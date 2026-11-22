import "./style.css";

type Step = "instructions" | "rest" | "measurement" | "break" | "result";
type Reading = { systolic: number; diastolic: number };

const REST_DURATION = 5 * 60;
const BREAK_DURATION = 60;
const app = document.querySelector<HTMLDivElement>("#app");

if (!app) throw new Error("App-Container fehlt.");
const root = app;

let step: Step = "instructions";
let readingNumber = 1;
let readings: Array<Reading | null> = [null, null, null];
let timerEndsAt: number | null = null;
let timerId: number | undefined;
let statusMessage = "";
let errorMessage = "";

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}

function remainingSeconds(): number {
  if (timerEndsAt === null) return 0;
  return Math.max(0, Math.ceil((timerEndsAt - Date.now()) / 1000));
}

function announce(message: string): void {
  statusMessage = message;
  render();
}

function startTimer(duration: number, next: () => void): void {
  timerEndsAt = Date.now() + duration * 1000;
  window.clearInterval(timerId);
  timerId = window.setInterval(() => {
    if (remainingSeconds() <= 0) {
      window.clearInterval(timerId);
      timerId = undefined;
      timerEndsAt = null;
      next();
      return;
    }
    render();
  }, 250);
  render();
}

function beginRest(): void {
  step = "rest";
  errorMessage = "";
  announce("Die Ruhephase von fünf Minuten läuft.");
  startTimer(REST_DURATION, () => {
    finishRest();
  });
}

function finishRest(): void {
  step = "measurement";
  readingNumber = 1;
  timerEndsAt = null;
  window.clearInterval(timerId);
  timerId = undefined;
  announce("Die Ruhephase ist beendet. Jetzt steht Messung 1 an.");
}

function beginBreak(): void {
  step = "break";
  errorMessage = "";
  announce(`Pause von einer Minute. Danach folgt Messung ${readingNumber}.`);
  startTimer(BREAK_DURATION, () => {
    finishBreak();
  });
}

function finishBreak(): void {
  step = "measurement";
  timerEndsAt = null;
  window.clearInterval(timerId);
  timerId = undefined;
  announce(`Die Pause ist beendet. Jetzt steht Messung ${readingNumber} an.`);
}

function skipWaiting(): void {
  if (step === "rest") finishRest();
  else if (step === "break") finishBreak();
}

function reset(): void {
  window.clearInterval(timerId);
  timerId = undefined;
  step = "instructions";
  readingNumber = 1;
  readings = [null, null, null];
  timerEndsAt = null;
  errorMessage = "";
  announce("Der Ablauf wurde zurückgesetzt.");
}

function valueFrom(id: string): number | null {
  const input = document.querySelector<HTMLInputElement>(`#${id}`);
  if (!input || input.value.trim() === "") return null;
  const value = Number(input.value);
  return Number.isInteger(value) && value >= 0 && value <= 300 ? value : null;
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

  readings[readingNumber - 1] = { systolic, diastolic };
  errorMessage = "";
  if (readingNumber < 3) {
    readingNumber += 1;
    beginBreak();
  } else {
    step = "result";
    announce("Alle drei Messungen sind erfasst. Das Ergebnis wird angezeigt.");
  }
}

function average(key: keyof Reading): number {
  const second = readings[1]?.[key] ?? 0;
  const third = readings[2]?.[key] ?? 0;
  return Math.round((second + third) / 2);
}

function layout(content: string): string {
  return `
    <main id="main-content" tabindex="-1">
      ${step !== "instructions" ? '<div class="page-actions"><button class="button button-quiet" data-action="reset">Neu starten</button></div>' : ""}
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
  const seconds = remainingSeconds();
  return `
    <section class="panel timer-panel">
      <h2>${title}</h2>
      <p>${text}</p>
      <div class="timer" aria-label="Verbleibende Zeit ${formatTime(seconds)}">${formatTime(seconds)}</div>
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
  const previous = readings[readingNumber - 2];
  return `
    <section class="panel">
      <h2>Messen ${readingNumber} von 3</h2>
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
  const rows = readings.map((reading, index) => `
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
          <tfoot><tr><th scope="row">Mittelwert aus 2 und 3</th><td>${average("systolic")} mmHg</td><td>${average("diastolic")} mmHg</td></tr></tfoot>
        </table>
      </div>
      <p class="muted">Die Werte werden nicht medizinisch bewertet. Besprich Fragen oder Auffälligkeiten mit deiner Ärztin oder deinem Arzt.</p>
    </section>
  `;
}

function render(): void {
  const content = step === "instructions" ? renderInstructions()
    : step === "rest" ? renderRest()
      : step === "break" ? renderBreak()
        : step === "measurement" ? renderMeasurement()
          : renderResult();
  root.innerHTML = layout(content);
  bindEvents();
}

function bindEvents(): void {
  document.querySelector<HTMLButtonElement>("[data-action='rest']")?.addEventListener("click", beginRest);
  document.querySelector<HTMLButtonElement>("[data-action='skip-waiting']")?.addEventListener("click", skipWaiting);
  document.querySelector<HTMLButtonElement>("[data-action='reset']")?.addEventListener("click", reset);
  document.querySelector<HTMLFormElement>("#measurement-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    submitMeasurement();
  });
  if (step === "measurement") document.querySelector<HTMLInputElement>("#systolic")?.focus();
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && timerEndsAt !== null && remainingSeconds() <= 0) {
    if (step === "rest") finishRest();
    else if (step === "break") finishBreak();
  }
});

render();
