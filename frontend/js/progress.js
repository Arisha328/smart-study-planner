// js/progress.js
// Progress Analytics - loads data and renders all charts

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await api.get('/progress');
    const p = res.data;

    // Stats
    document.getElementById('pCompletedTasks').textContent = p.completedTasks;
    document.getElementById('pPendingTasks').textContent = p.pendingTasks;
    document.getElementById('pStudyHours').textContent = `${p.totalStudyHours}h`;
    document.getElementById('pCompletion').textContent = `${p.completionPercentage}%`;

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';
    const textColor = isDark ? '#A1A8C3' : '#6B7280';

    // 1. Bar Chart - Weekly Study Hours
    new Chart(document.getElementById('barChart'), {
      type: 'bar',
      data: {
        labels: p.weeklyStudyHours.labels,
        datasets: [{
          label: 'Study Hours',
          data: p.weeklyStudyHours.data,
          backgroundColor: ['#6366F1','#8B5CF6','#06B6D4','#10B981','#F59E0B','#EF4444','#6366F1'],
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

    // 2. Pie Chart - Task Status
    new Chart(document.getElementById('pieChart'), {
      type: 'pie',
      data: {
        labels: ['Completed', 'Pending'],
        datasets: [{
          data: [p.completedTasks, p.pendingTasks],
          backgroundColor: ['#10B981', '#6366F1'],
          borderWidth: 0,
        }],
      },
      options: {
        plugins: {
          legend: { position: 'bottom', labels: { color: textColor, padding: 16 } },
        },
      },
    });

    // 3. Line Chart - Subject Progress (task-based %)
    const subjLabels = p.subjectProgress.map(s => s.name);
    const subjData = p.subjectProgress.map(s => s.taskBasedProgress || s.manualProgress || 0);
    const subjColors = p.subjectProgress.map(s => s.colorTag || '#6366F1');

    new Chart(document.getElementById('lineChart'), {
      type: 'line',
      data: {
        labels: subjLabels.length ? subjLabels : ['No subjects'],
        datasets: [{
          label: 'Progress %',
          data: subjData.length ? subjData : [0],
          borderColor: '#6366F1',
          backgroundColor: 'rgba(99,102,241,0.12)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: subjColors.length ? subjColors : ['#6366F1'],
          pointRadius: 6,
        }],
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, max: 100, grid: { color: gridColor }, ticks: { color: textColor, callback: v => v + '%' } },
          x: { grid: { display: false }, ticks: { color: textColor } },
        },
      },
    });

    // 4. Priority Doughnut
    new Chart(document.getElementById('priorityChart'), {
      type: 'doughnut',
      data: {
        labels: ['High', 'Medium', 'Low'],
        datasets: [{
          data: [
            p.taskPriorityBreakdown.High,
            p.taskPriorityBreakdown.Medium,
            p.taskPriorityBreakdown.Low,
          ],
          backgroundColor: ['#EF4444', '#F59E0B', '#10B981'],
          borderWidth: 0,
        }],
      },
      options: {
        cutout: '65%',
        plugins: { legend: { position: 'bottom', labels: { color: textColor } } },
      },
    });

    // Subject Progress List
    renderSubjectList(p.subjectProgress);

  } catch (err) {
    showToast(err.message, 'danger');
  }
});

function renderSubjectList(subjects) {
  const el = document.getElementById('subjectProgressList');
  if (!subjects || subjects.length === 0) {
    el.innerHTML = `<div class="empty-state"><i class="fas fa-book"></i><p>No subjects added yet.</p></div>`;
    return;
  }

  el.innerHTML = subjects.map(s => {
    const pct = s.taskBasedProgress || s.manualProgress || 0;
    return `
      <div class="mb-3">
        <div class="d-flex justify-content-between align-items-center mb-1">
          <div class="d-flex align-items-center gap-2">
            <span style="width:12px;height:12px;border-radius:50%;background:${s.colorTag};display:inline-block;"></span>
            <span class="fw-semibold">${escapeHtml(s.name)}</span>
          </div>
          <span class="small text-secondary">${s.completedTasks}/${s.totalTasks} tasks • <strong>${pct}%</strong></span>
        </div>
        <div class="progress progress-thin">
          <div class="progress-bar" style="width:${pct}%; background:${s.colorTag};"></div>
        </div>
      </div>
    `;
  }).join('');
}
