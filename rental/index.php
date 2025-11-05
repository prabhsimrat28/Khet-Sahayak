<?php require_once '../check_auth.php'; ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Equipment Listing - List Your Machinery</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <!-- Navigation Bar -->
    <nav class="navbar">
        <div class="nav-container">
            <div class="logo">
                <i class="fas fa-tractor"></i>
                <span data-translate="projectName">Khet Sahayak</span>
            </div>
            <ul class="nav-menu">
                <li class="nav-item">
                    <a href="../index2.html" class="nav-link">
                        <i class="fas fa-home"></i> <span data-translate="home">Home</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a href="listings.html" class="nav-link">
                        <i class="fas fa-list"></i> <span data-translate="viewListings">View Listings</span>
                    </a>
                </li>
                <li class="nav-item">
                    <select id="languageSelector" class="language-selector" onchange="changeLanguage(this.value)">
                        <option value="en">English</option>
                        <option value="hi">हिंदी (Hindi)</option>
                        <option value="pa">ਪੰਜਾਬੀ (Punjabi)</option>
                    </select>
                </li>
                <li class="nav-item">
    				<a href="account.php" class="nav-link">
        				<i class="fas fa-user"></i> <span data-translate="account">Account</span>
    				</a>
				</li>
            </ul>
        </div>
    </nav>

    <div class="container">
        <div class="form-wrapper">
            <h1 data-translate="pageTitle">List Your Equipment</h1>
            <p class="subtitle" data-translate="pageSubtitle">Fill in the details below to list your machinery</p>
            
            <form id="equipmentForm" enctype="multipart/form-data">
                
                <!-- Owner Information Section -->
                <fieldset>
                    <legend data-translate="ownerInfo">Owner Information</legend>
                    
                    <div class="form-group">
                        <label for="ownerName" data-translate="ownerNameLabel">Owner Name *</label>
                        <input 
                            type="text" 
                            id="ownerName" 
                            name="ownerName" 
                            placeholder="Enter your full name"
                            required
                        >
                        <span class="error-msg" id="ownerNameError"></span>
                    </div>

                    <div class="form-group">
                        <label for="phoneNumber" data-translate="phoneLabel">Phone Number *</label>
                        <input 
                            type="tel" 
                            id="phoneNumber" 
                            name="phoneNumber" 
                            placeholder="Enter your contact number"
                            required
                        >
                        <span class="error-msg" id="phoneNumberError"></span>
                    </div>

                </fieldset>

                <!-- Equipment Details Section -->
                <fieldset>
                    <legend data-translate="equipmentDetails">Equipment Details</legend>
                    
                    <div class="form-group">
                        <label for="machineryType">Type of Machinery *</label>
                        <select id="machineryType" name="machineryType" required>
                            <option value="">-- Select Equipment Type --</option>
                            <option value="excavator">Excavator</option>
                            <option value="bulldozer">Bulldozer</option>
                            <option value="crane">Crane</option>
                            <option value="roller">Compactor/Roller</option>
                            <option value="loader">Loader</option>
                            <option value="generator">Generator</option>
                            <option value="pump">Water Pump</option>
                            <option value="compressor">Air Compressor</option>
                            <option value="drill">Drill Machine</option>
                            <option value="welding">Welding Machine</option>
                            <option value="other">Other</option>
                        </select>
                        <span class="error-msg" id="machineryTypeError"></span>
                    </div>

                    <div class="form-group">
                        <label for="price">Price (₹) *</label>
                        <input 
                            type="number" 
                            id="price" 
                            name="price" 
                            placeholder="Enter rental/sale price"
                            min="0"
                            step="0.01"
                            required
                        >
                        <span class="error-msg" id="priceError"></span>
                    </div>

                </fieldset>

                <!-- Location & Availability Section -->
                <fieldset>
                    <legend data-translate="locationAvailability">Location & Availability</legend>
                    
                    <div class="form-group">
                        <label for="location">Location *</label>
                        <input 
                            type="text" 
                            id="location" 
                            name="location" 
                            placeholder="Enter location (City, State)"
                            required
                        >
                        <span class="error-msg" id="locationError"></span>
                    </div>

                    <div class="time-slot-group">
                        <div class="form-group">
                            <label for="availableFrom">Available From *</label>
                            <input 
                                type="datetime-local" 
                                id="availableFrom" 
                                name="availableFrom"
                                required
                            >
                            <span class="error-msg" id="availableFromError"></span>
                        </div>

                        <div class="form-group">
                            <label for="availableUntil">Available Until *</label>
                            <input 
                                type="datetime-local" 
                                id="availableUntil" 
                                name="availableUntil"
                                required
                            >
                            <span class="error-msg" id="availableUntilError"></span>
                        </div>
                    </div>

                </fieldset>

                <!-- Image Upload Section -->
                <fieldset>
                    <legend data-translate="uploadImages">Upload Images (Up to 5)</legend>
                    
                    <div class="image-upload-container">
                        <label for="images" class="upload-label">
                            <div class="upload-box">
                                <span class="upload-icon">📸</span>
                                <p>Click to select images or drag & drop</p>
                                <small>PNG, JPG, GIF up to 5MB each (Max 5 images)</small>
                            </div>
                            <input 
                                type="file" 
                                id="images" 
                                name="images" 
                                multiple 
                                accept="image/*"
                            >
                        </label>
                        <span class="error-msg" id="imagesError"></span>
                    </div>

                    <div id="imagePreviewContainer" class="image-preview-container"></div>
                </fieldset>

                <!-- Submit Button -->
                <button type="submit" class="submit-btn" data-translate="submitBtn">List Equipment</button>
                <span class="success-msg" id="successMsg"></span>

            </form>
        </div>
    </div>

    <script src="script.js"></script>
</body>
</html>