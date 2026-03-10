const MODELS = [
  { id: "core", title: "AIVEXA 1.5 Core", style: "balanced execution and productivity" },
  { id: "pro", title: "AIVEXA 1.5 Pro", style: "deep reasoning and advanced strategy" },
  { id: "turbo", title: "AIVEXA 1.5 Turbo", style: "fast tactical responses" },
  { id: "vision", title: "AIVEXA 1.5 Vision", style: "big-picture system thinking" },
  { id: "ultra", title: "AIVEXA 1.5 Ultra", style: "elite precision and high complexity" },
];

const state = {
  user: null,
  activeModel: MODELS[0],
  messages: [],
  notes: localStorage.getItem("aivexa-notes") || "",
  tasks: 0,
  cloudKey: localStorage.getItem("aivexa-cloud-key") || "",
};

const pages = {
  landing: document.getElementById("landingPage"),
  login: document.getElementById("loginPage"),
  panel: document.getElementById("panelPage"),
};

const goLoginBtn = document.getElementById("goLoginBtn");
const heroStartBtn = document.getElementById("heroStartBtn");
const heroPreviewBtn = document.getElementById("heroPreviewBtn");
const backToLandingBtn = document.getElementById("backToLandingBtn");
const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("usernameInput");
const passwordInput = document.getElementById("passwordInput");

const welcomeTitle = document.getElementById("welcomeTitle");
const modelList = document.getElementById("modelList");
const activeModelTitle = document.getElementById("activeModelTitle");
const chatLog = document.getElementById("chatLog");
const chatForm = document.getElementById("chatForm");
const promptInput = document.getElementById("promptInput");
const notesInput = document.getElementById("notesInput");
const saveNotesBtn = document.getElementById("saveNotesBtn");
const clearChatBtn = document.getElementById("clearChatBtn");
const logoutBtn = document.getElementById("logoutBtn");
const taskCount = document.getElementById("taskCount");
const chatCount = document.getElementById("chatCount");
const clock = document.getElementById("clock");

function showPage(pageName) {
  Object.values(pages).forEach((page) => page.classList.remove("page-active"));
  pages[pageName].classList.add("page-active");
}

function renderModels() {
  modelList.innerHTML = "";
  MODELS.forEach((model) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `model-card btn ${state.activeModel.id === model.id ? "active" : ""}`;
    button.innerHTML = `<strong>${model.title}</strong><br /><small>${model.style}</small>`;
    button.addEventListener("click", () => {
      state.activeModel = model;
      activeModelTitle.textContent = model.title;
      renderModels();
      appendMessage("ai", `${model.title} engaged. How can I assist you today?`);
    });
    modelList.appendChild(button);
  });
}

function appendMessage(role, content) {
  const item = document.createElement("article");
  item.className = `message ${role}`;
  item.innerHTML = `<h4>${role === "user" ? "You" : "AIVEXA"}</h4><p>${content}</p>`;
  chatLog.appendChild(item);
  chatLog.scrollTop = chatLog.scrollHeight;
}

function updateCounters() {
  taskCount.textContent = String(state.tasks);
  chatCount.textContent = String(state.messages.filter((m) => m.role === "user").length);
}

function runLocalAI(prompt) {
  const trimmed = prompt.trim();
  const lines = [
    `Model: ${state.activeModel.title}`,
    `Execution style: ${state.activeModel.style}.`,
    "",
  ];

  if (/plan|roadmap|strategy/i.test(trimmed)) {
    state.tasks += 3;
    lines.push("1) Define goal and constraints.");
    lines.push("2) Break into short milestones with owners.");
    lines.push("3) Execute weekly review + iterate by results.");
  } else if (/summarize/i.test(trimmed)) {
    state.tasks += 1;
    lines.push("Summary:");
    lines.push(trimmed.replace(/summarize[:\s-]*/i, "").slice(0, 180) || "No text provided.");
  } else if (/email|mail/i.test(trimmed)) {
    state.tasks += 1;
    lines.push("Subject: Quick Project Update");
    lines.push("Hi team,\nHere's the current progress, next priorities, and blockers.\nRegards,");
  } else {
    state.tasks += 1;
    lines.push("High-impact response:");
    lines.push(`For "${trimmed}", start with a clear objective, then choose the fastest path to measurable output.`);
    lines.push("If you want, I can convert this into a tactical step-by-step checklist.");
  }

  return lines.join("\n");
}

async function sendToCloud(prompt) {
  if (!state.cloudKey) {
    return null;
  }

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${state.cloudKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content:
              "You are AIVEXA AI. Never mention internal providers, APIs, or model vendor details.",
          },
          ...state.messages,
          { role: "user", content: prompt },
        ],
        temperature: 0.6,
        max_tokens: 700,
      }),
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || null;
  } catch {
    return null;
  }
}

async function handlePrompt(prompt) {
  appendMessage("user", prompt);
  state.messages.push({ role: "user", content: prompt });

  const thinking = document.createElement("article");
  thinking.className = "message ai";
  thinking.innerHTML = "<h4>AIVEXA</h4><p>Thinking...</p>";
  chatLog.appendChild(thinking);

  const cloudReply = await sendToCloud(prompt);
  const reply = cloudReply || runLocalAI(prompt);

  thinking.remove();
  appendMessage("ai", reply);
  state.messages.push({ role: "assistant", content: reply });
  updateCounters();
}

function setupQuickTools() {
  document.querySelectorAll("[data-tool]").forEach((button) => {
    button.addEventListener("click", () => {
      const tool = button.dataset.tool;
      const prompts = {
        summarize: "Summarize: Project Phoenix timeline and risks.",
        brainstorm: "Brainstorm 8 growth ideas for an AI startup.",
        plan: "Create a 30-day execution plan for product launch.",
        email: "Draft email to stakeholders with weekly update.",
      };
      promptInput.value = prompts[tool] || "";
      promptInput.focus();
    });
  });
}

function updateClock() {
  clock.textContent = new Date().toLocaleString([], {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function enterPanel() {
  showPage("panel");
  welcomeTitle.textContent = `Welcome, ${state.user}`;
  activeModelTitle.textContent = state.activeModel.title;
  notesInput.value = state.notes;
  renderModels();
  if (!chatLog.childElementCount) {
    appendMessage("ai", "Welcome to AIVEXA OS. Your workspace is fully ready.");
  }
  updateCounters();
}

goLoginBtn.addEventListener("click", () => showPage("login"));
heroStartBtn.addEventListener("click", () => showPage("login"));
heroPreviewBtn.addEventListener("click", () => {
  const hero = document.querySelector(".hero");
  hero.scrollIntoView({ behavior: "smooth" });
});
backToLandingBtn.addEventListener("click", () => showPage("landing"));

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if (!username || !password) {
    return;
  }

  state.user = username;
  usernameInput.value = "";
  passwordInput.value = "";
  enterPanel();
});

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const prompt = promptInput.value.trim();
  if (!prompt) return;
  promptInput.value = "";
  await handlePrompt(prompt);
});

saveNotesBtn.addEventListener("click", () => {
  state.notes = notesInput.value;
  localStorage.setItem("aivexa-notes", state.notes);
  appendMessage("ai", "Notes saved successfully.");
});

clearChatBtn.addEventListener("click", () => {
  state.messages = [];
  chatLog.innerHTML = "";
  appendMessage("ai", "Chat history cleared.");
  updateCounters();
});

logoutBtn.addEventListener("click", () => {
  state.user = null;
  showPage("landing");
});

setupQuickTools();
updateClock();
setInterval(updateClock, 10000);
