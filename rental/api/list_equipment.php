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
    // Validate required fields
    $required_fields = ['ownerName', 'phoneNumber', 'machineryType', 'price', 'location', 'availableFrom', 'availableUntil'];
    
    foreach ($required_fields as $field) {
        if (!isset($_POST[$field]) || empty(trim($_POST[$field]))) {
            http_response_code(400);
            echo json_encode(['error' => "Missing or empty field: $field"]);
            exit;
        }
    }

    // Sanitize inputs
    $ownerName = trim($_POST['ownerName']);
    $phoneNumber = trim($_POST['phoneNumber']);
    $machineryType = trim($_POST['machineryType']);
    $price = floatval($_POST['price']);
    $location = trim($_POST['location']);
    $availableFrom = $_POST['availableFrom'];
    $availableUntil = $_POST['availableUntil'];

    // Validate price
    if ($price <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Price must be greater than 0']);
        exit;
    }

    // Validate phone number (10 digits)
    if (!preg_match('/^[0-9]{10}$/', str_replace(' ', '', $phoneNumber))) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid phone number format']);
        exit;
    }

    // Validate dates
    $fromDate = new DateTime($availableFrom);
    $untilDate = new DateTime($availableUntil);
    
    if ($fromDate >= $untilDate) {
        http_response_code(400);
        echo json_encode(['error' => 'End date must be after start date']);
        exit;
    }

    // Begin database transaction
    $pdo->beginTransaction();

    // Insert equipment data
    $stmt = $pdo->prepare("
        INSERT INTO equipment 
        (owner_name, phone_number, machinery_type, price, location, available_from, available_until)
        VALUES (:owner_name, :phone_number, :machinery_type, :price, :location, :available_from, :available_until)
    ");

    $stmt->execute([
        ':owner_name' => $ownerName,
        ':phone_number' => $phoneNumber,
        ':machinery_type' => $machineryType,
        ':price' => $price,
        ':location' => $location,
        ':available_from' => $availableFrom,
        ':available_until' => $availableUntil
    ]);

    // Get the inserted equipment ID
    $equipmentId = $pdo->lastInsertId();

    // Handle image uploads
    $uploadDir = '../uploads/';
    
    // Create uploads directory if it doesn't exist
    if (!file_exists($uploadDir)) {
        if (!mkdir($uploadDir, 0755, true)) {
            throw new Exception("Failed to create upload directory");
        }
    }

    // Allowed image types
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    $maxFileSize = 5 * 1024 * 1024; // 5MB
    
    $imageOrder = 0;
    $uploadedImages = [];

    // Check for uploaded images (image_0 to image_4)
    for ($i = 0; $i < 5; $i++) {
        $fileKey = "image_$i";
        
        if (isset($_FILES[$fileKey]) && $_FILES[$fileKey]['error'] === UPLOAD_ERR_OK) {
            
            $tmpName = $_FILES[$fileKey]['tmp_name'];
            $originalName = $_FILES[$fileKey]['name'];
            $fileSize = $_FILES[$fileKey]['size'];
            $fileType = $_FILES[$fileKey]['type'];
            
            // Validate file type
            $imageInfo = getimagesize($tmpName);
            if ($imageInfo === false) {
                throw new Exception("File is not a valid image: $originalName");
            }
            
            // Validate MIME type
            if (!in_array($fileType, $allowedTypes)) {
                throw new Exception("Invalid file type. Only JPG, PNG, GIF, and WebP allowed.");
            }
            
            // Validate file size
            if ($fileSize > $maxFileSize) {
                throw new Exception("Image too large. Maximum size is 5MB.");
            }
            
            // Generate unique filename
            $extension = pathinfo($originalName, PATHINFO_EXTENSION);
            $newFileName = uniqid('equipment_', true) . '_' . $imageOrder . '.' . $extension;
            $uploadPath = $uploadDir . $newFileName;
            
            // Move uploaded file
            if (move_uploaded_file($tmpName, $uploadPath)) {
                $imageUrl = '/rental/uploads/' . $newFileName;
                
                // Insert image record into database
                $imgStmt = $pdo->prepare("
                    INSERT INTO equipment_images (equipment_id, image_url, image_order)
                    VALUES (:equipment_id, :image_url, :image_order)
                ");
                
                $imgStmt->execute([
                    ':equipment_id' => $equipmentId,
                    ':image_url' => $imageUrl,
                    ':image_order' => $imageOrder
                ]);
                
                $uploadedImages[] = $imageUrl;
                $imageOrder++;
            } else {
                throw new Exception("Failed to move uploaded file: $originalName");
            }
        }
    }

    // Commit transaction
    $pdo->commit();
    
    // Return success response
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Equipment listed successfully',
        'equipmentId' => $equipmentId,
        'imagesUploaded' => count($uploadedImages)
    ]);

} catch (PDOException $e) {
    // Rollback transaction on database error
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    
    // Log error
    error_log("Database Error: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode(['error' => 'Database error occurred. Please try again.']);
    
} catch (Exception $e) {
    // Rollback transaction on any error
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    
    // Log error
    error_log("Error: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>