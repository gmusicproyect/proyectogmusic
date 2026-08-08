import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { adaptPayloadToLabNotes } from "./adapt-payload-to-lab-notes";
import { HIGHWAY_FEATURE_ENABLED, normalizeRawNotes } from "./lab-note";

describe("normalizeRawNotes", () => {
  it("aplica defaults del extracto Juan", () => {
    const notes = normalizeRawNotes([
      { string: 1, fret: 0 },
      { time: "2", string: "3", fret: "2", duration: "1", isRest: 1 },
    ]);
    assert.equal(notes[0]?.id, 0);
    assert.equal(notes[0]?.time, 0);
    assert.equal(notes[0]?.string, 1);
    assert.equal(notes[0]?.fret, 0);
    assert.equal(notes[0]?.type, "open");
    assert.equal(notes[0]?.isRest, false);
    assert.equal(notes[1]?.time, 2);
    assert.equal(notes[1]?.string, 3);
    assert.equal(notes[1]?.fret, 2);
    assert.equal(notes[1]?.type, "normal");
    assert.equal(notes[1]?.isRest, true);
    assert.equal(notes[1]?.duration, 1);
  });
});

describe("adaptPayloadToLabNotes", () => {
  it("prioriza notes[] del contrato Lab", () => {
    const result = adaptPayloadToLabNotes({
      answerInput: "fretboard",
      notes: [
        { time: 0, string: 1, fret: 0 },
        { time: 1, string: 1, fret: 0 },
        { time: 2, string: 1, fret: 0 },
        { time: 3, string: 1, fret: 0 },
      ],
    });
    assert.equal(result.notes.length, 4);
    assert.ok(result.notes.every((n) => n.string === 1 && n.fret === 0));
    assert.equal(result.highwayEnabled, false);
  });

  it("aplana patterns[].notes si no hay notes[]", () => {
    const result = adaptPayloadToLabNotes({
      patterns: [
        {
          notes: [
            { time: 0, string: 6, fret: 0 },
            { time: 1, string: 5, fret: 0 },
          ],
        },
      ],
    });
    assert.equal(result.notes.length, 2);
    assert.equal(result.notes[0]?.string, 6);
    assert.equal(result.notes[1]?.string, 5);
  });

  it("mapea tapSequence existente a LabNotes al aire", () => {
    const result = adaptPayloadToLabNotes({
      tapSequence: [
        { stringNumber: 6, label: "6", stringName: "Mi grave" },
        { stringNumber: 6, label: "6", stringName: "Mi grave" },
      ],
    });
    assert.equal(result.notes.length, 2);
    assert.equal(result.notes[0]?.string, 6);
    assert.equal(result.notes[0]?.fret, 0);
    assert.equal(result.notes[0]?.type, "open");
  });

  it("no inventa notes desde options/answerInput", () => {
    const result = adaptPayloadToLabNotes({
      answerInput: "fretboard",
      options: [
        { id: "E", text: "Mi grave" },
        { id: "e", text: "Mi agudo" },
      ],
    });
    assert.deepEqual(result.notes, []);
  });

  it("highway stub permanece OFF aunque el payload pida moving", () => {
    assert.equal(HIGHWAY_FEATURE_ENABLED, false);
    const result = adaptPayloadToLabNotes({
      stageType: "moving",
      highwayEnabled: true,
      notes: [{ string: 1, fret: 0 }],
    });
    assert.equal(result.highwayEnabled, false);
    assert.equal(result.stageType, "moving");
  });
});
