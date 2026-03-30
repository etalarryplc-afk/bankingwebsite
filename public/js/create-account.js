// Handle Create Account form submission
const createForm = document.getElementById('createAccountForm');
const createMessage = document.getElementById('createAccountMessage');

function showMessage(el, text, type = 'success') {
    el.textContent = text;
    el.classList.remove('success', 'error');
    el.classList.add(type);
}

createForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(createForm);

    // Basic client-side validation
    const accountType = formData.get('accountType');
    if (!formData.get('firstName') || !formData.get('lastName') || !formData.get('idNumber')) {
        showMessage(createMessage, 'Please fill in required fields (First Name, Last Name, ID Number).', 'error');
        return;
    }

    if (accountType === 'personal') {
        if (!formData.get('zip') || !formData.get('city')) {
            showMessage(createMessage, 'Zip and City are required for Personal accounts.', 'error');
            return;
        }
        if (!formData.get('idFront') || !formData.get('idBack')) {
            showMessage(createMessage, 'Please upload both front and back of your ID.', 'error');
            return;
        }
    }

    try {
        const res = await fetch('/api/create-account', {
            method: 'POST',
            body: formData
        });

        const data = await res.json();
        if (data.success) {
            showMessage(createMessage, data.message, 'success');
            createForm.reset();
            setTimeout(() => { createMessage.classList.remove('success', 'error'); }, 6000);
        } else {
            showMessage(createMessage, data.error || 'Failed to submit application.', 'error');
        }
    } catch (err) {
        console.error(err);
        showMessage(createMessage, 'An error occurred. Please try again later.', 'error');
    }
});
