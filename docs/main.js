// 🔥 BREAKWAY GAS SUPPLY – main.js

// -----------------------
// App-wide Constants (Global Scope)
// -----------------------
const GAS_PRICES = {
  '14.2kg': { name: 'Domestic (14.2 kg)', price: 600 },
  '5kg': { name: 'Mini (5 kg)', price: 400 },
  '19kg': { name: 'Commercial (19 kg)', price: 950 }
};
const DELIVERY_CHARGE = 80;

// -----------------------
// Toast Notification (Global Scope)
// -----------------------
window.showToast = (message, type = "success") => {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    if (!toast || !toast.parentNode) return; // Already removed
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 400);
  }, 2500);
};

document.addEventListener("DOMContentLoaded", () => {
  // --- Seed localStorage with initial admin/agent users ---
  // This ensures agent accounts are available for login when using localStorage.
  const initializeUsers = () => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    const defaultAgents = [
      {
        id: 'U-1670000000000',
        name: 'GORLA KIRAN(273)',
        email: 'admin@breakway.com',
        password: 'admin', // Super Admin
        role: 'admin',
      },
      {
        id: 'U-1700000000001',
        name: 'Support Agent',
        email: 'support@breakway.com',
        password: 'support', // Support Agent
        role: 'support',
      },
      {
        id: 'U-1700000000002',
        name: 'Verification Agent',
        email: 'verify@breakway.com',
        password: 'verify', // Verification Agent
        role: 'verification',
      },
      {
        id: 'U-1700000000003',
        name: 'Delivery Agent',
        email: 'delivery@breakway.com',
        password: 'delivery', // Delivery Agent
        role: 'delivery',
      }
    ];

    // Check if any of the default agents need to be added.
    let needsUpdate = false;
    defaultAgents.forEach(agent => {
      if (!users.some(u => u.email === agent.email)) {
        users.push(agent);
        needsUpdate = true;
      }
    });

    if (needsUpdate) {
      localStorage.setItem('users', JSON.stringify(users));
      console.log('Default agent users have been initialized in localStorage.');
    }
  };
  initializeUsers();

  // -----------------------
  // Smooth Fade Animation
  // -----------------------
  const card = document.querySelector(".card");
  if (card) {
    card.style.opacity = 0;
    setTimeout(() => {
      card.style.transition = "opacity 0.8s ease-in-out";
      card.style.opacity = 1;
    }, 200);
  }

  // -----------------------
  // Show/Hide Password Toggle
  // -----------------------
  document.querySelectorAll('.password-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      // Find the parent .form-group to correctly locate the input
      const formGroup = toggle.closest('.form-group');
      if (formGroup) {
        const passwordInput = formGroup.querySelector('input');
        if (passwordInput.type === 'password') {
          passwordInput.type = 'text';
          toggle.textContent = 'Hide';
        } else {
          passwordInput.type = 'password';
          toggle.textContent = 'Show';
        }
      }
    });
  });


  // -----------------------
  // Login Form
  // -----------------------
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const contact = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value.trim();

      if (!contact || !password) {
        showToast("Please fill all fields.", "error");
        return;
      }

      // --- Login using localStorage ---
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      if (users.length === 0) {
        showToast("No user account found. Please sign up.", "error");
        return;
      }

      // Find the user in the localStorage array
      const foundUser = users.find(user => (user.mobile === contact || user.email === contact) && user.password === password);

      if (foundUser) {
        // Save user's name to sessionStorage to display on dashboard
        sessionStorage.setItem('loggedInUserName', foundUser.name);
        sessionStorage.setItem('currentUserId', foundUser.id);

        const params = new URLSearchParams(window.location.search);
        const isAgentLogin = params.get('role') === 'agent';

        // If on the agent login page, but the user found is NOT an agent, show an error.
        if (isAgentLogin && !foundUser.role) {
          showToast("This account does not have agent privileges.", "error");
          return;
        }

        // If on the USER login page, but the user found IS an agent, show an error.
        if (!isAgentLogin && foundUser.role) {
          showToast("This is an agent account. Please use the agent login.", "error");
          setTimeout(() => { window.location.href = 'login.html?role=agent'; }, 2000);
          return;
        }

        // Check user's role and redirect accordingly
        if (foundUser.role) {
          sessionStorage.setItem('userRole', foundUser.role);
          showToast("Agent login successful! Redirecting...", "success");
          let redirectUrl = 'admin-dashboard.html';
          if (foundUser.role === 'support') {
            redirectUrl = 'support-dashboard.html';
          } else if (foundUser.role === 'verification') {
            redirectUrl = 'verification-dashboard.html';
          } else if (foundUser.role === 'delivery') {
            redirectUrl = 'delivery-dashboard.html';
          }

          setTimeout(() => {
            window.location.href = redirectUrl;
          }, 1500);

        } else {
          // For regular users, always redirect to the dashboard.
          // The dashboard itself will handle what to show based on KYC status.
          showToast("Login successful! Redirecting...", "success");
          setTimeout(() => { window.location.href = "dashboard.html"; }, 1500);
        }
      } else {
        showToast("Incorrect mobile number/email or password.", "error");
      }
    });
  }

  // -----------------------
  // Register Form
  // -----------------------
  const registerForm = document.getElementById("registerForm");
  if (registerForm) { 
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = document.getElementById("fullName").value.trim();
      const contact = document.getElementById("mobile").value.trim();
      const password = document.getElementById("password").value.trim();
      const confirm = document.getElementById("confirmPassword").value.trim();

      if (!name || !contact || !password || !confirm) {
        showToast("Please fill all fields.", "error");
        return;
      }

      // Validate mobile or email format
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
      const isPhone = /^\d{10}$/.test(contact);
      if (!isEmail && !isPhone) {
        showToast('Please enter a valid 10-digit mobile number or an email address.', 'error');
        return;
      }

      if (password !== confirm) {
        showToast("Passwords do not match!", "error");
        return;
      }

      // --- Backend Simulation using localStorage ---
      const users = JSON.parse(localStorage.getItem('users') || '[]');

      // Check if user already exists
      if (users.some(user => user.mobile === contact || user.email === contact)) {
        showToast("An account with this mobile/email already exists.", "error");
        return;
      }

      const userCredentials = {
        id: `U-${Date.now()}`, // Give each user a unique ID
        password: password, // Storing plain password for simulation
        name: name,
        kycStatus: 'pending' // Add KYC status
      };

      if (isPhone) userCredentials.mobile = contact;
      if (isEmail) userCredentials.email = contact;

      users.push(userCredentials);
      localStorage.setItem('users', JSON.stringify(users));

      // Do not log the user in automatically. Send them to the login page.
      showToast("Account created! Please log in to continue.", "success");

      setTimeout(() => {
        window.location.href = "login.html"; // Redirect to login page
      }, 1500);
    });
  }

  // -----------------------
  // Booking Form
  // -----------------------
  const bookingForm = document.getElementById("bookingForm");
  if (bookingForm) {
    bookingForm.addEventListener("submit", async (e) => { 
      e.preventDefault(); 
 
      // --- KYC Verification Check ---
      const currentUserId = sessionStorage.getItem('currentUserId');
      if (currentUserId) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const currentUser = users.find(u => u.id === currentUserId);
        if (!currentUser || currentUser.kycStatus !== 'verified') {
          showToast('Your account must be KYC verified to place an order.', 'error');
          // Optionally, redirect them to the dashboard or verification page
          setTimeout(() => {
            window.location.href = 'dashboard.html';
          }, 2000);
          return; // Stop the submission
        }
      }

      const cylinderType = document.getElementById('cylinderType').value || ''; 
      const quantity = document.getElementById('quantity').value || ''; 
      const address = {
        street: document.getElementById('addressStreet').value,
        village: document.getElementById('addressVillage').value,
        state: document.getElementById('addressState').value,
        district: document.getElementById('addressDistrict').value,
        pincode: document.getElementById('addressPincode').value,
      };
      const deliveryDate = document.getElementById('deliveryDate').value || ''; 
      const paymentMethod = document.getElementById('paymentInput').value || 'cod'; 
 
      if (!cylinderType) { showToast('Please select a cylinder type.', 'error'); return; } 
      const qtyNum = parseInt(quantity, 10); 
      if (!qtyNum || qtyNum < 1 || qtyNum > 2) { showToast('Please enter a valid quantity (1-2).', 'error'); return; } 
      if (!address.street || !address.pincode) { showToast('Please enter a complete delivery address.', 'error'); return; }
      if (!deliveryDate) { showToast('Please choose a preferred delivery date.', 'error'); return; } 

      // --- Add robust date validation ---
      const selectedDate = new Date(deliveryDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to midnight to compare dates only

      if (selectedDate <= today) {
        showToast('You cannot select a delivery date in the past.', 'error');
        return;
      }
 
      if (paymentMethod === 'card') { 
        const cardNumber = document.getElementById('cardNumber').value || ''; 
        const expiry = document.getElementById('expiry').value || ''; 
        const cvv = document.getElementById('cvv').value || ''; 
        if (!cardNumber.match(/\d{12,19}/)) { showToast('Please enter a valid card number.', 'error'); return; } 
        if (!expiry.match(/^(0[1-9]|1[0-2])\/(\d{2})$/)) { showToast('Please enter expiry in MM/YY format.', 'error'); return; } 
        if (!cvv.match(/^\d{3,4}$/)) { showToast('Please enter a valid CVV.', 'error'); return; } 
      }
 
      // Calculate total price
      const cylinderPrice = GAS_PRICES[cylinderType] ? GAS_PRICES[cylinderType].price : 0;
      const totalAmount = (cylinderPrice * qtyNum) + DELIVERY_CHARGE;

      const orderData = { 
        id: `ORD-${Date.now()}`, // Generate a temporary ID
        userId: sessionStorage.getItem('currentUserId') || 'guest', // Associate order with logged-in user
        cylinderType: cylinderType, 
        quantity: quantity, 
        address: `${address.street}, ${address.village}, ${address.district}, ${address.state} - ${address.pincode}`,
        deliveryDate: deliveryDate,
        totalAmount: totalAmount, // Save the total amount
        paymentMethod: paymentMethod,
        status: 'placed' // Add a default status
      }; 
 
      // --- Backend Simulation using localStorage ---
      // Save to sessionStorage for the confirmation page
      sessionStorage.setItem('lastOrder', JSON.stringify(orderData)); 
      // Also save to a persistent list of all orders in localStorage for the admin panel
      const allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      allOrders.push(orderData);
      localStorage.setItem('orders', JSON.stringify(allOrders));

      showToast("Order placed successfully! Redirecting...", "success"); 
 
      setTimeout(() => { 
        window.location.href = 'order-comfirmation.html'; 
      }, 1000);
    }); 
  } 

  // -----------------------
  // Theme Toggler
  // -----------------------
  (function() {
    const themeToggle = document.getElementById('themeToggleBtn');
    if (!themeToggle) return; // Do nothing if the button isn't on the page

    const applyTheme = (theme) => {
      document.documentElement.className = ''; // Clear existing theme classes
      if (theme === 'light') {
        document.documentElement.classList.add('theme-light');
        themeToggle.innerHTML = '🌙'; // Show moon icon for dark mode
      } else {
        themeToggle.innerHTML = '☀️'; // Show sun icon for light mode
      }
      localStorage.setItem('theme', theme);
    };

    themeToggle.addEventListener('click', () => {
      const currentTheme = localStorage.getItem('theme') || 'dark';
      applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });

    applyTheme(localStorage.getItem('theme') || 'dark'); // Apply saved or default theme on load
  })();

  // -----------------------
  // Logout Functionality
  // -----------------------
  // Use event delegation on the body to catch clicks on any logout button
  document.body.addEventListener('click', (e) => {
    if (e.target.matches('.btn-logout')) {
      e.preventDefault(); // Prevent default link navigation
      // Clear all session data on logout
      sessionStorage.clear();
      showToast('You have been logged out.', 'success');
      // Redirect to login page
      setTimeout(() => { window.location.href = 'login.html'; }, 1000);
    }
  });
});