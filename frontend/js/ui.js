// js/ui.js
// Shared UI utilities: toast notifications, loading overlay, scroll reveal

/** Show a Bootstrap toast notification. type: 'success' | 'danger' | 'warning' | 'info' */
function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    document.body.appendChild(container);
  }

  const icons = {
    success: 'fa-circle-check',
    danger: 'fa-circle-exclamation',
    warning: 'fa-triangle-exclamation',
    info: 'fa-circle-info',
  };

  const toastEl = document.createElement('div');
  toastEl.className = `toast align-items-center text-white border-0 bg-${type}`;
  toastEl.setAttribute('role', 'alert');
  toastEl.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">
        <i class="fas ${icons[type] || icons.info} me-2"></i>${message}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>
  `;

  container.appendChild(toastEl);
  const toast = new bootstrap.Toast(toastEl, { delay: 3500 });
  toast.show();

  toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
}

/** Show/hide a full-page loading overlay */
function showLoader() {
  if (document.querySelector('.loader-overlay')) return;
  const overlay = document.createElement('div');
  overlay.className = 'loader-overlay';
  overlay.innerHTML = '<div class="spinner-gradient"></div>';
  document.body.appendChild(overlay);
}

function hideLoader() {
  const overlay = document.querySelector('.loader-overlay');
  if (overlay) overlay.remove();
}

/** Scroll reveal effect - adds 'active' class to .reveal elements when in viewport */
function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  elements.forEach((el) => observer.observe(el));
}

document.addEventListener('DOMContentLoaded', initScrollReveal);

/**
 * Escape HTML to prevent injection when inserting strings into innerHTML.
 * Also attach to window to ensure availability across pages.
 */
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

window.escapeHtml = escapeHtml;
