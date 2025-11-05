<?php
// Database configuration
$host = 'sql109.infinityfree.com';
$dbname = 'if0_40310507_khetsahayak';
$username = 'if0_40310507';
$password = 'Prabhsimrat28'; // Add your MySQL password here (leave empty if no password)

try {
    // Create PDO connection
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    
    // Set error mode to exception
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Set default fetch mode
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    
} catch(PDOException $e) {
    // Log error and show user-friendly message
    error_log("Database Connection Error: " . $e->getMessage());
    die(json_encode(['error' => 'Database connection failed. Please try again later.']));
}
?>