let users = {}; // In-memory user storage

function toggleForm() {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const title = document.getElementById('form-title');
    const toggleLink = document.querySelector('.toggle-link');
    document.getElementById('message').textContent = '';

    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => input.value = '');

    if (loginForm.style.display === 'none') {
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
        title.textContent = 'Login';
        toggleLink.textContent = "Don't have an account? Sign up";
    } else {
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
        title.textContent = 'Sign Up';
        toggleLink.textContent = 'Already have an account? Login';
    }
}

function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (users[email] && users[email] === password) {
        document.getElementById('message').style.color = 'green';
        document.getElementById('message').textContent = 'Login successful!';
    } else {
        document.getElementById('message').style.color = 'red';
        document.getElementById('message').textContent = 'Invalid credentials.';
    }
}

function signup() {
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    if (users[email]) {
        document.getElementById('message').style.color = 'red';
        document.getElementById('message').textContent = 'Email already exists.';
    } else {
        users[email] = password;
        document.getElementById('message').style.color = 'green';
        document.getElementById('message').textContent = 'Signup successful! Please login.';
        toggleForm(); // Switch to login form
    }
}