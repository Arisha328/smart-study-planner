// js/subjects.js
// Subject Management - CRUD operations

let allSubjects = [];
let subjectModal;

document.addEventListener('DOMContentLoaded', () => {
  subjectModal = new bootstrap.Modal(document.getElementById('subjectModal'));
  loadSubjects();

  document.getElementById('searchInput').addEventListener('input', (e) => {
    loadSubjects(e.target.value);
  });

  document.getElementById('progress').addEventListener('input', (e) => {
    document.getElementById('progressValue').textContent = e.target.value;
  });

  document.getElementById('subjectForm').addEventListener('submit', handleSubjectSubmit);
});

async function loadSubjects(search = '') {
  const grid = document.getElementById('subjectsGrid');
  try {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    const res = await api.get(`/subjects${query}`);
    allSubjects = res.data;
    renderSubjects(allSubjects);
  } catch (err) {
    showToast(err.message, 'danger');
    grid.innerHTML = `<div class="empty-state col-12"><i class="fas fa-triangle-exclamation"></i><p>${err.message}</p></div>`;
  }
}

function renderSubjects(subjects) {
  const grid = document.getElementById('subjectsGrid');

  if (subjects.length === 0) {
    grid.innerHTML = `
      <div class="empty-state col-12">
        <i class="fas fa-book"></i>
        <p>No subjects yet. Add your first subject to get started!</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = subjects
    .map((s) => `
      <div class="col-md-6 col-lg-4">
        <div class="glass-card p-4 h-100 fade-in-up">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <div class="d-flex align-items-center gap-2">
              <span style="width:14px;height:14px;border-radius:50%;background:${s.colorTag};display:inline-block;"></span>
              <h6 class="fw-bold mb-0">${escapeHtml(s.name)}</h6>
            </div>
            <span class="badge badge-priority-${s.priority.toLowerCase()}">${s.priority}</span>
          </div>
          <p class="text-secondary small mb-2"><i class="fas fa-user me-1"></i>${escapeHtml(s.instructor || 'No instructor set')}</p>
          <p class="text-secondary small mb-3"><i class="fas fa-award me-1"></i>${s.credits} Credits</p>
          <div class="mb-3">
            <div class="d-flex justify-content-between small mb-1">
              <span>Progress</span><span>${s.progress}%</span>
            </div>
            <div class="progress progress-thin">
              <div class="progress-bar" style="width:${s.progress}%; background:${s.colorTag};"></div>
            </div>
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-sm btn-outline-gradient flex-fill" onclick="openSubjectModal('${s._id}')"><i class="fas fa-pen me-1"></i>Edit</button>
            <button class="btn btn-sm btn-outline-danger flex-fill" onclick="deleteSubject('${s._id}')"><i class="fas fa-trash me-1"></i>Delete</button>
          </div>
        </div>
      </div>
    `)
    .join('');
}

function openSubjectModal(id = null) {
  const form = document.getElementById('subjectForm');
  form.reset();
  document.getElementById('subjectId').value = '';
  document.getElementById('colorTag').value = '#6366F1';
  document.getElementById('progress').value = 0;
  document.getElementById('progressValue').textContent = '0';

  if (id) {
    const subject = allSubjects.find((s) => s._id === id);
    if (subject) {
      document.getElementById('subjectModalTitle').textContent = 'Edit Subject';
      document.getElementById('subjectId').value = subject._id;
      document.getElementById('subjectName').value = subject.name;
      document.getElementById('instructor').value = subject.instructor || '';
      document.getElementById('credits').value = subject.credits;
      document.getElementById('priority').value = subject.priority;
      document.getElementById('colorTag').value = subject.colorTag;
      document.getElementById('progress').value = subject.progress;
      document.getElementById('progressValue').textContent = subject.progress;
    }
  } else {
    document.getElementById('subjectModalTitle').textContent = 'Add Subject';
  }

  subjectModal.show();
}

async function handleSubjectSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('subjectId').value;
  const btn = document.getElementById('saveSubjectBtn');

  const payload = {
    name: document.getElementById('subjectName').value.trim(),
    instructor: document.getElementById('instructor').value.trim(),
    credits: Number(document.getElementById('credits').value),
    priority: document.getElementById('priority').value,
    colorTag: document.getElementById('colorTag').value,
    progress: Number(document.getElementById('progress').value),
  };

  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Saving...';

  try {
    if (id) {
      await api.put(`/subjects/${id}`, payload);
      showToast('Subject updated successfully', 'success');
    } else {
      await api.post('/subjects', payload);
      showToast('Subject added successfully', 'success');
    }
    subjectModal.hide();
    loadSubjects(document.getElementById('searchInput').value);
  } catch (err) {
    showToast(err.message, 'danger');
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Save Subject';
  }
}

async function deleteSubject(id) {
  if (!confirm('Are you sure you want to delete this subject? This cannot be undone.')) return;

  try {
    await api.delete(`/subjects/${id}`);
    showToast('Subject deleted', 'success');
    loadSubjects(document.getElementById('searchInput').value);
  } catch (err) {
    showToast(err.message, 'danger');
  }
}
