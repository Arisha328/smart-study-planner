// js/ai-assistant.js
// Frontend logic for the AI Study Assistant (powered by OpenAI API via backend /api/ai routes)

/**
 * Request an AI-generated study schedule and render it into a target container.
 * @param {string} containerId - element id to render results into
 * @param {object} options - { startDate, endDate, dailyAvailableHours }
 */
async function generateAISchedule(containerId, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = aiLoadingMarkup('Analyzing your workload and crafting a schedule');

  try {
    const res = await api.post('/ai/suggest-schedule', options);
    const { summary, sessions, message } = res.data;

    if (message && (!sessions || sessions.length === 0)) {
      container.innerHTML = `<div class="empty-state"><i class="fas fa-robot"></i><p>${message}</p></div>`;
      return;
    }

    let html = `<p class="mb-3 text-secondary">${summary || ''}</p>`;
    sessions.forEach((s) => {
      html += `
        <div class="ai-plan-item d-flex justify-content-between align-items-start flex-wrap gap-2">
          <div>
            <strong>${escapeHtml(s.title)}</strong>
            <div class="small text-secondary">${escapeHtml(s.subject || 'General')} • ${escapeHtml(s.date)} • ${escapeHtml(s.startTime)}–${escapeHtml(s.endTime)}</div>
            <div class="small mt-1">${escapeHtml(s.reason || '')}</div>
          </div>
          <button class="btn btn-sm btn-outline-gradient add-ai-session-btn"
            data-title="${escapeHtml(s.title)}"
            data-date="${escapeHtml(s.date)}"
            data-start="${escapeHtml(s.startTime)}"
            data-end="${escapeHtml(s.endTime)}">
            <i class="fas fa-plus me-1"></i>Add to Calendar
          </button>
        </div>
      `;
    });

    container.innerHTML = html;

    // Wire up "Add to Calendar" buttons -> creates a Schedule via API
    container.querySelectorAll('.add-ai-session-btn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        try {
          const startTime = new Date(`${btn.dataset.date}T${btn.dataset.start}:00`);
          const endTime = new Date(`${btn.dataset.date}T${btn.dataset.end}:00`);
          await api.post('/schedules', {
            title: btn.dataset.title,
            startTime,
            endTime,
            aiGenerated: true,
          });
          showToast('Session added to your calendar', 'success');
          btn.disabled = true;
          btn.innerHTML = '<i class="fas fa-check me-1"></i>Added';
        } catch (err) {
          showToast(err.message, 'danger');
        }
      });
    });
  } catch (err) {
    container.innerHTML = `<div class="empty-state"><i class="fas fa-triangle-exclamation"></i><p>${escapeHtml(err.message)}</p></div>`;
  }
}

/**
 * Request AI predictions for how long pending tasks will take.
 * @param {string} containerId - element id to render results into
 * @param {string|null} taskId - optional single task id
 */
async function predictTaskCompletion(containerId, taskId = null) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = aiLoadingMarkup('Estimating how long your tasks will take');

  try {
    const res = await api.post('/ai/predict-completion', taskId ? { taskId } : {});
    const { predictions } = res.data;

    if (!predictions || predictions.length === 0) {
      container.innerHTML = `<div class="empty-state"><i class="fas fa-robot"></i><p>No pending tasks to analyze.</p></div>`;
      return;
    }

    let html = '';
    predictions.forEach((p) => {
      const hours = (p.predictedMinutes / 60).toFixed(1);
      const confColor = { Low: 'secondary', Medium: 'warning', High: 'success' }[p.confidence] || 'secondary';
      html += `
        <div class="ai-plan-item">
          <div class="d-flex justify-content-between align-items-center">
            <strong>${escapeHtml(p.title)}</strong>
            <span class="badge bg-${confColor}">${escapeHtml(p.confidence)} confidence</span>
          </div>
          <div class="small text-secondary mt-1">Estimated time: <strong>${p.predictedMinutes} min (~${hours} hrs)</strong></div>
          <div class="small mt-1">${escapeHtml(p.reasoning || '')}</div>
        </div>
      `;
    });

    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = `<div class="empty-state"><i class="fas fa-triangle-exclamation"></i><p>${escapeHtml(err.message)}</p></div>`;
  }
}

/**
 * Request the AI's recommended daily study plan and render it.
 * @param {string} containerId - element id to render results into
 */
async function loadDailyAIPlan(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = aiLoadingMarkup('Building your personalized plan for today');

  try {
    const res = await api.get('/ai/daily-plan');
    const { greetingMessage, totalRecommendedMinutes, plan, message } = res.data;

    if (message && (!plan || plan.length === 0)) {
      container.innerHTML = `<div class="empty-state"><i class="fas fa-mug-hot"></i><p>${escapeHtml(message)}</p></div>`;
      return;
    }

    const totalHours = (totalRecommendedMinutes / 60).toFixed(1);
    let html = `
      <p class="mb-1">${escapeHtml(greetingMessage || '')}</p>
      <p class="small text-secondary mb-3">Recommended focus time today: <strong>~${totalHours} hrs</strong></p>
    `;

    plan.forEach((item) => {
      const badgeClass = `badge-priority-${(item.priority || 'medium').toLowerCase()}`;
      html += `
        <div class="ai-plan-item">
          <div class="d-flex justify-content-between align-items-center">
            <strong>${escapeHtml(item.title)}</strong>
            <span class="badge ${badgeClass}">${escapeHtml(item.priority)}</span>
          </div>
          <div class="small text-secondary mt-1">${escapeHtml(item.subject || 'General')} • ${item.recommendedMinutes} min</div>
          <div class="small mt-1"><i class="fas fa-lightbulb text-warning me-1"></i>${escapeHtml(item.tip || '')}</div>
        </div>
      `;
    });

    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = `<div class="empty-state"><i class="fas fa-triangle-exclamation"></i><p>${escapeHtml(err.message)}</p></div>`;
  }
}

/** Returns markup for the animated "AI thinking" loading state */
function aiLoadingMarkup(label) {
  return `
    <div class="text-center py-4 text-secondary">
      <div class="ai-loading-dots mb-2">
        <span>•</span><span>•</span><span>•</span>
      </div>
      <div class="small">${escapeHtml(label)}...</div>
    </div>
  `;
}

/** Basic HTML escaping to avoid injection when rendering AI text */
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
