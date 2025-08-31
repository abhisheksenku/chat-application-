document.addEventListener('DOMContentLoaded', async () => {
    const accountBtn = document.getElementById('accountBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const accountMenu = document.getElementById('accountMenu');
    const usersList = document.getElementById('users');
    const chatHeader = document.getElementById("chatHeader");
    const chatBox = document.getElementById("chatBox");
    const messageInput = document.getElementById("messageInput");
    const sendForm = document.getElementById("sendForm");

    let currentChatUser = null;
    let myUserId = null;
    let lastMessages = [];

    const token = localStorage.getItem('token');
    if (!token) {
        alert('You must be logged in');
        window.location.href = '/login';
        return;
    }

    const append = (chatMessage, type) => {
        const messageElement = document.createElement('div');
        messageElement.innerText = chatMessage;
        messageElement.classList.add('message', type);
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;
    };

    const loadMessages = async (UserId) => {
        try {
            const response = await axios.get(`${BASE_URL}/chat/fetch/${UserId}`, {
                headers: { Authorization: token }
            });
            chatBox.innerHTML = '';
            const ChatHistory = response.data;
            ChatHistory.forEach(msg => {
                const type = msg.UserId === myUserId ? 'sent' : 'received';
                append(msg.UserId === myUserId ? `You: ${msg.message}` : msg.message, type);
            });
            lastMessages = ChatHistory.map(msg => msg.id);
        } catch (error) {
            console.error('Error while loading messages', error.response?.data || error.message);
        }
    };

    try {
        const myresponse = await axios.get(`${BASE_URL}/user/myaccount`, {
            headers: { Authorization: token }
        });
        myUserId = myresponse.data.id;
        const lastActiveChatId = myresponse.data.lastActiveChat;

        const response = await axios.get(`${BASE_URL}/user/fetch`, {
            headers: { Authorization: token }
        });
        const allUsers = response.data;

        if (lastActiveChatId) {
            const selectedUser = allUsers.find(u => u.id === lastActiveChatId);
            if (selectedUser) {
                currentChatUser = selectedUser;
                chatHeader.textContent = selectedUser.name;
                const li = [...document.querySelectorAll('#users li')]
                    .find(el => el.getAttribute('data-user') === selectedUser.name);
                if (li) li.classList.add('active');
                loadMessages(selectedUser.id);
            }
        }

        usersList.innerHTML = '';
        allUsers.forEach(user => {
            const li = document.createElement('li');
            li.textContent = user.name;
            li.setAttribute('data-user', user.name);

            li.addEventListener('click', async () => {
                currentChatUser = user;
                chatHeader.textContent = user.name;
                document.querySelectorAll('#users li').forEach(u => u.classList.remove('active'));
                li.classList.add('active');
                try {
                    await axios.post(`${BASE_URL}/user/updateLastChat`, { chatUserId: user.id }, {
                        headers: { Authorization: token }
                    });
                } catch (error) {
                    console.error('Failed to update last chat', error);
                }
                chatBox.innerHTML = '';
                loadMessages(user.id);
            });

            usersList.appendChild(li);
        });

    } catch (error) {
        console.error('Error fetching users:', error.response?.data || error.message);
    }

    const pollNewMessages = async () => {
        if (!currentChatUser) return;
        try {
            const response = await axios.get(`${BASE_URL}/chat/fetch/${currentChatUser.id}`, {
                headers: { Authorization: token }
            });
            const messages = response.data;
            const newMessageIds = messages.map(msg => msg.id);
            if (newMessageIds.join(',') !== lastMessages.join(',')) {
                chatBox.innerHTML = '';
                messages.forEach(msg => {
                    const type = msg.UserId === myUserId ? 'sent' : 'received';
                    append(msg.UserId === myUserId ? `You: ${msg.message}` : msg.message, type);
                });
                lastMessages = newMessageIds;
            }
        } catch (error) {
            console.error('Error fetching new messages:', error.response?.data || error.message);
        }
    };
    setInterval(pollNewMessages, 1000);

    sendForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const chatMessage = messageInput.value.trim();
        if (!chatMessage || !currentChatUser) return;
        try {
            const response = await axios.post(`${BASE_URL}/chat/add`, {
                message: chatMessage,
                to: currentChatUser.id
            }, {
                headers: { Authorization: token }
            });
            append(`You: ${chatMessage}`, 'sent');
            sendForm.reset();
            lastMessages.push(response.data.id);
        } catch (error) {
            console.error('Error while sending message', error);
        }
    });

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



// document.addEventListener('DOMContentLoaded', async () => {
//     const accountBtn = document.getElementById('accountBtn');
//     const logoutBtn = document.getElementById('logoutBtn');
//     const accountMenu = document.getElementById('accountMenu');
//     const usersList = document.getElementById('users');
//     const chatHeader = document.getElementById("chatHeader");
//     const chatBox = document.getElementById("chatBox");
//     const messageInput = document.getElementById("messageInput");
//     const sendForm = document.getElementById("sendForm");
//     //to store the current selected user and logged in user
//     let currentChatUser = null;
//     let myUserId = null;

//     const token = localStorage.getItem('token');
//     if (!token) {
//         alert('You must be logged in');
//         window.location.href = '/login';
//         return;
//     }

//     try {
//         const myresponse = await axios.get(`${BASE_URL}/user/me`,{
//           headers:{Authorization:token}
//         });
//         myUserId = myresponse.data.id;

//         const response = await axios.get(`${BASE_URL}/user/fetch`, {
//             headers: { Authorization: token }
//         });
//         const allUsers = response.data;
//         console.log('Users fetched', allUsers);

//         // Clear sidebar first
//         usersList.innerHTML = '';

//         // Show users in sidebar
//         allUsers.forEach(user => {
//             const li = document.createElement('li');
//             li.textContent = user.name;
//             li.setAttribute('data-user', user.name);

//             // When clicked, just set header (no chats yet)
//             li.addEventListener('click', () => {
//               currentChatUser = user;
//                 chatHeader.textContent = user.name;
//                 // document.querySelectorAll('#users li').forEach(u => u.classList.remove('active'));
//                 const userLists = document.querySelectorAll('#users li');
//                 for(let i =0; i<userLists.length; i++){
//                   userLists[i].classList.remove('active');
//                 }
//                 li.classList.add('active');
//                 chatBox.innerHTML = ''
//                 //to load the current chat of the selected user
//                 loadMessages(user.id);
//             });

//             usersList.appendChild(li);
//         });

//     } catch (error) {
//         console.error('Error fetching users:', error.response ? error.response.data : error.message);
//     }
//     const loadMessages = async (UserId) => {
//       try {
//         const response = await axios.get(`${BASE_URL}/chat/fetch/${UserId}`,{
//           headers:{Authorization:token}
//         });
//         const messages = response.data;
//         console.log('Chat history:',messages);
//         chatBox.innerHTML = '';
//         const ChatHistory = response.data;
//         ChatHistory.forEach(msg=>{
//           append(`${msg.senderName}:${msg.message}`,
//             msg.senderId === myUserId ? 'sent':'received'
//           );
//         });
//       } catch (error) {
//         console.error('Error while loading Messages',error.response?.data||error.message);
//       }
//     }

//     // Send message
//     sendForm.addEventListener('submit', async (event) => {
//         event.preventDefault();
//         const chatMessage = messageInput.value.trim();
//         if (!chatMessage || !currentChatUser) return;

//         try {
//             // Save to DB
//             await axios.post(`${BASE_URL}/chat/add`, {
//                 to:currentChatUser.id,
//                 message: chatMessage
//             }, {
//                 headers: { Authorization: token }
//             });

//             // Show on screen
//             append(`You: ${chatMessage}`, 'sent');
//             sendForm.reset();
//         } catch (error) {
//             console.error('Error while sending message', error);
//         }
//     });

//     // Append message to chat box
//     const append = (chatMessage, type) => {
//         const messageElement = document.createElement('div');
//         messageElement.innerText = chatMessage;
//         messageElement.classList.add('message', type); 
//         // type = "sent" (me) OR "received" (others)
//         chatBox.appendChild(messageElement);
//         chatBox.scrollTop = chatBox.scrollHeight;
//     };


//     // Account dropdown
//     accountBtn.addEventListener('click', (e) => {
//         e.stopPropagation();
//         accountMenu.style.display = accountMenu.style.display === "block" ? "none" : "block";
//     });

//     logoutBtn.addEventListener('click', () => {
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


// // document.addEventListener('DOMContentLoaded',async ()=>{
// //     const accountBtn = document.getElementById('accountBtn');
// //     const logoutBtn = document.getElementById('logoutBtn');
// //     const accountMenu = document.getElementById('accountMenu');
// //     const token = localStorage.getItem('token');

    
// //     const chatHeader = document.getElementById("chatHeader");
// //     const chatBox = document.getElementById("chatBox");
// //     const messageInput = document.getElementById("messageInput");
// //     const sendBtn = document.getElementById("sendBtn");
// //     if(!token){
// //         alert('You must be logged in');
// //         window.location.href = '/login';
// //         return;
// //     }
// //     try {
// //         const response = await axios.get(`${BASE_URL}/user/fetch`,{
// //             headers: { Authorization: token}
// //         });
// //         const allUsers = response.data;
// //         console.log('Users fetched',allUsers);
// //         allUsers.forEach(user => {
// //             user.addEventListener("click", () => {
// //                 activeUser = user.getAttribute("data-user");
// //                 chatHeader.textContent = `${activeUser}`;
// //                 renderMessages(activeUser);
// //             });
// //         });
// //     } catch (error) {
// //         console.error('Error while fetching users:', error.response ? error.response.data : error.message);
// //     }
// //     accountBtn.addEventListener('click',(e)=>{
// //         e.stopPropagation();
// //         accountMenu.style.display = 
// //         accountMenu.style.display === "block" ? "none" : "block";
// //     });
// //     logoutBtn.addEventListener('click',()=>{
// //         document.cookie = "token=; Max-Age=0; path=/";
// //         localStorage.removeItem('token');
// //         window.location.href = '/login';
// //     });
// //     window.addEventListener("click", (e) => {
// //         if (!accountBtn.contains(e.target) && !accountMenu.contains(e.target)) {
// //             accountMenu.style.display = "none";
// //         }
// //     });
// // });
// // function renderMessages() {
// //   chatBox.innerHTML = "";
// //   if (!activeUser) return;

// //   chats[activeUser].forEach(msg => {
// //     const div = document.createElement("div");
// //     div.classList.add("message", msg.type);
// //     div.textContent = msg.text;
// //     chatBox.appendChild(div);
// //   });

// //   chatBox.scrollTop = chatBox.scrollHeight;
// // }