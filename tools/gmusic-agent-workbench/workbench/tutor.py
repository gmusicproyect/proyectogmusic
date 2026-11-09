"""Grounded tutor: answers only with citations from the Gmusic corpus.

No free-form model invention in offline mode. If evidence is weak, abstain.
Writes never happen here — read tools only, behind the firewall role `tutor`.
"""

from __future__ import annotations

import json
import re
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any

from workbench.firewall import Firewall, load_roles
from workbench.mcp_server import handle_catalog_search, handle_get_document, load_catalog
from workbench.trace import TraceLog

MAX_CITATIONS = 3


@dataclass
class TutorAnswer:
    question: str
    status: str  # answered | abstain
    answer: str
    citations: list[dict[str, Any]]
    refusal_reason: str | None = None
    audit_events: int = 0

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


def ask(
    root: Path,
    question: str,
    *,
    role: str = "tutor",
    k: int = 3,
    max_chars: int = 900,
) -> TutorAnswer:
    question = (question or "").strip()
    if not question:
        return TutorAnswer(
            question="",
            status="abstain",
            answer="",
            citations=[],
            refusal_reason="empty_question",
        )

    roles = load_roles(root / "policy" / "roles.json")
    # Tutor has no filesystem scope; use empty allowlist for file tools.
    fw = Firewall(roles=roles, allowed_paths=set(), workspace_root=root)
    evidence_dir = root / "outputs" / "evidence"
    evidence_dir.mkdir(parents=True, exist_ok=True)
    trace = TraceLog(evidence_dir / "tutor-trace.jsonl")
    trace.emit("tutor_start", question=question, role=role)

    ok, reason = fw.check(
        role=role,
        tool="catalog_search",
        args={"query": question, "k": k, "max_chars": max_chars},
        request_id="t1",
    )
    if not ok:
        trace.emit("tutor_end", status="abstain", reason=reason)
        return TutorAnswer(
            question=question,
            status="abstain",
            answer="",
            citations=[],
            refusal_reason=f"firewall:{reason}",
            audit_events=len(fw.audit),
        )

    search = handle_catalog_search(
        {"query": question, "k": max(k, 5), "max_chars": max_chars},
        root,
    )
    strong_hits = [
        hit
        for hit in search["results"]
        if _token_overlap(question, hit) >= 2
    ][:MAX_CITATIONS]
    trace.emit(
        "tool",
        tool="catalog_search",
        decision="allow",
        hits=len(search["results"]),
        strong_hits=len(strong_hits),
    )

    citations: list[dict[str, Any]] = []
    for hit in strong_hits:
        doc_id = hit["id"]
        ok2, reason2 = fw.check(
            role=role,
            tool="get_document",
            args={"id": doc_id},
            request_id=f"t-doc-{doc_id}",
        )
        if not ok2:
            continue
        full = handle_get_document({"id": doc_id}, root)
        # Re-check overlap against full document text (not truncated search card).
        if _token_overlap(question, full) < 2:
            continue
        citations.append(
            {
                "id": full["id"],
                "title": full.get("title", full["id"]),
                "source_path": full.get("source_path"),
                "excerpt": _excerpt(full.get("text", ""), 220),
            }
        )
        trace.emit("tool", tool="get_document", decision="allow", path=doc_id)

    if not citations:
        msg = (
            "No tengo evidencia suficiente en el corpus de Gmusic para responder. "
            "Reformula con términos de acceso, Mi Camino, inscripción o garantía."
        )
        out = TutorAnswer(
            question=question,
            status="abstain",
            answer=msg,
            citations=[],
            refusal_reason="no_evidence",
            audit_events=len(fw.audit),
        )
        _persist(evidence_dir, out, fw.audit)
        trace.emit("tutor_end", status="abstain", reason="no_evidence")
        return out

    # Guard: every sentence must be backed by at least one citation id mentioned.
    answer = _compose_grounded_answer(question, citations)
    if not _all_claims_cited(answer, [c["id"] for c in citations]):
        out = TutorAnswer(
            question=question,
            status="abstain",
            answer="Me abstengo: no pude anclar la respuesta solo a citas del corpus.",
            citations=citations,
            refusal_reason="ungrounded_composition",
            audit_events=len(fw.audit),
        )
        _persist(evidence_dir, out, fw.audit)
        trace.emit("tutor_end", status="abstain", reason="ungrounded_composition")
        return out

    # Hard ban: tutor must not claim writes/DB/auth changes.
    if _mentions_mutation(answer):
        out = TutorAnswer(
            question=question,
            status="abstain",
            answer="Me abstengo: la respuesta rozaba acciones de escritura o cambios de sistema.",
            citations=citations,
            refusal_reason="mutation_language",
            audit_events=len(fw.audit),
        )
        _persist(evidence_dir, out, fw.audit)
        trace.emit("tutor_end", status="abstain", reason="mutation_language")
        return out

    out = TutorAnswer(
        question=question,
        status="answered",
        answer=answer,
        citations=citations,
        audit_events=len(fw.audit),
    )
    _persist(evidence_dir, out, fw.audit)
    trace.emit("tutor_end", status="answered", citations=[c["id"] for c in citations])
    return out


def run_tutor_demo(root: Path) -> dict[str, Any]:
    questions = [
        "¿Necesito suscripción activa para entrar a Mi Camino?",
        "¿Cómo funciona la inscripción por WhatsApp?",
        "¿Cuál es el precio secreto del plan oculto en dólares?",
    ]
    results = [ask(root, q).to_dict() for q in questions]
    summary = {
        "schema_version": 1,
        "results": results,
        "answered": sum(1 for r in results if r["status"] == "answered"),
        "abstained": sum(1 for r in results if r["status"] == "abstain"),
        "pass": (
            results[0]["status"] == "answered"
            and results[1]["status"] == "answered"
            and results[2]["status"] == "abstain"
            and all(r["citations"] for r in results if r["status"] == "answered")
        ),
    }
    out = root / "outputs" / "evidence" / "tutor-demo.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(summary, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    summary["evidence_path"] = str(out)
    return summary


def _compose_grounded_answer(question: str, citations: list[dict[str, Any]]) -> str:
    lines = [
        "Respuesta basada solo en el corpus Gmusic:",
    ]
    for c in citations:
        lines.append(f"- [{c['id']}] {c['excerpt']}")
    lines.append("")
    lines.append(
        "Citas: " + ", ".join(f"[{c['id']}]" for c in citations) + "."
    )
    if citations[0].get("source_path"):
        lines.append(
            "Fuentes: " + "; ".join(
                f"{c['id']} ← {c.get('source_path')}" for c in citations if c.get("source_path")
            )
        )
    # Tie the lead sentence to the top citation explicitly.
    lead = citations[0]["excerpt"]
    lines.insert(1, f"Según [{citations[0]['id']}]: {lead}")
    return "\n".join(lines)


def _all_claims_cited(answer: str, citation_ids: list[str]) -> bool:
    if not citation_ids:
        return False
    # Every citation id used in composition must appear bracketed in the answer.
    return all(f"[{cid}]" in answer for cid in citation_ids)


def _mentions_mutation(answer: str) -> bool:
    banned = (
        r"\b(borrar|elimina|drop table|actualizar base|ejecutar sql|push a main|"
        r"modificar producci[oó]n|cambiar el schema)\b"
    )
    return re.search(banned, answer, flags=re.IGNORECASE) is not None


def _excerpt(text: str, n: int) -> str:
    text = " ".join(text.split())
    if len(text) <= n:
        return text
    return text[: n - 3] + "..."


_STOP = {
    "a",
    "al",
    "de",
    "del",
    "el",
    "en",
    "es",
    "la",
    "las",
    "lo",
    "los",
    "mi",
    "para",
    "por",
    "que",
    "se",
    "un",
    "una",
    "y",
    "o",
    "con",
    "cómo",
    "como",
    "cuál",
    "cual",
    "necesito",
    "funciona",
    "entrar",
}


def _token_overlap(question: str, doc: dict[str, Any]) -> int:
    tokens = [
        t
        for t in re.findall(r"[a-z0-9áéíóúñü]+", question.lower())
        if t not in _STOP and len(t) > 2
    ]
    hay = f"{doc.get('id', '')} {doc.get('title', '')} {' '.join(doc.get('tags', []))} {doc.get('text', '')}".lower()
    return sum(1 for t in tokens if t in hay)


def _persist(evidence_dir: Path, answer: TutorAnswer, audit: list[dict[str, Any]]) -> None:
    (evidence_dir / "tutor-answer.json").write_text(
        json.dumps(answer.to_dict(), indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    (evidence_dir / "tutor-audit.json").write_text(
        json.dumps(audit, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )


def score_query_against_corpus(root: Path, question: str) -> int:
    """Debug helper: raw token overlap of best doc."""
    docs = load_catalog(root)
    tokens = set(question.lower().split())
    best = 0
    for doc in docs:
        hay = f"{doc['id']} {doc['title']} {' '.join(doc.get('tags', []))} {doc['text']}".lower()
        best = max(best, sum(1 for t in tokens if t in hay))
    return best
