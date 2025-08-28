document.addEventListener('DOMContentLoaded', async () => {
    const accountBtn = document.getElementById('accountBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const accountMenu = document.getElementById('accountMenu');
    const usersList = document.getElementById('users');
    const chatHeader = document.getElementById("chatHeader");
    const chatBox = document.getElementById("chatBox");
    const messageInput = document.getElementById("messageInput");
    const sendForm = document.getElementById("sendForm");

    const token = localStorage.getItem('token');
    if (!token) {
        alert('You must be logged in');
        window.location.href = '/login';
        return;
    }

    try {
        const response = await axios.get(`${BASE_URL}/user/fetch`, {
            headers: { Authorization: token }
        });
        const allUsers = response.data;
        console.log('Users fetched', allUsers);

        // Clear sidebar first
        usersList.innerHTML = '';

        // Show users in sidebar
        allUsers.forEach(user => {
            const li = document.createElement('li');
            li.textContent = user.name;
            li.setAttribute('data-user', user.name);

            // When clicked, just set header (no chats yet)
            li.addEventListener('click', () => {
                chatHeader.textContent = user.name;
                document.querySelectorAll('#users li').forEach(u => u.classList.remove('active'));
                li.classList.add('active');
            });

            usersList.appendChild(li);
        });

    } catch (error) {
        console.error('Error fetching users:', error.response ? error.response.data : error.message);
    }

    // Send message
    sendForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const chatMessage = messageInput.value.trim();
        if (!chatMessage) return;

        try {
            // Save to DB
            await axios.post(`${BASE_URL}/chat/add`, {
                message: chatMessage
            }, {
                headers: { Authorization: token }
            });

            // Show on screen
            append(`You: ${chatMessage}`, 'sent');
            sendForm.reset();
        } catch (error) {
            console.error('Error while sending message', error);
        }
    });

    // Append message to chat box
    const append = (chatMessage, type) => {
        const messageElement = document.createElement('div');
        messageElement.innerText = chatMessage;
        messageElement.classList.add('message', type); 
        // type = "sent" (me) OR "received" (others)
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;
    };


    // Account dropdown
    accountBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        accountMenu.style.display = accountMenu.style.display === "block" ? "none" : "block";
    });

    logoutBtn.addEventListener('click', () => {
        document.cookie = "token=; Max-Age=0; path=/";
        localStorage.removeItem('token');
        window.location.href = '/login';
    });

    window.addEventListener("click", (e) => {
        if (!accountBtn.contains(e.target) && !accountMenu.contains(e.target)) {
            accountMenu.style.display = "none";
        }
    });
});


// document.addEventListener('DOMContentLoaded',async ()=>{
//     const accountBtn = document.getElementById('accountBtn');
//     const logoutBtn = document.getElementById('logoutBtn');
//     const accountMenu = document.getElementById('accountMenu');
//     const token = localStorage.getItem('token');

    
//     const chatHeader = document.getElementById("chatHeader");
//     const chatBox = document.getElementById("chatBox");
//     const messageInput = document.getElementById("messageInput");
//     const sendBtn = document.getElementById("sendBtn");
//     if(!token){
//         alert('You must be logged in');
//         window.location.href = '/login';
//         return;
//     }
//     try {
//         const response = await axios.get(`${BASE_URL}/user/fetch`,{
//             headers: { Authorization: token}
//         });
//         const allUsers = response.data;
//         console.log('Users fetched',allUsers);
//         allUsers.forEach(user => {
//             user.addEventListener("click", () => {
//                 activeUser = user.getAttribute("data-user");
//                 chatHeader.textContent = `${activeUser}`;
//                 renderMessages(activeUser);
//             });
//         });
//     } catch (error) {
//         console.error('Error while fetching users:', error.response ? error.response.data : error.message);
//     }
//     accountBtn.addEventListener('click',(e)=>{
//         e.stopPropagation();
//         accountMenu.style.display = 
//         accountMenu.style.display === "block" ? "none" : "block";
//     });
//     logoutBtn.addEventListener('click',()=>{
//         document.cookie = "token=; Max-Age=0; path=/";
//         localStorage.removeItem('token');
//         window.location.href = '/login';
//     });
//     window.addEventListener("click", (e) => {
//         if (!accountBtn.contains(e.target) && !accountMenu.contains(e.target)) {
//             accountMenu.style.display = "none";
//         }
//     });
// });
// function renderMessages() {
//   chatBox.innerHTML = "";
//   if (!activeUser) return;

//   chats[activeUser].forEach(msg => {
//     const div = document.createElement("div");
//     div.classList.add("message", msg.type);
//     div.textContent = msg.text;
//     chatBox.appendChild(div);
//   });

//   chatBox.scrollTop = chatBox.scrollHeight;
// }