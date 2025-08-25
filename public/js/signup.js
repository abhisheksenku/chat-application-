document.addEventListener('DOMContentLoaded',()=>{
    const signUPForm = document.getElementById('signupForm');
    signUPForm.addEventListener('submit',(event)=>{
        event.preventDefault();
        const formData = new FormData(signUPForm);
        const formValues = Object.fromEntries(formData.entries());
        console.log(formValues);
        signUPForm.reset();
    })
})