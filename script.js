"use strict";

const STORAGE_KEYS = {
  name: "rajat-cse-demo-name",
  progress: "rajat-cse-progress",
  plan: "rajat-cse-weekly-plan",
  suggestions: "rajat-cse-suggestions",
};

function readStored(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch (error) {
    console.error(`Unable to read saved ${key} data.`, error);
    return fallback;
  }
}

function writeStored(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Unable to save ${key} data.`, error);
    return false;
  }
}

const signInButton = document.querySelector("#sign-in-button");
const signInDialog = document.querySelector("#sign-in-dialog");
const signInForm = document.querySelector("#sign-in-form");
const signInMessage = document.querySelector("#sign-in-message");
const userIndicator = document.querySelector("#user-indicator");
const saveProgressButton = document.querySelector("#save-progress");
const progressMessage = document.querySelector("#progress-message");
const progressFill = document.querySelector("#progress-fill");
const progressNumber = document.querySelector("#progress-number");
const progressTopic = document.querySelector("#progress-topic");
const saveState = document.querySelector("#save-state");

function updateUser(name) {
  if (!name) return;
  userIndicator.textContent = `Hi, ${name}`;
  userIndicator.hidden = false;
  signInButton.textContent = "Change name";
  progressTopic.textContent = "Arrays & Strings · Demo progress";
  saveState.textContent = "Saved on this device";
}

function openSignIn() {
  signInMessage.textContent = "";
  signInDialog.showModal();
  signInForm.elements.displayName.focus();
}

signInButton.addEventListener("click", openSignIn);
document.querySelector("#mobile-sign-in-button").addEventListener("click", () => {
  mobileNav.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  openSignIn();
});
document.querySelector("#close-dialog").addEventListener("click", () => signInDialog.close());
signInDialog.addEventListener("click", (event) => {
  if (event.target === signInDialog) signInDialog.close();
});

signInForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = signInForm.elements.displayName.value.trim();
  if (!name) return;
  if (!writeStored(STORAGE_KEYS.name, name)) {
    signInMessage.textContent = "Could not save your name. Check browser storage settings and try again.";
    signInMessage.style.color = "#ff9b8b";
    return;
  }
  updateUser(name);
  signInDialog.close();
});

const storedName = readStored(STORAGE_KEYS.name, "");
if (typeof storedName === "string" && storedName) updateUser(storedName);

const savedProgress = readStored(STORAGE_KEYS.progress, null);
if (Number.isInteger(savedProgress) && savedProgress >= 0 && savedProgress <= 100) {
  progressNumber.textContent = `${savedProgress}%`;
  progressFill.style.width = `${savedProgress}%`;
  saveState.textContent = "Saved on this device";
  progressTopic.textContent = "Arrays & Strings · Saved progress";
}

saveProgressButton.addEventListener("click", () => {
  if (!readStored(STORAGE_KEYS.name, "")) {
    progressMessage.textContent = "Add your name first to save progress on this device.";
    progressMessage.style.color = "#f3cb35";
    openSignIn();
    return;
  }
  const current = Number.parseInt(progressNumber.textContent, 10);
  const next = Math.min(100, current + 5);
  if (!writeStored(STORAGE_KEYS.progress, next)) {
    progressMessage.textContent = "Progress could not be saved. Check browser storage settings and try again.";
    progressMessage.style.color = "#ff9b8b";
    return;
  }
  progressNumber.textContent = `${next}%`;
  progressFill.style.width = `${next}%`;
  progressTopic.textContent = "Arrays & Strings · Saved progress";
  saveState.textContent = "Saved on this device";
  progressMessage.textContent = next === 100 ? "Roadmap complete — excellent work!" : "Progress saved. Keep the streak going!";
  progressMessage.style.color = "";
});

const resourceSearch = document.querySelector("#resource-search");
const resourceCards = [...document.querySelectorAll(".resource-card")];
let activeResourceFilter = "all";

function filterResources() {
  const term = resourceSearch.value.trim().toLowerCase();
  let visible = 0;
  for (const card of resourceCards) {
    const matchesCategory = activeResourceFilter === "all" || card.dataset.category === activeResourceFilter;
    const matchesSearch = !term || card.dataset.search.includes(term) || card.textContent.toLowerCase().includes(term);
    const show = matchesCategory && matchesSearch;
    card.hidden = !show;
    if (show) visible += 1;
  }
  document.querySelector("#resource-empty").hidden = visible !== 0;
}

resourceSearch.addEventListener("input", filterResources);
document.querySelector("#resource-filters").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-filter]");
  if (!button) return;
  activeResourceFilter = button.dataset.filter;
  document.querySelectorAll("#resource-filters .filter-button").forEach((item) => {
    const active = item === button;
    item.classList.toggle("active", active);
    item.setAttribute("aria-pressed", String(active));
  });
  filterResources();
});

const projectCards = [...document.querySelectorAll(".project-card")];
document.querySelector("#project-filters").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-filter]");
  if (!button) return;
  const category = button.dataset.filter;
  let visible = 0;
  projectCards.forEach((card) => {
    const show = category === "all" || card.dataset.level === category;
    card.hidden = !show;
    if (show) visible += 1;
  });
  document.querySelector("#project-empty").hidden = visible !== 0;
  document.querySelectorAll("#project-filters .filter-button").forEach((item) => {
    const active = item === button;
    item.classList.toggle("active", active);
    item.setAttribute("aria-pressed", String(active));
  });
});

const planInputs = [...document.querySelectorAll("[data-plan]")];
const savedPlan = readStored(STORAGE_KEYS.plan, []);
if (Array.isArray(savedPlan)) {
  planInputs.forEach((input) => { input.checked = savedPlan.includes(input.dataset.plan); });
}
planInputs.forEach((input) => {
  input.addEventListener("change", () => {
    const selected = planInputs.filter((item) => item.checked).map((item) => item.dataset.plan);
    if (!writeStored(STORAGE_KEYS.plan, selected)) {
      input.checked = !input.checked;
      document.querySelector("#plan-result").hidden = false;
      document.querySelector("#plan-result").textContent = "Your selection could not be saved. Check browser storage settings and try again.";
    }
  });
});

document.querySelector("#make-plan").addEventListener("click", () => {
  const selected = planInputs.filter((input) => input.checked).map((input) => input.dataset.plan);
  const result = document.querySelector("#plan-result");
  result.hidden = false;
  if (!selected.length) {
    result.textContent = "Choose at least one focus area above to build your weekly plan.";
    return;
  }
  result.innerHTML = `<strong>Your weekly focus</strong><br>${selected.map((item, index) => `${index + 1}. ${item}`).join("<br>")}<br><br>Pick one small task each day, then review your progress this weekend.`;
});

document.querySelector("#feedback-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const data = Object.fromEntries(new FormData(form).entries());
  const previous = readStored(STORAGE_KEYS.suggestions, []);
  if (!Array.isArray(previous)) {
    document.querySelector("#form-message").textContent = "Saved suggestions could not be read. Please refresh and try again.";
    document.querySelector("#form-message").style.color = "#ff9b8b";
    return;
  }
  const suggestions = [...previous, { ...data, createdAt: new Date().toISOString() }];
  const message = document.querySelector("#form-message");
  if (!writeStored(STORAGE_KEYS.suggestions, suggestions)) {
    message.textContent = "Suggestion could not be saved. Check browser storage settings and try again.";
    message.style.color = "#ff9b8b";
    return;
  }
  form.reset();
  message.textContent = "Thanks! Your suggestion has been saved in this browser.";
  message.style.color = "";
});

const menuToggle = document.querySelector("#menu-toggle");
const mobileNav = document.querySelector("#mobile-nav");
menuToggle.addEventListener("click", () => {
  const isOpen = mobileNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});
mobileNav.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    mobileNav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  }
});
document.addEventListener("click", (event) => {
  if (!event.target.closest("#mobile-nav, #menu-toggle")) {
    mobileNav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  }
});
