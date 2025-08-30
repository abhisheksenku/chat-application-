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
    let lastMessages = []; // store IDs of messages to avoid duplicates

    const token = localStorage.getItem('token');
    if (!token) {
        alert('You must be logged in');
        window.location.href = '/login';
        return;
    }

    // --- Append message to chat ---
    const append = (chatMessage, type) => {
        const messageElement = document.createElement('div');
        messageElement.innerText = chatMessage;
        messageElement.classList.add('message', type);
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;
    };

    // --- Load users and last active chat ---
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

                // Update last active chat in backend
                try {
                    await axios.post(`${BASE_URL}/user/updateLastChat`,
                        { chatUserId: user.id },
                        { headers: { Authorization: token } }
                    );
                } catch (error) {
                    console.error('Failed to update last chat', error);
                }

                chatBox.innerHTML = '';
                lastMessages = []; // reset last messages when switching chat
                pollNewMessages(); // load messages immediately
            });

            usersList.appendChild(li);
        });

        // Set last active chat if exists
        if (lastActiveChatId) {
            const selectedUser = allUsers.find(u => u.id === lastActiveChatId);
            if (selectedUser) {
                currentChatUser = selectedUser;
                chatHeader.textContent = selectedUser.name;
                const li = [...document.querySelectorAll('#users li')]
                    .find(el => el.getAttribute('data-user') === selectedUser.name);
                if (li) li.classList.add('active');
                pollNewMessages(); // load messages immediately
            }
        }

    } catch (error) {
        console.error('Error fetching users:', error.response ? error.response.data : error.message);
    }

    // --- Polling function to fetch new messages ---
    const pollNewMessages = async () => {
        if (!currentChatUser) return;

        try {
            const response = await axios.get(`${BASE_URL}/chat/fetch/${currentChatUser.id}`, {
                headers: { Authorization: token }
            });

            const messages = response.data;

            // Append only new messages
            messages.forEach(msg => {
                if (!lastMessages.includes(msg.id)) {
                    const type = msg.UserId === myUserId ? 'sent' : 'received';
                    append(msg.UserId === myUserId ? `You: ${msg.message}` : msg.message, type);
                    lastMessages.push(msg.id);
                }
            });

        } catch (error) {
            console.error('Error fetching new messages:', error.response?.data || error.message);
        }
    };

    setInterval(pollNewMessages, 1000); // poll every second

    // --- Send message ---
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

            // Append to screen immediately
            // append(`You: ${chatMessage}`, 'sent');
            sendForm.reset();

            // Update lastMessages to prevent duplicate
            const newMessageId = response.data.id; // backend must return message ID
            lastMessages.push(newMessageId);

        } catch (error) {
            console.error('Error while sending message', error);
        }
    });

    // --- Account dropdown ---
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
//     let lastMessages = [];//to keep track of last messages to avoid duplicates

//     const token = localStorage.getItem('token');
//     if (!token) {
//         alert('You must be logged in');
//         window.location.href = '/login';
//         return;
//     }
//     const loadMessages = async (UserId) => {
//       try {
//         const response = await axios.get(`${BASE_URL}/chat/fetch/${UserId}`,{
//           headers:{Authorization:token}
//         });        
//         chatBox.innerHTML = '';
//         const ChatHistory = response.data;
//         console.log('Chat history:',ChatHistory);
//         ChatHistory.forEach(msg => {
//           const type = msg.UserId === myUserId ? 'sent' : 'received';
//           append(msg.message, type);
//         });
//       } catch (error) {
//         console.error('Error while loading Messages',error.response?.data||error.message);
//       }
//     }
//     try {
//         const myresponse = await axios.get(`${BASE_URL}/user/myaccount`,{
//           headers:{Authorization:token}
//         });
//         myUserId = myresponse.data.id;
//         const lastActiveChatId = myresponse.data.lastActiveChat;


//         const response = await axios.get(`${BASE_URL}/user/fetch`, {
//             headers: { Authorization: token }
//         });
//         const allUsers = response.data;
//         console.log('Users fetched', allUsers);
//         if(lastActiveChatId){
//           const selectedUser = allUsers.find(u=>u.id === lastActiveChatId);
//           if(selectedUser){
//             currentChatUser = selectedUser;
//             chatHeader.textContent = selectedUser.name;
//             const li = [...document.querySelectorAll('#users li')]
//                           .find(el=>el.getAttribute('data-user') === selectedUser.name);
//             if(li)li.classList.add('active');
//             loadMessages(selectedUser.id)
//           }
//         }
//         // Clear sidebar first
//         usersList.innerHTML = '';

//         // Show users in sidebar
//         allUsers.forEach(user => {
//             const li = document.createElement('li');
//             li.textContent = user.name;
//             li.setAttribute('data-user', user.name);

//             // When clicked, just set header (no chats yet)
//             li.addEventListener('click', async () => {
//               currentChatUser = user;
//                 chatHeader.textContent = user.name;
//                 // document.querySelectorAll('#users li').forEach(u => u.classList.remove('active'));
//                 const userLists = document.querySelectorAll('#users li');
//                 for(let i =0; i<userLists.length; i++){
//                   userLists[i].classList.remove('active');
//                 }
//                 li.classList.add('active');
//                 try {
//                   await axios.post(`${BASE_URL}/user/updateLastChat`,
//                     {chatUserId:user.id},
//                     {headers:{Authorization:token}}
//                   );
//                 } catch (error) {
//                   console.error('Failed to update last chat',error)
//                 }
//                 chatBox.innerHTML = ''
//                 //to load the current chat of the selected user
//                 loadMessages(user.id);
//             });

//             usersList.appendChild(li);
//         });

//     } catch (error) {
//         console.error('Error fetching users:', error.response ? error.response.data : error.message);
//     };

//     const pollNewMessages = async()=>{
//       if (!currentChatUser) return;
//         try {
//           const response = await axios.get(`${BASE_URL}/chat/fetch/${currentChatUser.id}`, {
//               headers: { Authorization: token }
//           });

//           const messages = response.data;

//           const newMessageIds = messages.map(msg => msg.id);
//           if (newMessageIds.join(',') !== lastMessages.join(',')) {
//               chatBox.innerHTML = '';
//               messages.forEach(msg => {
//                   const type = msg.UserId === myUserId ? 'sent' : 'received';
//                   append(msg.UserId === myUserId ? `You: ${msg.message}` : msg.message, type);
//               });
//               lastMessages = newMessageIds;
//           }
//       } catch (error) {
//           console.error('Error fetching new messages:', error.response?.data || error.message);
//       }
//     };
//     setInterval(pollNewMessages, 1000);

//     // Send message
//     sendForm.addEventListener('submit', async (event) => {
//         event.preventDefault();
//         const chatMessage = messageInput.value.trim();
//         if (!chatMessage || !currentChatUser) return;

//         try {
//             // Save to DB
//             await axios.post(`${BASE_URL}/chat/add`, {
//               message: chatMessage, 
//               to:currentChatUser.id                
//             }, {
//                 headers: { Authorization: token }
//             });

//             // Show on screen
//             append(`You: ${chatMessage}`, 'sent');
//             sendForm.reset();
//             // --- Update lastMessages to avoid duplicate on next poll ---
//             const newMessageId = response.data.id; // Assuming your backend returns the new message ID
//             lastMessages.push({ id: newMessageId, UserId: myUserId, message: chatMessage });
//         } catch (error) {
//             console.error('Error while sending message', error);
//       }
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