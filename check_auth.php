<?php
// Include this file at the top of pages that require authentication
session_start();

// Check if user is logged in
if (!isset($_SESSION['user_id']) || !isset($_SESSION['session_token'])) {
    // Redirect to auth page
    header('Location: ../auth.html');
    exit;
}

// Determine config path based on file location
$configPath = __DIR__ . '/rental/config.php';
echo "Step 3: config path = $configPath<br>";
if (!file_exists($configPath)) {
    die('Config file not found');
}

if (!file_exists($configPath)) {
    die('Config file not found at: ' . $configPath);
}

// Include database
require_once $configPath;

try {
    // Verify session token in database
    $stmt = $pdo->prepare("
        SELECT us.*, u.name, u.phone, u.is_active
        FROM user_sessions us
        JOIN users u ON us.user_id = u.id
        WHERE us.session_token = ? AND us.expires_at > NOW()
    ");
    $stmt->execute([$_SESSION['session_token']]);
    $session = $stmt->fetch();

    if (!$session) {
        // Invalid or expired session
        session_unset();
        session_destroy();
        header('Location: ../auth.html');
        exit;
    }

    // Check if user is active
    if (!$session['is_active']) {
        session_unset();
        session_destroy();
        header('Location: ../auth.html');
        exit;
    }

    // Session is valid - set user info
    $currentUser = [
        'id' => $session['user_id'],
        'name' => $session['name'],
        'phone' => $session['phone']
    ];

} catch (PDOException $e) {
    error_log("Session Check Error: " . $e->getMessage());
    header('Location: ../auth.html');
    exit;
}
?>