<?php 
// Require authentication
require_once '../check_auth.php';

// Fetch user's listings
try {
    $stmt = $pdo->prepare("
        SELECT 
            e.id,
            e.machinery_type,
            e.price,
            e.created_at,
            COUNT(ei.id) as image_count
        FROM equipment e
        LEFT JOIN equipment_images ei ON e.id = ei.equipment_id
        WHERE e.phone_number = ?
        GROUP BY e.id
        ORDER BY e.created_at DESC
    ");
    $stmt->execute([$currentUser['phone']]);
    $userListings = $stmt->fetchAll();
} catch (PDOException $e) {
    error_log("Fetch listings error: " . $e->getMessage());
    $userListings = [];
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Account - Khet Sahayak</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
    <link rel="stylesheet" href="account-style.css">
</head>
<body>
    <!-- Navigation Bar -->
    <nav class="navbar">
        <div class="nav-container">
            <div class="logo">
                <i class="fas fa-tractor"></i>
                <span>Khet Sahayak</span>
            </div>
            <ul class="nav-menu">
                <li class="nav-item">
                    <a href="equipment-home.html" class="nav-link">
                        <i class="fas fa-home"></i> <span>Home</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a href="#" class="nav-link" onclick="logout(event)">
                        <i class="fas fa-sign-out-alt"></i> <span>Logout</span>
                    </a>
                </li>
            </ul>
        </div>
    </nav>

    <!-- Main Content -->
    <main class="main-content">
        <div class="container">
            
            <!-- Account Details Section -->
            <div class="account-section">
                <div class="section-header">
                    <h2><i class="fas fa-user-circle"></i> Account Details</h2>
                </div>
                
                <div class="account-details">
                    <div class="detail-card">
                        <div class="detail-icon">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="detail-info">
                            <span class="detail-label">Full Name</span>
                            <span class="detail-value"><?php echo htmlspecialchars($currentUser['name']); ?></span>
                        </div>
                    </div>

                    <div class="detail-card">
                        <div class="detail-icon">
                            <i class="fas fa-phone"></i>
                        </div>
                        <div class="detail-info">
                            <span class="detail-label">Phone Number</span>
                            <span class="detail-value"><?php echo htmlspecialchars($currentUser['phone']); ?></span>
                        </div>
                    </div>

                    <div class="detail-card">
                        <div class="detail-icon">
                            <i class="fas fa-list"></i>
                        </div>
                        <div class="detail-info">
                            <span class="detail-label">Total Listings</span>
                            <span class="detail-value"><?php echo count($userListings); ?></span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- My Listings Section -->
            <div class="listings-section">
                <div class="section-header">
                    <h2><i class="fas fa-clipboard-list"></i> My Listings</h2>
                    <a href="index.html" class="btn btn-primary btn-small">
                        <i class="fas fa-plus"></i> Add New Listing
                    </a>
                </div>

                <?php if (empty($userListings)): ?>
                    <!-- No Listings -->
                    <div class="no-listings">
                        <i class="fas fa-inbox"></i>
                        <h3>No Listings Yet</h3>
                        <p>You haven't listed any equipment yet.</p>
                        <a href="index.html" class="btn btn-primary">
                            <i class="fas fa-plus"></i> List Your First Equipment
                        </a>
                    </div>
                <?php else: ?>
                    <!-- Listings Table -->
                    <div class="listings-table-wrapper">
                        <table class="listings-table">
                            <thead>
                                <tr>
                                    <th>Equipment Type</th>
                                    <th>Price</th>
                                    <th>Listed On</th>
                                    <th>Images</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($userListings as $listing): ?>
                                    <tr id="listing-<?php echo $listing['id']; ?>">
                                        <td>
                                            <div class="equipment-info">
                                                <i class="fas fa-tractor"></i>
                                                <span><?php echo ucwords(str_replace('_', ' ', htmlspecialchars($listing['machinery_type']))); ?></span>
                                            </div>
                                        </td>
                                        <td class="price-cell">
                                            ₹<?php echo number_format($listing['price'], 0); ?>
                                        </td>
                                        <td>
                                            <?php 
                                                $date = new DateTime($listing['created_at']);
                                                echo $date->format('d M Y');
                                            ?>
                                        </td>
                                        <td>
                                            <span class="image-count">
                                                <i class="fas fa-images"></i> <?php echo $listing['image_count']; ?>
                                            </span>
                                        </td>
                                        <td>
                                            <button 
                                                class="btn btn-danger btn-small" 
                                                onclick="deleteListing(<?php echo $listing['id']; ?>)"
                                            >
                                                <i class="fas fa-trash"></i> Delete
                                            </button>
                                        </td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                <?php endif; ?>
            </div>

        </div>
    </main>

    <!-- Delete Confirmation Modal -->
    <div id="deleteModal" class="modal" style="display: none;">
        <div class="modal-content">
            <i class="fas fa-exclamation-triangle warning-icon"></i>
            <h3>Delete Listing?</h3>
            <p>Are you sure you want to delete this listing? This action cannot be undone.</p>
            <div class="modal-buttons">
                <button class="btn btn-secondary" onclick="closeDeleteModal()">
                    <i class="fas fa-times"></i> Cancel
                </button>
                <button class="btn btn-danger" onclick="confirmDelete()">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    </div>

    <!-- Success Message -->
    <div id="successMessage" class="toast-message" style="display: none;">
        <i class="fas fa-check-circle"></i>
        <span id="successText"></span>
    </div>

    <script src="account-script.js"></script>
</body>
</html>