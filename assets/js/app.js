// =========================================================
// PANCHHI HR - MASTER BACKEND ENGINE & UI LOGIC
// =========================================================

const API_URL = "https://script.google.com/macros/s/AKfycbwfvr9L7BHbJxKaKkxnj1pXd_RjfI8Aw7iQZBJZvj5bperM19RlQuWs6PoPEvKLUSch/exec";

// 1. Dynamic Greeting Logic
function updateGreeting() {
    const greetingElement = document.getElementById('dynamicGreeting');
    if (!greetingElement) return;

    const hour = new Date().getHours();
    let greeting = 'Good Evening';
    let icon = '<i class="fas fa-moon text-indigo-200 mr-2"></i>';

    if (hour >= 5 && hour < 12) {
        greeting = 'Good Morning';
        icon = '<i class="fas fa-sun text-amber-400 mr-2"></i>';
    } else if (hour >= 12 && hour < 17) {
        greeting = 'Good Afternoon';
        icon = '<i class="fas fa-cloud-sun text-orange-400 mr-2"></i>';
    }

    greetingElement.innerHTML = `${icon} ${greeting}, Aditya!`;
}

// 2. Live Date and Time Logic
function updateClock() {
    const dateEl = document.getElementById('liveDate');
    const timeEl = document.getElementById('liveTime');
    if(!dateEl || !timeEl) return;

    const now = new Date();
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    dateEl.innerText = now.toLocaleDateString('en-US', options);
    timeEl.innerText = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// 3. Under Construction / Coming Soon Alert
function showComingSoon(moduleName) {
    const modal = document.getElementById('constructionModal');
    const text = document.getElementById('constructionText');
    if (modal && text) {
        text.innerText = moduleName;
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}

function closeComingSoon() {
    const modal = document.getElementById('constructionModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

// 4. Universal API Sync Function
async function syncToCloud(payload, buttonElement) {
    const originalText = buttonElement.innerHTML;
    buttonElement.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i> Syncing...`;
    buttonElement.classList.add("opacity-70", "cursor-not-allowed");
    buttonElement.disabled = true;

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify(payload)
        });
        
        const result = await response.json();
        
        buttonElement.innerHTML = `<i class="fas fa-check-double mr-2"></i> Synced!`;
        buttonElement.classList.replace("from-indigo-600", "from-emerald-500");
        buttonElement.classList.replace("to-purple-600", "to-teal-500");
        
        setTimeout(() => {
            buttonElement.innerHTML = originalText;
            buttonElement.classList.remove("opacity-70", "cursor-not-allowed");
            buttonElement.classList.replace("from-emerald-500", "from-indigo-600");
            buttonElement.classList.replace("to-teal-500", "to-purple-600");
            buttonElement.disabled = false;
        }, 3000);

        if (result.status === "success") {
            console.log("Cloud Sync Successful:", result.message);
            return true;
        } else {
            alert("❌ Server Error: " + result.message);
            return false;
        }
    } catch (error) {
        buttonElement.innerHTML = originalText;
        buttonElement.disabled = false;
        alert("❌ Network Error: Could not connect to Panchhi Master DB.");
        console.error("API Error:", error);
        return false;
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    updateGreeting();
    updateClock();
    setInterval(updateGreeting, 60000); 
    setInterval(updateClock, 1000); // Ticks every second
});
