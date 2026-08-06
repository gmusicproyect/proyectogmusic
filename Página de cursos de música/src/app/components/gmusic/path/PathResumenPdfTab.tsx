import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { PathModuleData, PathNodeData } from "../../../data/gmusic-path-types";
import { useSignedMaterialUrl } from "../../../hooks/useSignedMaterialUrl";
import { isPrivateSupabaseStorageMaterialUrl } from "../../../utils/supabase-storage";
import {
  lessonStageLabelForSlot,
  resolveLessonStageSlot,
} from "../lesson/lesson-stage";
import { GM_BORDER, GM_GOLD, GM_SURFACE, GM_TEXT, GM_TEXT_SEC } from "../tokens";

export interface PathResumenPdfTabProps {
  modules: PathModuleData[];
}

function flattenNodesWithModule(modules: PathModuleData[]): Array<{
  node: PathNodeData;
  moduleTitle: string;
}> {
  return modules.flatMap((module) =>
    module.nodes.map((node) => ({
      node,
      moduleTitle: module.title,
    }))
  );
}

function PathPdfStageItem({
  node,
  moduleTitle,
}: {
  node: PathNodeData;
  moduleTitle: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const stageSlot = resolveLessonStageSlot(node.stageType, node.order);
  const stageLabel = lessonStageLabelForSlot(stageSlot);
  const needsSigning = isPrivateSupabaseStorageMaterialUrl(node.guidePdfUrl);
  const signedPdf = useSignedMaterialUrl(expanded && needsSigning ? node.guidePdfUrl : null);
  const publicPdfUrl = needsSigning ? null : node.guidePdfUrl ?? null;
  const resolvedPdfUrl = needsSigning ? signedPdf.resolvedUrl : publicPdfUrl;
  const summary =
    node.guideText?.trim() ||
    node.description?.trim() ||
    node.completionCriteria?.trim() ||
    `Material de ${stageLabel.toLowerCase()} en ${moduleTitle}.`;

  return (
    <div
      className="rounded-lg border overflow-hidden"
      style={{ borderColor: GM_BORDER, background: GM_SURFACE }}
    >
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="flex w-full items-start gap-3 px-4 py-4 text-left min-h-[56px]"
        aria-expanded={expanded}
      >
        <span className="text-lg shrink-0" aria-hidden="true">
          📄
        </span>
        <span className="min-w-0 flex-1">
          <span
            className="block text-sm font-medium leading-snug"
            style={{ color: GM_TEXT }}
          >
            {node.order != null ? `Etapa ${node.order} · ` : ""}
            {node.title}
          </span>
          <span className="mt-1 block text-xs leading-relaxed" style={{ color: GM_TEXT_SEC }}>
            {stageLabel} · toca para ver de qué trata
          </span>
        </span>
        <ChevronDown
          className="mt-0.5 h-4 w-4 shrink-0 transition-transform"
          style={{
            color: GM_TEXT_SEC,
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
          }}
          aria-hidden="true"
        />
      </button>

      {expanded ? (
        <div
          className="border-t px-4 py-4 space-y-4"
          style={{ borderColor: GM_BORDER }}
        >
          <p className="text-sm leading-relaxed" style={{ color: GM_TEXT_SEC }}>
            {summary}
          </p>

          {signedPdf.error ? (
            <p className="text-sm" style={{ color: GM_TEXT_SEC }}>
              {signedPdf.error}
            </p>
          ) : null}

          {signedPdf.loading ? (
            <p className="text-sm" style={{ color: GM_TEXT_SEC }}>
              Preparando la guía PDF…
            </p>
          ) : resolvedPdfUrl ? (
            <div className="space-y-3">
              <iframe
                title={`Guía PDF — ${node.title}`}
                src={resolvedPdfUrl}
                className="h-[min(60vh,480px)] w-full rounded-md border-0 bg-white"
                style={{ border: `1px solid ${GM_BORDER}` }}
              />
              <a
                href={resolvedPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center justify-center rounded-md px-5 text-xs font-semibold uppercase tracking-[0.1em]"
                style={{ background: GM_GOLD, color: "#0A0A0A" }}
              >
                Abrir PDF en pestaña nueva
              </a>
            </div>
          ) : (
            <p className="text-sm" style={{ color: GM_TEXT_SEC }}>
              No hay guía PDF para esta etapa todavía.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}

export function PathResumenPdfTab({ modules }: PathResumenPdfTabProps) {
  const entries = flattenNodesWithModule(modules);

  if (entries.length === 0) {
    return (
      <p className="text-sm text-center py-8" style={{ color: GM_TEXT_SEC }}>
        Tu camino aún no tiene etapas con material PDF.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed" style={{ color: GM_TEXT_SEC }}>
        Materia de las etapas — toca una para ver de qué trata.
      </p>
      <div className="space-y-3">
        {entries.map(({ node, moduleTitle }) => (
          <PathPdfStageItem key={node.id} node={node} moduleTitle={moduleTitle} />
        ))}
      </div>
    </div>
  );
}
