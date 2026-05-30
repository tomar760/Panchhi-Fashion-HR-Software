// Profile and Modal Toggles
function openProfile() {
    document.getElementById('profilePanel').classList.add('open');
    document.getElementById('overlay').classList.add('show');
}

function openAddModal() {
    document.getElementById('addModal').classList.add('show');
    document.getElementById('overlay').classList.add('show');
}

function closeAll() {
    const profilePanel = document.getElementById('profilePanel');
    const addModal = document.getElementById('addModal');
    const overlay = document.getElementById('overlay');
    
    if(profilePanel) profilePanel.classList.remove('open');
    if(addModal) addModal.classList.remove('show');
    if(overlay) overlay.classList.remove('show');
    
    document.querySelectorAll('.custom-select-dropdown').forEach(el => el.classList.remove('show'));
}

// Custom Tabs Logic
function switchTab(tabId, btn, groupClass) {
    document.querySelectorAll('.' + groupClass + '-tab').forEach(el => el.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    
    let btnParent = btn.parentElement;
    btnParent.querySelectorAll('.tab-btn').forEach(el => {
        if(groupClass === 'prof') {
            el.classList.remove('active', 'text-white', 'border-white');
            el.classList.add('text-indigo-200', 'border-transparent');
        } else {
            el.classList.remove('active', 'text-indigo-600', 'border-indigo-600');
            el.classList.add('text-gray-500', 'border-transparent');
        }
    });
    
    if(groupClass === 'prof') {
        btn.classList.remove('text-indigo-200', 'border-transparent');
        btn.classList.add('active', 'text-white', 'border-white');
    } else {
        btn.classList.remove('text-gray-500', 'border-transparent');
        btn.classList.add('active', 'text-indigo-600', 'border-indigo-600');
    }
}

// Custom Smart Dropdown Logic
function toggleDropdown(dropdownId) {
    document.getElementById(dropdownId).classList.toggle('show');
}

function selectValue(inputId, val, dropdownId) {
    document.getElementById(inputId).value = val;
    document.getElementById(dropdownId).classList.remove('show');
}

function addNewValue(inputId, listId, dropdownId) {
    let val = document.getElementById(inputId).value.trim();
    if(val !== '') {
        let div = document.createElement('div');
        div.className = 'dropdown-item'; 
        div.innerText = val;
        div.onclick = function() { selectValue(inputId, val, dropdownId); };
        document.getElementById(listId).appendChild(div);
        selectValue(inputId, val, dropdownId);
    }
}

function filterDropdown(inputId, dropdownId, listId) {
    let input = document.getElementById(inputId).value.toLowerCase();
    let items = document.getElementById(listId).getElementsByClassName('dropdown-item');
    document.getElementById(dropdownId).classList.add('show');
    for(let i=0; i < items.length; i++) {
        items[i].style.display = items[i].innerText.toLowerCase().includes(input) ? "" : "none";
    }
}

// Close dropdown if clicked outside
document.addEventListener('click', function(e) {
    if(!e.target.closest('.custom-select-wrapper')) {
        document.querySelectorAll('.custom-select-dropdown').forEach(el => el.classList.remove('show'));
    }
});
