<?php
require_once 'config.php';

echo "<h2>Fixing Image Paths</h2>";

try {
    // Get all images
    $stmt = $pdo->query("SELECT id, image_url FROM equipment_images");
    $images = $stmt->fetchAll();
    
    echo "<p>Found " . count($images) . " images</p>";
    
    $fixed = 0;
    foreach ($images as $image) {
        echo "<p>Current path: {$image['image_url']}</p>";
        
        // If path starts with /, remove it
        if (strpos($image['image_url'], '/') === 0) {
            $newUrl = substr($image['image_url'], 1); // Remove leading /
            
            $updateStmt = $pdo->prepare("UPDATE equipment_images SET image_url = ? WHERE id = ?");
            $updateStmt->execute([$newUrl, $image['id']]);
            
            echo "<p style='color: green;'>✓ Fixed to: {$newUrl}</p>";
            $fixed++;
        } else {
            echo "<p style='color: blue;'>Already correct</p>";
        }
    }
    
    echo "<hr>";
    echo "<p style='color: green; font-weight: bold; font-size: 18px;'>✓ Fixed $fixed image paths!</p>";
    echo "<p><a href='view_listings.html' style='background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;'>View Listings Now</a></p>";
    
} catch (Exception $e) {
    echo "<p style='color: red;'>Error: " . $e->getMessage() . "</p>";
}
?>