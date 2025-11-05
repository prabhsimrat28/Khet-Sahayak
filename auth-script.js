// Initialize forms
document.addEventListener('DOMContentLoaded', () => {
    setupFormHandlers();
});

// Setup form submit handlers
function setupFormHandlers() {
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('signupForm').addEventListener('submit', handleSignup);
}

// Toggle between login and signup
function showSignup(e) {
    e.preventDefault();
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'block';
    document.getElementById('successMessage').style.display = 'none';
    clearAllErrors();
}

function showLogin(e) {
    e.preventDefault();
    document.getElementById('signupForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('successMessage').style.display = 'none';
    clearAllErrors();
}

// Clear all error messages
function clearAllErrors() {
    document.querySelectorAll('.error-msg').forEach(el => el.textContent = '');
}

// Validate phone number (10 digits)
function validatePhone(phone) {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
}

// Validate password (min 6 characters)
function validatePassword(password) {
    return password.length >= 6;
}

// Handle Signup
async function handleSignup(e) {
    e.preventDefault();
    clearAllErrors();

    const name = document.getElementById('signupName').value.trim();
    const phone = document.getElementById('signupPhone').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;

    let isValid = true;

    // Validate name
    if (name.length < 2) {
        document.getElementById('signupNameError').textContent = 'Name must be at least 2 characters';
        isValid = false;
    }

    // Validate phone
    if (!validatePhone(phone)) {
        document.getElementById('signupPhoneError').textContent = 'Enter valid 10-digit phone number';
        isValid = false;
    }

    // Validate password
    if (!validatePassword(password)) {
        document.getElementById('signupPasswordError').textContent = 'Password must be at least 6 characters';
        isValid = false;
    }

    // Validate confirm password
    if (password !== confirmPassword) {
        document.getElementById('signupConfirmError').textContent = 'Passwords do not match';
        isValid = false;
    }

    if (!isValid) return;

    // Disable button
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing Up...';

    try {
        const response = await fetch('api/auth.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'signup',
                name: name,
                phone: phone,
                password: password
            })
        });

        const data = await response.json();

        if (data.success) {
            // Show success message
            document.getElementById('signupForm').style.display = 'none';
            document.getElementById('successMessage').style.display = 'block';
            document.getElementById('successText').textContent = 
                'Account created successfully! Redirecting to login...';

            // Redirect to login after 2 seconds
            setTimeout(() => {
                showLogin(new Event('click'));
            }, 2000);
        } else {
            document.getElementById('signupPhoneError').textContent = 
                data.message || 'Signup failed. Please try again.';
        }

    } catch (error) {
        console.error('Signup error:', error);
        document.getElementById('signupPhoneError').textContent = 
            'Server error. Please try again later.';
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Sign Up';
    }
}

// Handle Login
async function handleLogin(e) {
    e.preventDefault();
    clearAllErrors();

    const phone = document.getElementById('loginPhone').value.trim();
    const password = document.getElementById('loginPassword').value;

    let isValid = true;

    // Validate phone
    if (!validatePhone(phone)) {
        document.getElementById('loginPhoneError').textContent = 'Enter valid 10-digit phone number';
        isValid = false;
    }

    // Validate password
    if (password.length === 0) {
        document.getElementById('loginPasswordError').textContent = 'Password is required';
        isValid = false;
    }

    if (!isValid) return;

    // Disable button
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging In...';

    try {
        const response = await fetch('api/auth.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'login',
                phone: phone,
                password: password
            })
        });

        const data = await response.json();

        if (data.success) {
            // Show success message
            document.getElementById('loginForm').style.display = 'none';
            document.getElementById('successMessage').style.display = 'block';
            document.getElementById('successText').textContent = 
                'Login successful! Redirecting...';

            // Redirect to equipment home after 1 second
            setTimeout(() => {
                window.location.href = 'rental/equipment-home.html';
            }, 1000);
        } else {
            document.getElementById('loginPasswordError').textContent = 
                data.message || 'Invalid credentials';
        }

    } catch (error) {
        console.error('Login error:', error);
        document.getElementById('loginPasswordError').textContent = 
            'Server error. Please try again later.';
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
    }
}