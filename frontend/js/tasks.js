// js/tasks.js
// Daily Task Management - CRUD, search, filter, sort, AI completion prediction

let allSubjectsForTasks = [];
let taskModal;

document.addEventListener('DOMContentLoaded', async () => {
  taskModal = new bootstrap.Modal(document.getElementById('taskModal'));

  await loadSubjectOptions();
  loadTasks();

  document.getElementById('searchInput').addEventListener('input', debounce(loadTasks, 300));
  document.getElementById('priorityFilter').addEventListener('change', loadTasks);
  document.getElementById('statusFilter').addEventListener('change', loadTasks);
  document.getElementById('sortFilter').addEventListener('change', loadTasks);

  document.getElementById('taskForm').addEventListener('submit', handleTaskSubmit);
});

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

async function loadSubjectOptions() {
  try {
    const res = await api.get('/subjects');
    allSubjectsForTasks = res.data;
    const select = document.getElementById('taskSubject');
    allSubjectsForTasks.forEach((s) => {
      const opt = document.createElement('option');
      opt.value = s._id;
      opt.textContent = s.name;
      select.appendChild(opt);
    });
  } catch (err) {
    showToast(err.message, 'danger');
  }
}

async function loadTasks() {
  const list = document.getElementById('tasksList');

  const search = document.getElementById('searchInput').value;
  const priority = document.getElementById('priorityFilter').value;
  const completed = document.getElementById('statusFilter').value;
  const sort = document.getElementById('sortFilter').value;

  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (priority) params.set('priority', priority);
  if (completed) params.set('completed', completed);
  if (sort) params.set('sort', sort);

  try {
    const res = await api.get(`/tasks?${params.toString()}`);
    renderTasks(res.data);
  } catch (err) {
    showToast(err.message, 'danger');
    list.innerHTML = `<div class="empty-state"><i class="fas fa-triangle-exclamation"></i><p>${err.message}</p></div>`;
  }
}

function renderTasks(tasks) {
  const list = document.getElementById('tasksList');

  if (tasks.length === 0) {
    list.innerHTML = `
      <div class="glass-card empty-state">
        <i class="fas fa-list-check"></i>
        <p>No tasks found. Add a task to get started, or adjust your filters.</p>
      </div>
    `;
    return;
  }

  list.innerHTML = tasks
    .map((t) => {
      const dueDate = new Date(t.dueDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      const isOverdue = !t.completed && new Date(t.dueDate) < new Date(new Date().toDateString());
      return `
        <div class="glass-card p-3 mb-2 d-flex align-items-start gap-3 fade-in-up">
          <div class="form-check mt-1">
            <input class="form-check-input" type="checkbox" ${t.completed ? 'checked' : ''} onchange="toggleTaskComplete('${t._id}', this.checked)">
          </div>
          <div class="flex-grow-1">
            <div class="d-flex justify-content-between flex-wrap gap-2">
              <h6 class="fw-bold mb-1 ${t.completed ? 'text-decoration-line-through text-secondary' : ''}">${escapeHtml(t.title)}</h6>
              <span class="badge badge-priority-${t.priority.toLowerCase()}">${t.priority}</span>
            </div>
            <div class="small text-secondary mb-1">
              <i class="fas fa-book me-1"></i>${t.subject ? escapeHtml(t.subject.name) : 'General'}
              &nbsp;•&nbsp;
              <i class="fas fa-calendar me-1"></i><span class="${isOverdue ? 'text-danger fw-semibold' : ''}">${dueDate}${isOverdue ? ' (Overdue)' : ''}</span>
              &nbsp;•&nbsp;
              <i class="fas fa-hourglass-half me-1"></i>${t.estimatedMinutes} min
            </div>
            ${t.notes ? `<p class="small mb-2">${escapeHtml(t.notes)}</p>` : ''}
            <div class="d-flex gap-2">
              <button class="btn btn-sm btn-outline-gradient" onclick="openTaskModal('${t._id}')"><i class="fas fa-pen me-1"></i>Edit</button>
              <button class="btn btn-sm btn-outline-danger" onclick="deleteTask('${t._id}')"><i class="fas fa-trash me-1"></i>Delete</button>
            </div>
          </div>
        </div>
      `;
    })
    .join('');
}

let currentTasksCache = [];

async function toggleTaskComplete(id, completed) {
  try {
    await api.put(`/tasks/${id}`, { completed });
    showToast(completed ? 'Task marked as complete' : 'Task marked as pending', 'success');
    loadTasks();
  } catch (err) {
    showToast(err.message, 'danger');
  }
}

async function openTaskModal(id = null) {
  const form = document.getElementById('taskForm');
  form.reset();
  document.getElementById('taskId').value = '';
  document.getElementById('taskEstimate').value = 60;

  if (id) {
    try {
      const res = await api.get(`/tasks/${id}`);
      const t = res.data;
      document.getElementById('taskModalTitle').textContent = 'Edit Task';
      document.getElementById('taskId').value = t._id;
      document.getElementById('taskTitle').value = t.title;
      document.getElementById('taskSubject').value = t.subject ? t.subject._id : '';
      document.getElementById('taskDueDate').value = new Date(t.dueDate).toISOString().split('T')[0];
      document.getElementById('taskPriority').value = t.priority;
      document.getElementById('taskEstimate').value = t.estimatedMinutes;
      document.getElementById('taskNotes').value = t.notes || '';
    } catch (err) {
      showToast(err.message, 'danger');
      return;
    }
  } else {
    document.getElementById('taskModalTitle').textContent = 'Add Task';
  }

  taskModal.show();
}

async function handleTaskSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('taskId').value;
  const btn = document.getElementById('saveTaskBtn');

  const payload = {
    title: document.getElementById('taskTitle').value.trim(),
    subject: document.getElementById('taskSubject').value || null,
    dueDate: document.getElementById('taskDueDate').value,
    priority: document.getElementById('taskPriority').value,
    estimatedMinutes: Number(document.getElementById('taskEstimate').value),
    notes: document.getElementById('taskNotes').value.trim(),
  };

  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Saving...';

  try {
    if (id) {
      await api.put(`/tasks/${id}`, payload);
      showToast('Task updated successfully', 'success');
    } else {
      await api.post('/tasks', payload);
      showToast('Task added successfully', 'success');
    }
    taskModal.hide();
    loadTasks();
  } catch (err) {
    showToast(err.message, 'danger');
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Save Task';
  }
}

async function deleteTask(id) {
  if (!confirm('Are you sure you want to delete this task?')) return;

  try {
    await api.delete(`/tasks/${id}`);
    showToast('Task deleted', 'success');
    loadTasks();
  } catch (err) {
    showToast(err.message, 'danger');
  }
}
