document.addEventListener('DOMContentLoaded',()=>{
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit',async (event)=>{
        event.preventDefault();
        const formData = new FormData(loginForm);
        const formValues = Object.fromEntries(formData.entries());
        console.log(formValues);
        try {
            const response = await axios.post(`${BASE_URL}/user/login`,formValues);
            console.log('Login successful',response.data);
            localStorage.setItem('token',response.data.token);
            window.location.href = '/chat'
            loginForm.reset();
        } catch (error) {
            console.error('Error while loggin in:',error);
            alert('Invalid email or password')   
        }
    })
})