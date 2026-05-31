// Login Handling
function handleLogin() {
    const btn = document.getElementById('loginBtn');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>&nbsp; Authenticating...';
    btn.disabled = true;
    setTimeout(() => {
        window.location.href = 'modules/dashboard.html';
    }, 1500);
}

// Live Clock & Greeting
function updateClock() {
    const clockEl = document.getElementById('liveClock');
    const greetingEl = document.getElementById('greetingText');
    const dateEl = document.getElementById('greetingDate');
    
    if(!clockEl) return;
    
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    clockEl.textContent = timeStr;
    
    if(greetingEl) {
        const h = now.getHours();
        let greeting = 'Good Morning';
        if (h >= 12 && h < 17) greeting = 'Good Afternoon';
        else if (h >= 17 && h < 21) greeting = 'Good Evening';
        else if (h >= 21) greeting = 'Good Night';
        greetingEl.textContent = greeting + ', Aditya! 👋';
    }
    
    if(dateEl) {
        const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        dateEl.textContent = dateStr;
    }
}
setInterval(updateClock, 1000);
updateClock();

// Sidebar Toggle (Mobile)
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('sidebarOverlay').classList.toggle('show');
}

// Global Modals & Toasts
function showModal(id) { document.getElementById('modal-' + id).classList.add('show'); }
function closeModal(id) { document.getElementById('modal-' + id).classList.remove('show'); }

function showToast(type, title, msg) {
    const toast = document.getElementById('toast');
    if(!toast) return;
    const icon = document.getElementById('toastIcon');
    toast.querySelector('.toast-icon').className = 'toast-icon ' + type;
    if (type === 'success') icon.innerHTML = '<i class="fas fa-check"></i>';
    else if (type === 'error') icon.innerHTML = '<i class="fas fa-times"></i>';
    else icon.innerHTML = '<i class="fas fa-info"></i>';
    document.getElementById('toastTitle').textContent = title;
    document.getElementById('toastMessage').textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// Button Fake Processing Effect
function processBtn(btn, msg) {
    const origHTML = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>&nbsp; Processing...';
    btn.disabled = true;
    setTimeout(() => {
        btn.innerHTML = '<i class="fas fa-check"></i>&nbsp; Done';
        btn.style.background = 'linear-gradient(135deg,#10b981,#34d399)';
        setTimeout(() => {
            btn.innerHTML = origHTML;
            btn.disabled = false;
            btn.style.background = '';
            showToast('success', 'Success', msg);
        }, 800);
    }, 1500);
}

// Search Filter
function filterEmployees() {
    const q = document.getElementById('empSearch').value.toLowerCase();
    document.querySelectorAll('#empTable tbody tr').forEach(r => {
        r.style.display = r.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
}
