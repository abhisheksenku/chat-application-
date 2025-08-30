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
    let myName = null;
    //Authentication
    const token = localStorage.getItem('token');
    if (!token) {
        alert('You must be logged in');
        window.location.href = '/login';
        return;
    };
    //append function to create messages inside chat window
    const append = (message,type='received')=>{
        const el = document.createElement('div');
        el.innerText = message;
        el.classList.add('message',type);
        chatBox.appendChild(el);
        chatBox.scrollTop = chatBox.scrollHeight;       
    }
    //loadMessages function to fetch old messages with a contact, basically chat history
    const loadMessages = async (userId) => {
        try {
            const response = await axios.get(`${BASE_URL}/chat/fetch/${userId}?myId=${myUserId}`, {
                headers: { Authorization: token }
            });

            chatBox.innerHTML = '';
            const chatHistory = response.data || [];
            chatHistory.forEach(msg => {
                if (msg.senderId === myUserId) {
                    // message is sent by me → right side
                    append(`You: ${msg.message}`, 'sent');
                } else {
                    // message is from the other user
                    append(`${msg.senderName || 'User'}: ${msg.message}`, 'received');
                }
            });
        } catch (err) {
            console.error('Error while loading messages', err.response?.data || err.message);
        }
    };

    //to fetch all users for side bar and current logged in user too
    try {
        const loggedResponse = await axios.get(`${BASE_URL}/user/myaccount`,{
            headers:{Authorization:token}
        });
        myUserId= loggedResponse.data.id;
        myName = loggedResponse.data.name;
        const lastActiveChatId = loggedResponse.data.lastActiveChat;
        //to get all users
        const allUsersResponse = await axios.get(`${BASE_URL}/user/fetch`,{
            headers:{Authorization:token}
        });
        const allUsers = allUsersResponse.data || [];
        usersList.innerHTML = '';
        allUsers.forEach(user=>{
            // if(user.id===myUserId) return don't show self, but we already made in controller part
            const li = document.createElement('li');
            li.textContent = user.name;
            li.dataset.userId = user.id;
            li.addEventListener('click',async()=>{
                currentChatUser = user;
                chatHeader.textContent = user.name;
                document.querySelectorAll('#users li').forEach(
                        u=>u.classList.remove('active')
                );
                li.classList.add('active');
                try {
                    await axios.post(`${BASE_URL}/user/updateLastChat`,
                        {chatUserId:user.id},
                        {headers:{Authorization:token}}
                    );
                } catch (error) {
                    console.error('Failed to update the last chat',error);
                }
                //load the messages 
                await loadMessages(user.id)
            });
            usersList.appendChild(li);
        });
        if(lastActiveChatId){
            const li = [...document.querySelectorAll('#users li')].find(
                el=>Number(el.dataset.userId) === Number(lastActiveChatId)
            );
            const selectedUser = allUsers.find(u=>u.id === lastActiveChatId);
            if(li && selectedUser){
                li.classList.add('active');
                currentChatUser = selectedUser;
                chatHeader.textContent = selectedUser.name;
                await loadMessages(selectedUser.id);
            }
        }
    } catch (err) {
        console.error('Init error (myaccount/users):', err.response?.data || err.message);
    }
    //Websocket:Socket.io connection
    const socket = io('/',{
        auth:{token}
    });
    socket.on('connect',()=>{
        socket.emit('register',{userId:myUserId,name:myName});
    });
    //real time incoming messages
    socket.on('receive-message', (data) => {
    const isMine = data.from === myUserId;

    const isForCurrentChat =
        currentChatUser &&
        (isMine ? data.to === currentChatUser.id : data.from === currentChatUser.id);

    if (isForCurrentChat) {
        append(
        `${isMine ? 'You' : data.fromName}: ${data.message}`,
        isMine ? 'sent' : 'received'
        );
    } else if (!isMine) { // only count unread for received messages
        const li = [...document.querySelectorAll('#users li')].find(
        (el) => Number(el.dataset.userId) === data.from
        );
        if (li && !li.classList.contains('active')) {
        li.dataset.unread = (Number(li.dataset.unread || 0) + 1).toString();
        li.textContent = `${data.fromName} (${li.dataset.unread})`;
        }
    }
    });

      // Presence hooks (optional)
    socket.on('user-joined', ({ userId, name }) => {
        // console.log(`${name} joined`);
    });

    socket.on('left', ({ userId, name }) => {
        // console.log(`${name} left`);
    });

    socket.on('error-message', (p) => {
        console.error('Server error:', p?.message || p);
    });
    //sending messages
    sendForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const chatMessage = messageInput.value.trim();
        if (!chatMessage || !currentChatUser) return;

        socket.emit('send-message', {
        to: currentChatUser.id,
        message: chatMessage
        });

        // rely on receive-message echo
        sendForm.reset();
    });
    // Typing Indicator
    let typingTimeout = null;
    const sendTyping = (isTyping) => {
        if (!currentChatUser) return;
        socket.emit('typing', { to: currentChatUser.id, isTyping });
    };

    messageInput.addEventListener('input', () => {
        sendTyping(true);
        if (typingTimeout) clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => sendTyping(false), 1000);
    });

    socket.on('typing', ({ from, fromName, isTyping }) => {
        if (!currentChatUser || from !== currentChatUser.id) return;
        chatHeader.dataset.orig = chatHeader.dataset.orig || chatHeader.textContent;
        chatHeader.textContent = isTyping ? `${fromName} is typing...` : (chatHeader.dataset.orig || chatHeader.textContent);
        if (!isTyping) chatHeader.dataset.orig = '';
    });
    accountBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        accountMenu.style.display = accountMenu.style.display === 'block' ? 'none' : 'block';
    });

    logoutBtn.addEventListener('click', () => {
        document.cookie = 'token=; Max-Age=0; path=/';
        localStorage.removeItem('token');
        window.location.href = '/login';
    });

    window.addEventListener('click', (e) => {
        if (!accountBtn.contains(e.target) && !accountMenu.contains(e.target)) {
        accountMenu.style.display = 'none';
        }
    });
})