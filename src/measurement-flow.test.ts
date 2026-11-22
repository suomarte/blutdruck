import { describe, expect, it } from "vitest";
import {
  BREAK_DURATION,
  REST_DURATION,
  acceptMeasurement,
  average,
  createInitialFlow,
  finishBreak,
  finishRest,
  parseReadingValue,
  remainingSeconds,
  startBreak,
  startRest,
} from "./measurement-flow";

describe("measurement flow", () => {
  it("calculates timer values from the end timestamp", () => {
    const now = 1_000_000;
    const rest = startRest(createInitialFlow(), now);
    expect(rest.timerEndsAt).toBe(now + REST_DURATION * 1000);
    expect(remainingSeconds(rest.timerEndsAt, now + 1_500)).toBe(299);
    expect(remainingSeconds(rest.timerEndsAt, now + REST_DURATION * 1000)).toBe(0);
  });

  it("moves from rest to the first measurement", () => {
    const flow = finishRest(startRest(createInitialFlow(), 100));
    expect(flow.step).toBe("measurement");
    expect(flow.readingNumber).toBe(1);
    expect(flow.timerEndsAt).toBeNull();
  });

  it("starts a one-minute break after the first two measurements", () => {
    const first = acceptMeasurement(finishRest(startRest(createInitialFlow(), 0)), {
      systolic: 120,
      diastolic: 80,
    });
    const paused = startBreak(first, 10_000);
    expect(paused.step).toBe("break");
    expect(paused.readingNumber).toBe(2);
    expect(paused.timerEndsAt).toBe(10_000 + BREAK_DURATION * 1000);

    const second = acceptMeasurement(finishBreak(paused), { systolic: 130, diastolic: 85 });
    expect(second.step).toBe("break");
    expect(second.readingNumber).toBe(3);
  });

  it("shows the result after the third measurement and averages only readings 2 and 3", () => {
    let flow = finishRest(startRest(createInitialFlow(), 0));
    flow = acceptMeasurement(flow, { systolic: 100, diastolic: 70 });
    flow = acceptMeasurement(finishBreak(startBreak(flow, 60_000)), { systolic: 120, diastolic: 80 });
    flow = acceptMeasurement(finishBreak(startBreak(flow, 120_000)), { systolic: 130, diastolic: 90 });

    expect(flow.step).toBe("result");
    expect(average(flow, "systolic")).toBe(125);
    expect(average(flow, "diastolic")).toBe(85);
  });

  it("accepts only whole numbers from 0 to 300", () => {
    expect(parseReadingValue("0")).toBe(0);
    expect(parseReadingValue("300")).toBe(300);
    expect(parseReadingValue("120.5")).toBeNull();
    expect(parseReadingValue("301")).toBeNull();
    expect(parseReadingValue("")).toBeNull();
  });
});
