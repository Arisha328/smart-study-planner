// js/layout.js
// Injects the shared sidebar + topbar markup into dashboard pages.
// Usage: <div id="layout-root"></div> then include this script, passing data-page attribute.

function renderLayout(activePage) {
  const user = getCurrentUser() || { fullName: 'Student' };
  const initials = user.fullName ? user.fullName.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase() : 'S';

  const navItems = [
    { page: 'dashboard', href: 'dashboard.html', icon: 'fa-gauge-high', label: 'Dashboard' },
    { page: 'subjects', href: 'subjects.html', icon: 'fa-book', label: 'Subjects' },
    { page: 'tasks', href: 'tasks.html', icon: 'fa-list-check', label: 'Daily Tasks' },
    { page: 'calendar', href: 'calendar.html', icon: 'fa-calendar-days', label: 'Study Calendar' },
    { page: 'progress', href: 'progress.html', icon: 'fa-chart-pie', label: 'Progress Analytics' },
    { page: 'ai-assistant', href: 'ai-assistant.html', icon: 'fa-robot', label: 'AI Assistant' },
    { page: 'profile', href: 'profile.html', icon: 'fa-user', label: 'Profile' },
    { page: 'settings', href: 'settings.html', icon: 'fa-gear', label: 'Settings' },
  ];

  const sidebarLinks = navItems.map(item => `
    <a href="${item.href}" class="nav-link ${activePage === item.page ? 'active' : ''}">
      <i class="fas ${item.icon}"></i> ${item.label}
    </a>
  `).join('');

  const sidebarHtml = `
    <aside class="sidebar" id="sidebar">
      <div class="px-4 mb-4">
        <a href="dashboard.html" class="brand-logo gradient-text"><i class="fas fa-graduation-cap"></i> Smart Study Planner</a>
      </div>
      <nav class="nav flex-column">
        ${sidebarLinks}
        <a href="#" class="nav-link text-danger" id="logoutBtn">
          <i class="fas fa-right-from-bracket"></i> Logout
        </a>
      </nav>
    </aside>
  `;

  const pageTitle = navItems.find(i => i.page === activePage)?.label || 'Dashboard';

  const topbarHtml = `
    <div class="topbar d-flex justify-content-between align-items-center">
      <div class="d-flex align-items-center gap-3">
        <button class="btn sidebar-toggle-btn" id="sidebarToggle"><i class="fas fa-bars"></i></button>
        <h5 class="mb-0 fw-bold">${pageTitle}</h5>
      </div>
      <div class="d-flex align-items-center gap-3">
        <button class="theme-toggle-btn"><i class="fas fa-moon theme-toggle-icon"></i></button>
        <a href="profile.html" class="d-flex align-items-center gap-2 text-decoration-none text-reset">
          <div class="stat-icon gradient-bg" style="width:38px;height:38px;font-size:0.9rem;">${initials}</div>
          <span class="d-none d-md-inline fw-semibold">${escapeHtml(user.fullName || 'Student')}</span>
        </a>
      </div>
    </div>
  `;

  const root = document.getElementById('layout-root');
  root.insertAdjacentHTML('afterbegin', sidebarHtml);

  const mainContent = document.getElementById('main-content');
  if (mainContent) {
    mainContent.insertAdjacentHTML('afterbegin', topbarHtml);
  }

  // Wire up logout
  document.getElementById('logoutBtn').addEventListener('click', (e) => {
    e.preventDefault();
    logout();
  });

  // Wire up sidebar toggle (mobile)
  const toggleBtn = document.getElementById('sidebarToggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('show');
    });
  }

  // Re-bind theme toggle (layout injected after theme.js DOMContentLoaded ran)
  document.querySelectorAll('.theme-toggle-btn').forEach((btn) => {
    btn.addEventListener('click', toggleTheme);
  });
  updateThemeIcon(document.documentElement.getAttribute('data-theme') || 'light');
}

document.addEventListener('DOMContentLoaded', () => {
  requireAuth();
  const page = document.body.getAttribute('data-page');
  renderLayout(page);
});
