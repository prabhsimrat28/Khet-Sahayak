<?php
// Set headers for JSON response and CORS
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

// Include database configuration
require_once '../config.php';

// Only accept GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

try {
    // Get all equipment ordered by newest first
    $stmt = $pdo->query("
        SELECT 
            id,
            owner_name,
            phone_number,
            machinery_type,
            price,
            location,
            available_from,
            available_until,
            created_at,
            updated_at
        FROM equipment 
        ORDER BY created_at DESC
    ");
    
    $equipment = $stmt->fetchAll();
    
    // Get images for each equipment
    foreach ($equipment as &$item) {
        $imgStmt = $pdo->prepare("
            SELECT 
                image_url,
                image_order
            FROM equipment_images 
            WHERE equipment_id = :equipment_id
            ORDER BY image_order ASC
        ");
        
        $imgStmt->execute([':equipment_id' => $item['id']]);
        $images = $imgStmt->fetchAll(PDO::FETCH_COLUMN);
        
        $item['images'] = $images;
        $item['image_count'] = count($images);
    }
    
    // Return success response
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'count' => count($equipment),
        'data' => $equipment
    ]);

} catch (PDOException $e) {
    // Log error
    error_log("Database Error: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode(['error' => 'Failed to retrieve equipment listings']);
}
?>

