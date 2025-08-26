document.addEventListener('DOMContentLoaded',async ()=>{
    const accountBtn = document.getElementById('accountBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const accountMenu = document.getElementById('accountMenu');
    const token = localStorage.getItem('token');
    if(!token){
        alert('You must be logged in');
        window.location.href = '/login';
        return;
    }
    try {
        const response = await axios.get(`${BASE_URL}/user/fetch`,{
            headers: { Authorization: token}
        });
        const allUsers = response.data;
        console.log('Users fetched',allUsers);
    } catch (error) {
        console.error('Error while fetching users:', error.response ? error.response.data : error.message);
    }
    accountBtn.addEventListener('click',(e)=>{
        e.stopPropagation();
        accountMenu.style.display = 
        accountMenu.style.display === "block" ? "none" : "block";
    });
    logoutBtn.addEventListener('click',()=>{
        document.cookie = "token=; Max-Age=0; path=/";
        localStorage.removeItem('token');
        window.location.href = '/login';
    });
    window.addEventListener("click", (e) => {
        if (!accountBtn.contains(e.target) && !accountMenu.contains(e.target)) {
            accountMenu.style.display = "none";
        }
    });
})