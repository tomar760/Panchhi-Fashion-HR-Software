// =========================================================
// PANCHHI HR - MASTER BACKEND ENGINE & UI LOGIC
// =========================================================

// Tumhara naya updated Google Apps Script URL
const API_URL = "https://script.google.com/macros/s/AKfycbzBYMRJEYAw_TlIIlP2qF49zxYZndpI6MnEkz-R2PChuBuE_tfFC_L10kCwFzXtObbe/exec";

// 1. Dynamic Greeting Logic
function updateGreeting() {
    const el = document.getElementById('dynamicGreeting');
    if(!el) return;
    const hour = new Date().getHours();
    let g = hour < 12 ? 'Good Morning' : (hour < 17 ? 'Good Afternoon' : 'Good Evening');
    let icon = hour < 12 ? 'fa-sun text-amber-400' : (hour < 17 ? 'fa-cloud-sun text-orange-400' : 'fa-moon text-indigo-200');
    el.innerHTML = `<i class="fas ${icon} mr-2"></i> ${g}, Aditya!`;
}

// 2. Live Date and Time Clock
function updateClock() {
    const d = document.getElementById('liveDate');
    const t = document.getElementById('liveTime');
    if(!d || !t) return;
    const now = new Date();
    d.innerText = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    t.innerText = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// 3. Under Construction Popup Trigger
function showComingSoon(mod) {
    const modal = document.getElementById('constructionModal');
    if(modal) {
        document.getElementById('constructionText').innerText = mod;
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}
function closeComingSoon() { document.getElementById('constructionModal').classList.add('hidden'); }

// 4. Universal Cloud Sync Function (Handles Single & Bulk Records)
async function syncToCloud(payload, btn) {
    const originalText = btn.innerHTML;
    btn.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i> Syncing...`;
    btn.classList.add("opacity-50", "cursor-not-allowed"); 
    btn.disabled = true;
    
    try {
        const response = await fetch(API_URL, { 
            method: "POST", 
            body: JSON.stringify(payload) 
        });
        const result = await response.json();
        
        btn.innerHTML = `<i class="fas fa-check-double mr-2"></i> Synced!`;
        btn.classList.replace("from-indigo-600", "from-emerald-500");
        
        setTimeout(() => { 
            btn.innerHTML = originalText; 
            btn.classList.remove("opacity-50", "cursor-not-allowed"); 
            if(btn.classList.contains("from-emerald-500")) {
                btn.classList.replace("from-emerald-500", "from-indigo-600");
            }
            btn.disabled = false; 
        }, 3000);
        
        if (result.status === "success") {
            return true;
        } else { 
            alert("❌ Server Error: " + result.message); 
            return false; 
        }
    } catch (error) { 
        btn.innerHTML = originalText; 
        btn.disabled = false; 
        alert("❌ Network Error: Connection failed with Apps Script."); 
        return false; 
    }
}

// Page Load Par Start Hone Wali Settings
document.addEventListener('DOMContentLoaded', () => { 
    updateGreeting(); 
    updateClock(); 
    setInterval(updateGreeting, 60000); 
    setInterval(updateClock, 1000); 
});
