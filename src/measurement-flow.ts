export type Step = "instructions" | "rest" | "measurement" | "break" | "result";

export type Reading = {
  systolic: number;
  diastolic: number;
};

export type FlowConfig = {
  restDurationSeconds: number;
  breakDurationSeconds: number;
  measurementCount: number;
  resultReadingNumbers: number[];
};

export type FlowState = {
  step: Step;
  readingNumber: number;
  readings: Array<Reading | null>;
  timerEndsAt: number | null;
  config: FlowConfig;
};

export const DEFAULT_CONFIG: FlowConfig = {
  restDurationSeconds: 5 * 60,
  breakDurationSeconds: 60,
  measurementCount: 3,
  resultReadingNumbers: [2, 3],
};

export function parseReadingValue(value: string): number | null {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 && parsed <= 300 ? parsed : null;
}

export function createInitialFlow(config: FlowConfig = DEFAULT_CONFIG): FlowState {
  return {
    step: "instructions",
    readingNumber: 1,
    readings: Array.from({ length: config.measurementCount }, () => null),
    timerEndsAt: null,
    config: {
      ...config,
      resultReadingNumbers: [...config.resultReadingNumbers],
    },
  };
}

export function remainingSeconds(timerEndsAt: number | null, now: number): number {
  if (timerEndsAt === null) return 0;
  return Math.max(0, Math.ceil((timerEndsAt - now) / 1000));
}

export function startRest(flow: FlowState, now: number): FlowState {
  return {
    ...flow,
    step: "rest",
    timerEndsAt: now + flow.config.restDurationSeconds * 1000,
  };
}

export function finishRest(flow: FlowState): FlowState {
  return { ...flow, step: "measurement", readingNumber: 1, timerEndsAt: null };
}

export function startBreak(flow: FlowState, now: number): FlowState {
  return {
    ...flow,
    step: "break",
    timerEndsAt: now + flow.config.breakDurationSeconds * 1000,
  };
}

export function finishBreak(flow: FlowState): FlowState {
  return { ...flow, step: "measurement", timerEndsAt: null };
}

export function acceptMeasurement(flow: FlowState, reading: Reading): FlowState {
  const readings = [...flow.readings];
  readings[flow.readingNumber - 1] = reading;

  if (flow.readingNumber < flow.config.measurementCount) {
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
  const values = flow.config.resultReadingNumbers
    .map((readingNumber) => flow.readings[readingNumber - 1]?.[key])
    .filter((value): value is number => value !== undefined);
  return values.length === 0 ? 0 : Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}
