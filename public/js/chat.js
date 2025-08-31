document.addEventListener('DOMContentLoaded', async () => {
    const accountBtn = document.getElementById('accountBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const accountMenu = document.getElementById('accountMenu');
    const usersList = document.getElementById('users');
    const chatHeader = document.getElementById("chatHeader");
    const chatTitle = document.getElementById("chatTitle");
    const chatBox = document.getElementById("chatBox");
    const messageInput = document.getElementById("messageInput");
    const sendForm = document.getElementById("sendForm");
    const createGroupBtn = document.getElementById("createGroupBtn");
    const createGroupModal = document.getElementById("createGroupModal");

    const groupNameInput = document.getElementById("groupName");
    const groupMembersList = document.getElementById("groupMembersList");
    const saveGroupBtn = document.getElementById("saveGroupBtn");
    const cancelGroupBtn = document.getElementById("cancelGroupBtn");

    let currentChatUser = null;
    let myUserId = null;
    let lastMessages = [];
    let allUsers = [];

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

    const loadMessages = async (userId) => {
        try {
            const response = await axios.get(`${BASE_URL}/chat/fetch/${userId}`, {
                headers: { Authorization: token }
            });
            chatBox.innerHTML = '';
            const chatHistory = response.data;
            chatHistory.forEach(msg => {
                const type = msg.UserId === myUserId ? 'sent' : 'received';
                append(msg.UserId === myUserId ? `You: ${msg.message}` : msg.message, type);
            });
            lastMessages = chatHistory.map(msg => msg.id);
        } catch (error) {
            console.error('Error while loading messages', error.response?.data || error.message);
        }
    };

    // Fetch my account info and all users
    try {
        const myResponse = await axios.get(`${BASE_URL}/user/myaccount`, {
            headers: { Authorization: token }
        });
        myUserId = myResponse.data.id;
        const lastActiveChatId = myResponse.data.lastActiveChat;

        const response = await axios.get(`${BASE_URL}/user/fetch`, {
            headers: { Authorization: token }
        });
        allUsers = response.data;

        usersList.innerHTML = '';
        allUsers.forEach(user => {
            const li = document.createElement('li');
            li.textContent = user.name;
            li.setAttribute('data-user', user.name);

            if (user.isGroup) li.classList.add('group');

            li.addEventListener('click', async () => {
                currentChatUser = user;
                chatTitle.textContent = user.name; // Only update span
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

        if (lastActiveChatId) {
            const selectedUser = allUsers.find(u => u.id === lastActiveChatId);
            if (selectedUser) {
                currentChatUser = selectedUser;
                chatTitle.textContent = selectedUser.name;
                const li = [...document.querySelectorAll('#users li')]
                    .find(el => el.getAttribute('data-user') === selectedUser.name);
                if (li) li.classList.add('active');
                loadMessages(selectedUser.id);
            }
        }

    } catch (error) {
        console.error('Error fetching users:', error.response?.data || error.message);
    }

    // Poll new messages
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

    // Send message
    sendForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const chatMessage = messageInput.value.trim();
        if (!chatMessage || !currentChatUser) return;

        try {
            let response;
            if (currentChatUser.isGroup) {
                response = await axios.post(`${BASE_URL}/chat/add/group`, {
                    message: chatMessage,
                    groupId: currentChatUser.id
                }, { headers: { Authorization: token } });
            } else {
                response = await axios.post(`${BASE_URL}/chat/add`, {
                    message: chatMessage,
                    to: currentChatUser.id
                }, { headers: { Authorization: token } });
            }
            append(`You: ${chatMessage}`, 'sent');
            sendForm.reset();
            lastMessages.push(response.data.id);
        } catch (error) {
            console.error('Error while sending message', error);
        }
    });

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

    // === CREATE GROUP FUNCTIONALITY ===
    createGroupBtn.addEventListener('click', () => {
        createGroupModal.style.display = "flex";

        // Populate members list excluding myself
        groupMembersList.innerHTML = '';
        allUsers.forEach(user => {
            if (user.id !== myUserId) {
                const label = document.createElement('label');
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.value = user.id;
                label.appendChild(checkbox);
                label.append(` ${user.name}`);
                groupMembersList.appendChild(label);
            }
        });
    });

    cancelGroupBtn.addEventListener('click', () => {
        createGroupModal.style.display = "none";
    });

    saveGroupBtn.addEventListener('click', async () => {
        const selectedMembers = [...groupMembersList.querySelectorAll('input[type="checkbox"]:checked')].map(cb => parseInt(cb.value));
        const groupName = groupNameInput.value.trim();
        if (!groupName || selectedMembers.length === 0) {
            alert('Enter group name and select at least one member');
            return;
        }

        try {
            const response = await axios.post(`${BASE_URL}/group/create`, {
                name: groupName,
                members: selectedMembers
            }, { headers: { Authorization: token } });

            // Add new group to user list
            const newGroup = response.data;
            allUsers.push(newGroup);

            const li = document.createElement('li');
            li.textContent = newGroup.name;
            li.setAttribute('data-user', newGroup.name);
            li.classList.add('group');

            li.addEventListener('click', async () => {
                currentChatUser = newGroup;
                chatTitle.textContent = newGroup.name;
                document.querySelectorAll('#users li').forEach(u => u.classList.remove('active'));
                li.classList.add('active');
                chatBox.innerHTML = '';
                loadMessages(newGroup.id);
            });

            usersList.appendChild(li);
            createGroupModal.style.display = "none";
            groupNameInput.value = '';
        } catch (error) {
            console.error('Error creating group', error.response?.data || error.message);
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

//     let currentChatUser = null;
//     let myUserId = null;
//     let lastMessages = [];

//     const token = localStorage.getItem('token');
//     if (!token) {
//         alert('You must be logged in');
//         window.location.href = '/login';
//         return;
//     }

//     const append = (chatMessage, type) => {
//         const messageElement = document.createElement('div');
//         messageElement.innerText = chatMessage;
//         messageElement.classList.add('message', type);
//         chatBox.appendChild(messageElement);
//         chatBox.scrollTop = chatBox.scrollHeight;
//     };

//     const loadMessages = async (UserId) => {
//         try {
//             const response = await axios.get(`${BASE_URL}/chat/fetch/${UserId}`, {
//                 headers: { Authorization: token }
//             });
//             chatBox.innerHTML = '';
//             const ChatHistory = response.data;
//             ChatHistory.forEach(msg => {
//                 const type = msg.UserId === myUserId ? 'sent' : 'received';
//                 append(msg.UserId === myUserId ? `You: ${msg.message}` : msg.message, type);
//             });
//             lastMessages = ChatHistory.map(msg => msg.id);
//         } catch (error) {
//             console.error('Error while loading messages', error.response?.data || error.message);
//         }
//     };

//     try {
//         const myresponse = await axios.get(`${BASE_URL}/user/myaccount`, {
//             headers: { Authorization: token }
//         });
//         myUserId = myresponse.data.id;
//         const lastActiveChatId = myresponse.data.lastActiveChat;

//         const response = await axios.get(`${BASE_URL}/user/fetch`, {
//             headers: { Authorization: token }
//         });
//         const allUsers = response.data;

//         if (lastActiveChatId) {
//             const selectedUser = allUsers.find(u => u.id === lastActiveChatId);
//             if (selectedUser) {
//                 currentChatUser = selectedUser;
//                 chatHeader.textContent = selectedUser.name;
//                 const li = [...document.querySelectorAll('#users li')]
//                     .find(el => el.getAttribute('data-user') === selectedUser.name);
//                 if (li) li.classList.add('active');
//                 loadMessages(selectedUser.id);
//             }
//         }

//         usersList.innerHTML = '';
//         allUsers.forEach(user => {
//             const li = document.createElement('li');
//             li.textContent = user.name;
//             li.setAttribute('data-user', user.name);

//             li.addEventListener('click', async () => {
//                 currentChatUser = user;
//                 chatHeader.textContent = user.name;
//                 document.querySelectorAll('#users li').forEach(u => u.classList.remove('active'));
//                 li.classList.add('active');
//                 try {
//                     await axios.post(`${BASE_URL}/user/updateLastChat`, { chatUserId: user.id }, {
//                         headers: { Authorization: token }
//                     });
//                 } catch (error) {
//                     console.error('Failed to update last chat', error);
//                 }
//                 chatBox.innerHTML = '';
//                 loadMessages(user.id);
//             });

//             usersList.appendChild(li);
//         });

//     } catch (error) {
//         console.error('Error fetching users:', error.response?.data || error.message);
//     }

//     const pollNewMessages = async () => {
//         if (!currentChatUser) return;
//         try {
//             const response = await axios.get(`${BASE_URL}/chat/fetch/${currentChatUser.id}`, {
//                 headers: { Authorization: token }
//             });
//             const messages = response.data;
//             const newMessageIds = messages.map(msg => msg.id);
//             if (newMessageIds.join(',') !== lastMessages.join(',')) {
//                 chatBox.innerHTML = '';
//                 messages.forEach(msg => {
//                     const type = msg.UserId === myUserId ? 'sent' : 'received';
//                     append(msg.UserId === myUserId ? `You: ${msg.message}` : msg.message, type);
//                 });
//                 lastMessages = newMessageIds;
//             }
//         } catch (error) {
//             console.error('Error fetching new messages:', error.response?.data || error.message);
//         }
//     };
//     setInterval(pollNewMessages, 1000);

//     sendForm.addEventListener('submit', async (event) => {
//         event.preventDefault();
//         const chatMessage = messageInput.value.trim();
//         if (!chatMessage || !currentChatUser) return;
//         try {
//             const response = await axios.post(`${BASE_URL}/chat/add`, {
//                 message: chatMessage,
//                 to: currentChatUser.id
//             }, {
//                 headers: { Authorization: token }
//             });
//             append(`You: ${chatMessage}`, 'sent');
//             sendForm.reset();
//             lastMessages.push(response.data.id);
//         } catch (error) {
//             console.error('Error while sending message', error);
//         }
//     });

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