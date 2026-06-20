// js/profile.js
// Profile page - load user data, edit profile, handle avatar

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const [profileRes, progressRes, subjectsRes] = await Promise.all([
      api.get('/users/profile'),
      api.get('/progress'),
      api.get('/subjects'),
    ]);

    const user = profileRes.data;
    const prog = progressRes.data;

    // Populate display
    const initials = user.fullName ? user.fullName.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase() : 'S';
    document.getElementById('avatarInitials').textContent = initials;
    document.getElementById('profileName').textContent = user.fullName || '–';
    document.getElementById('profileEmail').textContent = user.email;
    document.getElementById('profileMeta').textContent = [user.university, user.department].filter(Boolean).join(' • ') || 'No university set';
    document.getElementById('profileSubjects').textContent = subjectsRes.data.length;
    document.getElementById('profileCompleted').textContent = prog.completedTasks;
    document.getElementById('profileHours').textContent = `${prog.totalStudyHours}h`;

    // Populate form
    document.getElementById('editName').value = user.fullName || '';
    document.getElementById('editEmail').value = user.email;
    document.getElementById('editUniversity').value = user.university || '';
    document.getElementById('editDepartment').value = user.department || '';

    // Avatar image (if stored)
    if (user.profilePicture) {
      const img = document.createElement('img');
      img.src = user.profilePicture;
      img.alt = 'Profile';
      document.getElementById('avatarInitials').replaceWith(img);
    }

  } catch (err) {
    showToast(err.message, 'danger');
  }

  // Avatar file picker
  document.getElementById('avatarInput').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target.result;
      try {
        await api.put('/users/profile', { profilePicture: base64 });

        // Replace avatar display
        const container = document.getElementById('avatarInitials') || document.querySelector('.avatar-wrap img');
        if (container) {
          const img = document.createElement('img');
          img.src = base64;
          img.alt = 'Profile';
          container.replaceWith(img);
        }

        showToast('Profile picture updated', 'success');
      } catch (err) {
        showToast(err.message, 'danger');
      }
    };
    reader.readAsDataURL(file);
  });

  // Profile form submit
  document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('saveProfileBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Saving...';

    try {
      const res = await api.put('/users/profile', {
        fullName: document.getElementById('editName').value.trim(),
        university: document.getElementById('editUniversity').value.trim(),
        department: document.getElementById('editDepartment').value.trim(),
      });

      // Update localStorage user data
      const stored = JSON.parse(localStorage.getItem('ssp_user') || '{}');
      stored.fullName = res.data.fullName;
      localStorage.setItem('ssp_user', JSON.stringify(stored));

      document.getElementById('profileName').textContent = res.data.fullName;
      showToast('Profile updated successfully', 'success');
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-floppy-disk me-2"></i>Save Changes';
    }
  });
});
