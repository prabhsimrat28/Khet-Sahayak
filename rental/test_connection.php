<?php
require_once 'config.php';

echo "<h2>Testing Database Connection</h2>";

try {
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM equipment");
    $result = $stmt->fetch();
    
    echo "<p style='color: green; font-weight: bold;'>✓ CONNECTION SUCCESSFUL!</p>";
    echo "<p>Equipment count: " . $result['count'] . "</p>";
    
} catch(Exception $e) {
    echo "<p style='color: red; font-weight: bold;'>✗ CONNECTION FAILED!</p>";
    echo "<p>Error: " . $e->getMessage() . "</p>";
}
?>