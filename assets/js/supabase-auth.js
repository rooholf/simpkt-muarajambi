import { supabase } from './initSupabase.js';

async function checkLoginAndUpdateButton() {
  const { data: user, error } = await supabase.auth.getUser();

  if (user.user) {
    document.getElementById('loginBtn').textContent = 'Logout';
  } else {
    document.getElementById('loginBtn').textContent = 'Login untuk Admin';
  }
}
// Function to logout the current user

async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Logout failed:', error.message);
  } else {
    console.log('Logged out successfully');

    document.getElementById('loginBtn').textContent = 'Login untuk Admin';
  }
}

document.getElementById('loginBtn').addEventListener('click', () => {
  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn.textContent === 'Logout') {
    logout();
  } else {
    document.getElementById('loginModal').classList.remove('hidden');
  }
});


checkLoginAndUpdateButton();

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = e.target.email.value;
  const password = e.target.password.value;

  // Process login credentials
  const login = async (email, password) => {
    const { user, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      console.error('Login failed:', error.message);
      // Handle login failure (e.g., show an error message)
    } else {
      console.log('Logged in successfully');
      // Reload the page after successful login
      window.location.reload();
    }
  };

  // Call the login function with the provided credentials
  await login(email, password);
});
