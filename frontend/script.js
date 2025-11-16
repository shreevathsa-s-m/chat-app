const BACKEND_URL = "https://chat-backend-lhas.onrender.com";
const socket = io(BACKEND_URL);

let joined = false;

// Utility: Get time
function getTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Short helper for querySelector
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
    console.log("Error loading history");
  }
}

// Join chat when username is entered
function joinChat() {
  const username = qs("username").value.trim();

  if (!joined && username !== "") {
    socket.emit("join", username);
    joined = true;
  }
}

// Detect username being typed or changed
qs("username").addEventListener("keyup", joinChat);
qs("username").addEventListener("change", joinChat);

// Send message
function sendMessage(e) {
  if (e) e.preventDefault();

  const username = qs("username").value.trim();
  const message = qs("message").value.trim();

  if (!username || !message) return;

  socket.emit("send_message", { username, message });
  qs("message").value = "";
}

// Receive real-time messages
socket.on("receive_message", data => {
  addMessage(data.username, data.message);
});

// Add message bubble to UI
function addMessage(username, message) {
  const chatBox = qs("chat-box");
  const me = qs("username").value.trim();
  const isMe = me && username === me;

  const row = document.createElement("div");
  row.className = "message-row";

  // Avatar (left side)
  if (!isMe) {
    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent = username.charAt(0).toUpperCase();
    row.appendChild(avatar);
  } else {
    let space = document.createElement("div");
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

// =============================
// ONLINE USERS REAL-TIME EVENTS
// =============================

// Listen for online users update
socket.on("online_users", (data) => {
  const { count, users } = data;

  // Update online count text
  qs("online-count").innerText = `Online Users: ${count}`;

  // Update list
  const list = qs("online-list");
  list.innerHTML = "";

  users.forEach(u => {
    list.innerHTML += `<li>${u}</li>`;
  });
});

// On window load
window.onload = () => {
  loadMessages();

  qs("set-name").onclick = () => {
    if (qs("username").value.trim()) {
      qs("message").focus();
    }
  };
};
