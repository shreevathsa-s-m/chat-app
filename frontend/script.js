const BACKEND_URL = "https://chat-backend-lhas.onrender.com";  
const socket = io(BACKEND_URL);

// Load old messages
async function loadMessages() {
  try {
    const res = await fetch(`${BACKEND_URL}/messages`);
    const messages = await res.json();

    const box = document.getElementById("chat-box");

    messages.forEach((m) => {
      box.innerHTML += `<p><b>${m.username}:</b> ${m.message}</p>`;
    });
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
  const box = document.getElementById("chat-box");
  box.innerHTML += `<p><b>${msg.username}:</b> ${msg.message}</p>`;
});

// Load messages on start
window.onload = loadMessages;
