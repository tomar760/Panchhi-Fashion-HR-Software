/***********************************************************************************
 * PANCHHI HR PRO — Core Logic
 * Fast Loading | No LocalStorage for Data | Auto-Sync | Dark Mode
 ***********************************************************************************/

const CONFIG = {
  // ⬇️ Paste your Web App URL here
  WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbyyr1q3hGQZzOJoQp11zxoxdH1PHOACxIhatTAH9WWpH84GISYLqhyu2_0lruv_5gh5/exec',
  COMPANY: 'House of Panchhi',
  VERSION: 'v3.1.0'
};

const App = {
  data: {},
  lastSync: null,
  syncInterval: null,
  isDark: false
};

// ===================== AUTH & SESSION =====================
const Auth = {
  SESSION_KEY: 'phr_user_session',

  save(user) {
    sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(user));
  },
  get() {
    try { return JSON.parse(sessionStorage.getItem(this.SESSION_KEY)); } catch(e) { return null; }
  },
  clear() { sessionStorage.removeItem(this.SESSION_KEY); },
  isLoggedIn() { return !!this.get(); },
  logout() { this.clear(); window.location.href = 'login.html'; },
  
  hasAccess(module) {
    const u = this.get();
    if (!u) return false;
    if (u.role === 'Super Admin' || u.role === 'Director') return true;
    return (u.modules || []).includes(module);
  }
};

// ===================== FAST DATA SYNC =====================
const DataSync = {
  async fetchAll() {
    try {
      const res = await fetch(`${CONFIG.WEB_APP_URL}?action=FETCH_ALL`);
      const json = await res.json();
      if (json.success) {
        App.data = json.data;
        App.lastSync = new Date();
        // Trigger UI updates on current page
        if (typeof renderDashboard === 'function') renderDashboard();
        if (typeof renderTable === 'function') renderTable();
        return true;
      }
    } catch (e) {
      console.error('Sync Error:', e);
    }
    return false;
  },

  startAutoSync() {
    if (this.syncInterval) clearInterval(this.syncInterval);
    // 💡 30 Second Auto-Sync
    this.syncInterval = setInterval(() => this.fetchAll(), 30000);
  }
};

// ===================== CORE UTILITIES =====================
function updateClock() {
  const now = new Date();
  
  // Format: Thursday, 18 June 2026
  const dateStr = now.toLocaleDateString('en-IN', { 
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
  });
  
  // Format: 10:45:22 AM
  const timeStr = now.toLocaleTimeString('en-IN', { 
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true 
  });

  const clockEl = document.getElementById('liveClock');
  if (clockEl) {
    clockEl.innerHTML = `
      <div class="clock-time">${timeStr}</div>
      <div class="clock-date">${dateStr}</div>
    `;
  }
  
  // Greeting
  const hr = now.getHours();
  let greet = "Good Morning";
  if (hr >= 12 && hr < 17) greet = "Good Afternoon";
  else if (hr >= 17 && hr < 21) greet = "Good Evening";
  else if (hr >= 21) greet = "Good Night";
  
  const user = Auth.get();
  const greetEl = document.getElementById('greetingText');
  if (greetEl && user) greetEl.textContent = `${greet}, ${user.name}! 👋`;
}

function toggleTheme() {
  App.isDark = !App.isDark;
  document.documentElement.setAttribute('data-theme', App.isDark ? 'dark' : 'light');
  const icon = document.querySelector('.theme-toggle i');
  if (icon) icon.className = App.isDark ? 'fas fa-sun' : 'fas fa-moon';
  localStorage.setItem('phr_theme', App.isDark ? 'dark' : 'light');
}

// ===================== API WRAPPER =====================
const GSheet = {
  async send(sheet, data, action = 'INSERT') {
    try {
      // 💡 Using URLSearchParams for "Simple Request" (No Preflight = Faster)
      const params = new URLSearchParams();
      params.append('sheet', sheet);
      params.append('action', action);
      params.append('data', JSON.stringify(data));

      const res = await fetch(CONFIG.WEB_APP_URL, {
        method: 'POST',
        body: params
      });
      // Note: Since it's a cross-origin POST to Apps Script, we might not get 
      // the body back if we don't handle redirects. But with standard Web App 
      // setup, this works.
      const text = await res.text();
      return JSON.parse(text);
    } catch (e) {
      console.error('API Error:', e);
      return { success: false, error: e.message };
    }
  }
};

// ===================== LOGIN LOGIC =====================
async function handleLogin() {
  const email = document.getElementById('loginEmail')?.value.trim();
  const pass = document.getElementById('loginPass')?.value;
  const btn = document.getElementById('loginBtn');
  const err = document.getElementById('loginError');

  if (!email || !pass) return;
  
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner spin"></i> Signing In...';
  if (err) err.style.display = 'none';

  try {
    const res = await GSheet.send('Auth', { email, password: pass }, 'LOGIN');
    if (res.success && res.user) {
      Auth.save(res.user);
      window.location.replace('index.html');
    } else {
      throw new Error(res.msg || 'Login Failed');
    }
  } catch (e) {
    btn.disabled = false;
    btn.innerHTML = 'Sign In';
    if (err) { err.textContent = e.message; err.style.display = 'flex'; }
  }
}

// ===================== INITIALIZATION =====================
document.addEventListener('DOMContentLoaded', () => {
  // Theme Init
  const savedTheme = localStorage.getItem('phr_theme');
  if (savedTheme === 'dark') toggleTheme();

  // Clock Start
  setInterval(updateClock, 1000);
  updateClock();

  // Session Check
  const path = window.location.pathname.split('/').pop();
  if (path !== 'login.html') {
    if (!Auth.isLoggedIn()) {
      window.location.replace('login.html');
    } else {
      DataSync.fetchAll();
      DataSync.startAutoSync();
      applyUI();
    }
  }
});

function applyUI() {
  const user = Auth.get();
  if (!user) return;
  
  // Sidebar info
  document.querySelectorAll('#sidebarName').forEach(el => el.textContent = user.name);
  document.querySelectorAll('.badge-role').forEach(el => el.textContent = user.role);
  
  // Avatar
  const avatarHtml = user.photo 
    ? `<img src="${user.photo}">` 
    : user.name.charAt(0).toUpperCase();
    
  document.querySelectorAll('.user-avatar, .header-avatar').forEach(el => {
    el.innerHTML = avatarHtml;
    if (!user.photo) el.style.background = 'var(--primary)';
  });

  // Permissions
  document.querySelectorAll('.nav-link[data-module]').forEach(el => {
    const mod = el.getAttribute('data-module');
    if (mod !== 'dashboard' && !Auth.hasAccess(mod)) el.style.display = 'none';
  });
}

// Utility Functions
function initials(name) { return name.split(' ').map(n => n[0]).join('').toUpperCase(); }
function formatINR(amt) { return '₹' + Number(amt).toLocaleString('en-IN'); }
function genId(p) { return p + Date.now().toString(36).toUpperCase(); }
function todayStr() { return new Date().toISOString().split('T')[0]; }

function showToast(type, title, msg) {
  // Use existing toast logic or simple alert
  console.log(`${type.toUpperCase()}: ${title} - ${msg}`);
}
