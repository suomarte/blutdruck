/** @vitest-environment happy-dom */

import { beforeEach, expect, it, vi } from "vitest";

beforeEach(() => {
  vi.resetModules();
  document.body.innerHTML = '<div id="app"></div>';
  window.localStorage.clear();
  vi.stubGlobal("matchMedia", () => ({ matches: false, addListener: vi.fn(), removeListener: vi.fn() }));
});

it("shows the result after submitting the third measurement", async () => {
  await import("./main");

  const skipWaiting = () => document.querySelector<HTMLButtonElement>("[data-action='skip-waiting']")?.click();
  const submit = (systolic: string, diastolic: string) => {
    document.querySelector<HTMLInputElement>("#systolic")!.value = systolic;
    document.querySelector<HTMLInputElement>("#diastolic")!.value = diastolic;
    document.querySelector<HTMLFormElement>("#measurement-form")!.requestSubmit();
  };

  document.querySelector<HTMLButtonElement>("[data-action='rest']")!.click();
  skipWaiting();
  submit("120", "80");
  skipWaiting();
  submit("125", "82");
  skipWaiting();
  submit("130", "84");

  expect(document.querySelector("h2")?.textContent).toBe("Ergebnis");
  expect(document.body.textContent).toContain("Mittelwert aus 2 und 3");
  expect(document.body.textContent).toContain("Ergebnis");
});

it("saves settings before the next flow starts", async () => {
  await import("./main");

  document.querySelector<HTMLButtonElement>("[data-action='settings']")!.click();
  const restDuration = document.querySelector<HTMLSelectElement>("#rest-duration")!;
  const breakDuration = document.querySelector<HTMLSelectElement>("#break-duration")!;
  const measurementCount = document.querySelector<HTMLSelectElement>("#measurement-count")!;
  restDuration.value = "60";
  breakDuration.value = "30";
  measurementCount.value = "2";
  measurementCount.dispatchEvent(new Event("change"));

  const first = document.querySelector<HTMLInputElement>("input[name='result-readings'][value='1']")!;
  const second = document.querySelector<HTMLInputElement>("input[name='result-readings'][value='2']")!;
  first.checked = true;
  second.checked = false;
  document.querySelector<HTMLFormElement>("#settings-form")!.requestSubmit();

  expect(window.localStorage.getItem("blutdruck.konfiguration")).toBe(JSON.stringify({
    restDurationSeconds: 60,
    breakDurationSeconds: 30,
    measurementCount: 2,
    resultReadingNumbers: [1],
  }));
  document.querySelector<HTMLButtonElement>("[data-action='rest']")!.click();
  document.querySelector<HTMLButtonElement>("[data-action='skip-waiting']")!.click();
  expect(document.querySelector("h2")?.textContent).toBe("Messen 1 von 2");

  const submit = (systolic: string, diastolic: string) => {
    document.querySelector<HTMLInputElement>("#systolic")!.value = systolic;
    document.querySelector<HTMLInputElement>("#diastolic")!.value = diastolic;
    document.querySelector<HTMLFormElement>("#measurement-form")!.requestSubmit();
  };
  submit("120", "80");
  document.querySelector<HTMLButtonElement>("[data-action='skip-waiting']")!.click();
  submit("130", "85");

  expect(document.body.textContent).toContain("Mittelwert aus 1");
  expect(document.body.textContent).not.toContain("Mittelwert aus 2 und 3");
});

it("restores the current flow after reloading the tab", async () => {
  await import("./main");

  document.querySelector<HTMLButtonElement>("[data-action='rest']")!.click();
  expect(document.querySelector("h2")?.textContent).toBe("Ruhephase");

  vi.resetModules();
  document.body.innerHTML = '<div id="app"></div>';
  await import("./main");

  expect(document.querySelector("h2")?.textContent).toBe("Ruhephase");
});
