import "./style.css";
import {
  acceptMeasurement,
  average,
  createInitialFlow,
  finishBreak as finishBreakState,
  finishRest as finishRestState,
  remainingSeconds,
  parseReadingValue,
  startBreak,
  startRest,
  type FlowState,
} from "./measurement-flow";

const INSTALL_HINT_STORAGE_KEY = "blutdruck.install-hinweis-ausblenden";
const app = document.querySelector<HTMLDivElement>("#app");

if (!app) throw new Error("App-Container fehlt.");
const root = app;

let flow: FlowState = createInitialFlow();
let timerId: number | undefined;
let statusMessage = "";
let errorMessage = "";
let showInstallHint = window.localStorage.getItem(INSTALL_HINT_STORAGE_KEY) !== "true";

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}

function announce(message: string): void {
  statusMessage = message;
  render(true);
}

function isStandalone(): boolean {
  return window.matchMedia("(display-mode: standalone)").matches
    || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

function isAppleMobileDevice(): boolean {
  return /iPhone|iPad|iPod/.test(navigator.userAgent)
    || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function hideInstallHint(): void {
  window.localStorage.setItem(INSTALL_HINT_STORAGE_KEY, "true");
  showInstallHint = false;
  render();
}

function startTimer(next: () => void): void {
  window.clearInterval(timerId);
  timerId = window.setInterval(() => {
    if (remainingSeconds(flow.timerEndsAt, Date.now()) <= 0) {
      window.clearInterval(timerId);
      timerId = undefined;
      next();
      return;
    }
    render();
  }, 250);
  render();
}

function beginRest(): void {
  flow = startRest(flow, Date.now());
  errorMessage = "";
  announce("Die Ruhephase von fünf Minuten läuft.");
  startTimer(() => {
    finishRest();
  });
}

function finishRest(): void {
  flow = finishRestState(flow);
  window.clearInterval(timerId);
  timerId = undefined;
  announce("Die Ruhephase ist beendet. Jetzt steht Messung 1 an.");
}

function beginBreak(): void {
  flow = startBreak(flow, Date.now());
  errorMessage = "";
  announce(`Pause von einer Minute. Danach folgt Messung ${flow.readingNumber}.`);
  startTimer(() => {
    finishBreak();
  });
}

function finishBreak(): void {
  flow = finishBreakState(flow);
  window.clearInterval(timerId);
  timerId = undefined;
  announce(`Die Pause ist beendet. Jetzt steht Messung ${flow.readingNumber} an.`);
}

function skipWaiting(): void {
  if (flow.step === "rest") finishRest();
  else if (flow.step === "break") finishBreak();
}

function reset(): void {
  window.clearInterval(timerId);
  timerId = undefined;
  flow = createInitialFlow();
  errorMessage = "";
  announce("Der Ablauf wurde zurückgesetzt.");
}

function valueFrom(id: string): number | null {
  const input = document.querySelector<HTMLInputElement>(`#${id}`);
  return input ? parseReadingValue(input.value) : null;
}

function submitMeasurement(): void {
  const systolic = valueFrom("systolic");
  const diastolic = valueFrom("diastolic");
  if (systolic === null || diastolic === null) {
    errorMessage = "Bitte gib für beide Werte ganze Zahlen von 0 bis 300 mmHg ein.";
    render();
    document.querySelector<HTMLInputElement>("#systolic")?.focus();
    return;
  }

  flow = acceptMeasurement(flow, { systolic, diastolic });
  errorMessage = "";
  if (flow.step === "break") {
    beginBreak();
  } else {
    announce("Alle drei Messungen sind erfasst. Das Ergebnis wird angezeigt.");
  }
}

function layout(content: string): string {
  return `
    <header class="site-header">
      <a class="brand" href="./" aria-label="Blutdruck – Startseite">
        <img src="icons/icon-180.png" alt="" width="48" height="48" />
        <span>Blutdruck</span>
      </a>
    </header>
    <main id="main-content" tabindex="-1">
      <h1 class="sr-only">Blutdruckmessung</h1>
      ${flow.step !== "instructions" ? '<div class="page-actions"><button class="button button-quiet" data-action="reset">Neu starten</button></div>' : ""}
      ${content}
    </main>
    <div class="sr-only" role="status" aria-live="polite" aria-atomic="true">${statusMessage}</div>
  `;
}

function renderInstructions(): string {
  return `
    <section class="intro">
      <h2>Vorbereitung für die Blutdruckmessung</h2>
      <p>Diese Anwendung begleitet dich bei drei manuellen Messungen mit deinem Oberarm-Blutdruckmessgerät. Die Anwendung stellt keine Diagnose und ersetzt keine ärztliche Beratung.</p>
      ${showInstallHint && isAppleMobileDevice() && !isStandalone() ? `
        <div class="install-card">
          <h3>App auf den Home-Bildschirm legen</h3>
          <ol>
            <li>Öffne das Safari-Menü über das Teilen-Symbol in der Browserleiste.</li>
            <li>Wähle dort „Zum Home-Bildschirm“ und bestätige mit „Hinzufügen“.</li>
          </ol>
          <button class="button button-quiet dismiss-install-hint" data-action="hide-install-hint" type="button">Nicht mehr anzeigen</button>
        </div>
      ` : ""}
      <button class="button button-primary" data-action="rest">Ruhephase vorbereiten</button>
      <div class="notice">
        <h3>Bitte vorher beachten</h3>
        <ul>
          <li>In den letzten 30 Minuten nichts essen und auf Koffein, Rauchen und Sport verzichten.</li>
          <li>Vorher die Blase entleeren.</li>
          <li>Beachte zusätzlich die Anleitung deines Messgeräts.</li>
        </ul>
      </div>
    </section>
  `;
}

function renderTimer(title: string, text: string): string {
  const seconds = remainingSeconds(flow.timerEndsAt, Date.now());
  return `
    <section class="panel timer-panel">
      <h2>${title}</h2>
      <p>${text}</p>
      <div class="timer" role="timer" aria-live="off" aria-label="Verbleibende Zeit ${formatTime(seconds)}">${formatTime(seconds)}</div>
      <p class="timer-hint">Die Zeit läuft auch weiter, wenn dieser Tab nicht geöffnet ist.</p>
      <button class="button button-quiet" data-action="skip-waiting" type="button">Wartephase überspringen</button>
    </section>
  `;
}

function renderRest(): string {
  return renderTimer(
    "Ruhephase",
    "Setz dich ruhig hin, lehn dich an und stell beide Füße auf den Boden. Kreuze deine Beine nicht. Leg die Manschette am bloßen Oberarm an und stütz den Arm auf Herzhöhe ab."
  );
}

function renderBreak(): string {
  return renderTimer(
    "Kurze Pause",
    "Bleib ruhig sitzen und sprich nicht. Nach Ablauf der Pause kannst du die nächste Messung am Gerät starten."
  );
}

function renderMeasurement(): string {
  const previous = flow.readings[flow.readingNumber - 2];
  return `
    <section class="panel">
      <h2>Messen ${flow.readingNumber} von 3</h2>
      <p>Starte die Messung an deinem Gerät. Gib anschließend die angezeigten Werte ein. Während der Messung bitte nicht sprechen.</p>
      ${previous ? `<p class="muted">Die vorherige Messung wurde übernommen.</p>` : ""}
      <form id="measurement-form" novalidate>
        <div class="field-grid">
          <label for="systolic">Systolisch <span>(mmHg)</span>
            <input id="systolic" name="systolic" type="number" min="0" max="300" step="1" inputmode="numeric" placeholder="z. B. 120" required />
          </label>
          <label for="diastolic">Diastolisch <span>(mmHg)</span>
            <input id="diastolic" name="diastolic" type="number" min="0" max="300" step="1" inputmode="numeric" placeholder="z. B. 80" required />
          </label>
        </div>
        ${errorMessage ? `<p class="error" role="alert">${errorMessage}</p>` : ""}
        <button class="button button-primary" type="submit">Messung übernehmen</button>
      </form>
    </section>
  `;
}

function renderResult(): string {
  const rows = flow.readings.map((reading, index) => `
    <tr><th scope="row">Messung ${index + 1}</th><td>${reading?.systolic} mmHg</td><td>${reading?.diastolic} mmHg</td></tr>
  `).join("");
  return `
    <section class="panel">
      <h2>Ergebnis</h2>
      <p>Hier siehst du die eingegebenen Werte. Der Mittelwert berücksichtigt nur die zweite und dritte Messung.</p>
      <div class="table-wrap">
        <table>
          <caption class="sr-only">Blutdruckwerte und Mittelwert</caption>
          <thead><tr><th scope="col">Messung</th><th scope="col">Systolisch</th><th scope="col">Diastolisch</th></tr></thead>
          <tbody>${rows}</tbody>
          <tfoot><tr><th scope="row">Mittelwert aus 2 und 3</th><td>${average(flow, "systolic")} mmHg</td><td>${average(flow, "diastolic")} mmHg</td></tr></tfoot>
        </table>
      </div>
      <p class="muted">Die Werte werden nicht medizinisch bewertet. Besprich Fragen oder Auffälligkeiten mit deiner Ärztin oder deinem Arzt.</p>
    </section>
  `;
}

function render(focusMain = false): void {
  const content = flow.step === "instructions" ? renderInstructions()
    : flow.step === "rest" ? renderRest()
      : flow.step === "break" ? renderBreak()
        : flow.step === "measurement" ? renderMeasurement()
          : renderResult();
  root.innerHTML = layout(content);
  bindEvents();
  if (focusMain && flow.step !== "measurement") {
    document.querySelector<HTMLElement>("#main-content")?.focus();
  }
}

function bindEvents(): void {
  document.querySelector<HTMLButtonElement>("[data-action='hide-install-hint']")?.addEventListener("click", hideInstallHint);
  document.querySelector<HTMLButtonElement>("[data-action='rest']")?.addEventListener("click", beginRest);
  document.querySelector<HTMLButtonElement>("[data-action='skip-waiting']")?.addEventListener("click", skipWaiting);
  document.querySelector<HTMLButtonElement>("[data-action='reset']")?.addEventListener("click", reset);
  document.querySelector<HTMLFormElement>("#measurement-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    submitMeasurement();
  });
  if (flow.step === "measurement") document.querySelector<HTMLInputElement>("#systolic")?.focus();
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && flow.timerEndsAt !== null && remainingSeconds(flow.timerEndsAt, Date.now()) <= 0) {
    if (flow.step === "rest") finishRest();
    else if (flow.step === "break") finishBreak();
  }
});

render();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js")
      .then((registration) => registration.update())
      .catch((error: unknown) => {
        console.error("Offline-Unterstützung konnte nicht aktiviert werden.", error);
      });
  });
}
