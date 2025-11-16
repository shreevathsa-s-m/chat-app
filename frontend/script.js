const BACKEND_URL = "https://chat-backend-lhas.onrender.com";  
const socket = io(BACKEND_URL);

function getTime() {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Load old messages
async function loadMessages() {
  try {
    const res = await fetch(`${BACKEND_URL}/messages`);
    const messages = await res.json();

    messages.forEach((m) => addMessage(m.username, m.message));
  } catch (err) {
    console.error("Failed to load messages", err);
  }
}

// Send message
function sendMessage() {
  const username = document.getElementById("username").value;
  const message = document.getElementById("message").value;

  if (!username || !message) return;

  socket.emit("send_message", { username, message });
  document.getElementById("message").value = "";
}

// Receive live message
socket.on("receive_message", (msg) => {
  addMessage(msg.username, msg.message);
});

// Add message to UI with bubble + avatar + time
function addMessage(username, message) {
  const chatBox = document.getElementById("chat-box");

  const currentUser = document.getElementById("username").value;
  const isMe = username === currentUser;

  const row = document.createElement("div");
  row.classList.add("message-row");

  // Avatar (for others only)
  let avatar = "";
  if (!isMe) {
    const letter = username.charAt(0).toUpperCase();
    avatar = `<div class="avatar">${letter}</div>`;
  }

  // Bubble
  const bubbleClass = isMe ? "bubble bubble-right" : "bubble bubble-left";

  row.innerHTML = `
    ${isMe ? "" : avatar}
    <div>
      <div class="${bubbleClass}">
        <b>${username}:</b> ${message}
      </div>
      <span class="time">${getTime()}</span>
    </div>
  `;

  chatBox.appendChild(row);

  // Auto-scroll to latest
  chatBox.scrollTop = chatBox.scrollHeight;
}

window.onload = loadMessages;
