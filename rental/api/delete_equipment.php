<?php
// Set headers for JSON response and CORS
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Include database configuration
require_once '../config.php';

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

try {
    // Get JSON input
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (!isset($data['equipmentId']) || empty($data['equipmentId'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Equipment ID is required']);
        exit;
    }
    
    $equipmentId = intval($data['equipmentId']);
    
    // Begin transaction
    $pdo->beginTransaction();
    
    // Get image URLs before deleting (to delete files)
    $stmt = $pdo->prepare("SELECT image_url FROM equipment_images WHERE equipment_id = ?");
    $stmt->execute([$equipmentId]);
    $images = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    // Delete equipment (CASCADE will delete images from database)
    $stmt = $pdo->prepare("DELETE FROM equipment WHERE id = ?");
    $result = $stmt->execute([$equipmentId]);
    
    if ($stmt->rowCount() === 0) {
        $pdo->rollBack();
        http_response_code(404);
        echo json_encode(['error' => 'Equipment not found']);
        exit;
    }
    
    // Delete physical image files
    foreach ($images as $imageUrl) {
        $imagePath = '../' . ltrim($imageUrl, '/');
        if (file_exists($imagePath)) {
            unlink($imagePath);
        }
    }
    
    // Commit transaction
    $pdo->commit();
    
    // Return success response
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Equipment deleted successfully'
    ]);

} catch (PDOException $e) {
    // Rollback transaction on error
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    
    // Log error
    error_log("Database Error: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode(['error' => 'Database error occurred']);
    
} catch (Exception $e) {
    // Rollback transaction on error
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    
    // Log error
    error_log("Error: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>