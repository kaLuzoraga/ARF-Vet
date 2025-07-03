let users = {};

    function toggleForm() {
      const loginForm = document.getElementById('login-form');
      const signupForm = document.getElementById('signup-form');
      const title = document.getElementById('form-title');
      const toggleLink = document.querySelector('.toggle-link');
      document.getElementById('message').textContent = '';

      document.querySelectorAll('input').forEach(input => input.value = '');
      document.querySelectorAll('.error-msg').forEach(el => el.textContent = '');

      loginForm.classList.toggle('active');
      signupForm.classList.toggle('active');

      if (loginForm.classList.contains('active')) {
        title.textContent = 'Login';
        toggleLink.textContent = "Don't have an account? Sign up";
      } else {
        title.textContent = 'Sign Up';
        toggleLink.textContent = 'Already have an account? Login';
      }
    }

    function login() {
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value.trim();

      if (users[email] && users[email] === password) {
        document.getElementById('message').style.color = 'green';
        document.getElementById('message').textContent = 'Login successful!';
      } else {
        document.getElementById('message').style.color = 'red';
        document.getElementById('message').textContent = 'Invalid credentials.';
      }
    }

    function signup(event) {
      event.preventDefault();

      const name = document.getElementById('signup-name');
      const address = document.getElementById('signup-address');
      const phone = document.getElementById('signup-phone');
      const email = document.getElementById('signup-email');
      const password = document.getElementById('signup-password');
      const confirm = document.getElementById('confirm-password');

      let valid = true;

      document.querySelectorAll('.error-msg').forEach(el => el.textContent = '');

      if (!email.value.trim()) {
        document.getElementById('error-email').textContent = 'This field is required.';
        valid = false;
      }
      if (!password.value.trim()) {
        document.getElementById('error-password').textContent = 'This field is required.';
        valid = false;
      }
      if (!confirm.value.trim()) {
        document.getElementById('error-confirm').textContent = 'This field is required.';
        valid = false;
      }
      if (password.value.trim() !== confirm.value.trim()) {
        document.getElementById('error-confirm').textContent = 'Passwords do not match.';
        valid = false;
      }
      if (!name.value.trim()) {
        document.getElementById('error-name').textContent = 'This field is required.';
        valid = false;
      }
      if (!address.value.trim()) {
        document.getElementById('error-address').textContent = 'This field is required.';
        valid = false;
      }
      if (!phone.value.trim()) {
        document.getElementById('error-phone').textContent = 'This field is required.';
        valid = false;
      }

      if (!valid) return;

      if (users[email.value]) {
        document.getElementById('message').style.color = 'red';
        document.getElementById('message').textContent = 'Email already exists.';
        return;
      }

      users[email.value] = password.value;
      document.getElementById('message').style.color = 'green';
      document.getElementById('message').textContent = 'Signup successful! Please login.';
      toggleForm();
    }