// js/calendar.js
// Study Calendar - month & week views with schedule CRUD

let currentDate = new Date();
let viewMode = 'month'; // 'month' | 'week'
let allSchedules = [];
let scheduleModal;

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

document.addEventListener('DOMContentLoaded', async () => {
  scheduleModal = new bootstrap.Modal(document.getElementById('scheduleModal'));
  await loadSubjectOptions();
  await fetchAndRender();

  document.getElementById('prevBtn').addEventListener('click', () => { navigate(-1); });
  document.getElementById('nextBtn').addEventListener('click', () => { navigate(1); });
  document.getElementById('todayBtn').addEventListener('click', () => { currentDate = new Date(); fetchAndRender(); });
  document.getElementById('monthViewBtn').addEventListener('click', () => switchView('month'));
  document.getElementById('weekViewBtn').addEventListener('click', () => switchView('week'));
  document.getElementById('scheduleForm').addEventListener('submit', handleScheduleSubmit);
  document.getElementById('deleteSessionBtn').addEventListener('click', handleDeleteSession);
});

async function loadSubjectOptions() {
  try {
    const res = await api.get('/subjects');
    const sel = document.getElementById('sessionSubject');
    res.data.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s._id;
      opt.textContent = s.name;
      opt.dataset.color = s.colorTag;
      sel.appendChild(opt);
    });
  } catch {}
}

function navigate(dir) {
  if (viewMode === 'month') {
    currentDate.setMonth(currentDate.getMonth() + dir);
  } else {
    currentDate.setDate(currentDate.getDate() + dir * 7);
  }
  fetchAndRender();
}

function switchView(mode) {
  viewMode = mode;
  document.getElementById('monthViewBtn').classList.toggle('active', mode === 'month');
  document.getElementById('weekViewBtn').classList.toggle('active', mode === 'week');
  fetchAndRender();
}

async function fetchAndRender() {
  try {
    // Fetch a wide range to cover the visible cells
    const from = new Date(currentDate);
    from.setDate(1); from.setMonth(from.getMonth() - 1);
    const to = new Date(currentDate);
    to.setDate(1); to.setMonth(to.getMonth() + 2);
    const res = await api.get(`/schedules?from=${from.toISOString()}&to=${to.toISOString()}`);
    allSchedules = res.data;
  } catch (err) {
    showToast(err.message, 'danger');
    allSchedules = [];
  }
  viewMode === 'month' ? renderMonth() : renderWeek();
}

/* ===== MONTH VIEW ===== */
function renderMonth() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  document.getElementById('calendarTitle').textContent = `${MONTH_NAMES[month]} ${year}`;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();
  const today = new Date();

  let cells = '';

  // Header row
  const headerRow = DAY_NAMES.map(d => `<div class="cal-day-name">${d}</div>`).join('');

  // Previous month padding
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    cells += calCell(new Date(year, month - 1, d), true);
  }
  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const isToday = date.toDateString() === today.toDateString();
    cells += calCell(date, false, isToday);
  }
  // Next month padding
  const totalCells = firstDay + daysInMonth;
  const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  for (let d = 1; d <= remaining; d++) {
    cells += calCell(new Date(year, month + 1, d), true);
  }

  document.getElementById('calendarView').innerHTML = `
    <div class="cal-header">${headerRow}</div>
    <div class="calendar-grid">${cells}</div>
  `;

  // Bind click to open modal with pre-filled date
  document.querySelectorAll('.cal-cell').forEach(cell => {
    cell.addEventListener('click', (e) => {
      if (e.target.classList.contains('cal-event')) return; // handled separately
      const date = cell.dataset.date;
      if (date) openScheduleModal(null, date);
    });
  });

  document.querySelectorAll('.cal-event').forEach(ev => {
    ev.addEventListener('click', (e) => {
      e.stopPropagation();
      openScheduleModal(ev.dataset.id);
    });
  });
}

function calCell(date, otherMonth, isToday = false) {
  const dateStr = date.toISOString().split('T')[0];
  const daySchedules = allSchedules.filter(s => {
    const d = new Date(s.startTime);
    return d.getFullYear() === date.getFullYear() && d.getMonth() === date.getMonth() && d.getDate() === date.getDate();
  });
  const eventsHtml = daySchedules.slice(0, 3).map(s => `
    <div class="cal-event" style="background:${s.subject?.colorTag || '#6366F1'}" data-id="${s._id}" title="${escapeHtml(s.title)}">
      ${escapeHtml(s.title)}
    </div>
  `).join('');
  const more = daySchedules.length > 3 ? `<div class="small text-secondary">+${daySchedules.length - 3} more</div>` : '';

  return `<div class="cal-cell${otherMonth ? ' other-month' : ''}${isToday ? ' today' : ''}" data-date="${dateStr}">
    <div class="day-num">${date.getDate()}</div>
    ${eventsHtml}${more}
  </div>`;
}

/* ===== WEEK VIEW ===== */
function renderWeek() {
  // Find Monday of current week
  const startOfWeek = new Date(currentDate);
  const day = startOfWeek.getDay();
  startOfWeek.setDate(startOfWeek.getDate() - day); // Start on Sunday

  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + i);
    days.push(d);
  }

  const title = `Week of ${days[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${days[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  document.getElementById('calendarTitle').textContent = title;

  const today = new Date();
  const hours = Array.from({ length: 24 }, (_, i) => i);

  let headerCols = `<div class="week-time-col"></div>`;
  days.forEach(d => {
    const isToday = d.toDateString() === today.toDateString();
    headerCols += `<div class="text-center py-2 small fw-bold ${isToday ? 'text-primary' : 'text-secondary'}">${DAY_NAMES[d.getDay()]} ${d.getDate()}</div>`;
  });

  let rows = '';
  hours.forEach(h => {
    let cols = `<div class="week-time-col py-1">${h.toString().padStart(2,'0')}:00</div>`;
    days.forEach(d => {
      const daySchedules = allSchedules.filter(s => {
        const start = new Date(s.startTime);
        return start.getFullYear() === d.getFullYear() &&
          start.getMonth() === d.getMonth() &&
          start.getDate() === d.getDate() &&
          start.getHours() === h;
      });
      const events = daySchedules.map(s => {
        const duration = Math.max(1, Math.round((new Date(s.endTime) - new Date(s.startTime)) / (1000*60*60)));
        return `<div class="week-event" style="background:${s.subject?.colorTag || '#6366F1'};height:${duration*44}px;" data-id="${s._id}" title="${escapeHtml(s.title)}" onclick="openScheduleModal('${s._id}')">${escapeHtml(s.title)}</div>`;
      }).join('');
      cols += `<div class="week-cell">${events}</div>`;
    });
    rows += `<div class="week-grid">${cols}</div>`;
  });

  document.getElementById('calendarView').innerHTML = `
    <div style="overflow-x:auto;">
      <div class="week-grid" style="min-width:600px;">${headerCols}</div>
      <div style="min-width:600px; max-height:520px; overflow-y:auto;">${rows}</div>
    </div>
  `;
}

/* ===== MODAL ===== */
function openScheduleModal(id = null, prefilledDate = null) {
  const form = document.getElementById('scheduleForm');
  form.reset();
  document.getElementById('scheduleId').value = '';
  document.getElementById('deleteSessionBtn').classList.add('d-none');

  if (id) {
    const s = allSchedules.find(x => x._id === id);
    if (s) {
      document.getElementById('scheduleModalTitle').textContent = 'Edit Study Session';
      document.getElementById('scheduleId').value = s._id;
      document.getElementById('sessionTitle').value = s.title;
      document.getElementById('sessionSubject').value = s.subject?._id || '';
      document.getElementById('sessionStart').value = toLocalDatetimeInput(new Date(s.startTime));
      document.getElementById('sessionEnd').value = toLocalDatetimeInput(new Date(s.endTime));
      document.getElementById('sessionNotes').value = s.notes || '';
      document.getElementById('deleteSessionBtn').classList.remove('d-none');
    }
  } else {
    document.getElementById('scheduleModalTitle').textContent = 'Add Study Session';
    if (prefilledDate) {
      const dt = new Date(prefilledDate + 'T09:00');
      const end = new Date(prefilledDate + 'T10:00');
      document.getElementById('sessionStart').value = toLocalDatetimeInput(dt);
      document.getElementById('sessionEnd').value = toLocalDatetimeInput(end);
    }
  }
  scheduleModal.show();
}

function toLocalDatetimeInput(date) {
  const pad = n => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

async function handleScheduleSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('scheduleId').value;
  const btn = document.getElementById('saveSessionBtn');

  const payload = {
    title: document.getElementById('sessionTitle').value.trim(),
    subject: document.getElementById('sessionSubject').value || null,
    startTime: new Date(document.getElementById('sessionStart').value).toISOString(),
    endTime: new Date(document.getElementById('sessionEnd').value).toISOString(),
    notes: document.getElementById('sessionNotes').value.trim(),
  };

  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Saving...';

  try {
    if (id) {
      await api.put(`/schedules/${id}`, payload);
      showToast('Session updated', 'success');
    } else {
      await api.post('/schedules', payload);
      showToast('Session added to calendar', 'success');
    }
    scheduleModal.hide();
    await fetchAndRender();
  } catch (err) {
    showToast(err.message, 'danger');
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Save Session';
  }
}

async function handleDeleteSession() {
  const id = document.getElementById('scheduleId').value;
  if (!id || !confirm('Delete this study session?')) return;
  try {
    await api.delete(`/schedules/${id}`);
    showToast('Session deleted', 'success');
    scheduleModal.hide();
    await fetchAndRender();
  } catch (err) {
    showToast(err.message, 'danger');
  }
}
