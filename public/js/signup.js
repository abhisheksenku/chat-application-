document.addEventListener('DOMContentLoaded',()=>{
    const signUPForm = document.getElementById('signupForm');
    signUPForm.addEventListener('submit',async (event)=>{
        event.preventDefault();
        const formData = new FormData(signUPForm);
        const formValues = Object.fromEntries(formData.entries());
        console.log(formValues);
        try {
            const response = await axios.post(`${BASE_URL}/user/add`,formValues);
            console.log('User added:',response.data);
            console.log('Response of add',response);
            window.location.href = 'login';
            signUPForm.reset();
        } catch (error) {
            console.log('Error caught',error);
            if(error.response && error.response.status === 409){
                console.log('Alerting User');
                alert(error.response.data.error)
            }
            else{
                alert('Something went wrong');
            }
        }
        
    });
});