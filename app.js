const STEPS = [
  {
    key: "location",
    label: "Where",
    hint: "home, out indoors, outdoors, or no preference",
    options: [
      { value: "home", label: "🏡 home" },
      { value: "indoor", label: "🏠 indoors" },
      { value: "outdoor", label: "🌳 outdoors" },
      { value: "any", label: "✨ either", gold: true },
    ],
  },
  {
    key: "period",
    label: "Weekday or weekend?",
    hint: null,
    options: [
      { value: "weekday", label: "🗓️ weekday" },
      { value: "weekend", label: "🎉 weekend" },
    ],
  },
  {
    key: "timeOfDay",
    label: "Time of day",
    hint: "weekday evenings are assumed, so this only matters on weekends",
    showIf: (state) => state.period === "weekend",
    options: [
      { value: "morning", label: "🌅 morning" },
      { value: "afternoon", label: "☀️ afternoon" },
      { value: "evening", label: "🌙 evening" },
      { value: "any", label: "✨ anytime", gold: true },
    ],
  },
  {
    key: "effort",
    label: "How far",
    hint: "how big a trip you're up for, not how tiring it is",
    options: [
      { value: "low", label: "🏠 doorstep" },
      { value: "medium", label: "🚌 in town" },
      { value: "high", label: "🚆 proper trip" },
      { value: "any", label: "✨ any", gold: true },
    ],
  },
];

const state = {
  location: null,
  period: null,
  timeOfDay: null,
  effort: null,
};

let activities = [];
let choicesByActivity = {};
let lastId = null;
let wizardIndex = 0;

const wizardEl = document.getElementById("wizard");
const wizardProgressEl = document.getElementById("wizard-progress");
const wizardStepEl = document.getElementById("wizard-step");
const topbarEl = document.getElementById("topbar");
const topbarFieldsEl = document.getElementById("topbar-fields");
const resultWrap = document.getElementById("result-wrap");
const emptyState = document.getElementById("empty-state");
const matchCount = document.getElementById("match-count");

function visibleSteps() {
  return STEPS.filter((step) => !step.showIf || step.showIf(state));
}

// Weekday activities assume an evening slot; weekend asks the question for real.
function effectiveTimeOfDay() {
  return state.period === "weekday" ? "evening" : state.timeOfDay || "any";
}

function matches(activity) {
  const locOk = state.location === "any" || activity.location === "any" || activity.location === state.location;
  const time = effectiveTimeOfDay();
  const timeOk = time === "any" || activity.timeOfDay.includes("any") || activity.timeOfDay.includes(time);
  const effortOk = state.effort === "any" || activity.effort === state.effort;
  return locOk && timeOk && effortOk;
}

function currentMatches() {
  return activities.filter(matches);
}

function updateMatchCount() {
  const n = currentMatches().length;
  matchCount.textContent = n === 1 ? "1 idea fits that" : `${n} ideas fit that`;
}

// ---------- wizard ----------

function renderWizardProgress(steps) {
  wizardProgressEl.innerHTML = "";
  steps.forEach((_, i) => {
    const dot = document.createElement("span");
    dot.className =
      "progress-dot" +
      (i < wizardIndex ? " progress-dot--done" : i === wizardIndex ? " progress-dot--active" : "");
    wizardProgressEl.appendChild(dot);
  });
}

function renderWizardStep() {
  const steps = visibleSteps();

  if (wizardIndex >= steps.length) {
    finishWizard();
    return;
  }

  renderWizardProgress(steps);

  const step = steps[wizardIndex];
  wizardStepEl.innerHTML = "";

  const label = document.createElement("span");
  label.className = "field-label";
  label.textContent = step.label;
  if (step.hint) {
    const hint = document.createElement("span");
    hint.className = "hint";
    hint.textContent = step.hint;
    label.appendChild(hint);
  }
  wizardStepEl.appendChild(label);

  const grid = document.createElement("div");
  grid.className = "chip-grid";
  step.options.forEach((opt) => {
    const btn = document.createElement("button");
    btn.className = "chip";
    btn.type = "button";
    btn.textContent = opt.label;
    btn.addEventListener("click", () => {
      state[step.key] = opt.value;
      wizardIndex += 1;
      renderWizardStep();
    });
    grid.appendChild(btn);
  });
  wizardStepEl.appendChild(grid);
}

function finishWizard() {
  wizardEl.hidden = true;
  topbarEl.hidden = false;
  renderTopbar();
  spin();
}

// ---------- topbar (adjustable after the first suggestion) ----------

function renderTopbar() {
  topbarFieldsEl.innerHTML = "";
  visibleSteps().forEach((step) => {
    const btn = document.createElement("button");
    btn.className = "chip chip-selected";
    btn.type = "button";
    const current = step.options.find((o) => o.value === state[step.key]) || step.options[0];
    btn.textContent = `${step.label}: ${current.label}`;
    btn.title = "Click to change";
    btn.addEventListener("click", () => {
      const opts = step.options;
      const idx = opts.findIndex((o) => o.value === state[step.key]);
      state[step.key] = opts[(idx + 1) % opts.length].value;
      // changing "period" may reveal or hide the timeOfDay field
      renderTopbar();
      spin();
    });
    topbarFieldsEl.appendChild(btn);
  });
  updateMatchCount();
}

// ---------- result ----------

function renderResult(activity) {
  document.getElementById("result-activity").textContent = activity.activity;
  document.getElementById("result-tag").textContent = activity.tag || "idea";

  const linkEl = document.getElementById("result-link");
  if (activity.link) {
    linkEl.href = activity.link;
    linkEl.hidden = false;
  } else {
    linkEl.hidden = true;
  }

  const choicesEl = document.getElementById("result-choices");
  const choices = choicesByActivity[activity.id];
  choicesEl.innerHTML = "";
  if (choices && choices.length) {
    const label = document.createElement("span");
    label.className = "choices-label";
    label.textContent = "pick one:";
    choicesEl.appendChild(label);
    choices.forEach(({ name, link }) => {
      const a = document.createElement("a");
      a.className = "chip choice-chip";
      a.href = link;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = name;
      choicesEl.appendChild(a);
    });
    choicesEl.hidden = false;
  } else {
    choicesEl.hidden = true;
  }

  resultWrap.hidden = false;
  emptyState.hidden = true;
  resultWrap.querySelector(".map-poster").style.animation = "none";
  requestAnimationFrame(() => {
    resultWrap.querySelector(".map-poster").style.animation = "";
  });
}

function spin() {
  updateMatchCount();
  const pool = currentMatches();
  if (pool.length === 0) {
    resultWrap.hidden = true;
    emptyState.hidden = false;
    return;
  }

  let choice;
  if (pool.length === 1) {
    choice = pool[0];
  } else {
    const candidates = pool.filter((a) => a.id !== lastId);
    choice = candidates[Math.floor(Math.random() * candidates.length)];
  }
  lastId = choice.id;
  renderResult(choice);
}

// Minimal RFC4180-ish CSV parser: handles quoted fields, embedded commas,
// escaped "" quotes, and \r\n or \n line endings.
function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && next === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((cell) => cell !== "")) rows.push(row);
      row = [];
    } else {
      field += char;
    }
  }
  if (field !== "" || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function rowsToObjects(rows) {
  const [header, ...dataRows] = rows;
  return dataRows.map((row) => {
    const obj = {};
    header.forEach((col, i) => {
      obj[col] = (row[i] || "").trim();
    });
    return obj;
  });
}

function rowsToActivities(rows) {
  return rowsToObjects(rows).map((activity) => {
    activity.timeOfDay = activity.timeOfDay
      ? activity.timeOfDay.split(";").map((s) => s.trim()).filter(Boolean)
      : ["any"];
    if (!activity.link) delete activity.link;
    return activity;
  });
}

function rowsToChoicesByActivity(rows) {
  const byActivity = {};
  rowsToObjects(rows).forEach(({ activity_id, name, link }) => {
    if (!activity_id) return;
    (byActivity[activity_id] ||= []).push({ name, link });
  });
  return byActivity;
}

async function loadActivities() {
  const [activitiesRes, choicesRes] = await Promise.all([
    fetch("activities.csv"),
    fetch("choices.csv"),
  ]);
  activities = rowsToActivities(parseCSV(await activitiesRes.text()));
  choicesByActivity = rowsToChoicesByActivity(parseCSV(await choicesRes.text()));
  renderWizardStep();
}

document.getElementById("spin-btn").addEventListener("click", spin);
loadActivities();
