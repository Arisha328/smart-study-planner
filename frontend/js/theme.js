// js/theme.js
// Dark mode / light mode toggle with localStorage persistence

const THEME_KEY = 'ssp_theme';

/** Apply saved theme on page load (call this immediately, before DOM paints if possible) */
function applySavedTheme() {
  const saved = localStorage.getItem(THEME_KEY) || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  return saved;
}

/** Toggle between light and dark mode */
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem(THEME_KEY, next);
  updateThemeIcon(next);
}

/** Update the theme toggle button icon */
function updateThemeIcon(theme) {
  const icons = document.querySelectorAll('.theme-toggle-icon');
  icons.forEach((icon) => {
    icon.className = theme === 'dark' ? 'fas fa-sun theme-toggle-icon' : 'fas fa-moon theme-toggle-icon';
  });
}

// Apply theme immediately on script load
applySavedTheme();

document.addEventListener('DOMContentLoaded', () => {
  updateThemeIcon(document.documentElement.getAttribute('data-theme') || 'light');

  document.querySelectorAll('.theme-toggle-btn').forEach((btn) => {
    btn.addEventListener('click', toggleTheme);
  });
});
