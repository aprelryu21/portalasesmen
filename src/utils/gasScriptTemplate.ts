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
  PENDAFTAR_BARU: "Pendaftar_Baru",
  INFORMASI_SEKOLAH: "INFORMASI_SEKOLAH",
  DATA_SISWA: "DATA_SISWA",
  DATA_GURU: "DATA_GURU",
  DATA_ASESMEN: "DATA_ASESMEN",
  DESAIN_KARTU: "DESAIN_KARTU",
  DATA_POSTER: "data_poster",
  DATA_LJ: "Data_LJ",
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

  // 1b. Sheet PENDAFTAR_BARU (Pendaftaran Sekolah Baru Menunggu Persetujuan Admin)
  var sheetPendaftar = ss.getSheetByName(SHEET_NAMES.PENDAFTAR_BARU);
  if (!sheetPendaftar) {
    sheetPendaftar = ss.insertSheet(SHEET_NAMES.PENDAFTAR_BARU);
    sheetPendaftar.appendRow([
      "ID", "Username", "Password", "Nama Sekolah", "NPSN", "Role", "Status", "Created At", "Keterangan"
    ]);
    sheetPendaftar.getRange("A1:I1").setFontWeight("bold").setBackground("#F59E0B").setFontColor("#FFFFFF");
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
      "Agama", "Kelas", "Tempat Lahir", "Tanggal Lahir", "Ruang Ujian", "Nomor Meja", "Foto URL", "Updated At"
    ]);
    sheetSiswa.getRange("A1:O1").setFontWeight("bold").setBackground("#10B981").setFontColor("#FFFFFF");
  } else {
    // Smart upgrade: cek jika kolom Agama belum ada di sheet DATA_SISWA yang sudah ada
    try {
      var sHeaders = sheetSiswa.getRange(1, 1, 1, Math.max(sheetSiswa.getLastColumn(), 1)).getValues()[0];
      var hasAgama = false;
      for (var h = 0; h < sHeaders.length; h++) {
        if (String(sHeaders[h]).toLowerCase().indexOf("agama") !== -1) {
          hasAgama = true;
          break;
        }
      }
      if (!hasAgama && sHeaders.length >= 7) {
        sheetSiswa.insertColumnAfter(7); // sisipkan setelah Jenis Kelamin (kolom 7 -> kolom 8)
        sheetSiswa.getRange(1, 8).setValue("Agama").setFontWeight("bold").setBackground("#10B981").setFontColor("#FFFFFF");
      }
    } catch(e) {}
  }

  // 3.5 Sheet DATA_GURU (Data Guru, Pengawas, Proktor, & Teknisi)
  var sheetGuru = ss.getSheetByName(SHEET_NAMES.DATA_GURU);
  if (!sheetGuru) {
    sheetGuru = ss.insertSheet(SHEET_NAMES.DATA_GURU);
    sheetGuru.appendRow([
      "ID", "School ID", "Username", "NIP", "Nama Lengkap", "Jenis Kelamin",
      "Agama", "Mata Pelajaran / Jabatan", "No HP", "Email", "Peran / Tugas", "Ruang Tugas", "Foto URL", "Updated At"
    ]);
    sheetGuru.getRange("A1:N1").setFontWeight("bold").setBackground("#8B5CF6").setFontColor("#FFFFFF");
  }

  // 3.6 Sheet DATA_ASESMEN (Daftar Jenis Asesmen / Ujian Sekolah Multi-Tingkat)
  var sheetAsesmen = ss.getSheetByName(SHEET_NAMES.DATA_ASESMEN);
  if (!sheetAsesmen) {
    sheetAsesmen = ss.insertSheet(SHEET_NAMES.DATA_ASESMEN);
    sheetAsesmen.appendRow([
      "ID", "School ID", "Username", "Nama Asesmen", "Semester", "Tahun Pelajaran",
      "Tanggal Pelaksanaan", "Titimangsa Lokasi", "Tanggal Titimangsa", "Jadwal Ujian", "Catatan Tata Tertib", "Status Aktif", "Updated At"
    ]);
    sheetAsesmen.getRange("A1:M1").setFontWeight("bold").setBackground("#0284C7").setFontColor("#FFFFFF");
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

  // 4b. Sheet DATA_POSTER (Pengaturan Gaya Desain & Orientasi Poster A4)
  var sheetPoster = ss.getSheetByName(SHEET_NAMES.DATA_POSTER);
  if (!sheetPoster) {
    sheetPoster = ss.insertSheet(SHEET_NAMES.DATA_POSTER);
    sheetPoster.appendRow([
      "School ID", "Username", "Style ID", "Orientation", "Watermark Opacity", "Show Address", "Settings JSON", "Updated At"
    ]);
    sheetPoster.getRange("A1:H1").setFontWeight("bold").setBackground("#9333EA").setFontColor("#FFFFFF");
  }

  // 4c. Sheet Data_LJ (Pengaturan Desain Lembar Jawaban Siswa A4)
  var sheetLJ = ss.getSheetByName(SHEET_NAMES.DATA_LJ);
  if (!sheetLJ) {
    sheetLJ = ss.insertSheet(SHEET_NAMES.DATA_LJ);
    sheetLJ.appendRow([
      "School ID", "Username", "PG Count", "Isian Count", "Uraian Count", "Kop Line 1", "Kop Line 3 (Sekolah)", "Settings JSON", "Updated At"
    ]);
    sheetLJ.getRange("A1:I1").setFontWeight("bold").setBackground("#0D9488").setFontColor("#FFFFFF");
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

    // 2.6 AMBIL PENDAFTAR BARU DARI SHEET Pendaftar_Baru
    if (action === "GET_PENDAFTAR_BARU" || action === "GET_APPLICANTS") {
      var applicants = handleGetPendaftarBaru();
      return createJsonResponse({
        status: "success",
        action: action,
        applicants: applicants
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

    // 2. DAFTAR / TAMBAH AKUN BARU (LANGSUNG KE SHEET AKUN)
    if (action === "REGISTER" || action === "ADD_ACCOUNT") {
      var regResult = handleAddAccount(contents);
      return createJsonResponse(regResult);
    }

    // 2b. DAFTAR SEKOLAH BARU (MASUK KE SHEET "Pendaftar_Baru")
    if (action === "REGISTER_NEW_SCHOOL" || action === "APPLY_NEW_SCHOOL") {
      var applyResult = handleRegisterSchoolApplicant(contents);
      return createJsonResponse(applyResult);
    }

    // 2c. AMBIL DAFTAR PENDAFTAR BARU
    if (action === "GET_PENDAFTAR_BARU" || action === "GET_APPLICANTS") {
      var appList = handleGetPendaftarBaru();
      return createJsonResponse({
        status: "success",
        applicants: appList
      });
    }

    // 2d. SETUJUI PENDAFTAR BARU (LEMBARKAN KE SHEET "AKUN")
    if (action === "APPROVE_PENDAFTAR_BARU" || action === "APPROVE_APPLICANT") {
      var approveResult = handleApprovePendaftarBaru(contents);
      return createJsonResponse(approveResult);
    }

    // 2e. TOLAK PENDAFTAR BARU
    if (action === "REJECT_PENDAFTAR_BARU" || action === "REJECT_APPLICANT") {
      var rejectResult = handleRejectPendaftarBaru(contents);
      return createJsonResponse(rejectResult);
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

    // 11b. SIMPAN DESAIN POSTER (Sheet data_poster)
    if (action === "SAVE_POSTER_DESIGN") {
      var posterDesignResult = handleSavePosterDesign(contents);
      return createJsonResponse(posterDesignResult);
    }

    // 11c. SIMPAN DESAIN LEMBAR JAWABAN (Sheet Data_LJ)
    if (action === "SAVE_ANSWER_SHEET_DESIGN" || action === "SAVE_LJ_DESIGN") {
      var ljDesignResult = handleSaveAnswerSheetDesign(contents);
      return createJsonResponse(ljDesignResult);
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

    // 16.1 BATCH DATA GURU (ATOMIC & TIDAK BERTUMPUK)
    if (action === "BATCH_TEACHERS") {
      var batchTeachResult = handleBatchTeachers(contents);
      return createJsonResponse(batchTeachResult);
    }

    // 16.2 TAMBAH 1 GURU (CRUD EFISIEN)
    if (action === "ADD_TEACHER") {
      var addTeachResult = handleAddTeacher(contents);
      return createJsonResponse(addTeachResult);
    }

    // 16.3 UPDATE 1 GURU (CRUD EFISIEN)
    if (action === "UPDATE_TEACHER") {
      var updTeachResult = handleUpdateTeacher(contents);
      return createJsonResponse(updTeachResult);
    }

    // 16.4 HAPUS 1 GURU (CRUD EFISIEN)
    if (action === "DELETE_TEACHER") {
      var delTeachResult = handleDeleteTeacher(contents);
      return createJsonResponse(delTeachResult);
    }

    // 16.5 HAPUS BANYAK GURU (CRUD EFISIEN)
    if (action === "BULK_DELETE_TEACHERS") {
      var bulkDelTeachResult = handleBulkDeleteTeachers(contents);
      return createJsonResponse(bulkDelTeachResult);
    }

    // 16.6 BATCH DATA ASESMEN (ATOMIC & TIDAK BERTUMPUK)
    if (action === "BATCH_EXAMS") {
      var batchExResult = handleBatchExams(contents);
      return createJsonResponse(batchExResult);
    }

    // 16.7 TAMBAH 1 ASESMEN (CRUD EFISIEN)
    if (action === "ADD_EXAM") {
      var addExResult = handleAddExam(contents);
      return createJsonResponse(addExResult);
    }

    // 16.8 UPDATE 1 ASESMEN (CRUD EFISIEN)
    if (action === "UPDATE_EXAM") {
      var updExResult = handleUpdateExam(contents);
      return createJsonResponse(updExResult);
    }

    // 16.9 HAPUS 1 ASESMEN (CRUD EFISIEN)
    if (action === "DELETE_EXAM") {
      var delExResult = handleDeleteExam(contents);
      return createJsonResponse(delExResult);
    }

    // 16.10 SET ASESMEN AKTIF
    if (action === "SET_ACTIVE_EXAM") {
      var setActExResult = handleSetActiveExam(contents);
      return createJsonResponse(setActExResult);
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

    // 19b. HAPUS 1 LOG PENGGUNA BESERTA FOTO DI GOOGLE DRIVE
    if (action === "DELETE_LOGIN_LOG") {
      var delLogResult = handleDeleteLoginLog(contents);
      return createJsonResponse(delLogResult);
    }

    // 19c. BERSIHKAN SEMUA LOG PENGGUNA & HAPUS SEMUA FOTO DI DRIVE
    if (action === "CLEAR_ALL_LOGIN_LOGS") {
      var clearLogsResult = handleClearAllLoginLogs();
      return createJsonResponse(clearLogsResult);
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

    var sheetAsesmen = ss.getSheetByName(SHEET_NAMES.DATA_ASESMEN);
    if (sheetAsesmen) {
      var aRows = sheetAsesmen.getDataRange().getValues();
      for (var a = aRows.length - 1; a >= 1; a--) {
        if (String(aRows[a][2]).toLowerCase() === username) {
          sheetAsesmen.deleteRow(a + 1);
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
 * Helper untuk mendeteksi posisi indeks kolom di Sheet DATA_SISWA secara dinamis & cerdas
 */
function getStudentColumnIndices(headerRow) {
  var map = {
    id: 0,
    schoolId: 1,
    username: 2,
    nisn: 3,
    nis: 4,
    name: 5,
    gender: 6,
    religion: -1,
    className: 7,
    birthPlace: 8,
    birthDate: 9,
    examRoom: 10,
    examSeat: 11,
    photoUrl: 12,
    updatedAt: 13
  };
  if (!headerRow || headerRow.length === 0) return map;

  for (var i = 0; i < headerRow.length; i++) {
    var h = String(headerRow[i] || "").trim().toLowerCase();
    if (h === "id") map.id = i;
    else if (h === "school id" || h.indexOf("school") !== -1) map.schoolId = i;
    else if (h === "username") map.username = i;
    else if (h === "nisn") map.nisn = i;
    else if (h === "nis") map.nis = i;
    else if (h === "nama lengkap" || h === "nama") map.name = i;
    else if (h === "jenis kelamin" || h === "gender" || h === "l/p") map.gender = i;
    else if (h === "agama" || h.indexOf("agama") !== -1) map.religion = i;
    else if (h === "kelas" || h === "rombel") map.className = i;
    else if (h === "tempat lahir") map.birthPlace = i;
    else if (h === "tanggal lahir") map.birthDate = i;
    else if (h === "ruang ujian" || h === "ruang") map.examRoom = i;
    else if (h === "nomor meja" || h === "no meja") map.examSeat = i;
    else if (h === "foto url" || h === "foto") map.photoUrl = i;
    else if (h === "updated at" || h.indexOf("update") !== -1) map.updatedAt = i;
  }
  return map;
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
        logoUrl: (r[10] && String(r[10]).toLowerCase() !== "undefined" && String(r[10]).toLowerCase() !== "null") ? String(r[10]).trim() : "",
        principalName: String(r[11]),
        principalNip: String(r[12]),
        headTitle: String(r[13]) || "Kepala Sekolah",
        email: r[22] ? String(r[22]) : ""
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
  var sIndices = rowsSiswa.length > 0 ? getStudentColumnIndices(rowsSiswa[0]) : null;

  for (var j = 1; j < rowsSiswa.length; j++) {
    var s = rowsSiswa[j];
    var sId = String(s[sIndices ? sIndices.id : 0] || "").trim();
    var su = String(s[sIndices ? sIndices.username : 2] || "").toLowerCase();
    if (!su || !sId) continue;

    var comboKey = su + "_" + sId;
    if (seenStudentIds[comboKey]) continue;
    seenStudentIds[comboKey] = true;

    var sReligion = sIndices && sIndices.religion !== -1 ? String(s[sIndices.religion] || "Islam").trim() : "Islam";
    if (!sReligion) sReligion = "Islam";

    if (!studentsMap[su]) studentsMap[su] = [];
    studentsMap[su].push({
      id: sId,
      nisn: String(s[sIndices ? sIndices.nisn : 3]),
      nis: String(s[sIndices ? sIndices.nis : 4]),
      name: String(s[sIndices ? sIndices.name : 5]),
      gender: String(s[sIndices ? sIndices.gender : 6]) === "P" ? "P" : "L",
      religion: sReligion,
      className: String(s[sIndices ? sIndices.className : (sIndices && sIndices.religion !== -1 ? 8 : 7)]),
      birthPlace: String(s[sIndices ? sIndices.birthPlace : (sIndices && sIndices.religion !== -1 ? 9 : 8)]),
      birthDate: s[sIndices ? sIndices.birthDate : (sIndices && sIndices.religion !== -1 ? 10 : 9)] instanceof Date ? s[sIndices ? sIndices.birthDate : (sIndices && sIndices.religion !== -1 ? 10 : 9)].toISOString().split('T')[0] : String(s[sIndices ? sIndices.birthDate : (sIndices && sIndices.religion !== -1 ? 10 : 9)]),
      examRoom: String(s[sIndices ? sIndices.examRoom : (sIndices && sIndices.religion !== -1 ? 11 : 10)]),
      examSeat: String(s[sIndices ? sIndices.examSeat : (sIndices && sIndices.religion !== -1 ? 12 : 11)]),
      photoUrl: String(s[sIndices ? sIndices.photoUrl : (sIndices && sIndices.religion !== -1 ? 13 : 12)]),
      createdAt: String(s[sIndices ? sIndices.updatedAt : (sIndices && sIndices.religion !== -1 ? 14 : 13)]),
      updatedAt: String(s[sIndices ? sIndices.updatedAt : (sIndices && sIndices.religion !== -1 ? 14 : 13)])
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

  // 4b. Desain Poster (Sheet data_poster)
  var sheetPoster = ss.getSheetByName(SHEET_NAMES.DATA_POSTER || "data_poster");
  var rowsPoster = sheetPoster ? sheetPoster.getDataRange().getValues() : [];
  var posterDesignsMap = {};
  for (var p = 1; p < rowsPoster.length; p++) {
    var pr = rowsPoster[p];
    var pu = String(pr[1] || "").toLowerCase();
    if (!pu) continue;
    try {
      posterDesignsMap[pu] = JSON.parse(pr[6] || "{}");
    } catch(e) {}
  }

  // 4c. Desain Lembar Jawaban (Sheet Data_LJ)
  var sheetLJ = ss.getSheetByName(SHEET_NAMES.DATA_LJ || "Data_LJ");
  var rowsLJ = sheetLJ ? sheetLJ.getDataRange().getValues() : [];
  var answerSheetsMap = {};
  for (var l = 1; l < rowsLJ.length; l++) {
    var lr = rowsLJ[l];
    var lu = String(lr[1] || "").toLowerCase();
    if (!lu) continue;
    try {
      answerSheetsMap[lu] = JSON.parse(lr[7] || "{}");
    } catch(e) {}
  }

  // 5. Data Guru (Sheet DATA_GURU)
  var sheetGuru = ss.getSheetByName(SHEET_NAMES.DATA_GURU);
  var rowsGuru = sheetGuru ? sheetGuru.getDataRange().getValues() : [];
  var teachersMap = {};
  var seenTeacherKeys = {};

  for (var g = 1; g < rowsGuru.length; g++) {
    var gr = rowsGuru[g];
    var gId = String(gr[0] || "").trim();
    var gu = String(gr[2] || "").toLowerCase();
    if (!gu || !gId) continue;

    var gKey = gu + "_" + gId;
    if (seenTeacherKeys[gKey]) continue;
    seenTeacherKeys[gKey] = true;

    if (!teachersMap[gu]) teachersMap[gu] = [];
    teachersMap[gu].push({
      id: gId,
      nip: String(gr[3] || ""),
      name: String(gr[4] || ""),
      gender: String(gr[5]) === "P" ? "P" : "L",
      religion: String(gr[6] || ""),
      subject: String(gr[7] || ""),
      phone: String(gr[8] || ""),
      email: String(gr[9] || ""),
      roleType: String(gr[10] || "guru"),
      roomDuty: String(gr[11] || ""),
      photoUrl: String(gr[12] || ""),
      createdAt: String(gr[13] || new Date().toISOString()),
      updatedAt: String(gr[13] || new Date().toISOString())
    });
  }

  // 6. Data Asesmen (Sheet DATA_ASESMEN)
  var sheetAsesmen = ss.getSheetByName(SHEET_NAMES.DATA_ASESMEN);
  var rowsAsesmen = sheetAsesmen ? sheetAsesmen.getDataRange().getValues() : [];
  var examsMap = {};
  var seenExamKeys = {};

  for (var a = 1; a < rowsAsesmen.length; a++) {
    var ar = rowsAsesmen[a];
    var aId = String(ar[0] || "").trim();
    var au = String(ar[2] || "").toLowerCase();
    if (!au || !aId) continue;

    var aKey = au + "_" + aId;
    if (seenExamKeys[aKey]) continue;
    seenExamKeys[aKey] = true;

    if (!examsMap[au]) examsMap[au] = [];
    var isAct = String(ar[11]).toLowerCase() === "true" || ar[11] === true || ar[11] === 1;
    examsMap[au].push({
      id: aId,
      name: String(ar[3] || ""),
      semester: String(ar[4] || ""),
      academicYear: String(ar[5] || ""),
      dateText: String(ar[6] || ""),
      location: String(ar[7] || ""),
      signatureDate: String(ar[8] || ""),
      scheduleInfo: String(ar[9] || ""),
      extraNote: String(ar[10] || ""),
      isActive: isAct
    });
  }

  return {
    accounts: accounts,
    applicants: handleGetPendaftarBaru(),
    schoolsMap: schoolsMap,
    studentsMap: studentsMap,
    teachersMap: teachersMap,
    examsMap: examsMap,
    designsMap: designsMap,
    posterDesignsMap: posterDesignsMap,
    answerSheetsMap: answerSheetsMap,
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
      exams: payload.exams || [exam],
      studentsCount: students.length,
      students: students,
      teachersCount: (payload.teachers || []).length,
      teachers: payload.teachers || [],
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
    now,
    school.email || ""
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
      s.religion || "Islam",
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

  // 5. Simpan DATA_GURU di Spreadsheet
  var teachers = payload.teachers || [];
  if (Array.isArray(teachers) && teachers.length > 0) {
    handleBatchTeachers({
      username: username,
      schoolId: school.id || ("sch_" + username),
      teachers: teachers
    });
  }

  // 6. Simpan DATA_ASESMEN di Spreadsheet
  var exams = payload.exams || (payload.exam ? [Object.assign({}, payload.exam, { isActive: true })] : []);
  if (Array.isArray(exams) && exams.length > 0) {
    handleBatchExams({
      username: username,
      schoolId: school.id || ("sch_" + username),
      exams: exams
    });
  }

  return {
    status: "success",
    message: "Data " + students.length + " siswa, guru & asesmen berhasil disimpan ke Spreadsheet & Google Drive!",
    totalStudentsSaved: students.length,
    totalTeachersSaved: teachers.length,
    totalExamsSaved: exams.length,
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
    now,
    school.email || ""
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
 * 12b. Simpan khusus pengaturan desain poster ke Sheet data_poster
 */
function handleSavePosterDesign(contents) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var username = contents.username || "Nagata";
  var posterDesign = contents.posterDesign || {};
  var now = new Date().toISOString();

  var sheetName = SHEET_NAMES.DATA_POSTER || "data_poster";
  var sheetPoster = ss.getSheetByName(sheetName);
  if (!sheetPoster) {
    sheetPoster = ss.insertSheet(sheetName);
    sheetPoster.appendRow([
      "School ID", "Username", "Style ID", "Orientation", "Watermark Opacity", "Show Address", "Settings JSON", "Updated At"
    ]);
    sheetPoster.getRange("A1:H1").setFontWeight("bold").setBackground("#9333EA").setFontColor("#FFFFFF");
  }

  var rows = sheetPoster.getDataRange().getValues();
  var rowIdx = -1;

  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][1]).toLowerCase() === username.toLowerCase()) {
      rowIdx = i + 1;
      break;
    }
  }

  var posterData = [
    "pos_" + username,
    username,
    posterDesign.styleId || "neobrutal",
    posterDesign.orientation || "portrait",
    posterDesign.watermarkOpacity !== undefined ? posterDesign.watermarkOpacity : 14,
    posterDesign.showSchoolAddressInFooter !== false ? "YA" : "TIDAK",
    JSON.stringify(posterDesign),
    now
  ];

  if (rowIdx > 0) {
    sheetPoster.getRange(rowIdx, 1, 1, posterData.length).setValues([posterData]);
  } else {
    sheetPoster.appendRow(posterData);
  }

  return {
    status: "success",
    message: "Pengaturan desain poster berhasil disimpan ke sheet data_poster!",
    timestamp: now
  };
}

/**
 * 12c. Simpan khusus pengaturan desain lembar jawaban ke Sheet Data_LJ
 */
function handleSaveAnswerSheetDesign(contents) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var username = contents.username || "Nagata";
  var ljDesign = contents.answerSheetDesign || contents.ljDesign || {};
  var now = new Date().toISOString();

  var sheetName = SHEET_NAMES.DATA_LJ || "Data_LJ";
  var sheetLJ = ss.getSheetByName(sheetName);
  if (!sheetLJ) {
    sheetLJ = ss.insertSheet(sheetName);
    sheetLJ.appendRow([
      "School ID", "Username", "PG Count", "Isian Count", "Uraian Count", "Kop Line 1", "Kop Line 3 (Sekolah)", "Settings JSON", "Updated At"
    ]);
    sheetLJ.getRange("A1:I1").setFontWeight("bold").setBackground("#0D9488").setFontColor("#FFFFFF");
  }

  var rows = sheetLJ.getDataRange().getValues();
  var rowIdx = -1;

  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][1]).toLowerCase() === username.toLowerCase()) {
      rowIdx = i + 1;
      break;
    }
  }

  var kop = ljDesign.kop || {};
  var questions = ljDesign.questions || {};

  var ljData = [
    "lj_" + username,
    username,
    questions.enablePg !== false ? (questions.pgCount || 25) : 0,
    questions.enableIsian !== false ? (questions.isianCount || 10) : 0,
    questions.enableUraian !== false ? (questions.uraianCount || 5) : 0,
    kop.line1 || "",
    kop.line3 || "",
    JSON.stringify(ljDesign),
    now
  ];

  if (rowIdx > 0) {
    sheetLJ.getRange(rowIdx, 1, 1, ljData.length).setValues([ljData]);
  } else {
    sheetLJ.appendRow(ljData);
  }

  return {
    status: "success",
    message: "Pengaturan desain lembar jawaban berhasil disimpan ke sheet Data_LJ!",
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
    student.religion || "Islam",
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
      religion: student.religion || "Islam",
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
      student.religion || "Islam",
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
      s.religion || "Islam",
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

/**
 * ----------------------------------------------------------------------------
 * SISTEM CRUD PINTAR: DATA GURU (Sheet DATA_GURU)
 * ----------------------------------------------------------------------------
 */

function handleAddTeacher(contents) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var username = String(contents.username || "Nagata").trim();
  var teacher = contents.teacher || {};
  var schoolId = contents.schoolId || "sch_" + username;
  var now = new Date().toISOString();

  if (!teacher.name && !teacher.nip) {
    return { status: "error", message: "Data guru tidak lengkap (Nama / NIP kosong)." };
  }

  var sheetGuru = ss.getSheetByName(SHEET_NAMES.DATA_GURU);
  if (!sheetGuru) {
    initSheets();
    sheetGuru = ss.getSheetByName(SHEET_NAMES.DATA_GURU);
  }
  var allRows = sheetGuru.getDataRange().getValues();

  var existingRowIdx = -1;
  for (var i = 1; i < allRows.length; i++) {
    var r = allRows[i];
    var rUser = String(r[2] || "").trim().toLowerCase();
    if (rUser === username.toLowerCase()) {
      if ((teacher.id && String(r[0]) === String(teacher.id)) ||
          (teacher.nip && teacher.nip !== "-" && String(r[3]) === String(teacher.nip))) {
        existingRowIdx = i + 1;
        break;
      }
    }
  }

  var rowData = [
    teacher.id || "tea_" + new Date().getTime(),
    schoolId,
    username,
    teacher.nip || "",
    teacher.name || "",
    teacher.gender || "L",
    teacher.religion || "",
    teacher.subject || "",
    teacher.phone || "",
    teacher.email || "",
    teacher.roleType || "guru",
    teacher.roomDuty || "",
    teacher.photoUrl || "",
    now
  ];

  if (existingRowIdx > 0) {
    sheetGuru.getRange(existingRowIdx, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheetGuru.appendRow(rowData);
  }

  return {
    status: "success",
    message: "Data guru '" + (teacher.name || teacher.nip) + "' berhasil disimpan ke database!",
    teacher: {
      id: rowData[0],
      nip: teacher.nip || "",
      name: teacher.name || "",
      gender: teacher.gender || "L",
      religion: teacher.religion || "",
      subject: teacher.subject || "",
      phone: teacher.phone || "",
      email: teacher.email || "",
      roleType: teacher.roleType || "guru",
      roomDuty: teacher.roomDuty || "",
      photoUrl: teacher.photoUrl || "",
      createdAt: teacher.createdAt || now,
      updatedAt: now
    }
  };
}

function handleUpdateTeacher(contents) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var username = String(contents.username || "Nagata").trim();
  var teacher = contents.teacher || {};
  var now = new Date().toISOString();

  if (!teacher.id && !teacher.nip) {
    return { status: "error", message: "ID atau NIP guru diperlukan untuk update data." };
  }

  var sheetGuru = ss.getSheetByName(SHEET_NAMES.DATA_GURU);
  if (!sheetGuru) {
    initSheets();
    sheetGuru = ss.getSheetByName(SHEET_NAMES.DATA_GURU);
  }
  var allRows = sheetGuru.getDataRange().getValues();

  var targetRowIdx = -1;
  for (var i = 1; i < allRows.length; i++) {
    var r = allRows[i];
    var rUser = String(r[2] || "").trim().toLowerCase();
    if (rUser === username.toLowerCase()) {
      if ((teacher.id && String(r[0]) === String(teacher.id)) ||
          (teacher.nip && teacher.nip !== "-" && String(r[3]) === String(teacher.nip))) {
        targetRowIdx = i + 1;
        break;
      }
    }
  }

  if (targetRowIdx > 0) {
    var updateRange = [
      teacher.nip || "",
      teacher.name || "",
      teacher.gender || "L",
      teacher.religion || "",
      teacher.subject || "",
      teacher.phone || "",
      teacher.email || "",
      teacher.roleType || "guru",
      teacher.roomDuty || "",
      teacher.photoUrl || "",
      now
    ];
    sheetGuru.getRange(targetRowIdx, 4, 1, updateRange.length).setValues([updateRange]);
    return {
      status: "success",
      message: "Data guru '" + teacher.name + "' berhasil diperbarui di database!",
      teacher: teacher
    };
  } else {
    return handleAddTeacher(contents);
  }
}

function handleDeleteTeacher(contents) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var username = String(contents.username || "Nagata").trim().toLowerCase();
  var teacherId = String(contents.teacherId || contents.id || "").trim();
  var teacherNip = String(contents.nip || "").trim();

  if (!teacherId && !teacherNip) {
    return { status: "error", message: "Teacher ID atau NIP wajib diisi untuk menghapus." };
  }

  var sheetGuru = ss.getSheetByName(SHEET_NAMES.DATA_GURU);
  if (!sheetGuru) return { status: "success", message: "Data guru telah bersih." };
  var allRows = sheetGuru.getDataRange().getValues();
  var deleted = false;

  for (var i = allRows.length - 1; i >= 1; i--) {
    var r = allRows[i];
    var rId = String(r[0]).trim();
    var rUser = String(r[2] || "").trim().toLowerCase();
    var rNip = String(r[3] || "").trim();

    var match = false;
    if (rUser === username) {
      if (teacherId && rId === teacherId) match = true;
      else if (teacherNip && teacherNip !== "-" && rNip === teacherNip) match = true;
    }

    if (match) {
      sheetGuru.deleteRow(i + 1);
      deleted = true;
      break;
    }
  }

  return {
    status: deleted ? "success" : "error",
    message: deleted ? "Data guru berhasil dihapus dari database!" : "Data guru tidak ditemukan di database."
  };
}

function handleBulkDeleteTeachers(contents) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var username = String(contents.username || "Nagata").trim().toLowerCase();
  var teacherIds = contents.teacherIds || contents.ids || [];
  if (!Array.isArray(teacherIds)) teacherIds = [];

  if (teacherIds.length === 0) {
    return { status: "error", message: "Daftar ID guru untuk dihapus kosong." };
  }

  var idSet = {};
  for (var k = 0; k < teacherIds.length; k++) {
    idSet[String(teacherIds[k]).trim()] = true;
  }

  var sheetGuru = ss.getSheetByName(SHEET_NAMES.DATA_GURU);
  if (!sheetGuru) return { status: "success", deletedCount: 0 };
  var allRows = sheetGuru.getDataRange().getValues();
  var deletedCount = 0;

  for (var i = allRows.length - 1; i >= 1; i--) {
    var r = allRows[i];
    var rId = String(r[0]).trim();
    var rUser = String(r[2] || "").trim().toLowerCase();

    if (rUser === username && idSet[rId]) {
      sheetGuru.deleteRow(i + 1);
      deletedCount++;
    }
  }

  return {
    status: "success",
    message: "Berhasil menghapus " + deletedCount + " data guru dari database!",
    deletedCount: deletedCount
  };
}

function handleBatchTeachers(contents) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var username = String(contents.username || "").toLowerCase();
  var teachers = contents.teachers || [];
  var schoolId = contents.schoolId || "sch_" + username;
  var now = new Date().toISOString();

  var sheetGuru = ss.getSheetByName(SHEET_NAMES.DATA_GURU);
  if (!sheetGuru) {
    initSheets();
    sheetGuru = ss.getSheetByName(SHEET_NAMES.DATA_GURU);
  }
  var allData = sheetGuru.getDataRange().getValues();

  var retainedRows = [];
  for (var i = 1; i < allData.length; i++) {
    if (String(allData[i][2]).trim().toLowerCase() !== username) {
      retainedRows.push(allData[i]);
    }
  }

  var seenKeys = {};
  var cleanTeachers = [];
  for (var tIdx = 0; tIdx < teachers.length; tIdx++) {
    var tch = teachers[tIdx];
    var key = (tch.nip && tch.nip !== "-") ? "nip_" + tch.nip : (tch.id || "tea_" + tIdx);
    if (!seenKeys[key]) {
      seenKeys[key] = true;
      cleanTeachers.push(tch);
    }
  }

  var newRows = cleanTeachers.map(function(t) {
    return [
      t.id || "tea_" + new Date().getTime() + "_" + Math.random().toString(36).substr(2, 4),
      schoolId,
      username,
      t.nip || "",
      t.name || "",
      t.gender || "L",
      t.religion || "",
      t.subject || "",
      t.phone || "",
      t.email || "",
      t.roleType || "guru",
      t.roomDuty || "",
      t.photoUrl || "",
      t.updatedAt || now
    ];
  });

  var combinedRows = retainedRows.concat(newRows);

  if (sheetGuru.getLastRow() > 1) {
    sheetGuru.deleteRows(2, sheetGuru.getLastRow() - 1);
  }

  if (combinedRows.length > 0) {
    sheetGuru.getRange(2, 1, combinedRows.length, combinedRows[0].length).setValues(combinedRows);
  }

  return {
    status: "success",
    message: "Data " + cleanTeachers.length + " guru berhasil diperbarui tanpa penumpukan!",
    totalTeachersSaved: cleanTeachers.length
  };
}

/**
 * ----------------------------------------------------------------------------
 * SISTEM CRUD PINTAR: DATA ASESMEN / UJIAN (Sheet DATA_ASESMEN)
 * ----------------------------------------------------------------------------
 */

function handleAddExam(contents) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var username = String(contents.username || "Nagata").trim();
  var exam = contents.exam || {};
  var schoolId = contents.schoolId || "sch_" + username;
  var now = new Date().toISOString();

  if (!exam.name) {
    return { status: "error", message: "Nama asesmen / ujian wajib diisi." };
  }

  var sheetAsesmen = ss.getSheetByName(SHEET_NAMES.DATA_ASESMEN);
  if (!sheetAsesmen) {
    initSheets();
    sheetAsesmen = ss.getSheetByName(SHEET_NAMES.DATA_ASESMEN);
  }
  var allRows = sheetAsesmen.getDataRange().getValues();

  var existingRowIdx = -1;
  for (var i = 1; i < allRows.length; i++) {
    var r = allRows[i];
    var rUser = String(r[2] || "").trim().toLowerCase();
    if (rUser === username.toLowerCase()) {
      if (exam.id && String(r[0]) === String(exam.id)) {
        existingRowIdx = i + 1;
        break;
      }
    }
  }

  if (exam.isActive) {
    for (var j = 1; j < allRows.length; j++) {
      if (String(allRows[j][2]).trim().toLowerCase() === username.toLowerCase()) {
        sheetAsesmen.getRange(j + 1, 12).setValue(false);
      }
    }
  }

  var rowData = [
    exam.id || "exam_" + new Date().getTime(),
    schoolId,
    username,
    exam.name || "",
    exam.semester || "",
    exam.academicYear || "",
    exam.dateText || "",
    exam.location || "",
    exam.signatureDate || "",
    exam.scheduleInfo || "",
    exam.extraNote || "",
    exam.isActive ? true : false,
    now
  ];

  if (existingRowIdx > 0) {
    sheetAsesmen.getRange(existingRowIdx, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheetAsesmen.appendRow(rowData);
  }

  if (exam.isActive) {
    syncActiveExamToSchoolSheet(username, exam);
  }

  return {
    status: "success",
    message: "Asesmen '" + exam.name + "' berhasil disimpan ke database!",
    exam: {
      id: rowData[0],
      name: exam.name || "",
      semester: exam.semester || "",
      academicYear: exam.academicYear || "",
      dateText: exam.dateText || "",
      location: exam.location || "",
      signatureDate: exam.signatureDate || "",
      scheduleInfo: exam.scheduleInfo || "",
      extraNote: exam.extraNote || "",
      isActive: exam.isActive ? true : false
    }
  };
}

function handleUpdateExam(contents) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var username = String(contents.username || "Nagata").trim();
  var exam = contents.exam || {};
  var now = new Date().toISOString();

  if (!exam.id) {
    return handleAddExam(contents);
  }

  var sheetAsesmen = ss.getSheetByName(SHEET_NAMES.DATA_ASESMEN);
  if (!sheetAsesmen) {
    initSheets();
    sheetAsesmen = ss.getSheetByName(SHEET_NAMES.DATA_ASESMEN);
  }
  var allRows = sheetAsesmen.getDataRange().getValues();

  var targetRowIdx = -1;
  for (var i = 1; i < allRows.length; i++) {
    var r = allRows[i];
    var rUser = String(r[2] || "").trim().toLowerCase();
    if (rUser === username.toLowerCase() && String(r[0]) === String(exam.id)) {
      targetRowIdx = i + 1;
      break;
    }
  }

  if (targetRowIdx > 0) {
    if (exam.isActive) {
      for (var j = 1; j < allRows.length; j++) {
        if (String(allRows[j][2]).trim().toLowerCase() === username.toLowerCase() && (j + 1) !== targetRowIdx) {
          sheetAsesmen.getRange(j + 1, 12).setValue(false);
        }
      }
    }

    var updateData = [
      exam.name || "",
      exam.semester || "",
      exam.academicYear || "",
      exam.dateText || "",
      exam.location || "",
      exam.signatureDate || "",
      exam.scheduleInfo || "",
      exam.extraNote || "",
      exam.isActive ? true : false,
      now
    ];
    sheetAsesmen.getRange(targetRowIdx, 4, 1, updateData.length).setValues([updateData]);

    if (exam.isActive) {
      syncActiveExamToSchoolSheet(username, exam);
    }

    return {
      status: "success",
      message: "Data asesmen '" + exam.name + "' berhasil diperbarui di database!",
      exam: exam
    };
  } else {
    return handleAddExam(contents);
  }
}

function handleDeleteExam(contents) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var username = String(contents.username || "Nagata").trim().toLowerCase();
  var examId = String(contents.examId || contents.id || "").trim();

  if (!examId) {
    return { status: "error", message: "Exam ID wajib diisi untuk menghapus asesmen." };
  }

  var sheetAsesmen = ss.getSheetByName(SHEET_NAMES.DATA_ASESMEN);
  if (!sheetAsesmen) return { status: "success", message: "Data asesmen telah bersih." };
  var allRows = sheetAsesmen.getDataRange().getValues();
  var deleted = false;

  for (var i = allRows.length - 1; i >= 1; i--) {
    var r = allRows[i];
    var rId = String(r[0]).trim();
    var rUser = String(r[2] || "").trim().toLowerCase();

    if (rUser === username && rId === examId) {
      sheetAsesmen.deleteRow(i + 1);
      deleted = true;
      break;
    }
  }

  return {
    status: deleted ? "success" : "error",
    message: deleted ? "Data asesmen berhasil dihapus dari database!" : "Asesmen tidak ditemukan di database."
  };
}

function handleSetActiveExam(contents) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var username = String(contents.username || "Nagata").trim();
  var examId = String(contents.examId || contents.id || "").trim();

  var sheetAsesmen = ss.getSheetByName(SHEET_NAMES.DATA_ASESMEN);
  if (!sheetAsesmen) {
    initSheets();
    sheetAsesmen = ss.getSheetByName(SHEET_NAMES.DATA_ASESMEN);
  }
  var allRows = sheetAsesmen.getDataRange().getValues();
  var activeExamObj = null;

  for (var i = 1; i < allRows.length; i++) {
    var r = allRows[i];
    var rId = String(r[0]).trim();
    var rUser = String(r[2] || "").trim().toLowerCase();

    if (rUser === username.toLowerCase()) {
      var isTarget = (rId === examId);
      sheetAsesmen.getRange(i + 1, 12).setValue(isTarget);
      if (isTarget) {
        activeExamObj = {
          id: rId,
          name: String(r[3] || ""),
          semester: String(r[4] || ""),
          academicYear: String(r[5] || ""),
          dateText: String(r[6] || ""),
          location: String(r[7] || ""),
          signatureDate: String(r[8] || ""),
          scheduleInfo: String(r[9] || ""),
          extraNote: String(r[10] || ""),
          isActive: true
        };
      }
    }
  }

  if (activeExamObj) {
    syncActiveExamToSchoolSheet(username, activeExamObj);
  }

  return {
    status: "success",
    message: "Asesmen aktif berhasil disetel!",
    activeExam: activeExamObj
  };
}

function handleBatchExams(contents) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var username = String(contents.username || "").toLowerCase();
  var exams = contents.exams || [];
  var schoolId = contents.schoolId || "sch_" + username;
  var now = new Date().toISOString();

  var sheetAsesmen = ss.getSheetByName(SHEET_NAMES.DATA_ASESMEN);
  if (!sheetAsesmen) {
    initSheets();
    sheetAsesmen = ss.getSheetByName(SHEET_NAMES.DATA_ASESMEN);
  }
  var allData = sheetAsesmen.getDataRange().getValues();

  var retainedRows = [];
  for (var i = 1; i < allData.length; i++) {
    if (String(allData[i][2]).trim().toLowerCase() !== username) {
      retainedRows.push(allData[i]);
    }
  }

  var seenIds = {};
  var cleanExams = [];
  for (var eIdx = 0; eIdx < exams.length; eIdx++) {
    var ex = exams[eIdx];
    var key = ex.id || ("exam_" + eIdx);
    if (!seenIds[key]) {
      seenIds[key] = true;
      cleanExams.push(ex);
    }
  }

  var newRows = cleanExams.map(function(e) {
    return [
      e.id || "exam_" + new Date().getTime() + "_" + Math.random().toString(36).substr(2, 4),
      schoolId,
      username,
      e.name || "",
      e.semester || "",
      e.academicYear || "",
      e.dateText || "",
      e.location || "",
      e.signatureDate || "",
      e.scheduleInfo || "",
      e.extraNote || "",
      e.isActive ? true : false,
      now
    ];
  });

  var combinedRows = retainedRows.concat(newRows);

  if (sheetAsesmen.getLastRow() > 1) {
    sheetAsesmen.deleteRows(2, sheetAsesmen.getLastRow() - 1);
  }

  if (combinedRows.length > 0) {
    sheetAsesmen.getRange(2, 1, combinedRows.length, combinedRows[0].length).setValues(combinedRows);
  }

  return {
    status: "success",
    message: "Data " + cleanExams.length + " asesmen berhasil disimpan tanpa penumpukan!",
    totalExamsSaved: cleanExams.length
  };
}

function syncActiveExamToSchoolSheet(username, exam) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetSekolah = ss.getSheetByName(SHEET_NAMES.INFORMASI_SEKOLAH);
    if (!sheetSekolah) return;
    var rows = sheetSekolah.getDataRange().getValues();

    for (var i = 1; i < rows.length; i++) {
      if (String(rows[i][1]).toLowerCase() === username.toLowerCase()) {
        var rowIdx = i + 1;
        sheetSekolah.getRange(rowIdx, 15).setValue(exam.name || "");
        sheetSekolah.getRange(rowIdx, 16).setValue(exam.semester || "");
        sheetSekolah.getRange(rowIdx, 17).setValue(exam.academicYear || "");
        sheetSekolah.getRange(rowIdx, 18).setValue(exam.dateText || "");
        sheetSekolah.getRange(rowIdx, 19).setValue(exam.location || "");
        sheetSekolah.getRange(rowIdx, 20).setValue(exam.extraNote || "");
        break;
      }
    }
  } catch (errSync) {
    Logger.log("Peringatan syncActiveExamToSchoolSheet: " + errSync.toString());
  }
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
        logoUrl: (r[10] && String(r[10]).toLowerCase() !== "undefined" && String(r[10]).toLowerCase() !== "null") ? String(r[10]).trim() : "",
        principalName: String(r[11]),
        principalNip: String(r[12]),
        headTitle: String(r[13]) || "Kepala Sekolah",
        email: r[22] ? String(r[22]) : ""
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
  var sIndices = rowsSiswa.length > 0 ? getStudentColumnIndices(rowsSiswa[0]) : null;

  for (var j = 1; j < rowsSiswa.length; j++) {
    var s = rowsSiswa[j];
    var su = String(s[sIndices ? sIndices.username : 2] || "").toLowerCase();
    if (su === cleanUser || (!cleanUser && cleanUser === "")) {
      var sReligion = sIndices && sIndices.religion !== -1 ? String(s[sIndices.religion] || "Islam").trim() : "Islam";
      if (!sReligion) sReligion = "Islam";

      studentsList.push({
        id: String(s[sIndices ? sIndices.id : 0]),
        nisn: String(s[sIndices ? sIndices.nisn : 3]),
        nis: String(s[sIndices ? sIndices.nis : 4]),
        name: String(s[sIndices ? sIndices.name : 5]),
        gender: String(s[sIndices ? sIndices.gender : 6]) === "P" ? "P" : "L",
        religion: sReligion,
        className: String(s[sIndices ? sIndices.className : (sIndices && sIndices.religion !== -1 ? 8 : 7)]),
        birthPlace: String(s[sIndices ? sIndices.birthPlace : (sIndices && sIndices.religion !== -1 ? 9 : 8)]),
        birthDate: s[sIndices ? sIndices.birthDate : 9] instanceof Date ? s[sIndices ? sIndices.birthDate : 9].toISOString().split('T')[0] : String(s[sIndices ? sIndices.birthDate : 9]),
        examRoom: String(s[sIndices ? sIndices.examRoom : 10]),
        examSeat: String(s[sIndices ? sIndices.examSeat : 11]),
        photoUrl: String(s[sIndices ? sIndices.photoUrl : 12]),
        createdAt: String(s[sIndices ? sIndices.updatedAt : 13]),
        updatedAt: String(s[sIndices ? sIndices.updatedAt : 13])
      });
    }
  }

  // 3.5. Guru
  var sheetGuru = ss.getSheetByName(SHEET_NAMES.DATA_GURU);
  var rowsGuru = sheetGuru ? sheetGuru.getDataRange().getValues() : [];
  var teachersList = [];

  for (var tg = 1; tg < rowsGuru.length; tg++) {
    var g = rowsGuru[tg];
    if (String(g[2]).toLowerCase() === cleanUser || (!cleanUser && cleanUser === "")) {
      teachersList.push({
        id: String(g[0]),
        nip: String(g[3] || ""),
        name: String(g[4] || ""),
        gender: String(g[5]) === "P" ? "P" : "L",
        religion: String(g[6] || ""),
        subject: String(g[7] || ""),
        phone: String(g[8] || ""),
        email: String(g[9] || ""),
        roleType: String(g[10] || "guru"),
        roomDuty: String(g[11] || ""),
        photoUrl: String(g[12] || ""),
        createdAt: String(g[13]),
        updatedAt: String(g[13])
      });
    }
  }

  // 3.6. Asesmen
  var sheetAsesmen = ss.getSheetByName(SHEET_NAMES.DATA_ASESMEN);
  var rowsAsesmen = sheetAsesmen ? sheetAsesmen.getDataRange().getValues() : [];
  var examsList = [];

  for (var ea = 1; ea < rowsAsesmen.length; ea++) {
    var a = rowsAsesmen[ea];
    if (String(a[2]).toLowerCase() === cleanUser || (!cleanUser && cleanUser === "")) {
      var isAct = String(a[11]).toLowerCase() === "true" || a[11] === true || a[11] === 1;
      examsList.push({
        id: String(a[0]),
        name: String(a[3] || ""),
        semester: String(a[4] || ""),
        academicYear: String(a[5] || ""),
        dateText: String(a[6] || ""),
        location: String(a[7] || ""),
        signatureDate: String(a[8] || ""),
        scheduleInfo: String(a[9] || ""),
        extraNote: String(a[10] || ""),
        isActive: isAct
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

  var sheetPoster = ss.getSheetByName(SHEET_NAMES.DATA_POSTER || "data_poster");
  var rowsPoster = sheetPoster ? sheetPoster.getDataRange().getValues() : [];
  var posterDesign = null;

  for (var kp = 1; kp < rowsPoster.length; kp++) {
    var dp = rowsPoster[kp];
    if (String(dp[1]).toLowerCase() === cleanUser) {
      try {
        posterDesign = JSON.parse(dp[6]);
      } catch (e) {}
      break;
    }
  }

  var sheetLJ = ss.getSheetByName(SHEET_NAMES.DATA_LJ || "Data_LJ");
  var rowsLJ = sheetLJ ? sheetLJ.getDataRange().getValues() : [];
  var answerSheetDesign = null;

  for (var kl = 1; kl < rowsLJ.length; kl++) {
    var dl = rowsLJ[kl];
    if (String(dl[1]).toLowerCase() === cleanUser) {
      try {
        answerSheetDesign = JSON.parse(dl[7]);
      } catch (e) {}
      break;
    }
  }

  return {
    school: schoolData,
    exam: examData,
    exams: examsList,
    students: studentsList,
    teachers: teachersList,
    cardDesign: cardDesign,
    posterDesign: posterDesign,
    answerSheetDesign: answerSheetDesign,
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

/**
 * 21. Registrasi pendaftar sekolah baru (Disimpan di Sheet Pendaftar_Baru dengan status pending)
 */
function handleRegisterSchoolApplicant(contents) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  initSheets();
  var sheet = ss.getSheetByName(SHEET_NAMES.PENDAFTAR_BARU);
  var username = String(contents.username || "").trim();
  var password = String(contents.password || "").trim();
  var schoolName = String(contents.schoolName || "").trim();
  var npsn = String(contents.npsn || "").trim();
  var role = String(contents.role || "operator").trim();
  var notes = String(contents.notes || "Menunggu Verifikasi Admin").trim();

  if (!username || !password || !schoolName) {
    return {
      status: "error",
      message: "Username, Password, dan Nama Sekolah wajib diisi!"
    };
  }

  // Cek apakah username sudah ada di Sheet AKUN
  var sheetAkun = ss.getSheetByName(SHEET_NAMES.AKUN);
  if (sheetAkun) {
    var akunRows = sheetAkun.getDataRange().getValues();
    for (var a = 1; a < akunRows.length; a++) {
      if (String(akunRows[a][1]).trim().toLowerCase() === username.toLowerCase()) {
        return {
          status: "error",
          message: "Username '" + username + "' sudah terdaftar di sistem. Silakan login atau gunakan username lain."
        };
      }
    }
  }

  // Cek apakah username sudah ada di Sheet PENDAFTAR_BARU dengan status pending
  if (sheet) {
    var rows = sheet.getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) {
      var u = String(rows[i][1]).trim().toLowerCase();
      var st = String(rows[i][6]).trim().toLowerCase();
      if (u === username.toLowerCase() && st === "pending") {
        return {
          status: "error",
          message: "Pendaftaran untuk username '" + username + "' sudah dikirim dan sedang menunggu persetujuan Admin."
        };
      }
    }
  }

  var newId = "app_" + new Date().getTime();
  var now = new Date().toISOString();

  sheet.appendRow([
    newId,
    username,
    password,
    schoolName,
    npsn,
    role,
    "pending",
    now,
    notes
  ]);

  return {
    status: "success",
    message: "Pendaftaran sekolah berhasil dikirim! Menunggu persetujuan Administrator.",
    applicant: {
      id: newId,
      username: username,
      schoolName: schoolName,
      npsn: npsn,
      role: role,
      status: "pending",
      createdAt: now,
      notes: notes
    }
  };
}

/**
 * Mengambil daftar pendaftar baru dari Sheet Pendaftar_Baru (urut dari yang terbaru)
 */
function handleGetPendaftarBaru() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAMES.PENDAFTAR_BARU);
  if (!sheet) return [];

  var rows = sheet.getDataRange().getValues();
  var applicants = [];

  for (var i = 1; i < rows.length; i++) {
    var r = rows[i];
    var id = String(r[0] || "");
    var username = String(r[1] || "").trim();
    if (!username && !id) continue;

    applicants.push({
      id: id || ("app_" + i),
      username: username,
      password: String(r[2] || ""),
      schoolName: String(r[3] || ""),
      npsn: String(r[4] || ""),
      role: String(r[5] || "operator"),
      status: String(r[6] || "pending").toLowerCase(),
      createdAt: String(r[7] || ""),
      notes: String(r[8] || "")
    });
  }

  applicants.reverse();
  return applicants;
}

/**
 * 22. Menyetujui pendaftar sekolah baru:
 * Memindahkan data ke Sheet AKUN agar dapat login dan mendapatkan akses,
 * serta memperbarui status di Sheet Pendaftar_Baru menjadi "approved"
 */
function handleApprovePendaftarBaru(contents) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  initSheets();
  var sheetPendaftar = ss.getSheetByName(SHEET_NAMES.PENDAFTAR_BARU);
  var sheetAkun = ss.getSheetByName(SHEET_NAMES.AKUN);
  if (!sheetPendaftar || !sheetAkun) {
    return { status: "error", message: "Sheet Pendaftar_Baru atau AKUN tidak ditemukan!" };
  }

  var id = String(contents.id || "").trim();
  var username = String(contents.username || "").trim().toLowerCase();

  var rows = sheetPendaftar.getDataRange().getValues();
  var foundRowIdx = -1;
  var applicantData = null;

  for (var i = 1; i < rows.length; i++) {
    var rId = String(rows[i][0]).trim();
    var rUser = String(rows[i][1]).trim().toLowerCase();
    if ((id && rId === id) || (username && rUser === username)) {
      foundRowIdx = i + 1;
      applicantData = {
        id: rId,
        username: String(rows[i][1]).trim(),
        password: String(rows[i][2] || "").trim(),
        schoolName: String(rows[i][3] || "").trim(),
        npsn: String(rows[i][4] || "").trim(),
        role: String(rows[i][5] || "operator").trim(),
        status: String(rows[i][6] || "pending").trim()
      };
      break;
    }
  }

  if (foundRowIdx === -1 || !applicantData) {
    return { status: "error", message: "Data pendaftar sekolah tidak ditemukan." };
  }

  // Cek apakah akun sudah ada di Sheet AKUN
  var akunRows = sheetAkun.getDataRange().getValues();
  var alreadyInAkun = false;
  for (var a = 1; a < akunRows.length; a++) {
    if (String(akunRows[a][1]).trim().toLowerCase() === applicantData.username.toLowerCase()) {
      alreadyInAkun = true;
      break;
    }
  }

  var now = new Date().toISOString();
  var newAccId = "acc_" + new Date().getTime();

  if (!alreadyInAkun) {
    sheetAkun.appendRow([
      newAccId,
      applicantData.username,
      applicantData.password,
      applicantData.schoolName,
      applicantData.npsn,
      applicantData.role,
      now
    ]);

    try {
      getOrCreateSchoolFolder(applicantData.schoolName || applicantData.username);
    } catch(eDrive) {}
  }

  // Update status di Sheet Pendaftar_Baru
  sheetPendaftar.getRange(foundRowIdx, 7).setValue("approved");
  sheetPendaftar.getRange(foundRowIdx, 9).setValue("Disetujui pada " + Utilities.formatDate(new Date(), "Asia/Jakarta", "dd MMM yyyy HH:mm") + " WIB");

  return {
    status: "success",
    message: "Sekolah '" + applicantData.schoolName + "' (@" + applicantData.username + ") berhasil disetujui dan ditambahkan ke Sheet AKUN!",
    account: {
      id: newAccId,
      username: applicantData.username,
      password: applicantData.password,
      schoolName: applicantData.schoolName,
      npsn: applicantData.npsn,
      role: applicantData.role,
      status: "active",
      createdAt: now
    }
  };
}

/**
 * 23. Menolak pendaftar sekolah baru
 */
function handleRejectPendaftarBaru(contents) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetPendaftar = ss.getSheetByName(SHEET_NAMES.PENDAFTAR_BARU);
  if (!sheetPendaftar) {
    return { status: "error", message: "Sheet Pendaftar_Baru tidak ditemukan!" };
  }

  var id = String(contents.id || "").trim();
  var username = String(contents.username || "").trim().toLowerCase();
  var reason = String(contents.reason || contents.notes || "Ditolak oleh Administrator").trim();

  var rows = sheetPendaftar.getDataRange().getValues();
  var foundRowIdx = -1;

  for (var i = 1; i < rows.length; i++) {
    var rId = String(rows[i][0]).trim();
    var rUser = String(rows[i][1]).trim().toLowerCase();
    if ((id && rId === id) || (username && rUser === username)) {
      foundRowIdx = i + 1;
      break;
    }
  }

  if (foundRowIdx === -1) {
    return { status: "error", message: "Data pendaftar tidak ditemukan." };
  }

  sheetPendaftar.getRange(foundRowIdx, 7).setValue("rejected");
  sheetPendaftar.getRange(foundRowIdx, 9).setValue(reason + " (" + Utilities.formatDate(new Date(), "Asia/Jakarta", "dd MMM yyyy HH:mm") + " WIB)");

  return {
    status: "success",
    message: "Pendaftaran sekolah berhasil ditolak."
  };
}

/**
 * Helper untuk menghapus file foto di Google Drive berdasarkan URL atau ID
 */
function deleteDrivePhotoByUrl(photoUrl) {
  if (!photoUrl || typeof photoUrl !== "string") return false;
  try {
    var match = photoUrl.match(/id=([a-zA-Z0-9_-]+)/) || photoUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      var file = DriveApp.getFileById(match[1]);
      if (file) {
        file.setTrashed(true);
        return true;
      }
    }
  } catch(e) {
    Logger.log("Peringatan deleteDrivePhoto: " + e.toString());
  }
  return false;
}

/**
 * 24. Hapus 1 baris log dari Sheet LOG_PENGGUNA dan hapus file foto terkait di Google Drive
 */
function handleDeleteLoginLog(contents) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetLog = ss.getSheetByName(SHEET_NAMES.LOG_PENGGUNA);
  if (!sheetLog) {
    return { status: "error", message: "Sheet LOG_PENGGUNA tidak ditemukan!" };
  }

  var logId = String(contents.id || contents.logId || "").trim();
  var photoUrl = String(contents.photoUrl || "").trim();

  var rows = sheetLog.getDataRange().getValues();
  var deleted = false;

  for (var i = rows.length - 1; i >= 1; i--) {
    var rId = String(rows[i][0] || "").trim();
    if (rId === logId) {
      if (!photoUrl && rows[i][5]) {
        photoUrl = String(rows[i][5]).trim();
      }
      sheetLog.deleteRow(i + 1);
      deleted = true;
      break;
    }
  }

  if (photoUrl) {
    deleteDrivePhotoByUrl(photoUrl);
  }

  return {
    status: "success",
    message: deleted ? "Catatan log dan file foto kamera di Drive berhasil dihapus!" : "Log diproses untuk dibersihkan."
  };
}

/**
 * 25. Bersihkan SEMUA baris log dari Sheet LOG_PENGGUNA dan hapus seluruh file foto di Drive
 */
function handleClearAllLoginLogs() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetLog = ss.getSheetByName(SHEET_NAMES.LOG_PENGGUNA);
  if (!sheetLog) {
    return { status: "success", message: "Sheet LOG_PENGGUNA kosong." };
  }

  var rows = sheetLog.getDataRange().getValues();
  var deletedPhotos = 0;

  for (var i = 1; i < rows.length; i++) {
    var photoUrl = String(rows[i][5] || "").trim();
    if (photoUrl) {
      if (deleteDrivePhotoByUrl(photoUrl)) {
        deletedPhotos++;
      }
    }
  }

  if (rows.length > 1) {
    sheetLog.deleteRows(2, rows.length - 1);
  }

  return {
    status: "success",
    message: "Seluruh catatan log masuk dan " + deletedPhotos + " file foto kamera di Google Drive berhasil dibersihkan!"
  };
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
