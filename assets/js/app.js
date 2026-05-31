const API_URL = "https://script.google.com/macros/s/AKfycbzBYMRJEYAw_TlIIlP2qF49zxYZndpI6MnEkz-R2PChuBuE_tfFC_L10kCwFzXtObbe/exec";

function updateGreeting() {
    const el = document.getElementById('dynamicGreeting');
    if(!el) return;
    const hour = new Date().getHours();
    let g = hour < 12 ? 'Good Morning' : (hour < 17 ? 'Good Afternoon' : 'Good Evening');
    let icon = hour < 12 ? 'fa-sun text-amber-400' : (hour < 17 ? 'fa-cloud-sun text-orange-400' : 'fa-moon text-indigo-200');
    el.innerHTML = `<i class="fas ${icon} mr-2"></i> ${g}, Aditya!`;
}

function updateClock() {
    const d = document.getElementById('liveDate');
    const t = document.getElementById('liveTime');
    if(!d || !t) return;
    const now = new Date();
    d.innerText = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    t.innerText = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function showComingSoon(mod) {
    const textEl = document.getElementById('constructionText');
    const modal = document.getElementById('constructionModal');
    if(textEl && modal) {
        textEl.innerText = mod;
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}
function closeComingSoon() { 
    const modal = document.getElementById('constructionModal');
    if(modal) {
        modal.classList.add('hidden'); 
        modal.classList.remove('flex');
    }
}

// Sidebar Animation Logic
function toggleMenu(menuId) {
    const menu = document.getElementById(menuId);
    const icon = document.getElementById(menuId + '-icon');
    if(menu && icon) {
        if(menu.classList.contains('hidden')) {
            menu.classList.remove('hidden');
            icon.classList.add('rotate-180');
        } else {
            menu.classList.add('hidden');
            icon.classList.remove('rotate-180');
        }
    }
}

async function syncToCloud(payload, btn) {
    const originalText = btn.innerHTML;
    btn.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i> Syncing...`;
    btn.classList.add("opacity-50", "cursor-not-allowed"); btn.disabled = true;
    try {
        const response = await fetch(API_URL, { method: "POST", body: JSON.stringify(payload) });
        const result = await response.json();
        btn.innerHTML = `<i class="fas fa-check-double mr-2"></i> Synced!`;
        btn.classList.replace("from-indigo-600", "from-emerald-500");
        setTimeout(() => { 
            btn.innerHTML = originalText; 
            btn.classList.remove("opacity-50", "cursor-not-allowed"); 
            btn.classList.replace("from-emerald-500", "from-indigo-600"); 
            btn.disabled = false; 
        }, 3000);
        if (result.status === "success") return true;
        else { alert("❌ Server Error: " + result.message); return false; }
    } catch (error) { 
        btn.innerHTML = originalText; btn.disabled = false; alert("❌ Network Error!"); return false; 
    }
}

document.addEventListener('DOMContentLoaded', () => { 
    updateGreeting(); updateClock(); 
    setInterval(updateGreeting, 60000); setInterval(updateClock, 1000); 
});
