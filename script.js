import { deepThinkPrompt } from "./deepThinkPrompt.js";
import { quickPrompt } from "./quickPrompt.js";

async function sendMessage() {
  const inputEl = document.getElementById("userInput");
  const msg = inputEl.value.trim();
  const messages = document.getElementById("messages");
  const mode = document.getElementById("modeSelect").value;

  if (!msg) return;

  // User message bubble
  const userBubble = document.createElement("div");
  userBubble.className = "flex justify-end";
  userBubble.innerHTML = `
    <div>
      <div class='bg-blue-600 text-white px-4 py-2 rounded-lg max-w-xl'>${msg}</div>
      <div class='text-xs text-gray-400 mt-1 text-right'>${new Date().toLocaleTimeString(
        [],
        { hour: "2-digit", minute: "2-digit" }
      )}</div>
    </div>`;
  messages.appendChild(userBubble);

  // Typing indicator
  const loader = document.createElement("div");
  loader.className =
    "flex justify-start items-center text-sm text-gray-500 animate-pulse";
  loader.textContent = "Sandy is thinking...";
  messages.appendChild(loader);
  inputEl.value = "";
  messages.scrollTo({ top: messages.scrollHeight, behavior: "smooth" });

  try {
    const messagesPayload =
      mode === "deep"
        ? [
            { role: "system", content: deepThinkPrompt },
            { role: "user", content: msg },
          ]
        : [
            { role: "system", content: quickPrompt },
            { role: "user", content: msg },
          ];
    if (mode === "deep") await new Promise((res) => setTimeout(res, 1200));

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization:
            "Bearer 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",
          "HTTP-Referer": "https://www.sitename.com",
          "X-Title": "SiteName",
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
    botBubble.appendChild(messageContainer);

    const timestamp = document.createElement("div");
    timestamp.className = "text-xs text-gray-400 mt-1";
    timestamp.textContent = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const container = document.createElement("div");
    container.appendChild(messageContainer);
    container.appendChild(timestamp);
    botBubble.appendChild(container);
    messages.appendChild(botBubble);

    // Typing effect
    let i = 0;
    function typeChar() {
      if (i < rawText.length) {
        messageContainer.innerHTML += rawText[i] === "\n" ? "<br>" : rawText[i];
        i++;
        setTimeout(typeChar, 15);
      } else {
        hljs.highlightAll();
        messages.scrollTo({ top: messages.scrollHeight, behavior: "smooth" });
      }
    }
    typeChar();
  } catch (e) {
    loader.remove();
    const error = document.createElement("div");
    error.className = "text-red-500 text-sm";
    error.textContent = "Error: " + e.message;
    messages.appendChild(error);
  }
}

document.getElementById("userInput").addEventListener("keydown", function (e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

window.sendMessage = sendMessage;
