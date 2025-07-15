import { deepThinkPrompt } from "./prompt/deepThinkPrompt.js";
import { quickPrompt } from "./prompt/quickPrompt.js";

async function sendMessage() {
  const inputEl = document.getElementById("userInput");
  const msg = inputEl.value.trim();
  const messages = document.getElementById("messages");
  const mode = document.getElementById("modeSelect").value;

  if (!msg) return;

  // User message
  const userBubble = document.createElement("div");
  userBubble.className = "flex justify-end";
  userBubble.innerHTML = `
    <div>
      <div class='bg-blue-600 text-white px-4 py-2 rounded-lg max-w-xl whitespace-pre-wrap'>${msg}</div>
      <div class='text-xs text-gray-400 mt-1 text-right'>${new Date().toLocaleTimeString(
        [],
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      )}</div>
    </div>`;
  messages.appendChild(userBubble);

  // Typing indicator
  const loader = document.createElement("div");
  loader.className = "flex justify-start text-sm text-gray-500 animate-pulse";
  loader.textContent = "Sandy is thinking...";
  messages.appendChild(loader);

  inputEl.value = "";
  messages.scrollTo({ top: messages.scrollHeight, behavior: "smooth" });

  const messagesPayload = [
    {
      role: "system",
      content: mode === "deep" ? deepThinkPrompt : quickPrompt,
    },
    { role: "user", content: msg },
  ];

  try {
    if (mode === "deep") await new Promise((r) => setTimeout(r, 1200));

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization:
            "Bearer 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",
          "HTTP-Referer": "http://127.0.0.1:5500", // match your local server
          "X-Title": "SandyAI",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model:
            mode === "quick"
              ? "mistralai/mistral-7b-instruct:free"
              : "deepseek/deepseek-r1:free",
          messages: messagesPayload,
        }),
      }
    );

    const data = await response.json();
    loader.remove();

    const rawText = data.choices?.[0]?.message?.content || "No response.";
    const botBubble = document.createElement("div");
    botBubble.className = "flex justify-start";

    const messageContainer = document.createElement("div");
    messageContainer.className =
      "bg-gray-100 text-gray-900 px-4 py-2 rounded-lg max-w-xl prose prose-sm";

    const timestamp = document.createElement("div");
    timestamp.className = "text-xs text-gray-400 mt-1";
    timestamp.textContent = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const wrapper = document.createElement("div");
    wrapper.appendChild(messageContainer);
    wrapper.appendChild(timestamp);
    botBubble.appendChild(wrapper);
    messages.appendChild(botBubble);

    // Typewriter animation
    let i = 0;
    function typeChar() {
      if (i < rawText.length) {
        messageContainer.innerHTML += rawText[i] === "\n" ? "<br>" : rawText[i];
        i++;
        setTimeout(typeChar, 10);
      } else {
        messageContainer.innerHTML = marked.parse(messageContainer.innerHTML);
        messages.scrollTo({ top: messages.scrollHeight, behavior: "smooth" });
      }
    }

    typeChar();
  } catch (err) {
    loader.remove();
    const error = document.createElement("div");
    error.className = "text-red-500 text-sm";
    error.textContent = "Error: " + err.message;
    messages.appendChild(error);
  }
}

// Send on Enter
document.getElementById("userInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

window.sendMessage = sendMessage;
