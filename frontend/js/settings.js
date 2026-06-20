// js/settings.js
// Settings page - dark mode toggle, notifications, password change

document.addEventListener('DOMContentLoaded', async () => {
  // Set initial dark mode toggle state
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  document.getElementById('darkModeToggle').checked = isDark;

  // Load saved settings from backend
  try {
    const res = await api.get('/users/profile');
    const settings = res.data.settings || {};
    document.getElementById('emailNotifToggle').checked = !!settings.emailNotifications;
    document.getElementById('reminderToggle').checked = !!settings.reminderNotifications;
  } catch (err) {
    showToast(err.message, 'danger');
  }

  // Dark mode toggle
  document.getElementById('darkModeToggle').addEventListener('change', async (e) => {
    const dark = e.target.checked;
    // Apply via theme.js
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('ssp_theme', dark ? 'dark' : 'light');
    updateThemeIcon(dark ? 'dark' : 'light');

    try {
      await api.put('/users/settings', { darkMode: dark });
    } catch {}
  });

  // Save notifications
  document.getElementById('saveNotifBtn').addEventListener('click', async () => {
    const btn = document.getElementById('saveNotifBtn');
    btn.disabled = true;
    try {
      await api.put('/users/settings', {
        emailNotifications: document.getElementById('emailNotifToggle').checked,
        reminderNotifications: document.getElementById('reminderToggle').checked,
      });
      showToast('Notification settings saved', 'success');
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      btn.disabled = false;
    }
  });

  // Change Password
  document.getElementById('passwordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const newPass = document.getElementById('newPassword').value;
    const confirmPass = document.getElementById('confirmPassword').value;

    if (newPass !== confirmPass) {
      showToast('New passwords do not match', 'danger');
      return;
    }

    const btn = document.getElementById('changePassBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Changing...';

    try {
      await api.put('/users/change-password', {
        currentPassword: document.getElementById('currentPassword').value,
        newPassword: newPass,
      });
      showToast('Password changed successfully', 'success');
      document.getElementById('passwordForm').reset();
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-key me-2"></i>Change Password';
    }
  });
});
