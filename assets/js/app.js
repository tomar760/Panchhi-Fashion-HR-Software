// TUMHARA GOOGLE SHEET URL YAHAN HAI
const GOOGLE_SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbz5-vHxNTcjeki1WNOhseDHHah6vqjrvWskkt98VZuz12ihZY5mPH5YdFTL8lSW6Edlgw/exec';

// --- System Init ---
function handleLogin() {
  document.getElementById('loginBtn').innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';
  setTimeout(() => {
    document.getElementById('loginOverlay').classList.add('hidden');
    document.getElementById('appWrapper').classList.add('active');
    loadModule('dashboard'); // Default load
  }, 1000);
}

// --- Module Router (AJAX) ---
async function loadModule(moduleName, linkElement) {
  if(linkElement) {
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    linkElement.classList.add('active');
  }
  
  const container = document.getElementById('module-container');
  container.innerHTML = '<div style="text-align:center; padding:50px;"><i class="fas fa-spinner fa-spin fa-2x" style="color:var(--primary)"></i><p>Loading Module...</p></div>';

  try {
    const response = await fetch(`modules/${moduleName}.html`);
    if(!response.ok) throw new Error("File not found");
    const html = await response.text();
    container.innerHTML = html;
  } catch (error) {
    container.innerHTML = `<div class="warning-box">Error loading module: Please run via Live Server (CORS issue).</div>`;
  }
}

// --- GATE PASS LOGIC ---
function submitGatePass(btn) {
  const empSelect = document.getElementById('gpEmpName').value;
  const purpose = document.getElementById('gpPurpose').value;
  if (!empSelect || !purpose) return showToast('error', 'Error', 'Fill required fields!');

  const [empName, department] = empSelect.split(' - ');
  const payload = {
    action: "addGatePass",
    empName: empName,
    department: department || "N/A",
    outTime: document.getElementById('gpOutTime').value,
    inTime: document.getElementById('gpInTime').value,
    purpose: purpose
  };

  processApiCall(btn, payload, 'Gate Pass Issued Successfully!');
}

// --- MEGA EMPLOYEE LOGIC (MIS) ---
function submitNewEmployee(btn) {
  // Extracting key fields from the mega form
  const payload = {
    action: "addEmployee",
    firstName: document.getElementById('empFirstName').value,
    lastName: document.getElementById('empLastName').value,
    fullName: document.getElementById('empFullName').value,
    mobile: document.getElementById('empMobile').value,
    email: document.getElementById('empPersEmail').value,
    department: document.getElementById('empDept').value,
    designation: document.getElementById('empDesig').value,
    baseCtc: document.getElementById('empFixCtc').value,
    aadharNo: document.getElementById('empAadhar').value,
    panNo: document.getElementById('empPan').value,
    // (Baki 49 fields isi pattern mein append ho jayenge)
  };

  if (!payload.firstName || !payload.mobile) return showToast('error', 'Error', 'Name & Mobile mandatory!');

  processApiCall(btn, payload, 'Employee Saved to Master Sheet!');
}

// --- API PROCESSOR ---
function processApiCall(btn, payload, successMsg) {
  const origHTML = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
  btn.disabled = true;

  fetch(GOOGLE_SHEET_API_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).then(() => {
    btn.innerHTML = '<i class="fas fa-check"></i> Done';
    btn.style.background = '#10b981';
    showToast('success', 'Success', successMsg);
    setTimeout(() => {
      btn.innerHTML = origHTML;
      btn.disabled = false;
      btn.style.background = '';
      closeModal('addEmployee');
    }, 2000);
  }).catch(err => {
    showToast('error', 'Failed', 'Sheet update failed.');
    btn.innerHTML = origHTML;
    btn.disabled = false;
  });
}

// --- UI Helpers ---
setInterval(() => {
  const now = new Date();
  document.getElementById('liveClock').textContent = now.toLocaleTimeString('en-US');
  document.getElementById('greetingDate').textContent = now.toDateString();
}, 1000);

function showModal(id) { document.getElementById('modal-'+id).classList.add('show'); }
function closeModal(id) { document.getElementById('modal-'+id).classList.remove('show'); }
function showToast(type, title, msg) {
  const t = document.getElementById('toast');
  document.getElementById('toastTitle').textContent = title;
  document.getElementById('toastMessage').textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}
