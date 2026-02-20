const MODEL_CONFIGS = [
  {
    id: "aivexa-1-5-core",
    title: "AIVEXA 1.5 Core",
    style: "Balanced for daily tasks and coding.",
  },
  {
    id: "aivexa-1-5-pro",
    title: "AIVEXA 1.5 Pro",
    style: "Deeper planning and structured responses.",
  },
  {
    id: "aivexa-1-5-turbo",
    title: "AIVEXA 1.5 Turbo",
    style: "Fast concise output mode.",
  },
  {
    id: "aivexa-1-5-vision",
    title: "AIVEXA 1.5 Vision",
    style: "Context-rich explanations.",
  },
  {
    id: "aivexa-1-5-ultra",
    title: "AIVEXA 1.5 Ultra",
    style: "Premium strategic intelligence mode.",
  },
];

const FEATURES = [
  { title: "5 AIVEXA Models", text: "Switch instantly between AIVEXA 1.5 variants." },
  { title: "Built-in Smart Tools", text: "Notes + planner included in the panel." },
  { title: "Zero Setup", text: "No API key prompts. Just login and use it." },
  { title: "Focus Mode", text: "Hide side noise and lock into deep work." },
];

const state = {
  user: "",
  activeModel: MODEL_CONFIGS[0],
  tasksDone: 0,
};

const pages = {
  landing: document.getElementById("landingPage"),
  login: document.getElementById("loginPage"),
  os: document.getElementById("osPage"),
};

const featureCards = document.getElementById("featureCards");
const goLoginBtn = document.getElementById("goLoginBtn");
const learnMoreBtn = document.getElementById("learnMoreBtn");
const loginForm = document.getElementById("loginForm");
const backLandingBtn = document.getElementById("backLandingBtn");
const usernameInput = document.getElementById("usernameInput");
const welcomeTitle = document.getElementById("welcomeTitle");
const logoutBtn = document.getElementById("logoutBtn");
const focusBtn = document.getElementById("focusBtn");
const modePill = document.getElementById("modePill");

const modelList = document.getElementById("modelList");
const activeModel = document.getElementById("activeModel");
const chatLog = document.getElementById("chatLog");
const chatForm = document.getElementById("chatForm");
const promptInput = document.getElementById("promptInput");

const notesInput = document.getElementById("notesInput");
const saveNotesBtn = document.getElementById("saveNotesBtn");
const todoForm = document.getElementById("todoForm");
const todoInput = document.getElementById("todoInput");
const todoList = document.getElementById("todoList");
const taskDoneStat = document.getElementById("taskDoneStat");
const latencyStat = document.getElementById("latencyStat");
const clock = document.getElementById("clock");

function showPage(name) {
  Object.values(pages).forEach((page) => page.classList.remove("active"));
  pages[name].classList.add("active");
}

function renderFeatures() {
  featureCards.innerHTML = "";
  FEATURES.forEach((item) => {
    const card = document.createElement("article");
    card.className = "feature glass";
    card.innerHTML = `<h3>${item.title}</h3><p>${item.text}</p>`;
    featureCards.appendChild(card);
  });
}

function renderModels() {
  modelList.innerHTML = "";
  MODEL_CONFIGS.forEach((model) => {
    const btn = document.createElement("button");
    btn.className = `model-btn${model.id === state.activeModel.id ? " active" : ""}`;
    btn.type = "button";
    btn.innerHTML = `<strong>${model.title}</strong><br><small>${model.style}</small>`;
    btn.addEventListener("click", () => {
      state.activeModel = model;
      activeModel.textContent = model.title;
      renderModels();
      addAiBubble(`Model switched to ${model.title}. Ready for your next task.`);
    });
    modelList.appendChild(btn);
  });
}

function addBubble(type, message) {
  const div = document.createElement("div");
  div.className = `bubble ${type}`;
  div.textContent = message;
  chatLog.appendChild(div);
  chatLog.scrollTop = chatLog.scrollHeight;
}

function addAiBubble(text) {
  addBubble("ai", text);
}

function localAssistantReply(prompt) {
  const lower = prompt.toLowerCase();

  if (lower.includes("todo") || lower.includes("task")) {
    return "I can help: add tasks in Task Planner and mark checkboxes when completed. I can also break big tasks into steps if you paste one here.";
  }
  if (lower.includes("notes") || lower.includes("write")) {
    return "Use Quick Notes on the right side. I suggest: Goal → Key points → Next actions for clean planning.";
  }
  if (lower.includes("plan") || lower.includes("roadmap")) {
    return "Here is a fast roadmap: 1) Define objective, 2) Split milestones, 3) Daily execution block, 4) Review and iterate.";
  }
  if (lower.includes("hello") || lower.includes("hi")) {
    return `Hi ${state.user || "there"}! ${state.activeModel.title} is online. Tell me what you want to build.`;
  }

  const modelFlavor = {
    "aivexa-1-5-core": "Balanced response:",
    "aivexa-1-5-pro": "Pro analysis:",
    "aivexa-1-5-turbo": "Turbo quick output:",
    "aivexa-1-5-vision": "Vision context output:",
    "aivexa-1-5-ultra": "Ultra strategic output:",
  }[state.activeModel.id];

  return `${modelFlavor} For "${prompt}", I recommend starting with a clear objective, then execute in short focused sprints with measurable checkpoints.`;
}

function updateClock() {
  clock.textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function randomLatency() {
  latencyStat.textContent = `${Math.floor(12 + Math.random() * 24)} ms`;
}

function loadNotes() {
  notesInput.value = localStorage.getItem("aivexa-notes") || "";
}

function renderTodos() {
  const todos = JSON.parse(localStorage.getItem("aivexa-todos") || "[]");
  todoList.innerHTML = "";
  state.tasksDone = todos.filter((t) => t.done).length;
  taskDoneStat.textContent = String(state.tasksDone);

  todos.forEach((todo, idx) => {
    const li = document.createElement("li");
    li.className = "todo-item";

    const box = document.createElement("input");
    box.type = "checkbox";
    box.checked = Boolean(todo.done);
    box.addEventListener("change", () => {
      const list = JSON.parse(localStorage.getItem("aivexa-todos") || "[]");
      list[idx].done = box.checked;
      localStorage.setItem("aivexa-todos", JSON.stringify(list));
      renderTodos();
    });

    const text = document.createElement("span");
    text.textContent = todo.text;

    li.append(box, text);
    todoList.appendChild(li);
  });
}

goLoginBtn.addEventListener("click", () => showPage("login"));
backLandingBtn.addEventListener("click", () => showPage("landing"));
learnMoreBtn.addEventListener("click", () => {
  window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
});

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  state.user = usernameInput.value.trim() || "User";
  welcomeTitle.textContent = `${state.user}'s AIVEXA OS Panel`;
  addAiBubble(`Welcome ${state.user}. ${state.activeModel.title} initialized.`);
  showPage("os");
});

logoutBtn.addEventListener("click", () => {
  showPage("landing");
  chatLog.innerHTML = "";
});

focusBtn.addEventListener("click", () => {
  document.body.classList.toggle("focus");
  modePill.textContent = document.body.classList.contains("focus") ? "Focus" : "Standard";
});

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const prompt = promptInput.value.trim();
  if (!prompt) {
    return;
  }

  addBubble("user", prompt);
  promptInput.value = "";

  setTimeout(() => {
    addAiBubble(localAssistantReply(prompt));
  }, 220);
});

saveNotesBtn.addEventListener("click", () => {
  localStorage.setItem("aivexa-notes", notesInput.value);
  addAiBubble("Notes saved successfully.");
});

todoForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = todoInput.value.trim();
  if (!text) {
    return;
  }

  const list = JSON.parse(localStorage.getItem("aivexa-todos") || "[]");
  list.push({ text, done: false });
  localStorage.setItem("aivexa-todos", JSON.stringify(list));
  todoInput.value = "";
  renderTodos();
});

renderFeatures();
renderModels();
loadNotes();
renderTodos();
updateClock();
randomLatency();
setInterval(updateClock, 10_000);
setInterval(randomLatency, 4_000);
