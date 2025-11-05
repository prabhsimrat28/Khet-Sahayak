// Global variable to store listing ID to delete
let listingToDelete = null;

// Delete listing function
function deleteListing(listingId) {
    listingToDelete = listingId;
    document.getElementById('deleteModal').style.display = 'flex';
}

// Close delete modal
function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
    listingToDelete = null;
}

// Confirm delete
async function confirmDelete() {
    if (!listingToDelete) return;

    const modal = document.getElementById('deleteModal');
    const deleteBtn = modal.querySelector('.btn-danger');
    
    // Disable button
    deleteBtn.disabled = true;
    deleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';

    try {
        const response = await fetch('api/delete_equipment.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                equipmentId: listingToDelete
            })
        });

        const result = await response.json();

        if (result.success) {
            // Remove row from table
            const row = document.getElementById(`listing-${listingToDelete}`);
            if (row) {
                row.style.opacity = '0';
                row.style.transform = 'translateX(-20px)';
                setTimeout(() => {
                    row.remove();
                    
                    // Check if table is empty
                    const tbody = document.querySelector('.listings-table tbody');
                    if (tbody && tbody.children.length === 0) {
                        // Reload page to show "no listings" message
                        location.reload();
                    }
                }, 300);
            }

            // Close modal
            closeDeleteModal();

            // Show success message
            showToast('Listing deleted successfully');

            // Update total listings count
            updateListingCount();

        } else {
            alert('Failed to delete listing: ' + (result.error || 'Unknown error'));
        }

    } catch (error) {
        console.error('Delete error:', error);
        alert('Error deleting listing. Please try again.');
    } finally {
        deleteBtn.disabled = false;
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Delete';
    }
}

// Update listing count in account details
function updateListingCount() {
    const rows = document.querySelectorAll('.listings-table tbody tr');
    const countElement = document.querySelector('.detail-card:nth-child(3) .detail-value');
    if (countElement) {
        countElement.textContent = rows.length;
    }
}

// Show toast message
function showToast(message) {
    const toast = document.getElementById('successMessage');
    const textElement = document.getElementById('successText');
    
    textElement.textContent = message;
    toast.style.display = 'flex';

    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

// Logout function
async function logout(e) {
    e.preventDefault();
    
    const confirmLogout = confirm('Are you sure you want to logout?');
    if (!confirmLogout) return;

    try {
        const response = await fetch('../api/auth.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'logout'
            })
        });

        const result = await response.json();

        if (result.success) {
            window.location.href = '../auth.html';
        }

    } catch (error) {
        console.error('Logout error:', error);
        // Redirect anyway
        window.location.href = '../auth.html';
    }
}

// Close modal on outside click
window.onclick = function(event) {
    const modal = document.getElementById('deleteModal');
    if (event.target === modal) {
        closeDeleteModal();
    }
}