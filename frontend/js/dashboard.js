// js/dashboard.js
// Loads dashboard stats, charts, and today's/upcoming tasks

document.addEventListener('DOMContentLoaded', async () => {
  const user = getCurrentUser();
  document.getElementById('welcomeText').textContent = `Welcome back, ${user?.fullName?.split(' ')[0] || 'Student'}! 👋`;

  try {
    const [progressRes, tasksRes, subjectsRes] = await Promise.all([
      api.get('/progress'),
      api.get('/tasks'),
      api.get('/subjects'),
    ]);

    const progress = progressRes.data;
    const tasks = tasksRes.data;
    const subjects = subjectsRes.data;

    renderStats(progress, tasks, subjects);
    renderTaskLists(tasks);
    renderCharts(progress);
  } catch (err) {
    showToast(err.message, 'danger');
  }

  // Load AI daily plan preview
  loadDailyAIPlan('dashboardAiPlan');
});

function renderStats(progress, tasks, subjects) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayTasks = tasks.filter((t) => {
    const due = new Date(t.dueDate);
    return due >= today && due < tomorrow && !t.completed;
  });

  const upcomingTasks = tasks.filter((t) => {
    const due = new Date(t.dueDate);
    return due >= tomorrow && !t.completed;
  });

  document.getElementById('statTodayTasks').textContent = todayTasks.length;
  document.getElementById('statUpcomingTasks').textContent = upcomingTasks.length;
  document.getElementById('statSubjects').textContent = subjects.length;
  document.getElementById('statCompleted').textContent = progress.completedTasks;

  document.getElementById('progressPercentText').textContent = `${progress.completionPercentage}%`;
  document.getElementById('progressBar').style.width = `${progress.completionPercentage}%`;
}

function renderTaskLists(tasks) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayTasks = tasks.filter((t) => {
    const due = new Date(t.dueDate);
    return due >= today && due < tomorrow && !t.completed;
  });

  const upcomingTasks = tasks
    .filter((t) => {
      const due = new Date(t.dueDate);
      return due >= tomorrow && !t.completed;
    })
    .slice(0, 5);

  document.getElementById('todayTasksList').innerHTML = renderTaskItems(todayTasks, 'No tasks due today. Enjoy the breathing room!');
  document.getElementById('upcomingTasksList').innerHTML = renderTaskItems(upcomingTasks, 'No upcoming tasks yet.');
}

function renderTaskItems(taskList, emptyMessage) {
  if (taskList.length === 0) {
    return `<div class="empty-state py-3"><i class="fas fa-mug-hot"></i><p class="mb-0">${emptyMessage}</p></div>`;
  }

  return taskList
    .map((t) => {
      const badgeClass = `badge-priority-${t.priority.toLowerCase()}`;
      const dueDate = new Date(t.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return `
        <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
          <div>
            <div class="fw-semibold">${escapeHtml(t.title)}</div>
            <div class="small text-secondary">${t.subject ? escapeHtml(t.subject.name) : 'General'} • ${dueDate}</div>
          </div>
          <span class="badge ${badgeClass}">${t.priority}</span>
        </div>
      `;
    })
    .join('');
}

function renderCharts(progress) {
  const gridColor = document.documentElement.getAttribute('data-theme') === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';
  const textColor = document.documentElement.getAttribute('data-theme') === 'dark' ? '#A1A8C3' : '#6B7280';

  // 1. Weekly Study Hours (Bar Chart)
  new Chart(document.getElementById('weeklyHoursChart'), {
    type: 'bar',
    data: {
      labels: progress.weeklyStudyHours.labels,
      datasets: [{
        label: 'Hours',
        data: progress.weeklyStudyHours.data,
        backgroundColor: '#6366F1',
        borderRadius: 8,
      }],
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: textColor } },
        x: { grid: { display: false }, ticks: { color: textColor } },
      },
    },
  });

  // 2. Task Completion (Doughnut Chart)
  new Chart(document.getElementById('taskCompletionChart'), {
    type: 'doughnut',
    data: {
      labels: ['Completed', 'Pending'],
      datasets: [{
        data: [progress.completedTasks, progress.pendingTasks],
        backgroundColor: ['#10B981', '#E5E7EB'],
        borderWidth: 0,
      }],
    },
    options: {
      plugins: { legend: { position: 'bottom', labels: { color: textColor } } },
      cutout: '70%',
    },
  });

  // 3. Subject Progress (Horizontal Bar Chart)
  const subjectLabels = progress.subjectProgress.map((s) => s.name);
  const subjectData = progress.subjectProgress.map((s) => s.taskBasedProgress || s.manualProgress || 0);
  const subjectColors = progress.subjectProgress.map((s) => s.colorTag || '#8B5CF6');

  new Chart(document.getElementById('subjectProgressChart'), {
    type: 'bar',
    data: {
      labels: subjectLabels.length ? subjectLabels : ['No subjects yet'],
      datasets: [{
        label: 'Progress %',
        data: subjectData.length ? subjectData : [0],
        backgroundColor: subjectColors.length ? subjectColors : ['#8B5CF6'],
        borderRadius: 8,
      }],
    },
    options: {
      indexAxis: 'y',
      plugins: { legend: { display: false } },
      scales: {
        x: { beginAtZero: true, max: 100, grid: { color: gridColor }, ticks: { color: textColor } },
        y: { grid: { display: false }, ticks: { color: textColor } },
      },
    },
  });
}
