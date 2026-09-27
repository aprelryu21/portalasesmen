/**
 * ============================================================================
 * TEMPLATE GOOGLE APPS SCRIPT DATABASE ENGINE DENGAN INTEGRASI DRIVE LENGKAP
 * ============================================================================
 * Folder Utama: /GENERATOR KARTU UJIAN/DATABASE/<NAMA_SEKOLAH>/
 * - Menyimpan spreadsheet induk & sheet per sekolah
 * - Mendukung operasi CRUD Akun langsung ke sheet "AKUN"
 * - Menghitung kapasitas kuota 10 Juta Sel Google Spreadsheet
 * - Menyimpan backup JSON data & subfolder FOTO_SISWA per sekolah
 */

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * ============================================================================
 * KARTU UJIAN — GOOGLE APPS SCRIPT DATABASE & DRIVE ENGINE (VERSI TERBARU)
 * ============================================================================
 * 
 * STRUKTUR PENYIMPANAN GOOGLE DRIVE:
 * 📂 /GENERATOR KARTU UJIAN/
 *    └── 📂 DATABASE/
 *        ├── 📂 [NAMA SEKOLAH A]/
 *        │   ├── 📄 DATA_[NAMA_SEKOLAH_A].json
 *        │   └── 📂 FOTO_SISWA/
 *        ├── 📂 [NAMA SEKOLAH B]/
 *        │   ├── 📄 DATA_[NAMA_SEKOLAH_B].json
 *        │   └── 📂 FOTO_SISWA/
 *        └── ...
 * 
 * SPREADSHEET INDUK (DATABASE MULTI-TAB):
 * 📊 Sheet AKUN (Pusat Pengguna: Operator & Admin)
 * 📊 Sheet INFORMASI_SEKOLAH (Profil Sekolah & Identitas Ujian)
 * 📊 Sheet DATA_SISWA (Roster Siswa, Foto & Ruang Ujian)
 * 📊 Sheet DESAIN_KARTU (Pengaturan Desain & Tata Letak Cetak)
 * 
 * PETUNJUK PEMASANGAN:
 * 1. Buka Google Spreadsheet baru atau yang sudah ada di Google Drive Anda.
 * 2. Klik menu "Ekstensi" (Extensions) -> "Apps Script".
 * 3. Hapus seluruh isi kode lama di Code.gs, lalu SALIN & TEMPEL (PASTE) seluruh kode ini.
 * 4. Klik ikon "Simpan" (Save).
 * 5. Klik tombol biru "Terapkan" (Deploy) -> "Penerapan Baru" (New deployment).
 * 6. Pilih jenis: "Aplikasi Web" (Web app).
 * 7. Konfigurasi:
 *    - Deskripsi: Database Kartu Ujian & Google Drive Engine
 *    - Jalankan sebagai (Execute as): "Saya" (Me)
 *    - Siapa yang memiliki akses (Who has access): "Siapa saja" (Anyone)
 * 8. Klik "Terapkan" (Deploy), berikan izin akses (Authorize access).
 * 9. Salin URL Aplikasi Web yang berakhiran "/exec", lalu simpan di src/config/appConfig.ts.
 */

// Konstanta Nama Sheet/Tab di Spreadsheet Aktif
var SHEET_NAMES = {
  AKUN: "AKUN",
  INFORMASI_SEKOLAH: "INFORMASI_SEKOLAH",
  DATA_SISWA: "DATA_SISWA",
  DESAIN_KARTU: "DESAIN_KARTU",
  LOG_PENGGUNA: "LOG_PENGGUNA"
};

// Konstanta Direktori Google Drive
var DRIVE_PATHS = {
  ROOT: "GENERATOR KARTU UJIAN",
  DATABASE: "DATABASE",
  PHOTOS: "FOTO_SISWA",
  LOG_PHOTOS: "FOTO_LOGIN"
};

// Batas Resmi Sel Google Spreadsheet (10.000.000 Sel)
var MAX_CELLS_LIMIT = 10000000;

/**
 * Otomatis inisialisasi sheet dan header di spreadsheet aktif jika belum ada.
 */
function initSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Sheet AKUN
  var sheetAkun = ss.getSheetByName(SHEET_NAMES.AKUN);
  if (!sheetAkun) {
    sheetAkun = ss.insertSheet(SHEET_NAMES.AKUN);
    sheetAkun.appendRow([
      "ID", "Username", "Password", "Nama Sekolah", "NPSN", "Role", "Created At"
    ]);
    sheetAkun.getRange("A1:G1").setFontWeight("bold").setBackground("#FFE600");
    // Akun Admin Default Nagata
    sheetAkun.appendRow([
      "acc_nagata_admin", "Nagata", "09072022", "Pusat Pengelola Kartu Ujian", "", "admin", new Date().toISOString()
    ]);
  }

  // 2. Sheet INFORMASI_SEKOLAH
  var sheetSekolah = ss.getSheetByName(SHEET_NAMES.INFORMASI_SEKOLAH);
  if (!sheetSekolah) {
    sheetSekolah = ss.insertSheet(SHEET_NAMES.INFORMASI_SEKOLAH);
    sheetSekolah.appendRow([
      "School ID", "Username", "Nama Sekolah", "NPSN", "NSS", "Alamat", "Desa",
      "Kecamatan", "Kabupaten", "Provinsi", "Logo URL", "Nama Kepala Sekolah",
      "NIP Kepala Sekolah", "Jabatan", "Nama Ujian", "Semester", "Tahun Pelajaran",
      "Tanggal Ujian", "Titimangsa Lokasi", "Catatan Tata Tertib", "Drive Folder URL", "Updated At"
    ]);
    sheetSekolah.getRange("A1:V1").setFontWeight("bold").setBackground("#00F0FF");
  }

  // 3. Sheet DATA_SISWA
  var sheetSiswa = ss.getSheetByName(SHEET_NAMES.DATA_SISWA);
  if (!sheetSiswa) {
    sheetSiswa = ss.insertSheet(SHEET_NAMES.DATA_SISWA);
    sheetSiswa.appendRow([
      "ID", "School ID", "Username", "NISN", "NIS", "Nama Lengkap", "Jenis Kelamin",
      "Kelas", "Tempat Lahir", "Tanggal Lahir", "Ruang Ujian", "Nomor Meja", "Foto URL", "Updated At"
    ]);
    sheetSiswa.getRange("A1:N1").setFontWeight("bold").setBackground("#10B981").setFontColor("#FFFFFF");
  }

  // 4. Sheet DESAIN_KARTU
  var sheetDesain = ss.getSheetByName(SHEET_NAMES.DESAIN_KARTU);
  if (!sheetDesain) {
    sheetDesain = ss.insertSheet(SHEET_NAMES.DESAIN_KARTU);
    sheetDesain.appendRow([
      "School ID", "Username", "Design JSON", "Print Settings JSON", "Updated At"
    ]);
    sheetDesain.getRange("A1:E1").setFontWeight("bold").setBackground("#FF4365").setFontColor("#FFFFFF");
  }

  // 5. Sheet LOG_PENGGUNA (Catatan Sesi Masuk & Foto Kamera Pengguna)
  var sheetLog = ss.getSheetByName(SHEET_NAMES.LOG_PENGGUNA);
  if (!sheetLog) {
    sheetLog = ss.insertSheet(SHEET_NAMES.LOG_PENGGUNA);
    sheetLog.appendRow([
      "ID", "Username", "Nama Sekolah", "Waktu Login", "Browser", "Foto URL", "Status"
    ]);
    sheetLog.getRange("A1:G1").setFontWeight("bold").setBackground("#1E293B").setFontColor("#FFFFFF");
  }

  return {
    spreadsheetId: ss.getId(),
    spreadsheetName: ss.getName(),
    spreadsheetUrl: ss.getUrl()
  };
}

/**
 * Menghitung kapasitas kuota 10 Juta Sel Google Spreadsheet
 */
function getSpreadsheetCapacityStats() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = ss.getSheets();
  var totalAllocatedCells = 0;
  var totalDataCells = 0;
  var sheetsInfo = [];

  for (var i = 0; i < sheets.length; i++) {
    var sh = sheets[i];
    var maxRows = sh.getMaxRows();
    var maxCols = sh.getMaxColumns();
    var lastRow = Math.max(1, sh.getLastRow());
    var lastCol = Math.max(1, sh.getLastColumn());

    var allocated = maxRows * maxCols;
    var used = lastRow * lastCol;

    totalAllocatedCells += allocated;
    totalDataCells += used;

    sheetsInfo.push({
      name: sh.getName(),
      lastRow: lastRow,
      lastColumn: lastCol,
      allocatedCells: allocated,
      dataCells: used
    });
  }

  var availableCells = Math.max(0, MAX_CELLS_LIMIT - totalAllocatedCells);
  var percentUsed = ((totalAllocatedCells / MAX_CELLS_LIMIT) * 100).toFixed(2);
  var percentAvailable = (100 - parseFloat(percentUsed)).toFixed(2);

  return {
    totalAllocatedCells: totalAllocatedCells,
    totalDataCells: totalDataCells,
    maxCellsCapacity: MAX_CELLS_LIMIT,
    availableCells: availableCells,
    percentUsed: percentUsed,
    percentAvailable: percentAvailable,
    sheetsCount: sheets.length,
    sheetsInfo: sheetsInfo
  };
}

/**
 * Mengambil atau membuat hierarki folder Google Drive:
 * /GENERATOR KARTU UJIAN/DATABASE/
 */
function getOrCreateDriveDatabaseFolder() {
  try {
    var rootFolders = DriveApp.getFoldersByName(DRIVE_PATHS.ROOT);
    var rootFolder = rootFolders.hasNext() ? rootFolders.next() : DriveApp.createFolder(DRIVE_PATHS.ROOT);

    var dbFolders = rootFolder.getFoldersByName(DRIVE_PATHS.DATABASE);
    var dbFolder = dbFolders.hasNext() ? dbFolders.next() : rootFolder.createFolder(DRIVE_PATHS.DATABASE);

    // Hitung jumlah folder sekolah di dalam DATABASE
    var schoolCount = 0;
    var schoolFolders = dbFolder.getFolders();
    while (schoolFolders.hasNext()) {
      schoolFolders.next();
      schoolCount++;
    }

    return {
      success: true,
      rootFolder: rootFolder,
      dbFolder: dbFolder,
      rootFolderId: rootFolder.getId(),
      rootFolderUrl: rootFolder.getUrl(),
      dbFolderId: dbFolder.getId(),
      dbFolderUrl: dbFolder.getUrl(),
      schoolCount: schoolCount,
      path: "/" + DRIVE_PATHS.ROOT + "/" + DRIVE_PATHS.DATABASE + "/"
    };
  } catch (err) {
    return {
      success: false,
      error: err.toString(),
      schoolCount: 0,
      path: "/" + DRIVE_PATHS.ROOT + "/" + DRIVE_PATHS.DATABASE + "/"
    };
  }
}

/**
 * Mengambil atau membuat folder khusus untuk sekolah tertentu di dalam Drive:
 * /GENERATOR KARTU UJIAN/DATABASE/<NAMA_SEKOLAH>/
 * Dan folder foto:
 * /GENERATOR KARTU UJIAN/DATABASE/<NAMA_SEKOLAH>/FOTO_SISWA/
 */
function getOrCreateSchoolFolder(schoolName) {
  var db = getOrCreateDriveDatabaseFolder();
  if (!db.success) {
    throw new Error("Gagal mengakses folder drive database: " + db.error);
  }

  var cleanName = (schoolName || "SEKOLAH_UMUM").toString().trim().replace(/[\\\\/:*?"<>|]/g, "_");
  if (!cleanName) cleanName = "SEKOLAH_DATA";

  var schoolFolders = db.dbFolder.getFoldersByName(cleanName);
  var schoolFolder = schoolFolders.hasNext() ? schoolFolders.next() : db.dbFolder.createFolder(cleanName);

  var photoFolders = schoolFolder.getFoldersByName(DRIVE_PATHS.PHOTOS);
  var photoFolder = photoFolders.hasNext() ? photoFolders.next() : schoolFolder.createFolder(DRIVE_PATHS.PHOTOS);

  return {
    schoolFolder: schoolFolder,
    schoolFolderId: schoolFolder.getId(),
    schoolFolderUrl: schoolFolder.getUrl(),
    photoFolder: photoFolder,
    photoFolderId: photoFolder.getId(),
    photoFolderUrl: photoFolder.getUrl(),
    schoolPath: "/" + DRIVE_PATHS.ROOT + "/" + DRIVE_PATHS.DATABASE + "/" + cleanName + "/",
    photoPath: "/" + DRIVE_PATHS.ROOT + "/" + DRIVE_PATHS.DATABASE + "/" + cleanName + "/" + DRIVE_PATHS.PHOTOS + "/"
  };
}

/**
 * Handler GET request untuk uji koneksi, ambil semua data, dan reload
 */
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "PING";
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  try {
    initSheets();

    // 1. RELOAD / AMBIL SELURUH DATA SPREADSHEET
    if (action === "GET_ALL_DATA") {
      var allData = handleGetAllDatabaseData();
      var capacity = getSpreadsheetCapacityStats();
      var driveStats = getOrCreateDriveDatabaseFolder();

      return createJsonResponse({
        status: "success",
        action: action,
        spreadsheetId: ss.getId(),
        spreadsheetName: ss.getName(),
        spreadsheetUrl: ss.getUrl(),
        capacity: capacity,
        driveDatabase: driveStats,
        data: allData
      });
    }

    // 2. AMBIL HANYA DAFTAR AKUN
    if (action === "GET_ACCOUNTS") {
      var accounts = handleGetAllAccounts();
      return createJsonResponse({
        status: "success",
        action: action,
        accounts: accounts
      });
    }

    // 2.5 AMBIL LOG PENGGUNA DARI SHEET LOG_PENGGUNA
    if (action === "GET_LOGIN_LOGS") {
      var logs = handleGetLoginLogs();
      return createJsonResponse({
        status: "success",
        action: action,
        logs: logs
      });
    }

    // 3. DEFAULT PING (DENGAN STATISTIK KAPASITAS SPREADSHEET & DRIVE)
    var driveInfo = getOrCreateDriveDatabaseFolder();
    var capacityStats = getSpreadsheetCapacityStats();

    var totalPhotosCount = 0;
    try {
      var sheetSiswa = ss.getSheetByName(SHEET_NAMES.DATA_SISWA);
      if (sheetSiswa) {
        var siswaRows = sheetSiswa.getDataRange().getValues();
        for (var p = 1; p < siswaRows.length; p++) {
          if (siswaRows[p][12] && String(siswaRows[p][12]).trim().length > 0) {
            totalPhotosCount++;
          }
        }
      }
    } catch (ePhoto) {}

    return createJsonResponse({
      status: "success",
      message: "Database Kartu Ujian (Spreadsheet & Drive) berhasil terhubung!",
      spreadsheetId: ss.getId(),
      spreadsheetName: ss.getName(),
      spreadsheetUrl: ss.getUrl(),
      capacity: capacityStats,
      driveDatabase: {
        status: driveInfo.success ? "Aktif & Tersinkron" : "Perlu Izin Drive",
        rootPath: "/" + DRIVE_PATHS.ROOT + "/" + DRIVE_PATHS.DATABASE + "/",
        rootFolderUrl: driveInfo.rootFolderUrl || "",
        dbFolderUrl: driveInfo.dbFolderUrl || "",
        dbFolderId: driveInfo.dbFolderId || "",
        schoolCount: driveInfo.schoolCount || 0
      },
      imageDatabase: {
        status: "Siap & Aktif",
        folderName: DRIVE_PATHS.PHOTOS,
        subfolderPattern: "/" + DRIVE_PATHS.ROOT + "/" + DRIVE_PATHS.DATABASE + "/[NAMA_SEKOLAH]/" + DRIVE_PATHS.PHOTOS + "/",
        totalPhotosSaved: totalPhotosCount
      },
      serverTime: new Date().toISOString()
    });
  } catch (err) {
    return createJsonResponse({
      status: "error",
      message: err.toString()
    });
  }
}

/**
 * Handler POST request untuk operasi CRUD Akun, Simpan Data, dan Autentikasi
 */
function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  initSheets();

  try {
    var contents = {};
    if (e && e.postData && e.postData.contents) {
      contents = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      contents = e.parameter;
    }

    var action = contents.action || "PING";

    // 1. LOGIN AKUN
    if (action === "LOGIN") {
      var authResult = handleLogin(contents.username, contents.password);
      return createJsonResponse(authResult);
    }

    // 2. DAFTAR / TAMBAH AKUN BARU
    if (action === "REGISTER" || action === "ADD_ACCOUNT") {
      var regResult = handleAddAccount(contents);
      return createJsonResponse(regResult);
    }

    // 3. UPDATE AKUN (EDIT INFORMASI AKUN DI SHEET AKUN)
    if (action === "UPDATE_ACCOUNT") {
      var updateResult = handleUpdateAccount(contents);
      return createJsonResponse(updateResult);
    }

    // 4. RESET / GANTI PASSWORD AKUN DI SHEET AKUN
    if (action === "RESET_PASSWORD" || action === "CHANGE_PASSWORD") {
      var passResult = handleResetPassword(contents);
      return createJsonResponse(passResult);
    }

    // 5. HAPUS AKUN DI SHEET AKUN
    if (action === "DELETE_ACCOUNT") {
      var delResult = handleDeleteAccount(contents);
      return createJsonResponse(delResult);
    }

    // 6. AMBIL SELURUH DATA LENGKAP
    if (action === "GET_ALL_DATA") {
      var fullData = handleGetAllDatabaseData();
      var cap = getSpreadsheetCapacityStats();
      return createJsonResponse({
        status: "success",
        spreadsheetId: ss.getId(),
        spreadsheetName: ss.getName(),
        spreadsheetUrl: ss.getUrl(),
        capacity: cap,
        data: fullData
      });
    }

    // 7. SIMPAN SEMUA DATA (Sinkronisasi Spreadsheet & Google Drive)
    if (action === "SAVE_ALL_DATA") {
      var saveResult = handleSaveAllData(contents);
      return createJsonResponse(saveResult);
    }

    // 8. LOAD SEMUA DATA PER USER
    if (action === "LOAD_ALL_DATA") {
      var loaded = loadAllDataForUser(contents.username);
      return createJsonResponse({
        status: "success",
        spreadsheetId: ss.getId(),
        spreadsheetName: ss.getName(),
        spreadsheetUrl: ss.getUrl(),
        data: loaded
      });
    }

    // 9. UNGGAH LOGO SEKOLAH KE GOOGLE DRIVE
    if (action === "UPLOAD_LOGO") {
      var logoResult = handleUploadLogo(contents);
      return createJsonResponse(logoResult);
    }

    // 10. SIMPAN IDENTITAS SEKOLAH & UJIAN SAJA
    if (action === "SAVE_SCHOOL_SETTINGS") {
      var schoolSetResult = handleSaveSchoolSettings(contents);
      return createJsonResponse(schoolSetResult);
    }

    // 11. SIMPAN DESAIN KARTU SAJA
    if (action === "SAVE_CARD_DESIGN") {
      var designSetResult = handleSaveCardDesign(contents);
      return createJsonResponse(designSetResult);
    }

    // 12. BATCH DATA SISWA (ATOMIC & TIDAK BERTUMPUK)
    if (action === "BATCH_STUDENTS") {
      var batchResult = handleBatchStudents(contents);
      return createJsonResponse(batchResult);
    }

    // 13. TAMBAH 1 SISWA (CRUD EFISIEN)
    if (action === "ADD_STUDENT") {
      var addStdResult = handleAddStudent(contents);
      return createJsonResponse(addStdResult);
    }

    // 14. UPDATE 1 SISWA (CRUD EFISIEN)
    if (action === "UPDATE_STUDENT") {
      var updStdResult = handleUpdateStudent(contents);
      return createJsonResponse(updStdResult);
    }

    // 15. HAPUS 1 SISWA (CRUD EFISIEN)
    if (action === "DELETE_STUDENT") {
      var delStdResult = handleDeleteStudent(contents);
      return createJsonResponse(delStdResult);
    }

    // 16. HAPUS BANYAK SISWA (CRUD EFISIEN)
    if (action === "BULK_DELETE_STUDENTS") {
      var bulkDelResult = handleBulkDeleteStudents(contents);
      return createJsonResponse(bulkDelResult);
    }

    // 17. BERSIHKAN & RAPIKAN SPREADSHEET (HAPUS KOLOM & BARIS KOSONG BERLEBIH)
    if (action === "CLEANUP_SPREADSHEET" || action === "OPTIMIZE_CAPACITY") {
      var cleanupResult = handleCleanupSpreadsheet();
      return createJsonResponse(cleanupResult);
    }

    // 18. CATAT LOG MASUK & FOTO KAMERA PENGGUNA (Sheet LOG_PENGGUNA & Google Drive)
    if (action === "RECORD_LOGIN_LOG" || action === "LOG_USER_LOGIN") {
      var logResult = handleRecordLoginLog(contents);
      return createJsonResponse(logResult);
    }

    // 19. AMBIL RIWAYAT LOG PENGGUNA VIA POST
    if (action === "GET_LOGIN_LOGS") {
      var logsPost = handleGetLoginLogs();
      return createJsonResponse({
        status: "success",
        logs: logsPost
      });
    }

    return createJsonResponse({
      status: "success",
      action: action,
      spreadsheetId: ss.getId(),
      message: "Operasi diterima"
    });

  } catch (err) {
    return createJsonResponse({
      status: "error",
      message: err.toString()
    });
  }
}

// ----------------------------------------------------------------------------
// LOGIKA CRUD AKUN PENGGUNA (LANGSUNG KE SHEET "AKUN")
// ----------------------------------------------------------------------------

function handleGetAllAccounts() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAMES.AKUN);
  if (!sheet) return [];

  var rows = sheet.getDataRange().getValues();
  var accounts = [];

  for (var i = 1; i < rows.length; i++) {
    var r = rows[i];
    var username = String(r[1] || "").trim();
    if (!username) continue;

    accounts.push({
      id: String(r[0] || "acc_" + i),
      username: username,
      password: String(r[2] || ""),
      schoolName: String(r[3] || ""),
      npsn: String(r[4] || ""),
      role: String(r[5] || "operator"),
      status: "active",
      createdAt: String(r[6] || new Date().toISOString())
    });
  }

  return accounts;
}

/**
 * Merapikan seluruh lembar di spreadsheet:
 * Menghapus kolom kosong berlebih di kanan data dan baris kosong di bawah data
 * untuk menghemat pemakaian sel (kuota 10 juta sel)
 */
function handleCleanupSpreadsheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = ss.getSheets();
  var trimmedCols = 0;
  var trimmedRows = 0;

  for (var i = 0; i < sheets.length; i++) {
    var sh = sheets[i];
    var maxCols = sh.getMaxColumns();
    var lastCol = Math.max(sh.getLastColumn(), 6);
    if (maxCols > lastCol + 1) {
      var colsToDel = maxCols - (lastCol + 1);
      sh.deleteColumns(lastCol + 2, colsToDel);
      trimmedCols += colsToDel;
    }

    var maxRows = sh.getMaxRows();
    var lastRow = Math.max(sh.getLastRow(), 10);
    if (maxRows > lastRow + 10) {
      var rowsToDel = maxRows - (lastRow + 10);
      sh.deleteRows(lastRow + 11, rowsToDel);
      trimmedRows += rowsToDel;
    }
  }

  var capacity = getSpreadsheetCapacity(ss);
  return {
    status: "success",
    message: "Spreadsheet berhasil dirapikan! Kolom dan baris kosong berlebih telah dihapus untuk menghemat kapasitas.",
    trimmedColumns: trimmedCols,
    trimmedRows: trimmedRows,
    freedCells: (trimmedCols * 200) + (trimmedRows * 10),
    capacity: capacity
  };
}

function handleAddAccount(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAMES.AKUN);
  var rows = sheet.getDataRange().getValues();

  var username = String(data.username || "").trim();
  var password = String(data.password || "123456").trim();
  var schoolName = String(data.schoolName || "").trim();
  var npsn = String(data.npsn || "").trim();
  var role = String(data.role || "operator").trim();

  if (!username) {
    return {
      status: "error",
      message: "Username wajib diisi!"
    };
  }

  // Cek apakah username sudah ada
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][1]).trim().toLowerCase() === username.toLowerCase()) {
      return {
        status: "error",
        message: "Username '" + username + "' sudah digunakan. Pilih username lain."
      };
    }
  }

  var newId = "acc_" + new Date().getTime();
  var now = new Date().toISOString();

  sheet.appendRow([newId, username, password, schoolName, npsn, role, now]);

  // Buat folder sekolah di Drive saat penambahan akun
  var driveInfo = null;
  try {
    driveInfo = getOrCreateSchoolFolder(schoolName || username);
  } catch (eDrive) {}

  return {
    status: "success",
    message: "Akun sekolah '" + schoolName + "' (@" + username + ") berhasil disimpan ke Spreadsheet!",
    driveFolderUrl: driveInfo ? driveInfo.schoolFolderUrl : "",
    drivePath: driveInfo ? driveInfo.schoolPath : "",
    user: {
      id: newId,
      username: username,
      schoolName: schoolName,
      npsn: npsn,
      role: role,
      status: "active",
      createdAt: now
    }
  };
}

function handleUpdateAccount(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAMES.AKUN);
  var rows = sheet.getDataRange().getValues();

  var id = String(data.id || "").trim();
  var username = String(data.username || "").trim();
  var schoolName = String(data.schoolName || "").trim();
  var npsn = String(data.npsn || "").trim();
  var role = String(data.role || "operator").trim();

  var rowIndex = -1;

  for (var i = 1; i < rows.length; i++) {
    var rowId = String(rows[i][0]).trim();
    var rowUser = String(rows[i][1]).trim().toLowerCase();

    if ((id && rowId === id) || (username && rowUser === username.toLowerCase())) {
      rowIndex = i + 1; // 1-indexed baris spreadsheet
      break;
    }
  }

  if (rowIndex === -1) {
    return {
      status: "error",
      message: "Akun dengan ID/Username '" + username + "' tidak ditemukan di spreadsheet."
    };
  }

  // Update kolom: Username (B), Nama Sekolah (D), NPSN (E), Role (F)
  if (username) sheet.getRange(rowIndex, 2).setValue(username);
  sheet.getRange(rowIndex, 4).setValue(schoolName);
  sheet.getRange(rowIndex, 5).setValue(npsn);
  sheet.getRange(rowIndex, 6).setValue(role);

  return {
    status: "success",
    message: "Perubahan akun @" + username + " berhasil disimpan ke Spreadsheet!",
    account: {
      id: id || String(rows[rowIndex - 1][0]),
      username: username,
      schoolName: schoolName,
      npsn: npsn,
      role: role,
      status: "active"
    }
  };
}

function handleResetPassword(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAMES.AKUN);
  var rows = sheet.getDataRange().getValues();

  var username = String(data.username || "").trim().toLowerCase();
  var newPassword = String(data.newPassword || data.password || "").trim();

  if (!username || !newPassword) {
    return {
      status: "error",
      message: "Username dan Password baru wajib diisi!"
    };
  }

  var rowIndex = -1;
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][1]).trim().toLowerCase() === username) {
      rowIndex = i + 1;
      break;
    }
  }

  if (rowIndex === -1) {
    return {
      status: "error",
      message: "Akun @" + username + " tidak ditemukan di spreadsheet."
    };
  }

  sheet.getRange(rowIndex, 3).setValue(newPassword);

  return {
    status: "success",
    message: "Password untuk akun @" + username + " berhasil diperbarui di spreadsheet!"
  };
}

function handleDeleteAccount(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetAkun = ss.getSheetByName(SHEET_NAMES.AKUN);
  var rows = sheetAkun.getDataRange().getValues();

  var username = String(data.username || "").trim().toLowerCase();
  var id = String(data.id || "").trim();

  if (username === "nagata") {
    return {
      status: "error",
      message: "Akun Administrator Utama 'Nagata' tidak dapat dihapus!"
    };
  }

  var deleted = false;
  for (var i = rows.length - 1; i >= 1; i--) {
    var rId = String(rows[i][0]).trim();
    var rUser = String(rows[i][1]).trim().toLowerCase();

    if ((id && rId === id) || (username && rUser === username)) {
      sheetAkun.deleteRow(i + 1);
      deleted = true;
      break;
    }
  }

  if (!deleted) {
    return {
      status: "error",
      message: "Akun @" + username + " tidak ditemukan."
    };
  }

  // Bersihkan juga data siswa, data guru, informasi sekolah, desain kartu, dan folder Drive milik username ini
  try {
    var sheetSiswa = ss.getSheetByName(SHEET_NAMES.DATA_SISWA);
    if (sheetSiswa) {
      var sRows = sheetSiswa.getDataRange().getValues();
      for (var s = sRows.length - 1; s >= 1; s--) {
        if (String(sRows[s][2]).toLowerCase() === username) {
          sheetSiswa.deleteRow(s + 1);
        }
      }
    }

    var sheetGuru = ss.getSheetByName(SHEET_NAMES.DATA_GURU);
    if (sheetGuru) {
      var gRows = sheetGuru.getDataRange().getValues();
      for (var g = gRows.length - 1; g >= 1; g--) {
        if (String(gRows[g][2]).toLowerCase() === username) {
          sheetGuru.deleteRow(g + 1);
        }
      }
    }

    var sheetSekolah = ss.getSheetByName(SHEET_NAMES.INFORMASI_SEKOLAH);
    if (sheetSekolah) {
      var schRows = sheetSekolah.getDataRange().getValues();
      for (var sc = schRows.length - 1; sc >= 1; sc--) {
        if (String(schRows[sc][1]).toLowerCase() === username) {
          sheetSekolah.deleteRow(sc + 1);
        }
      }
    }

    var sheetDesain = ss.getSheetByName(SHEET_NAMES.DESAIN_KARTU);
    if (sheetDesain) {
      var dRows = sheetDesain.getDataRange().getValues();
      for (var d = dRows.length - 1; d >= 1; d--) {
        if (String(dRows[d][1]).toLowerCase() === username) {
          sheetDesain.deleteRow(d + 1);
        }
      }
    }

    // Bersihkan folder penyimpanan Google Drive milik pengguna ini
    try {
      var rootFolders = DriveApp.getFoldersByName(DRIVE_PATHS.ROOT);
      if (rootFolders.hasNext()) {
        var rootFolder = rootFolders.next();
        var subFolders = rootFolder.getFolders();
        while (subFolders.hasNext()) {
          var f = subFolders.next();
          var fName = f.getName().toLowerCase();
          if (fName === username || fName.indexOf(username) !== -1) {
            f.setTrashed(true);
          }
        }
      }
    } catch (driveErr) {}
  } catch (cleanErr) {}

  return {
    status: "success",
    message: "Akun @" + username + " beserta seluruh data siswa, guru, desain, dan folder Drive berhasil dibersihkan!"
  };
}

function handleLogin(username, password) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAMES.AKUN);
  var rows = sheet.getDataRange().getValues();

  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    var u = String(row[1]).trim();
    var p = String(row[2]).trim();

    if (u.toLowerCase() === String(username).trim().toLowerCase()) {
      if (p === String(password).trim()) {
        return {
          status: "success",
          message: "Login berhasil",
          user: {
            id: String(row[0]),
            username: u,
            schoolName: String(row[3]),
            npsn: String(row[4]),
            role: String(row[5]) || "operator",
            status: "active",
            createdAt: String(row[6])
          }
        };
      } else {
        return {
          status: "error",
          message: "Password salah untuk akun " + username
        };
      }
    }
  }

  return {
    status: "error",
    message: "Username '" + username + "' tidak ditemukan. Silakan periksa kembali atau daftar akun baru."
  };
}

/**
 * Mengambil seluruh data database dari semua tab di Spreadsheet
 */
function handleGetAllDatabaseData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Akun
  var accounts = handleGetAllAccounts();

  // 2. Sekolah & Ujian
  var sheetSekolah = ss.getSheetByName(SHEET_NAMES.INFORMASI_SEKOLAH);
  var rowsSekolah = sheetSekolah ? sheetSekolah.getDataRange().getValues() : [];
  var schoolsMap = {};

  for (var i = 1; i < rowsSekolah.length; i++) {
    var r = rowsSekolah[i];
    var u = String(r[1] || "").toLowerCase();
    if (!u) continue;

    schoolsMap[u] = {
      school: {
        id: String(r[0]),
        name: String(r[2]),
        npsn: String(r[3]),
        nss: String(r[4]),
        address: String(r[5]),
        village: String(r[6]),
        district: String(r[7]),
        regency: String(r[8]),
        province: String(r[9]),
        logoUrl: String(r[10]),
        principalName: String(r[11]),
        principalNip: String(r[12]),
        headTitle: String(r[13]) || "Kepala Sekolah"
      },
      exam: {
        id: "exam_" + String(r[0]),
        name: String(r[14]),
        semester: String(r[15]),
        academicYear: String(r[16]),
        dateText: String(r[17]),
        location: String(r[18]),
        extraNote: String(r[19])
      }
    };
  }

  // 3. Siswa
  var sheetSiswa = ss.getSheetByName(SHEET_NAMES.DATA_SISWA);
  var rowsSiswa = sheetSiswa ? sheetSiswa.getDataRange().getValues() : [];
  var studentsMap = {};
  var seenStudentIds = {};

  for (var j = 1; j < rowsSiswa.length; j++) {
    var s = rowsSiswa[j];
    var sId = String(s[0] || "").trim();
    var su = String(s[2] || "").toLowerCase();
    if (!su || !sId) continue;

    var comboKey = su + "_" + sId;
    if (seenStudentIds[comboKey]) continue;
    seenStudentIds[comboKey] = true;

    if (!studentsMap[su]) studentsMap[su] = [];
    studentsMap[su].push({
      id: sId,
      nisn: String(s[3]),
      nis: String(s[4]),
      name: String(s[5]),
      gender: String(s[6]) === "P" ? "P" : "L",
      className: String(s[7]),
      birthPlace: String(s[8]),
      birthDate: s[9] instanceof Date ? s[9].toISOString().split('T')[0] : String(s[9]),
      examRoom: String(s[10]),
      examSeat: String(s[11]),
      photoUrl: String(s[12]),
      createdAt: String(s[13]),
      updatedAt: String(s[13])
    });
  }

  // 4. Desain Kartu & Pengaturan Cetak
  var sheetDesain = ss.getSheetByName(SHEET_NAMES.DESAIN_KARTU);
  var rowsDesain = sheetDesain ? sheetDesain.getDataRange().getValues() : [];
  var designsMap = {};

  for (var k = 1; k < rowsDesain.length; k++) {
    var d = rowsDesain[k];
    var du = String(d[1] || "").toLowerCase();
    if (!du) continue;

    try {
      designsMap[du] = {
        cardDesign: JSON.parse(d[2]),
        printSettings: JSON.parse(d[3])
      };
    } catch (e) {}
  }

  return {
    accounts: accounts,
    schoolsMap: schoolsMap,
    studentsMap: studentsMap,
    designsMap: designsMap,
    loginLogs: handleGetLoginLogs()
  };
}

/**
 * Simpan Data Lengkap:
 * 1. Simpan ke sheet INFORMASI_SEKOLAH, DATA_SISWA, DESAIN_KARTU
 * 2. Simpan / perbarui folder dan file JSON di Google Drive:
 *    /GENERATOR KARTU UJIAN/DATABASE/<NAMA_SEKOLAH>/DATA_<NAMA_SEKOLAH>.json
 */
function handleSaveAllData(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var username = payload.username || "Nagata";
  var school = payload.school || {};
  var exam = payload.exam || {};
  var students = payload.students || [];
  var design = payload.cardDesign || {};
  var printSettings = payload.printSettings || {};
  var now = new Date().toISOString();

  var schoolName = school.name || username;

  // 1. Kelola Folder Google Drive untuk Sekolah ini: /GENERATOR KARTU UJIAN/DATABASE/<NAMA_SEKOLAH>/
  var driveInfo = null;
  try {
    driveInfo = getOrCreateSchoolFolder(schoolName);

    var fileName = "DATA_" + schoolName.replace(/[\\\\/:*?"<>|]/g, "_") + ".json";
    var existingFiles = driveInfo.schoolFolder.getFilesByName(fileName);
    var jsonContent = JSON.stringify({
      school: school,
      exam: exam,
      studentsCount: students.length,
      students: students,
      cardDesign: design,
      printSettings: printSettings,
      lastUpdated: now,
      savedBy: username
    }, null, 2);

    if (existingFiles.hasNext()) {
      var existingFile = existingFiles.next();
      existingFile.setContent(jsonContent);
    } else {
      driveInfo.schoolFolder.createFile(fileName, jsonContent, MimeType.PLAIN_TEXT);
    }
  } catch (errDrive) {
    Logger.log("Peringatan Drive: " + errDrive.toString());
  }

  // 2. Simpan INFORMASI_SEKOLAH di Spreadsheet
  // Jika logo sekolah berupa base64, simpan ke Drive folder sekolah dan catat URL permanennya
  if (school.logoUrl && String(school.logoUrl).indexOf("data:image/") === 0 && driveInfo && driveInfo.schoolFolder) {
    try {
      var logoParts = school.logoUrl.split(",");
      var logoMime = logoParts[0].split(";")[0].replace("data:", "") || "image/png";
      var logoBytes = Utilities.base64Decode(logoParts[1]);
      var logoExt = logoMime.indexOf("svg") !== -1 ? ".svg" : ".png";
      var logoName = "LOGO_" + schoolName.replace(/[\\/:*?"<>|]/g, "_") + logoExt;

      var oldLogoFiles = driveInfo.schoolFolder.getFilesByName(logoName);
      while (oldLogoFiles.hasNext()) {
        oldLogoFiles.next().setTrashed(true);
      }

      var logoFile = driveInfo.schoolFolder.createFile(Utilities.newBlob(logoBytes, logoMime, logoName));
      logoFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      school.logoUrl = "https://lh3.googleusercontent.com/d/" + logoFile.getId();
    } catch (logoErr) {
      Logger.log("Peringatan simpan logo: " + logoErr.toString());
    }
  }

  var sheetSekolah = ss.getSheetByName(SHEET_NAMES.INFORMASI_SEKOLAH);
  var rowsSekolah = sheetSekolah.getDataRange().getValues();
  var sekolahRowIdx = -1;

  for (var i = 1; i < rowsSekolah.length; i++) {
    if (String(rowsSekolah[i][1]).toLowerCase() === username.toLowerCase()) {
      sekolahRowIdx = i + 1;
      break;
    }
  }

  var sekolahData = [
    school.id || "sch_" + username,
    username,
    school.name || "",
    school.npsn || "",
    school.nss || "",
    school.address || "",
    school.village || "",
    school.district || "",
    school.regency || "",
    school.province || "",
    school.logoUrl || "",
    school.principalName || "",
    school.principalNip || "",
    school.headTitle || "Kepala Sekolah",
    exam.name || "",
    exam.semester || "",
    exam.academicYear || "",
    exam.dateText || "",
    exam.location || "",
    exam.extraNote || "",
    driveInfo ? driveInfo.schoolFolderUrl : "",
    now
  ];

  if (sekolahRowIdx > 0) {
    sheetSekolah.getRange(sekolahRowIdx, 1, 1, sekolahData.length).setValues([sekolahData]);
  } else {
    sheetSekolah.appendRow(sekolahData);
  }

  // 3. Simpan DATA_SISWA di Spreadsheet (Atomic & Tidak Menumpuk)
  var sheetSiswa = ss.getSheetByName(SHEET_NAMES.DATA_SISWA);
  var allSiswaData = sheetSiswa.getDataRange().getValues();
  var retainedRows = [];

  // Pertahankan data siswa milik sekolah lain
  for (var j = 1; j < allSiswaData.length; j++) {
    if (String(allSiswaData[j][2]).trim().toLowerCase() !== username.toLowerCase()) {
      retainedRows.push(allSiswaData[j]);
    }
  }

  var newSiswaRows = students.map(function(s) {
    return [
      s.id,
      school.id || "sch_" + username,
      username,
      s.nisn || "",
      s.nis || "",
      s.name || "",
      s.gender || "L",
      s.className || "",
      s.birthPlace || "",
      s.birthDate || "",
      s.examRoom || "",
      s.examSeat || "",
      s.photoUrl || "",
      now
    ];
  });

  var combinedSiswaRows = retainedRows.concat(newSiswaRows);
  if (allSiswaData.length > 1) {
    sheetSiswa.getRange(2, 1, allSiswaData.length - 1, allSiswaData[0].length).clearContent();
  }
  if (combinedSiswaRows.length > 0) {
    sheetSiswa.getRange(2, 1, combinedSiswaRows.length, combinedSiswaRows[0].length).setValues(combinedSiswaRows);
  }

  // 4. Simpan DESAIN_KARTU di Spreadsheet
  var sheetDesain = ss.getSheetByName(SHEET_NAMES.DESAIN_KARTU);
  var rowsDesain = sheetDesain.getDataRange().getValues();
  var desainRowIdx = -1;

  for (var k = 1; k < rowsDesain.length; k++) {
    if (String(rowsDesain[k][1]).toLowerCase() === username.toLowerCase()) {
      desainRowIdx = k + 1;
      break;
    }
  }

  var desainData = [
    school.id || "sch_" + username,
    username,
    JSON.stringify(design),
    JSON.stringify(printSettings),
    now
  ];

  if (desainRowIdx > 0) {
    sheetDesain.getRange(desainRowIdx, 1, 1, desainData.length).setValues([desainData]);
  } else {
    sheetDesain.appendRow(desainData);
  }

  return {
    status: "success",
    message: "Data " + students.length + " siswa & pengaturan berhasil disimpan ke Spreadsheet & Google Drive!",
    totalStudentsSaved: students.length,
    driveFolderUrl: driveInfo ? driveInfo.schoolFolderUrl : "",
    drivePath: driveInfo ? driveInfo.schoolPath : "/GENERATOR KARTU UJIAN/DATABASE/" + schoolName + "/",
    photoFolderUrl: driveInfo ? driveInfo.photoFolderUrl : "",
    timestamp: now
  };
}

/**
 * Unggah logo sekolah ke Google Drive dan catatkan URL permanen ke database
 */
function handleUploadLogo(contents) {
  var schoolName = contents.schoolName || contents.username || "Sekolah";
  var username = String(contents.username || "Nagata").trim();
  var base64Data = contents.base64Data || "";
  if (!base64Data || base64Data.indexOf("data:image/") !== 0) {
    return { status: "error", message: "Data gambar logo tidak valid." };
  }

  var driveInfo = getOrCreateSchoolFolder(schoolName);
  var logoParts = base64Data.split(",");
  var logoMime = logoParts[0].split(";")[0].replace("data:", "") || "image/png";
  var logoBytes = Utilities.base64Decode(logoParts[1]);
  var logoExt = logoMime.indexOf("svg") !== -1 ? ".svg" : (logoMime.indexOf("jpeg") !== -1 || logoMime.indexOf("jpg") !== -1 ? ".jpg" : ".png");
  var logoName = "LOGO_" + schoolName.replace(/[\\/:*?"<>|]/g, "_") + logoExt;

  var oldFiles = driveInfo.schoolFolder.getFilesByName(logoName);
  while (oldFiles.hasNext()) {
    oldFiles.next().setTrashed(true);
  }

  var logoFile = driveInfo.schoolFolder.createFile(Utilities.newBlob(logoBytes, logoMime, logoName));
  logoFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  var publicLogoUrl = "https://lh3.googleusercontent.com/d/" + logoFile.getId();

  // Catat URL Logo permanen ke Sheet INFORMASI_SEKOLAH di kolom 11 (Logo URL)
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetSekolah = ss.getSheetByName(SHEET_NAMES.INFORMASI_SEKOLAH);
  var now = new Date().toISOString();
  if (sheetSekolah) {
    var rows = sheetSekolah.getDataRange().getValues();
    var foundIdx = -1;
    for (var i = 1; i < rows.length; i++) {
      if (String(rows[i][1]).toLowerCase() === username.toLowerCase()) {
        foundIdx = i + 1;
        break;
      }
    }
    if (foundIdx > 0) {
      sheetSekolah.getRange(foundIdx, 11).setValue(publicLogoUrl);
      sheetSekolah.getRange(foundIdx, 22).setValue(now);
    } else {
      var newRow = [
        "sch_" + username,
        username,
        schoolName,
        "", "", "", "", "", "", "",
        publicLogoUrl,
        "", "", "Kepala Sekolah",
        "", "", "", "", "", "",
        driveInfo.schoolFolderUrl || "",
        now
      ];
      sheetSekolah.appendRow(newRow);
    }
  }

  return {
    status: "success",
    message: "Logo berhasil disimpan permanen di Google Drive & tercatat di database!",
    logoUrl: publicLogoUrl,
    fileId: logoFile.getId(),
    folderUrl: driveInfo.schoolFolderUrl
  };
}

/**
 * Simpan khusus pengaturan identitas sekolah & ujian (Sheet INFORMASI_SEKOLAH)
 */
function handleSaveSchoolSettings(contents) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var username = String(contents.username || "Nagata").trim();
  var school = contents.school || {};
  var exam = contents.exam || {};
  var now = new Date().toISOString();
  var schoolName = school.name || username;

  var driveInfo = null;
  try {
    driveInfo = getOrCreateSchoolFolder(schoolName);

    // Jika logo dikirim sebagai base64, simpan permanen ke Drive folder sekolah
    if (school.logoUrl && String(school.logoUrl).indexOf("data:image/") === 0 && driveInfo && driveInfo.schoolFolder) {
      try {
        var logoParts = school.logoUrl.split(",");
        var logoMime = logoParts[0].split(";")[0].replace("data:", "") || "image/png";
        var logoBytes = Utilities.base64Decode(logoParts[1]);
        var logoExt = logoMime.indexOf("svg") !== -1 ? ".svg" : (logoMime.indexOf("jpeg") !== -1 || logoMime.indexOf("jpg") !== -1 ? ".jpg" : ".png");
        var logoName = "LOGO_" + schoolName.replace(/[\\/:*?"<>|]/g, "_") + logoExt;
        
        var oldFiles = driveInfo.schoolFolder.getFilesByName(logoName);
        while (oldFiles.hasNext()) {
          oldFiles.next().setTrashed(true);
        }

        var logoFile = driveInfo.schoolFolder.createFile(Utilities.newBlob(logoBytes, logoMime, logoName));
        logoFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        school.logoUrl = "https://lh3.googleusercontent.com/d/" + logoFile.getId();
      } catch (logoErr) {
        Logger.log("Peringatan simpan logo: " + logoErr.toString());
      }
    }
  } catch (dErr) {}

  var sheetSekolah = ss.getSheetByName(SHEET_NAMES.INFORMASI_SEKOLAH);
  var rows = sheetSekolah.getDataRange().getValues();
  var rowIdx = -1;

  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][1]).toLowerCase() === username.toLowerCase()) {
      rowIdx = i + 1;
      break;
    }
  }

  // 22 Kolom lengkap di Sheet INFORMASI_SEKOLAH
  var sekolahData = [
    school.id || "sch_" + username,
    username,
    school.name || "",
    school.npsn || "",
    school.nss || "",
    school.address || "",
    school.village || "",
    school.district || "",
    school.regency || "",
    school.province || "",
    school.logoUrl || "",
    school.principalName || "",
    school.principalNip || "",
    school.headTitle || "Kepala Sekolah",
    exam.name || "",
    exam.semester || "",
    exam.academicYear || "",
    exam.dateText || "",
    exam.location || "",
    exam.extraNote || "",
    driveInfo ? driveInfo.schoolFolderUrl : "",
    now
  ];

  if (rowIdx > 0) {
    sheetSekolah.getRange(rowIdx, 1, 1, sekolahData.length).setValues([sekolahData]);
  } else {
    sheetSekolah.appendRow(sekolahData);
  }

  // Update profil sekolah pada Sheet AKUN agar sinkron
  try {
    var sheetAkun = ss.getSheetByName(SHEET_NAMES.AKUN);
    if (sheetAkun) {
      var aRows = sheetAkun.getDataRange().getValues();
      for (var a = 1; a < aRows.length; a++) {
        if (String(aRows[a][1]).toLowerCase() === username.toLowerCase()) {
          if (school.name) sheetAkun.getRange(a + 1, 4).setValue(school.name);
          if (school.npsn) sheetAkun.getRange(a + 1, 5).setValue(school.npsn);
          break;
        }
      }
    }
  } catch (eAkun) {}

  return {
    status: "success",
    message: "Pengaturan identitas sekolah, pejabat pengesah, dan ujian berhasil disimpan ke database cloud!",
    school: school,
    exam: exam,
    logoUrl: school.logoUrl,
    driveFolderUrl: driveInfo ? driveInfo.schoolFolderUrl : ""
  };
}

/**
 * Simpan khusus pengaturan desain kartu & cetak (Sheet DESAIN_KARTU)
 */
function handleSaveCardDesign(contents) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var username = contents.username || "Nagata";
  var design = contents.cardDesign || {};
  var printSettings = contents.printSettings || {};
  var now = new Date().toISOString();

  var sheetDesain = ss.getSheetByName(SHEET_NAMES.DESAIN_KARTU);
  var rows = sheetDesain.getDataRange().getValues();
  var rowIdx = -1;

  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][1]).toLowerCase() === username.toLowerCase()) {
      rowIdx = i + 1;
      break;
    }
  }

  var desainData = [
    "des_" + username,
    username,
    JSON.stringify(design),
    JSON.stringify(printSettings),
    now
  ];

  if (rowIdx > 0) {
    sheetDesain.getRange(rowIdx, 1, 1, desainData.length).setValues([desainData]);
  } else {
    sheetDesain.appendRow(desainData);
  }

  return {
    status: "success",
    message: "Desain kartu & pengaturan cetak berhasil disimpan ke database!",
    timestamp: now
  };
}

/**
 * 13. Tambah 1 data siswa secara atomic & efisien (C-R-U-D)
 */
function handleAddStudent(contents) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var username = String(contents.username || "Nagata").trim();
  var student = contents.student || {};
  var schoolId = contents.schoolId || "sch_" + username;
  var now = new Date().toISOString();

  if (!student.name && !student.nisn) {
    return { status: "error", message: "Data siswa tidak lengkap (Nama / NISN kosong)." };
  }

  var sheetSiswa = ss.getSheetByName(SHEET_NAMES.DATA_SISWA);
  var allRows = sheetSiswa.getDataRange().getValues();

  var existingRowIdx = -1;
  for (var i = 1; i < allRows.length; i++) {
    var r = allRows[i];
    var rUser = String(r[2] || "").trim().toLowerCase();
    if (rUser === username.toLowerCase()) {
      if ((student.id && String(r[0]) === String(student.id)) ||
          (student.nisn && String(r[3]) === String(student.nisn))) {
        existingRowIdx = i + 1;
        break;
      }
    }
  }

  var rowData = [
    student.id || "std_" + new Date().getTime(),
    schoolId,
    username,
    student.nisn || "",
    student.nis || "",
    student.name || "",
    student.gender || "L",
    student.className || "",
    student.birthPlace || "",
    student.birthDate || "",
    student.examRoom || "",
    student.examSeat || "",
    student.photoUrl || "",
    now
  ];

  if (existingRowIdx > 0) {
    sheetSiswa.getRange(existingRowIdx, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheetSiswa.appendRow(rowData);
  }

  return {
    status: "success",
    message: "Siswa '" + (student.name || student.nisn) + "' berhasil disimpan ke database!",
    student: {
      id: rowData[0],
      nisn: student.nisn || "",
      nis: student.nis || "",
      name: student.name || "",
      gender: student.gender || "L",
      className: student.className || "",
      birthPlace: student.birthPlace || "",
      birthDate: student.birthDate || "",
      examRoom: student.examRoom || "",
      examSeat: student.examSeat || "",
      photoUrl: student.photoUrl || "",
      createdAt: student.createdAt || now,
      updatedAt: now
    }
  };
}

/**
 * 14. Update 1 data siswa yang sudah ada di Sheet DATA_SISWA
 */
function handleUpdateStudent(contents) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var username = String(contents.username || "Nagata").trim();
  var student = contents.student || {};
  var now = new Date().toISOString();

  if (!student.id && !student.nisn) {
    return { status: "error", message: "ID atau NISN siswa diperlukan untuk update data." };
  }

  var sheetSiswa = ss.getSheetByName(SHEET_NAMES.DATA_SISWA);
  var allRows = sheetSiswa.getDataRange().getValues();

  var targetRowIdx = -1;
  for (var i = 1; i < allRows.length; i++) {
    var r = allRows[i];
    var rUser = String(r[2] || "").trim().toLowerCase();
    if (rUser === username.toLowerCase()) {
      if ((student.id && String(r[0]) === String(student.id)) ||
          (student.nisn && String(r[3]) === String(student.nisn))) {
        targetRowIdx = i + 1;
        break;
      }
    }
  }

  if (targetRowIdx > 0) {
    var updateRange = [
      student.nisn || "",
      student.nis || "",
      student.name || "",
      student.gender || "L",
      student.className || "",
      student.birthPlace || "",
      student.birthDate || "",
      student.examRoom || "",
      student.examSeat || "",
      student.photoUrl || "",
      now
    ];
    sheetSiswa.getRange(targetRowIdx, 4, 1, updateRange.length).setValues([updateRange]);
    return {
      status: "success",
      message: "Data siswa '" + student.name + "' berhasil diperbarui di database!",
      student: student
    };
  } else {
    return handleAddStudent(contents);
  }
}

/**
 * 15. Hapus 1 siswa berdasarkan ID atau NISN dari Sheet DATA_SISWA
 */
function handleDeleteStudent(contents) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var username = String(contents.username || "Nagata").trim().toLowerCase();
  var studentId = String(contents.studentId || contents.id || "").trim();
  var studentNisn = String(contents.nisn || "").trim();

  if (!studentId && !studentNisn) {
    return { status: "error", message: "Student ID atau NISN wajib diisi untuk menghapus." };
  }

  var sheetSiswa = ss.getSheetByName(SHEET_NAMES.DATA_SISWA);
  var allRows = sheetSiswa.getDataRange().getValues();
  var deleted = false;

  for (var i = allRows.length - 1; i >= 1; i--) {
    var r = allRows[i];
    var rId = String(r[0]).trim();
    var rUser = String(r[2] || "").trim().toLowerCase();
    var rNisn = String(r[3] || "").trim();

    var match = false;
    if (rUser === username) {
      if (studentId && rId === studentId) match = true;
      else if (studentNisn && rNisn === studentNisn) match = true;
    }

    if (match) {
      sheetSiswa.deleteRow(i + 1);
      deleted = true;
      break;
    }
  }

  return {
    status: deleted ? "success" : "error",
    message: deleted ? "Data siswa berhasil dihapus dari database!" : "Siswa tidak ditemukan di database."
  };
}

/**
 * 16. Hapus banyak siswa sekaligus secara efisien
 */
function handleBulkDeleteStudents(contents) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var username = String(contents.username || "Nagata").trim().toLowerCase();
  var studentIds = contents.studentIds || contents.ids || [];
  var nisnList = contents.nisnList || [];
  if (!Array.isArray(studentIds)) studentIds = [];
  if (!Array.isArray(nisnList)) nisnList = [];

  if (studentIds.length === 0 && nisnList.length === 0) {
    return { status: "error", message: "Daftar ID atau NISN siswa untuk dihapus kosong." };
  }

  var idSet = {};
  for (var k = 0; k < studentIds.length; k++) {
    idSet[String(studentIds[k]).trim()] = true;
  }
  var nisnSet = {};
  for (var m = 0; m < nisnList.length; m++) {
    if (nisnList[m]) nisnSet[String(nisnList[m]).trim()] = true;
  }

  var sheetSiswa = ss.getSheetByName(SHEET_NAMES.DATA_SISWA);
  var allRows = sheetSiswa.getDataRange().getValues();
  var deletedCount = 0;

  for (var i = allRows.length - 1; i >= 1; i--) {
    var r = allRows[i];
    var rId = String(r[0]).trim();
    var rUser = String(r[2] || "").trim().toLowerCase();
    var rNisn = String(r[3] || "").trim();

    var shouldDelete = false;
    if (rUser === username) {
      if (idSet[rId]) shouldDelete = true;
      else if (rNisn && nisnSet[rNisn]) shouldDelete = true;
    }

    if (shouldDelete) {
      sheetSiswa.deleteRow(i + 1);
      deletedCount++;
    }
  }

  return {
    status: "success",
    message: "Berhasil menghapus " + deletedCount + " siswa dari database!",
    deletedCount: deletedCount
  };
}

/**
 * Simpan / perbarui batch siswa (Atomic & Tidak Bertumpuk)
 */
function handleBatchStudents(contents) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var username = String(contents.username || "").toLowerCase();
  var students = contents.students || [];
  var schoolId = contents.schoolId || "sch_" + username;
  var now = new Date().toISOString();

  var sheetSiswa = ss.getSheetByName(SHEET_NAMES.DATA_SISWA);
  var allData = sheetSiswa.getDataRange().getValues();

  var retainedRows = [];
  for (var i = 1; i < allData.length; i++) {
    if (String(allData[i][2]).trim().toLowerCase() !== username) {
      retainedRows.push(allData[i]);
    }
  }

  // Hilangkan duplikasi data di batch
  var seenIds = {};
  var cleanStudents = [];
  for (var sIdx = 0; sIdx < students.length; sIdx++) {
    var std = students[sIdx];
    var key = std.id || std.nisn || ("std_" + sIdx);
    if (!seenIds[key]) {
      seenIds[key] = true;
      cleanStudents.push(std);
    }
  }

  var newRows = cleanStudents.map(function(s) {
    return [
      s.id || "std_" + new Date().getTime() + "_" + Math.random().toString(36).substr(2, 4),
      schoolId,
      username,
      s.nisn || "",
      s.nis || "",
      s.name || "",
      s.gender || "L",
      s.className || "",
      s.birthPlace || "",
      s.birthDate || "",
      s.examRoom || "",
      s.examSeat || "",
      s.photoUrl || "",
      now
    ];
  });

  var combined = retainedRows.concat(newRows);
  if (allData.length > 1) {
    sheetSiswa.getRange(2, 1, allData.length - 1, allData[0].length).clearContent();
  }
  if (combined.length > 0) {
    sheetSiswa.getRange(2, 1, combined.length, combined[0].length).setValues(combined);
  }

  return {
    status: "success",
    message: "Data " + cleanStudents.length + " siswa berhasil diperbarui tanpa penumpukan!",
    totalStudents: cleanStudents.length
  };
}

function loadAllDataForUser(username) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var cleanUser = String(username).toLowerCase();

  var sheetSekolah = ss.getSheetByName(SHEET_NAMES.INFORMASI_SEKOLAH);
  var rowsSekolah = sheetSekolah ? sheetSekolah.getDataRange().getValues() : [];
  var schoolData = null;
  var examData = null;

  for (var i = 1; i < rowsSekolah.length; i++) {
    var r = rowsSekolah[i];
    if (String(r[1]).toLowerCase() === cleanUser || (!cleanUser && i === 1)) {
      schoolData = {
        id: String(r[0]),
        name: String(r[2]),
        npsn: String(r[3]),
        nss: String(r[4]),
        address: String(r[5]),
        village: String(r[6]),
        district: String(r[7]),
        regency: String(r[8]),
        province: String(r[9]),
        logoUrl: String(r[10]),
        principalName: String(r[11]),
        principalNip: String(r[12]),
        headTitle: String(r[13]) || "Kepala Sekolah"
      };
      examData = {
        id: "exam_" + String(r[0]),
        name: String(r[14]),
        semester: String(r[15]),
        academicYear: String(r[16]),
        dateText: String(r[17]),
        location: String(r[18]),
        extraNote: String(r[19])
      };
      break;
    }
  }

  var sheetSiswa = ss.getSheetByName(SHEET_NAMES.DATA_SISWA);
  var rowsSiswa = sheetSiswa ? sheetSiswa.getDataRange().getValues() : [];
  var studentsList = [];

  for (var j = 1; j < rowsSiswa.length; j++) {
    var s = rowsSiswa[j];
    if (String(s[2]).toLowerCase() === cleanUser || (!cleanUser && cleanUser === "")) {
      studentsList.push({
        id: String(s[0]),
        nisn: String(s[3]),
        nis: String(s[4]),
        name: String(s[5]),
        gender: String(s[6]) === "P" ? "P" : "L",
        className: String(s[7]),
        birthPlace: String(s[8]),
        birthDate: s[9] instanceof Date ? s[9].toISOString().split('T')[0] : String(s[9]),
        examRoom: String(s[10]),
        examSeat: String(s[11]),
        photoUrl: String(s[12]),
        createdAt: String(s[13]),
        updatedAt: String(s[13])
      });
    }
  }

  var sheetDesain = ss.getSheetByName(SHEET_NAMES.DESAIN_KARTU);
  var rowsDesain = sheetDesain ? sheetDesain.getDataRange().getValues() : [];
  var cardDesign = null;
  var printSettings = null;

  for (var k = 1; k < rowsDesain.length; k++) {
    var d = rowsDesain[k];
    if (String(d[1]).toLowerCase() === cleanUser) {
      try {
        cardDesign = JSON.parse(d[2]);
        printSettings = JSON.parse(d[3]);
      } catch (e) {}
      break;
    }
  }

  return {
    school: schoolData,
    exam: examData,
    students: studentsList,
    cardDesign: cardDesign,
    printSettings: printSettings
  };
}

/**
 * 20. Catat log masuk pengguna dan simpan foto kamera ke folder Google Drive sekolah:
 * /GENERATOR KARTU UJIAN/DATABASE/<NAMA_SEKOLAH>/FOTO_LOGIN/
 */
function handleRecordLoginLog(contents) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetLog = ss.getSheetByName(SHEET_NAMES.LOG_PENGGUNA);
  if (!sheetLog) {
    initSheets();
    sheetLog = ss.getSheetByName(SHEET_NAMES.LOG_PENGGUNA);
  }

  var username = String(contents.username || "Operator").trim();
  var schoolName = String(contents.schoolName || contents.username || "Sekolah").trim();
  var browser = String(contents.browser || "Web Browser").trim();
  var base64Photo = contents.base64Photo || contents.photoDataUrl || "";
  var now = new Date();
  var timeStr = Utilities.formatDate(now, "Asia/Jakarta", "dd MMM yyyy, HH:mm:ss") + " WIB";
  var logId = "log_" + now.getTime();
  var photoUrl = "";

  // Simpan foto ke Google Drive di folder sekolah
  if (base64Photo && typeof base64Photo === "string" && base64Photo.indexOf("data:image/") === 0) {
    try {
      var driveInfo = getOrCreateSchoolFolder(schoolName);
      var schoolFolder = driveInfo.schoolFolder;

      // Cari atau buat subfolder FOTO_LOGIN di dalam folder sekolah
      var folderName = DRIVE_PATHS.LOG_PHOTOS || "FOTO_LOGIN";
      var logFolders = schoolFolder.getFoldersByName(folderName);
      var logFolder = logFolders.hasNext() ? logFolders.next() : schoolFolder.createFolder(folderName);

      var parts = base64Photo.split(",");
      var mime = (parts[0].split(";")[0].replace("data:", "")) || "image/jpeg";
      var bytes = Utilities.base64Decode(parts[1]);
      var cleanUser = username.replace(/[^a-zA-Z0-9_-]/g, "_");
      var fileName = "LOGIN_" + cleanUser + "_" + now.getTime() + ".jpg";

      var file = logFolder.createFile(Utilities.newBlob(bytes, mime, fileName));
      try {
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      } catch (errShare) {}
      photoUrl = "https://drive.google.com/thumbnail?id=" + file.getId() + "&sz=w1000";
    } catch (errDrive) {
      photoUrl = "";
    }
  }

  // Tambahkan baris log ke Sheet LOG_PENGGUNA
  if (sheetLog) {
    sheetLog.appendRow([
      logId,
      username,
      schoolName,
      timeStr,
      browser,
      photoUrl,
      "Berhasil"
    ]);
  }

  var logEntry = {
    id: logId,
    username: username,
    schoolName: schoolName,
    loginTime: timeStr,
    browser: browser,
    photoUrl: photoUrl,
    status: "Berhasil"
  };

  return {
    status: "success",
    message: "Log masuk berhasil dicatat ke Spreadsheet dan foto tersimpan di Google Drive!",
    photoUrl: photoUrl,
    log: logEntry
  };
}

/**
 * Mengambil riwayat log pengguna dari Sheet LOG_PENGGUNA (urut dari yang terbaru)
 */
function handleGetLoginLogs() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetLog = ss.getSheetByName(SHEET_NAMES.LOG_PENGGUNA);
  if (!sheetLog) return [];

  var rows = sheetLog.getDataRange().getValues();
  var logs = [];

  for (var i = 1; i < rows.length; i++) {
    var r = rows[i];
    var id = String(r[0] || "");
    var username = String(r[1] || "").trim();
    if (!username && !id) continue;

    logs.push({
      id: id || ("log_" + i),
      username: username,
      schoolName: String(r[2] || ""),
      loginTime: String(r[3] || ""),
      browser: String(r[4] || ""),
      photoUrl: String(r[5] || ""),
      status: String(r[6] || "Berhasil")
    });
  }

  // Urutkan dari yang terbaru
  logs.reverse();
  return logs;
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
