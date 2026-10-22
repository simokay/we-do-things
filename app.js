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
    label: "Effort",
    hint: "how much energy you've got",
    options: [
      { value: "low", label: "🛋️ low" },
      { value: "medium", label: "🚶 medium" },
      { value: "high", label: "🏃 high" },
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

const locationLabels = { home: "🏡 home", indoor: "🏠 indoors", outdoor: "🌳 outdoors", any: "✨ either" };
const effortLabels = { low: "🛋️ low effort", medium: "🚶 medium effort", high: "🏃 high effort" };
const periodLabels = { weekday: "🗓️ weekday evening", weekend: "🎉 weekend" };

function renderResult(activity) {
  document.getElementById("result-name").textContent = activity.name;
  document.getElementById("result-desc").textContent = activity.description;
  document.getElementById("result-tag").textContent = activity.tag || "idea";

  const meta = document.getElementById("result-meta");
  meta.innerHTML = "";
  const metaChips = [
    locationLabels[activity.location] || activity.location,
    effortLabels[activity.effort] || activity.effort,
    periodLabels[state.period] || "",
  ].filter(Boolean);
  metaChips.forEach((label) => {
    const span = document.createElement("span");
    span.className = "chip";
    span.textContent = label;
    meta.appendChild(span);
  });

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

async function loadActivities() {
  const res = await fetch("data/activities.json");
  activities = await res.json();
  renderWizardStep();
}

document.getElementById("spin-btn").addEventListener("click", spin);
loadActivities();
