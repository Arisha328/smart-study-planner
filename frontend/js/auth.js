// js/auth.js
// Authentication helper functions

const AUTH_TOKEN_KEY = 'ssp_token';
const AUTH_USER_KEY = 'ssp_user';

/** Save token & user data to localStorage after login/signup */
function saveAuthData(data) {
  localStorage.setItem(AUTH_TOKEN_KEY, data.token);
  const userCopy = { ...data };
  delete userCopy.token;
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userCopy));
}

/** Get currently logged-in user (or null) */
function getCurrentUser() {
  const raw = localStorage.getItem(AUTH_USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

/** Check if user is authenticated */
function isAuthenticated() {
  return !!localStorage.getItem(AUTH_TOKEN_KEY);
}

/** Log the user out and redirect to login */
function logout() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  window.location.href = 'login.html';
}

/** Protect a page - redirect to login if not authenticated. Call at top of protected pages. */
function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = 'login.html';
  }
}

/** Redirect to dashboard if already logged in (used on login/signup pages) */
function redirectIfAuthenticated() {
  if (isAuthenticated()) {
    window.location.href = 'dashboard.html';
  }
}
