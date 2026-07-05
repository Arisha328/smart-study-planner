// js/api.js
// Central API configuration and fetch wrapper for Smart Study Planner

const API_BASE_URL = (() => {
  const currentOrigin = window.location.origin;
  if (currentOrigin && currentOrigin !== 'null') {
    return `${currentOrigin}/api`;
  }
  return 'http://127.0.0.1:5000/api';
})();

/**
 * Generic API request helper.
 * Automatically attaches JWT token (if present) and JSON headers.
 */
async function apiRequest(endpoint, { method = 'GET', body = null, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };

  if (auth) {
    const token = localStorage.getItem('ssp_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const config = { method, headers };
  if (body) config.body = JSON.stringify(body);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    // Network error or thrown error from above
    throw new Error(error.message || 'Network error - please try again');
  }
}

// Convenience methods
const api = {
  get: (endpoint) => apiRequest(endpoint, { method: 'GET' }),
  post: (endpoint, body, auth = true) => apiRequest(endpoint, { method: 'POST', body, auth }),
  put: (endpoint, body) => apiRequest(endpoint, { method: 'PUT', body }),
  delete: (endpoint) => apiRequest(endpoint, { method: 'DELETE' }),
};
