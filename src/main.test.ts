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
});
