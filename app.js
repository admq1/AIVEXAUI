const MODEL_CONFIGS = [
  {
    id: "aivexa-1-5-core",
    title: "AIVEXA 1.5 Core",
    description: "Balanced assistant for daily productivity and research.",
    backendModel: "llama-3.1-8b-instant",
  },
  {
    id: "aivexa-1-5-pro",
    title: "AIVEXA 1.5 Pro",
    description: "Advanced reasoning mode for multi-step tasks.",
    backendModel: "llama-3.3-70b-versatile",
  },
  {
    id: "aivexa-1-5-turbo",
    title: "AIVEXA 1.5 Turbo",
    description: "Low-latency responses for rapid interactions.",
    backendModel: "mixtral-8x7b-32768",
  },
  {
    id: "aivexa-1-5-vision",
    title: "AIVEXA 1.5 Vision",
    description: "Wide-context mode for complex understanding.",
    backendModel: "gemma2-9b-it",
  },
  {
    id: "aivexa-1-5-ultra",
    title: "AIVEXA 1.5 Ultra",
    description: "Premium depth mode for strategic planning.",
    backendModel: "deepseek-r1-distill-llama-70b",
  },
];

const state = {
  activeModel: MODEL_CONFIGS[0],
  messages: [],
};

const modelList = document.getElementById("modelList");
const activeModelTitle = document.getElementById("activeModelTitle");
const chatLog = document.getElementById("chatLog");
const chatForm = document.getElementById("chatForm");
const promptInput = document.getElementById("promptInput");
const apiKeyDialog = document.getElementById("apiKeyDialog");
const apiKeyButton = document.getElementById("apiKeyButton");
const apiKeyForm = document.getElementById("apiKeyForm");
const apiKeyInput = document.getElementById("apiKeyInput");
const clock = document.getElementById("clock");

function renderModels() {
  modelList.innerHTML = "";
  MODEL_CONFIGS.forEach((model) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = `model-card${model.id === state.activeModel.id ? " active" : ""}`;
    card.innerHTML = `<strong>${model.title}</strong><br /><small>${model.description}</small>`;
    card.addEventListener("click", () => {
      state.activeModel = model;
      activeModelTitle.textContent = model.title;
      renderModels();
    });
    modelList.appendChild(card);
  });
}

function renderMessage(role, content) {
  const article = document.createElement("article");
  article.className = `message ${role}`;
  article.innerHTML = `<h3>${role === "user" ? "You" : "AIVEXA"}</h3><p>${content}</p>`;
  chatLog.appendChild(article);
  chatLog.scrollTop = chatLog.scrollHeight;
}

function getApiKey() {
  return localStorage.getItem("aivexa-cloud-key") || "";
}

function updateClock() {
  clock.textContent = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function sendPrompt(prompt) {
  const apiKey = getApiKey();
  if (!apiKey) {
    apiKeyDialog.showModal();
    throw new Error("Missing API key");
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: state.activeModel.backendModel,
      messages: [
        {
          role: "system",
          content:
            "You are AIVEXA AI operating inside the AIVEXA OS user panel. Never mention provider details.",
        },
        ...state.messages,
      ],
      temperature: 0.5,
      max_tokens: 800,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Cloud request failed: ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "No response generated.";
}

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const prompt = promptInput.value.trim();
  if (!prompt) {
    return;
  }

  renderMessage("user", prompt);
  state.messages.push({ role: "user", content: prompt });
  promptInput.value = "";

  const thinkingBubble = document.createElement("article");
  thinkingBubble.className = "message ai";
  thinkingBubble.innerHTML = "<h3>AIVEXA</h3><p>Thinking...</p>";
  chatLog.appendChild(thinkingBubble);
  chatLog.scrollTop = chatLog.scrollHeight;

  try {
    const completion = await sendPrompt(prompt);
    thinkingBubble.remove();
    renderMessage("ai", completion);
    state.messages.push({ role: "assistant", content: completion });
  } catch (error) {
    thinkingBubble.remove();
    renderMessage("ai", `Unable to process request: ${error.message}`);
  }
});

apiKeyButton.addEventListener("click", () => {
  apiKeyInput.value = getApiKey();
  apiKeyDialog.showModal();
});

apiKeyForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(apiKeyForm);
  const action = formData.get("action");
  if (action === "cancel") {
    apiKeyDialog.close();
    return;
  }

  localStorage.setItem("aivexa-cloud-key", apiKeyInput.value.trim());
  apiKeyDialog.close();
});

updateClock();
setInterval(updateClock, 10_000);
renderModels();
