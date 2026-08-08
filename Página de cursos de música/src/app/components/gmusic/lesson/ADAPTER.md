# ADAPTER.md — contentPayload → LabNote[] (T-PRACTICE-CANVAS-01)

Clean-room bridge between the **product** `contentPayload` and the **LabNote** visual contract.
No imports from the Lab volume.

## Product `contentPayload` shape (today)

Parsed by `parse-exercise-payload.ts`. Relevant fields:

| Field | Type | Role |
|-------|------|------|
| `answerInput` | `"options" \| "fretboard" \| "sequence"` | UI input mode (default `options`) |
| `showFretboard` | `boolean` | Study chrome when true (P4; mutually exclusive with `answerInput: "fretboard"`) |
| `options` | `{ id, text }[]` | MCQ / sequence tokens |
| `audioUrl` / `imageUrl` / `diagramLabel` / `patternBeats` | media | Display only |
| `tapSequence` | `{ stringNumber, label, stringName }[]` | RHYTHM_TAP beats (existing) |
| `submissionOptionId` | `string` | RHYTHM_TAP complete token |
| `notes` | `{ time, string, fret, duration?, type?, isRest? }[]` | **Optional Lab contract** (forward-compatible) |
| `patterns` | `{ notes: [...] }[]` | **Optional** Lab stage patterns |
| `stageType` / `visualMode` | `string` | Optional; `"moving"` / `"highway"` = highway intent |
| `highwayEnabled` | `boolean` | Optional explicit highway request |

Derived (not in payload): `fretboardRole` = `response` \| `study` \| `none` via `resolveFretboardRole`.

## LabNote (motor visual)

```ts
type LabNote = {
  id: number;
  time: number;
  string: number; // 1..6 (1 = high e TOP)
  fret: number;   // 0 = open
  duration: number | null;
  type: string;
  isRest: boolean;
};
```

Normalization (`normalizeRawNotes`): `string || 1`, `fret || 0`, `type` from fret===0→`open` else `normal`, `isRest` boolean.

## Mapping priority (`adaptPayloadToLabNotes`)

1. **`notes[]`** → normalize directly.
2. Else **`patterns[].notes`** → flatten → normalize.
3. Else **`tapSequence[]`** → each beat → `{ time: index, string: stringNumber, fret: 0, type: "open" }`.
4. Else **`[]`** — no invented notes from `options` / `answerInput`.

| Source field | → LabNote field |
|--------------|-----------------|
| `notes[i].time` | `time` |
| `notes[i].string` | `string` (1..6) |
| `notes[i].fret` | `fret` |
| `notes[i].duration` | `duration` |
| `notes[i].type` | `type` |
| `notes[i].isRest` | `isRest` |
| `patterns[*].notes[*]` | same as `notes` (flattened) |
| `tapSequence[i].stringNumber` | `string` |
| *(tapSequence)* | `fret: 0`, `time: i`, `type: "open"` |

**Not mapped (by design):** `options`, `answerInput`, `showFretboard`, media URLs. Those stay on `ParsedExerciseView`; P4 `fretboardRole` still gates interaction.

## Highway stub

`HIGHWAY_FEATURE_ENABLED = false`. Even if `stageType: "moving"` or `highwayEnabled: true`, `AdaptPayloadResult.highwayEnabled` is **false**. Hit line / tempo scroll stay off.

## Runner wiring

- `fretboardRole === "response"` → taps are attempts (`selectedAnswer` = canonical stringId `"E"`…`"e"`).
- `study` → canvas inert (P4).
- `none` → no canvas.
- Complete via existing POST `/complete`; `secureAnswer` server-only.
