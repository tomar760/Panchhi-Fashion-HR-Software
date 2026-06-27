/***********************************************************************************
 * PANCHHI HR PRO — Google Apps Script Backend
 * 
 * 💡 HOW TO CHANGE GSHEET & DRIVE:
 * 1. SHEET_ID: Google Sheet ke URL se ID copy karke yaha dalein.
 * 2. DRIVE_FOLDER_ID: Google Drive folder ke URL se ID copy karke yaha dalein.
 * 
 * 💡 HOW TO ADD A NEW MODULE/SHEET:
 * 1. 'SHEETS' object mein nayi entry add karein: MY_NEW_MODULE: 'SheetNameInGSheet'
 * 2. 'processSheet' function ke switch case mein uska save logic add karein.
 * 3. 'ALL_MODULES' array mein uska naam add karein.
 ***********************************************************************************/

const CONFIG = {
  // ⬇️ Yaha apni Google Sheet ki ID dalein
  SHEET_ID: '10qQe9hxaDB8rj8YThTXyMnSDUv_j6nbiLrGg0_LYP-4', 
  
  // ⬇️ Yaha apne Google Drive Folder ki ID dalein (Attachments ke liye)
  DRIVE_FOLDER_ID: '1haM_kHc-gUpjOlZv8JXFENRMt5MdhkPv', 
  
  DEFAULT_ADMIN: {
    name: 'Aditya Tomar',
    email: 'aditya@houseofpanchhi.com',
    password: 'admin123'
  },
  COMPANY: 'House of Panchhi',
  MAX_USERS: 10
};

// 💡 Nayi Sheet add karne ke liye yaha entry karein
const SHEETS = {
  USERS: 'Users',
  ACTIVITY_LOG: 'ActivityLog',
  EMPLOYEES: 'Employees',
  ATTENDANCE: 'Attendance',
  GATE_PASS: 'GatePass',
  LEAVE: 'LeaveRecords',
  SALARY: 'SalaryRegister',
  ADVANCE: 'AdvanceLoans',
  STORE: 'StoreEntries',
  DEPARTMENTS: 'Departments'
};

const ALL_MODULES = [
  'dashboard','employees','attendance','gatepass','leave','salary','store','analytics','teams','settings','profile','users'
];

// ===================== CORS / ENTRY POINTS =====================
function createCORSResponse(data) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output; // Web App automatically handles CORS for GET/POST
}

function doPost(e) {
  try {
    let payload = {};
    if (e.postData && e.postData.type === 'application/x-www-form-urlencoded') {
      payload = e.parameter;
      if (payload.data) payload.data = JSON.parse(payload.data);
    } else {
      payload = JSON.parse(e.postData.contents);
    }

    const sheet = payload.sheet || '';
    const action = payload.action || '';
    const data = payload.data || {};

    let result;
    if (sheet === 'Auth' || sheet === 'Users') {
      result = handleAuth(action, data);
    } else if (sheet === 'ActivityLog') {
      result = logActivity(data);
    } else if (sheet === 'DriveUpload') {
      result = uploadToDrive(data);
    } else {
      result = processSheet(sheet, action, data);
    }

    return createCORSResponse(result);
  } catch (err) {
    return createCORSResponse({ success: false, error: err.message });
  }
}

function doGet(e) {
  try {
    const action = e.parameter.action;
    
    // SPEED BOOSTER: Saara data ek saath fetch karne ke liye
    if (action === 'FETCH_ALL') {
      return createCORSResponse(fetchAllData());
    }

    const sheet = e.parameter.sheet || '';
    const filter = e.parameter.filter || '';
    const email = e.parameter.email || '';
    let result;

    if (sheet === 'Auth' || sheet === 'Users') {
      result = handleAuth(e.parameter.action || 'GET_USERS', { email, filter });
    } else {
      result = readSheetData(sheet, filter);
    }

    return createCORSResponse(result);
  } catch (err) {
    return createCORSResponse({ success: false, error: err.message });
  }
}

// 🚀 SPEED BOOSTER: Ek hi baar mein saari sheets read karna
function fetchAllData() {
  const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const result = { success: true, data: {}, timestamp: new Date().getTime() };
  
  Object.keys(SHEETS).forEach(key => {
    const sheetName = SHEETS[key];
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      result.data[key] = [];
      return;
    }
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    if (lastRow < 2) {
      result.data[key] = [];
      return;
    }
    const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    const rows = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
    result.data[key] = rows.map(row => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = row[i]; });
      return obj;
    });
  });
  
  return result;
}

// ===================== AUTH & USERS =====================
function handleAuth(action, data) {
  switch (action) {
    case 'LOGIN': return loginUser(data);
    case 'GET_USERS': return getUsers();
    case 'UPDATE_PROFILE': return updateProfile(data);
    case 'CHANGE_PASSWORD': return changePassword(data);
    // Add more auth actions here
    default: return { success: false, msg: 'Unknown auth action' };
  }
}

function hashPassword(pwd) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, pwd, Utilities.Charset.UTF_8)
    .map(b => (b < 0 ? b + 256 : b).toString(16).padStart(2, '0')).join('');
}

function loginUser(data) {
  const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.USERS);
  const email = (data.email || '').toString().trim().toLowerCase();
  const pwd = hashPassword(data.password || '');
  const rows = sheet.getDataRange().getValues();
  
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][2].toString().toLowerCase() === email && rows[i][3].toString() === pwd) {
      if (rows[i][6].toString().toUpperCase() !== 'ACTIVE') return { success: false, msg: 'Account Inactive' };
      
      // Last login update
      sheet.getRange(i + 1, 10).setValue(Utilities.formatDate(new Date(), 'Asia/Kolkata', 'dd/MM/yyyy HH:mm'));
      
      const user = {
        id: rows[i][0], name: rows[i][1], email: rows[i][2],
        role: rows[i][4], modules: rows[i][5].split(','),
        photo: rows[i][7], phone: rows[i][8]
      };
      return { success: true, user: user };
    }
  }
  return { success: false, msg: 'Invalid Credentials' };
}

// 💡 Naye Module ko process karne ke liye yaha logic add karein
function processSheet(sheet, action, data) {
  const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  // Example update/insert logic for Employees (Unique E-Code)
  if (sheet === 'Employees') {
    return saveEmployee(ss, data);
  }
  // Baki modules ka logic yaha aayega...
  return { success: false, msg: 'Sheet logic not implemented yet' };
}

function saveEmployee(ss, data) {
  const sheet = ss.getSheetByName(SHEETS.EMPLOYEES);
  const ecode = data.ecode.toString().trim();
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  // Find row by E-Code
  let rowIdx = -1;
  if (sheet.getLastRow() > 1) {
    const ecodes = sheet.getRange(2, 2, sheet.getLastRow() - 1, 1).getValues();
    for(let i=0; i<ecodes.length; i++) {
      if (ecodes[i][0].toString() === ecode) {
        rowIdx = i + 2;
        break;
      }
    }
  }

  // Map data to headers
  const rowData = headers.map(h => {
    // Mapping frontend keys to sheet headers
    if (h === 'E-Code') return ecode;
    if (h === 'Full Name') return data.fullname;
    if (h === 'Department') return data.department;
    if (h === 'Designation') return data.designation;
    if (h === 'Status') return data.status || 'ACTIVE';
    if (h === 'Mobile') return data.mobile;
    // Add more mappings as per your GSheet columns
    return data[h] || ''; 
  });

  if (rowIdx > 0) {
    sheet.getRange(rowIdx, 1, 1, rowData.length).setValues([rowData]);
    return { success: true, action: 'UPDATED' };
  } else {
    sheet.appendRow(rowData);
    return { success: true, action: 'INSERTED' };
  }
}

// Basic Sheet Reader
function readSheetData(sheetName, filter) {
  const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return { success: false, msg: 'Sheet not found' };
  const rows = sheet.getDataRange().getValues();
  const headers = rows.shift();
  const data = rows.map(r => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = r[i]);
    return obj;
  });
  return { success: true, data: data };
}

function logActivity(data) {
  const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.ACTIVITY_LOG);
  sheet.appendRow([
    Utilities.formatDate(new Date(), 'Asia/Kolkata', 'dd/MM/yyyy HH:mm:ss'),
    data.user, data.role, data.action, data.module, data.details
  ]);
  return { success: true };
}

// Drive Upload Logic
function uploadToDrive(data) {
  const folder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
  const blob = Utilities.newBlob(Utilities.base64Decode(data.base64), data.mimeType, data.fileName);
  const file = folder.createFile(blob);
  return { success: true, url: file.getUrl(), id: file.getId() };
}
