const users = document.querySelectorAll("#users li");
const chatHeader = document.getElementById("chatHeader");
const chatBox = document.getElementById("chatBox");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

let activeUser = null;

// Store chats for each user
const chats = {
  "User 1": [],
  "User 2": []
};

// Select user
users.forEach(user => {
  user.addEventListener("click", () => {
    activeUser = user.getAttribute("data-user");
    chatHeader.textContent = `Chat with ${activeUser}`;
    renderMessages();
  });
});

// Send message
sendBtn.addEventListener("click", () => {
  const message = messageInput.value.trim();
  if (message && activeUser) {
    chats[activeUser].push({ type: "sent", text: message });
    messageInput.value = "";
    renderMessages();

    // Fake received message after 1 sec
    setTimeout(() => {
      chats[activeUser].push({ type: "received", text: `Reply from ${activeUser}` });
      renderMessages();
    }, 1000);
  }
});

// Render chat messages
function renderMessages() {
  chatBox.innerHTML = "";
  if (!activeUser) return;

  chats[activeUser].forEach(msg => {
    const div = document.createElement("div");
    div.classList.add("message", msg.type);
    div.textContent = msg.text;
    chatBox.appendChild(div);
  });

  chatBox.scrollTop = chatBox.scrollHeight;
}
