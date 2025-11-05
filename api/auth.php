<?php
session_start();

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Include database config
require_once '../rental/config.php';

// Get JSON input
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Validate action
if (!isset($data['action'])) {
    echo json_encode(['success' => false, 'message' => 'Action is required']);
    exit;
}

$action = $data['action'];

// Handle Signup
if ($action === 'signup') {
    handleSignup($pdo, $data);
}
// Handle Login
elseif ($action === 'login') {
    handleLogin($pdo, $data);
}
// Handle Logout
elseif ($action === 'logout') {
    handleLogout($pdo);
}
else {
    echo json_encode(['success' => false, 'message' => 'Invalid action']);
}

// Signup Function
function handleSignup($pdo, $data) {
    // Validate required fields
    if (empty($data['name']) || empty($data['phone']) || empty($data['password'])) {
        echo json_encode(['success' => false, 'message' => 'All fields are required']);
        return;
    }

    $name = trim($data['name']);
    $phone = trim($data['phone']);
    $password = $data['password'];

    // Validate name
    if (strlen($name) < 2) {
        echo json_encode(['success' => false, 'message' => 'Name must be at least 2 characters']);
        return;
    }

    // Validate phone (10 digits, starts with 6-9)
    if (!preg_match('/^[6-9]\d{9}$/', $phone)) {
        echo json_encode(['success' => false, 'message' => 'Invalid phone number']);
        return;
    }

    // Validate password
    if (strlen($password) < 6) {
        echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters']);
        return;
    }

    try {
        // Check if phone already exists
        $stmt = $pdo->prepare("SELECT id FROM users WHERE phone = ?");
        $stmt->execute([$phone]);
        
        if ($stmt->fetch()) {
            echo json_encode(['success' => false, 'message' => 'Phone number already registered']);
            return;
        }

        // Hash password
        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

        // Insert user
        $stmt = $pdo->prepare("
            INSERT INTO users (name, phone, password) 
            VALUES (?, ?, ?)
        ");
        
        $stmt->execute([$name, $phone, $hashedPassword]);

        echo json_encode([
            'success' => true, 
            'message' => 'Account created successfully'
        ]);

    } catch (PDOException $e) {
        error_log("Signup Error: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Database error occurred']);
    }
}

// Login Function
function handleLogin($pdo, $data) {
    // Validate required fields
    if (empty($data['phone']) || empty($data['password'])) {
        echo json_encode(['success' => false, 'message' => 'Phone and password are required']);
        return;
    }

    $phone = trim($data['phone']);
    $password = $data['password'];

    // Validate phone
    if (!preg_match('/^[6-9]\d{9}$/', $phone)) {
        echo json_encode(['success' => false, 'message' => 'Invalid phone number']);
        return;
    }

    try {
        // Get user by phone
        $stmt = $pdo->prepare("SELECT id, name, phone, password, is_active FROM users WHERE phone = ?");
        $stmt->execute([$phone]);
        $user = $stmt->fetch();

        if (!$user) {
            echo json_encode(['success' => false, 'message' => 'Invalid phone or password']);
            return;
        }

        // Check if account is active
        if (!$user['is_active']) {
            echo json_encode(['success' => false, 'message' => 'Account is deactivated']);
            return;
        }

        // Verify password
        if (!password_verify($password, $user['password'])) {
            echo json_encode(['success' => false, 'message' => 'Invalid phone or password']);
            return;
        }

        // Generate session token
        $sessionToken = bin2hex(random_bytes(32));
        $expiresAt = date('Y-m-d H:i:s', strtotime('+7 days'));
        $ipAddress = $_SERVER['REMOTE_ADDR'] ?? null;
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? null;

        // Create session in database
        $stmt = $pdo->prepare("
            INSERT INTO user_sessions (user_id, session_token, expires_at, ip_address, user_agent)
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->execute([$user['id'], $sessionToken, $expiresAt, $ipAddress, $userAgent]);

        // Update last login
        $stmt = $pdo->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
        $stmt->execute([$user['id']]);

        // Set session
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_name'] = $user['name'];
        $_SESSION['user_phone'] = $user['phone'];
        $_SESSION['session_token'] = $sessionToken;

        echo json_encode([
            'success' => true,
            'message' => 'Login successful',
            'user' => [
                'id' => $user['id'],
                'name' => $user['name'],
                'phone' => $user['phone']
            ],
            'token' => $sessionToken
        ]);

    } catch (PDOException $e) {
        error_log("Login Error: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Database error occurred']);
    }
}

// Logout Function
function handleLogout($pdo) {
    if (isset($_SESSION['session_token'])) {
        try {
            // Delete session from database
            $stmt = $pdo->prepare("DELETE FROM user_sessions WHERE session_token = ?");
            $stmt->execute([$_SESSION['session_token']]);
        } catch (PDOException $e) {
            error_log("Logout Error: " . $e->getMessage());
        }
    }

    // Destroy PHP session
    session_unset();
    session_destroy();

    echo json_encode(['success' => true, 'message' => 'Logged out successfully']);
}
?>