<?php
/**
 * REST API Backend PHP untuk Database MySQL Shared Hosting
 * Aplikasi Ekstrakurikuler Panahan
 *
 * Silakan upload file ini ke folder public_html atau root domain shared hosting Anda.
 * Sesuaikan konfigurasi database MySQL di bawah ini.
 */

// Headers CORS & JSON Response
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// Tangani Preflight Request OPTIONS Browser
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// =========================================================================
// KONFIGURASI DATABASE MYSQL SHARED HOSTING
// =========================================================================
$db_host = "localhost";        // Biasa 'localhost' di Shared Hosting (cPanel)
$db_name = "db_panahan";       // Nama Database MySQL Anda
$db_user = "root";             // Username Database MySQL
$db_pass = "";                 // Password Database MySQL
// =========================================================================

try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
    ]);
} catch (PDOException $e) {
    echo json_encode([
        "status" => "error",
        "message" => "Gagal terhubung ke MySQL Shared Hosting: " . $e->getMessage()
    ]);
    exit();
}

// Auto-create Tables if missing
function initSchema($pdo) {
    $sqls = [
        "CREATE TABLE IF NOT EXISTS `schools` (`id` VARCHAR(100) PRIMARY KEY, `name` VARCHAR(255) NOT NULL, `code` VARCHAR(50), `address` TEXT, `contactPerson` VARCHAR(150), `phone` VARCHAR(50), `activeStudentsCount` INT DEFAULT 0, `monthlyFeePerStudent` DECIMAL(12,2) DEFAULT 0, `coachHonorPerSession` DECIMAL(12,2) DEFAULT 0, `financialModel` VARCHAR(50) DEFAULT 'monthly_fee', `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",
        "CREATE TABLE IF NOT EXISTS `students` (`id` VARCHAR(100) PRIMARY KEY, `name` VARCHAR(255) NOT NULL, `nisn` VARCHAR(50), `schoolId` VARCHAR(100) NOT NULL, `schoolName` VARCHAR(255), `grade` VARCHAR(100), `parentName` VARCHAR(150), `parentPhone` VARCHAR(50), `bowType` VARCHAR(100), `targetDistance` VARCHAR(50), `qrCodeUrl` TEXT, `joinDate` VARCHAR(50), `status` VARCHAR(50) DEFAULT 'Aktif', `avatarUrl` TEXT, `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",
        "CREATE TABLE IF NOT EXISTS `coaches` (`id` VARCHAR(100) PRIMARY KEY, `name` VARCHAR(255) NOT NULL, `phone` VARCHAR(50), `specialization` VARCHAR(150), `assignedSchoolIds` JSON, `status` VARCHAR(50) DEFAULT 'Aktif', `avatarUrl` TEXT, `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",
        "CREATE TABLE IF NOT EXISTS `schedules` (`id` VARCHAR(100) PRIMARY KEY, `schoolId` VARCHAR(100) NOT NULL, `schoolName` VARCHAR(255), `day` VARCHAR(50), `time` VARCHAR(50), `coachId` VARCHAR(100), `coachName` VARCHAR(255), `location` VARCHAR(255), `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",
        "CREATE TABLE IF NOT EXISTS `student_attendance` (`id` VARCHAR(100) PRIMARY KEY, `studentId` VARCHAR(100) NOT NULL, `studentName` VARCHAR(255), `schoolId` VARCHAR(100) NOT NULL, `schoolName` VARCHAR(255), `date` VARCHAR(50) NOT NULL, `status` VARCHAR(50) NOT NULL, `scheduleId` VARCHAR(100), `notes` TEXT, `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",
        "CREATE TABLE IF NOT EXISTS `coach_attendance` (`id` VARCHAR(100) PRIMARY KEY, `coachId` VARCHAR(100) NOT NULL, `coachName` VARCHAR(255), `schoolId` VARCHAR(100) NOT NULL, `schoolName` VARCHAR(255), `date` VARCHAR(50) NOT NULL, `status` VARCHAR(50) NOT NULL, `scheduleId` VARCHAR(100), `sessionHonor` DECIMAL(12,2) DEFAULT 0, `notes` TEXT, `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",
        "CREATE TABLE IF NOT EXISTS `scores` (`id` VARCHAR(100) PRIMARY KEY, `studentId` VARCHAR(100) NOT NULL, `studentName` VARCHAR(255), `schoolId` VARCHAR(100) NOT NULL, `schoolName` VARCHAR(255), `date` VARCHAR(50) NOT NULL, `distance` VARCHAR(50), `arrowCount` INT DEFAULT 30, `totalScore` INT DEFAULT 0, `category` VARCHAR(100), `ends` JSON, `notes` TEXT, `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",
        "CREATE TABLE IF NOT EXISTS `payments` (`id` VARCHAR(100) PRIMARY KEY, `studentId` VARCHAR(100) NOT NULL, `studentName` VARCHAR(255), `schoolId` VARCHAR(100) NOT NULL, `schoolName` VARCHAR(255), `month` VARCHAR(50) NOT NULL, `year` INT NOT NULL, `amount` DECIMAL(12,2) NOT NULL, `status` VARCHAR(50) NOT NULL, `paymentDate` VARCHAR(50), `paymentMethod` VARCHAR(100), `proofUrl` TEXT, `notes` TEXT, `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",
        "CREATE TABLE IF NOT EXISTS `notifications` (`id` VARCHAR(100) PRIMARY KEY, `title` VARCHAR(255) NOT NULL, `message` TEXT NOT NULL, `timestamp` VARCHAR(100), `type` VARCHAR(50) DEFAULT 'info', `targetSchoolId` VARCHAR(100) DEFAULT 'ALL', `read` TINYINT(1) DEFAULT 0, `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",
        "CREATE TABLE IF NOT EXISTS `users` (`id` VARCHAR(100) PRIMARY KEY, `username` VARCHAR(100) UNIQUE NOT NULL, `password` VARCHAR(255) NOT NULL, `name` VARCHAR(255) NOT NULL, `role` VARCHAR(50) NOT NULL, `assignedSchoolIds` JSON, `associatedStudentId` VARCHAR(100), `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",
        "CREATE TABLE IF NOT EXISTS `settings` (`key` VARCHAR(100) PRIMARY KEY, `value` JSON NOT NULL, `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;"
    ];

    foreach ($sqls as $sql) {
        $pdo->exec($sql);
    }
}

initSchema($pdo);

$action = isset($_GET['action']) ? $_GET['action'] : '';

// 1. PING TEST
if ($action === 'ping' || $action === 'status') {
    echo json_encode([
        "status" => "success",
        "message" => "Database MySQL Shared Hosting Terhubung!",
        "database" => $db_name,
        "timestamp" => date("Y-m-d H:i:s")
    ]);
    exit();
}

// 2. GET ALL DATA
if ($action === 'get_all') {
    $collections = [
        "schools" => "SELECT * FROM schools",
        "students" => "SELECT * FROM students",
        "coaches" => "SELECT * FROM coaches",
        "schedules" => "SELECT * FROM schedules",
        "studentAttendance" => "SELECT * FROM student_attendance",
        "coachAttendance" => "SELECT * FROM coach_attendance",
        "scores" => "SELECT * FROM scores",
        "payments" => "SELECT * FROM payments",
        "notifications" => "SELECT * FROM notifications",
        "users" => "SELECT * FROM users",
    ];

    $data = [];
    foreach ($collections as $key => $sql) {
        $stmt = $pdo->query($sql);
        $rows = $stmt->fetchAll();
        // Decode JSON columns
        foreach ($rows as &$row) {
            if (isset($row['assignedSchoolIds']) && is_string($row['assignedSchoolIds'])) {
                $row['assignedSchoolIds'] = json_decode($row['assignedSchoolIds'], true);
            }
            if (isset($row['ends']) && is_string($row['ends'])) {
                $row['ends'] = json_decode($row['ends'], true);
            }
        }
        $data[$key] = $rows;
    }

    // Load Settings
    $stmtSettings = $pdo->query("SELECT * FROM settings");
    $settingsRows = $stmtSettings->fetchAll();
    $settings = [];
    foreach ($settingsRows as $s) {
        $settings[$s['key']] = json_decode($s['value'], true);
    }
    $data['settings'] = $settings;

    echo json_encode([
        "status" => "success",
        "data" => $data
    ]);
    exit();
}

// 3. GET SINGLE COLLECTION
if ($action === 'get_collection') {
    $collection = isset($_GET['name']) ? $_GET['name'] : '';
    $tableMap = [
        "schools" => "schools",
        "students" => "students",
        "coaches" => "coaches",
        "schedules" => "schedules",
        "studentAttendance" => "student_attendance",
        "coachAttendance" => "coach_attendance",
        "scores" => "scores",
        "payments" => "payments",
        "notifications" => "notifications",
        "users" => "users",
    ];

    if (!isset($tableMap[$collection])) {
        echo json_encode(["status" => "error", "message" => "Koleksi tidak valid"]);
        exit();
    }

    $table = $tableMap[$collection];
    $stmt = $pdo->query("SELECT * FROM `$table`");
    $rows = $stmt->fetchAll();

    foreach ($rows as &$row) {
        if (isset($row['assignedSchoolIds']) && is_string($row['assignedSchoolIds'])) {
            $row['assignedSchoolIds'] = json_decode($row['assignedSchoolIds'], true);
        }
        if (isset($row['ends']) && is_string($row['ends'])) {
            $row['ends'] = json_decode($row['ends'], true);
        }
    }

    echo json_encode(["status" => "success", "data" => $rows]);
    exit();
}

// 4. SYNC COLLECTION (BATCH SAVE)
if ($action === 'sync_collection' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $collection = isset($input['collection']) ? $input['collection'] : '';
    $items = isset($input['items']) ? $input['items'] : [];

    $tableMap = [
        "schools" => "schools",
        "students" => "students",
        "coaches" => "coaches",
        "schedules" => "schedules",
        "studentAttendance" => "student_attendance",
        "coachAttendance" => "coach_attendance",
        "scores" => "scores",
        "payments" => "payments",
        "notifications" => "notifications",
        "users" => "users",
    ];

    if (!isset($tableMap[$collection])) {
        echo json_encode(["status" => "error", "message" => "Koleksi tidak valid"]);
        exit();
    }

    $table = $tableMap[$collection];

    // Truncate & insert all
    $pdo->exec("DELETE FROM `$table`");

    if (!empty($items)) {
        foreach ($items as $item) {
            if (!isset($item['id'])) continue;

            $keys = array_keys($item);
            $cols = [];
            $placeholders = [];
            $vals = [];

            foreach ($item as $k => $v) {
                $cols[] = "`$k`";
                $placeholders[] = "?";
                if (is_array($v) || is_object($v)) {
                    $vals[] = json_encode($v);
                } else if (is_bool($v)) {
                    $vals[] = $v ? 1 : 0;
                } else {
                    $vals[] = $v;
                }
            }

            $sql = "INSERT INTO `$table` (" . implode(",", $cols) . ") VALUES (" . implode(",", $placeholders) . ")";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($vals);
        }
    }

    echo json_encode(["status" => "success", "message" => "Berhasil sinkronisasi koleksi $collection ke MySQL"]);
    exit();
}

// 5. SAVE SETTINGS DOC
if ($action === 'save_setting' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $key = isset($input['key']) ? $input['key'] : '';
    $value = isset($input['value']) ? $input['value'] : null;

    if (!$key || $value === null) {
        echo json_encode(["status" => "error", "message" => "Key dan Value wajib diisi"]);
        exit();
    }

    $jsonVal = json_encode($value);
    $stmt = $pdo->prepare("INSERT INTO settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)");
    $stmt->execute([$key, $jsonVal]);

    echo json_encode(["status" => "success", "message" => "Pengaturan $key tersimpan di MySQL"]);
    exit();
}

// Default Unknown Action
echo json_encode([
    "status" => "error",
    "message" => "Action tidak dikenal. Gunakan action: ping, get_all, get_collection, sync_collection, save_setting."
]);
