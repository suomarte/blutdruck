export type Step = "instructions" | "rest" | "measurement" | "break" | "result";

export type Reading = {
  systolic: number;
  diastolic: number;
};

export type FlowState = {
  step: Step;
  readingNumber: number;
  readings: Array<Reading | null>;
  timerEndsAt: number | null;
};

export const REST_DURATION = 5 * 60;
export const BREAK_DURATION = 60;

export function parseReadingValue(value: string): number | null {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 && parsed <= 300 ? parsed : null;
}

export function createInitialFlow(): FlowState {
  return {
    step: "instructions",
    readingNumber: 1,
    readings: [null, null, null],
    timerEndsAt: null,
  };
}

export function remainingSeconds(timerEndsAt: number | null, now: number): number {
  if (timerEndsAt === null) return 0;
  return Math.max(0, Math.ceil((timerEndsAt - now) / 1000));
}

export function startRest(flow: FlowState, now: number): FlowState {
  return { ...flow, step: "rest", timerEndsAt: now + REST_DURATION * 1000 };
}

export function finishRest(flow: FlowState): FlowState {
  return { ...flow, step: "measurement", readingNumber: 1, timerEndsAt: null };
}

export function startBreak(flow: FlowState, now: number): FlowState {
  return { ...flow, step: "break", timerEndsAt: now + BREAK_DURATION * 1000 };
}

export function finishBreak(flow: FlowState): FlowState {
  return { ...flow, step: "measurement", timerEndsAt: null };
}

export function acceptMeasurement(flow: FlowState, reading: Reading): FlowState {
  const readings = [...flow.readings];
  readings[flow.readingNumber - 1] = reading;

  if (flow.readingNumber < 3) {
    return {
      ...flow,
      readings,
      readingNumber: flow.readingNumber + 1,
      step: "break",
      timerEndsAt: null,
    };
  }

  return { ...flow, readings, step: "result", timerEndsAt: null };
}

export function average(flow: FlowState, key: keyof Reading): number {
  const second = flow.readings[1]?.[key] ?? 0;
  const third = flow.readings[2]?.[key] ?? 0;
  return Math.round((second + third) / 2);
}
