const BACKEND_URL = "https://chat-backend-lhas.onrender.com";
const socket = io(BACKEND_URL);

let joined = false;

// Utility: Get time
function getTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Short helper for getElementById
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

// Join chat (called intentionally when user confirms their name)
function joinChat() {
  const username = qs("username").value.trim();
  if (!username) return;

  // If already joined but username changed, re-join with new name
  socket.emit("join", username);
  joined = true;
  // optional: provide visual feedback that name is set
  qs("set-name").textContent = "Set";
}

// Send message (form submit)
function sendMessage(e) {
  if (e) e.preventDefault();

  const username = qs("username").value.trim();
  const message = qs("message").value.trim();

  // If user hasn't set a name yet, join now with the full name
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

// Add message bubble to UI (keep your existing structure)
function addMessage(username, message) {
  const chatBox = qs("chat-box");
  const me = qs("username").value.trim();
  const isMe = me && username === me;

  const row = document.createElement("div");
  row.className = "message-row";

  // Avatar (left side) or spacer for my messages
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

// =============================
// ONLINE USERS REAL-TIME EVENTS
// =============================
socket.on("online_users", (data) => {
  const { count, users } = data;

  // Update online count text
  const oc = qs("online-count");
  if (oc) oc.innerText = `Online Users: ${count}`;

  // Update list
  const list = qs("online-list");
  if (list) {
    list.innerHTML = "";
    users.forEach(u => {
      list.innerHTML += `<li>${u}</li>`;
    });
  }
});

// Wire up UI events after DOM ready
window.onload = () => {
  loadMessages();

  // Set-name button click — user confirms their full name
  const setBtn = qs("set-name");
  if (setBtn) {
    setBtn.addEventListener("click", () => {
      joinChat();
      qs("message").focus();
    });
  }

  // Also allow Enter key in username input to set name
  const usernameInput = qs("username");
  if (usernameInput) {
    usernameInput.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter") {
        ev.preventDefault();
        joinChat();
        qs("message").focus();
      }
    });
  }

  // Optional: if user presses Enter in message box, the form onsubmit already calls sendMessage
};
