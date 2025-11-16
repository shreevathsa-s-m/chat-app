const BACKEND_URL = "https://chat-backend-lhas.onrender.com";
const socket = io(BACKEND_URL);

let joined = false;

// Get formatted time
function getTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Shortcut for querySelector
function qs(id) {
  return document.getElementById(id);
}

// Load old messages from backend
async function loadMessages() {
  try {
    const res = await fetch(`${BACKEND_URL}/messages`);
    const messages = await res.json();
    messages.forEach(m => addMessage(m.username, m.message));
  } catch (e) {
    console.log("History load error");
  }
}

// ===== FIX: JOIN ONLY WHEN USER CLICKS "SET" =====
function joinChat() {
  const username = qs("username").value.trim();

  if (!username) return;

  socket.emit("join", username);   // send FULL name only
  joined = true;
}

// Send message
function sendMessage(e) {
  if (e) e.preventDefault();

  const username = qs("username").value.trim();
  const message = qs("message").value.trim();

  // If name not set yet, join now
  if (!joined && username) {
    joinChat();
  }

  if (!username || !message) return;

  socket.emit("send_message", { username, message });
  qs("message").value = "";
}

// Receive real-time messages
socket.on("receive_message", data => {
  addMessage(data.username, data.message);
});

// UI message bubble builder
function addMessage(username, message) {
  const chatBox = qs("chat-box");
  const me = qs("username").value.trim();
  const isMe = me && username === me;

  const row = document.createElement("div");
  row.className = "message-row";

  if (!isMe) {
    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent = username.charAt(0).toUpperCase();
    row.appendChild(avatar);
  } else {
    const space = document.createElement("div");
    space.style.width = "36px";
    row.appendChild(space);
  }

  const group = document.createElement("div");
  group.className = "msg-group";

  const name = document.createElement("div");
  name.className = "name";
  name.textContent = username;

  const bubble = document.createElement("div");
  bubble.className = isMe ? "bubble bubble-right" : "bubble bubble-left";
  bubble.textContent = message;

  const time = document.createElement("div");
  time.className = "time";
  time.textContent = getTime();

  group.appendChild(name);
  group.appendChild(bubble);
  group.appendChild(time);

  row.appendChild(group);
  chatBox.appendChild(row);

  chatBox.scrollTop = chatBox.scrollHeight;
}

// ===== ONLINE USERS LIST =====
socket.on("online_users", (data) => {
  const { count, users } = data;

  qs("online-count").innerText = `Online Users: ${count}`;

  const list = qs("online-list");
  list.innerHTML = "";

  users.forEach(u => {
    list.innerHTML += `<li>${u}</li>`;
  });
});

// ===== EVENTS ON PAGE LOAD =====
window.onload = () => {
  loadMessages();

  // Join only when Set button clicked
  qs("set-name").addEventListener("click", () => {
    joinChat();
    qs("message").focus();
  });

  // Enter key in username field also sets name
  qs("username").addEventListener("keydown", (ev) => {
    if (ev.key === "Enter") {
      ev.preventDefault();
      joinChat();
      qs("message").focus();
    }
  });
};
