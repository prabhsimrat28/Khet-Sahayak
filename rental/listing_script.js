// Load listings when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadEquipmentListings();
    loadSavedLanguage();
});

// Translation cache to avoid re-translating same text
const translationCache = {};

// Change language function with API translation
async function changeLanguage(lang) {
    // Save preference
    localStorage.setItem('preferredLanguage', lang);
    
    // Update language selector
    document.getElementById('languageSelector').value = lang;
    
    if (lang === 'en') {
        // Reload page to show original English text
        location.reload();
        return;
    }
    
    // Show loading indicator
    showTranslationLoading(true);
    
    try {
        // Translate static text elements
        const elementsToTranslate = document.querySelectorAll('[data-translate]');
        for (const element of elementsToTranslate) {
            const originalText = element.textContent.trim();
            if (originalText) {
                const translated = await translateText(originalText, lang);
                element.textContent = translated;
            }
        }
        
        // Translate dynamic card content
        await translateDynamicContent(lang);
        
    } catch (error) {
        console.error('Translation error:', error);
        alert('Translation failed. Showing English version.');
    } finally {
        showTranslationLoading(false);
    }
}

// Translate text using MyMemory API
async function translateText(text, targetLang) {
    // Check cache first
    const cacheKey = `${text}_${targetLang}`;
    if (translationCache[cacheKey]) {
        return translationCache[cacheKey];
    }
    
    // Map language codes
    const langMap = {
        'hi': 'hi',  // Hindi
        'pa': 'pa'   // Punjabi
    };
    
    const langCode = langMap[targetLang] || targetLang;
    
    try {
        const response = await fetch(
            `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${langCode}`
        );
        
        const data = await response.json();
        
        if (data.responseStatus === 200 && data.responseData.translatedText) {
            const translated = data.responseData.translatedText;
            translationCache[cacheKey] = translated;
            return translated;
        }
        
        return text; // Return original if translation fails
        
    } catch (error) {
        console.error('Translation API error:', error);
        return text;
    }
}

// Translate dynamic card content
async function translateDynamicContent(lang) {
    // Translate equipment types
    const equipmentTypes = document.querySelectorAll('.equipment-type-text');
    for (const element of equipmentTypes) {
        const originalText = element.textContent.trim();
        if (originalText) {
            element.textContent = await translateText(originalText, lang);
        }
    }
    
    // Translate equipment titles
    const equipmentTitles = document.querySelectorAll('.equipment-title-text');
    for (const element of equipmentTitles) {
        const originalText = element.textContent.trim();
        if (originalText) {
            element.textContent = await translateText(originalText, lang);
        }
    }
    
    // Translate locations
    const locations = document.querySelectorAll('.location-text');
    for (const element of locations) {
        const originalText = element.textContent.trim();
        if (originalText) {
            element.textContent = await translateText(originalText, lang);
        }
    }
    
    // Translate labels
    const priceLabels = document.querySelectorAll('.price-label');
    for (const element of priceLabels) {
        element.textContent = await translateText('Rental Price', lang);
    }
    
    const availabilityLabels = document.querySelectorAll('.availability-label');
    for (const element of availabilityLabels) {
        element.textContent = await translateText('AVAILABILITY', lang);
    }
    
    // Translate buttons
    const buttonSpans = document.querySelectorAll('.btn-primary span');
    for (const element of buttonSpans) {
        element.textContent = await translateText('View Full Listing', lang);
    }
}

// Show/hide translation loading indicator
function showTranslationLoading(show) {
    let loader = document.getElementById('translationLoader');
    
    if (show && !loader) {
        loader = document.createElement('div');
        loader.id = 'translationLoader';
        loader.style.cssText = `
            position: fixed;
            top: 60px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 168, 89, 0.95);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            z-index: 10000;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        `;
        loader.innerHTML = '<i class="fas fa-language"></i> Translating...';
        document.body.appendChild(loader);
    } else if (!show && loader) {
        loader.remove();
    }
}

// Load saved language preference
function loadSavedLanguage() {
    const savedLang = localStorage.getItem('preferredLanguage') || 'en';
    document.getElementById('languageSelector').value = savedLang;
    if (savedLang !== 'en') {
        changeLanguage(savedLang);
    }
}

async function loadEquipmentListings() {
    const loadingState = document.getElementById('loadingState');
    const errorState = document.getElementById('errorState');
    const noListingsState = document.getElementById('noListingsState');
    const listingsGrid = document.getElementById('listingsGrid');

    try {
        // Fetch data from API
        const response = await fetch('api/get_equipment.php');
        
        if (!response.ok) {
            throw new Error('Failed to fetch listings');
        }

        const result = await response.json();

        // Hide loading state
        loadingState.style.display = 'none';

        // Check if we have data
        if (result.success && result.data && result.data.length > 0) {
            // Store all data for filtering
            allEquipmentData = result.data;
            
            // Extract unique locations
            uniqueLocations = [...new Set(result.data.map(item => item.location))].sort();
            
            // Display all listings initially
            displayListings(allEquipmentData);
            
            // Apply current language to new cards
            const currentLang = document.getElementById('languageSelector').value;
            if (currentLang !== 'en') {
                translateDynamicContent(currentLang);
            }
        } else {
            // Show no listings state
            noListingsState.style.display = 'block';
        }

    } catch (error) {
        console.error('Error loading listings:', error);
        
        // Hide loading state and show error
        loadingState.style.display = 'none';
        errorState.style.display = 'block';
    }
}

// Handle location input with autocomplete
function handleLocationInput(value) {
    const dropdown = document.getElementById('locationDropdown');
    
    // Clear selected location if input is cleared
    if (!value) {
        selectedLocation = 'all';
        dropdown.classList.remove('show');
        applyFilters();
        return;
    }
    
    // Only show suggestions if 3 or more characters
    if (value.length < 3) {
        dropdown.classList.remove('show');
        return;
    }
    
    // Filter locations based on input
    const searchTerm = value.toLowerCase();
    const matchingLocations = uniqueLocations.filter(location => 
        location.toLowerCase().includes(searchTerm)
    );
    
    // Show dropdown with results
    showLocationDropdown(matchingLocations, value);
}

// Show location dropdown with matching results
function showLocationDropdown(locations, searchTerm) {
    const dropdown = document.getElementById('locationDropdown');
    dropdown.innerHTML = '';
    
    if (locations.length === 0) {
        dropdown.innerHTML = '<div class="autocomplete-no-results">No matching locations found</div>';
        dropdown.classList.add('show');
        return;
    }
    
    // Add "All Locations" option
    const allOption = document.createElement('div');
    allOption.className = 'autocomplete-item autocomplete-all-option';
    allOption.innerHTML = '<i class="fas fa-globe"></i> All Locations';
    allOption.onclick = () => selectLocation('all', 'All Locations');
    dropdown.appendChild(allOption);
    
    // Add matching locations
    locations.forEach(location => {
        const item = document.createElement('div');
        item.className = 'autocomplete-item';
        
        // Highlight matching text
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        const highlightedText = location.replace(regex, '<strong>$1</strong>');
        
        item.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${highlightedText}`;
        item.onclick = () => selectLocation(location, location);
        dropdown.appendChild(item);
    });
    
    dropdown.classList.add('show');
}

// Select location from dropdown
function selectLocation(location, displayText) {
    selectedLocation = location;
    document.getElementById('locationFilter').value = displayText;
    document.getElementById('locationDropdown').classList.remove('show');
    applyFilters();
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const autocompleteWrapper = document.querySelector('.autocomplete-wrapper');
    const dropdown = document.getElementById('locationDropdown');
    
    if (autocompleteWrapper && !autocompleteWrapper.contains(event.target)) {
        dropdown.classList.remove('show');
    }
});

// Populate location filter dropdown (REMOVED - no longer needed)

// Display listings
function displayListings(equipmentList) {
    const listingsGrid = document.getElementById('listingsGrid');
    listingsGrid.innerHTML = '';
    listingsGrid.style.display = 'grid';
    
    if (equipmentList.length === 0) {
        listingsGrid.style.display = 'block';
        listingsGrid.innerHTML = '<div class="no-results"><i class="fas fa-search"></i><p>No equipment found matching your filters.</p></div>';
        return;
    }
    
    equipmentList.forEach(equipment => {
        const card = createEquipmentCard(equipment);
        listingsGrid.appendChild(card);
    });
}

// Apply filters
function applyFilters() {
    const sortFilter = document.getElementById('sortFilter').value;
    
    let filteredData = [...allEquipmentData];
    
    // Filter by location
    if (selectedLocation !== 'all') {
        filteredData = filteredData.filter(item => item.location === selectedLocation);
    }
    
    // Sort data
    switch(sortFilter) {
        case 'newest':
            filteredData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            break;
        case 'oldest':
            filteredData.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            break;
        case 'price-low':
            filteredData.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
            break;
        case 'price-high':
            filteredData.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
            break;
    }
    
    // Display filtered results
    displayListings(filteredData);
    
    // Reapply translations if needed
    const currentLang = document.getElementById('languageSelector').value;
    if (currentLang !== 'en') {
        translateDynamicContent(currentLang);
    }
}

// Clear all filters
function clearFilters() {
    selectedLocation = 'all';
    document.getElementById('locationFilter').value = '';
    document.getElementById('sortFilter').value = 'newest';
    document.getElementById('locationDropdown').classList.remove('show');
    applyFilters();
}

function createEquipmentCard(equipment) {
    // Create card element
    const card = document.createElement('div');
    card.className = 'equipment-card';
    
    // Store original data for translation
    card.dataset.equipmentType = equipment.machinery_type;
    card.dataset.location = equipment.location;

    // Format price
    const formattedPrice = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(equipment.price);

    // Format dates
    const fromDate = formatDate(equipment.available_from);
    const untilDate = formatDate(equipment.available_until);

    // Equipment type display (always show English initially)
    const equipmentTypeDisplay = capitalizeWords(equipment.machinery_type.replace(/_/g, ' '));

    // Create image carousel section
    let imageHTML = '';
    if (equipment.images && equipment.images.length > 0) {
        const imagesHtml = equipment.images.map((img, index) => 
            `<img src="${img}" alt="${equipmentTypeDisplay}" class="carousel-image ${index === 0 ? 'active' : ''}" loading="lazy">`
        ).join('');
        
        const navigationHTML = equipment.images.length > 1 ? `
            <button class="carousel-btn prev-btn" onclick="changeImage(event, -1)">
                <i class="fas fa-chevron-left"></i>
            </button>
            <button class="carousel-btn next-btn" onclick="changeImage(event, 1)">
                <i class="fas fa-chevron-right"></i>
            </button>
            <div class="carousel-dots">
                ${equipment.images.map((_, index) => 
                    `<span class="dot ${index === 0 ? 'active' : ''}" onclick="goToImage(event, ${index})"></span>`
                ).join('')}
            </div>
        ` : '';
        
        imageHTML = `
            <div class="card-image">
                <div class="image-carousel">
                    ${imagesHtml}
                </div>
                ${navigationHTML}
            </div>
        `;
    } else {
        imageHTML = `
            <div class="card-image">
                <div class="card-image-placeholder">
                    <i class="fas fa-tractor"></i>
                </div>
            </div>
        `;
    }

    // Build card HTML
    card.innerHTML = `
        ${imageHTML}
        <div class="card-content">
            <span class="equipment-type equipment-type-text">${equipmentTypeDisplay}</span>
            
            <h3 class="equipment-title equipment-title-text">${equipmentTypeDisplay}</h3>
            
            <div class="card-details">
                <div class="detail-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <span class="location-text">${equipment.location}</span>
                </div>
            </div>
            
            <div class="price-section">
                <div class="price-label">Rental Price</div>
                <div class="price">${formattedPrice}</div>
            </div>
            
            <div class="availability-section">
                <div class="availability-label">AVAILABILITY</div>
                <div class="availability-dates">
                    <i class="fas fa-calendar-alt"></i>
                    <span>${fromDate} - ${untilDate}</span>
                </div>
            </div>
            
            <a href="view-listing.html?id=${equipment.id}" class="btn btn-primary btn-block">
                <i class="fas fa-eye"></i> <span>View Full Listing</span>
            </a>
        </div>
    `;

    return card;
}

// Helper function to format dates
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric'
    };
    return date.toLocaleDateString('en-IN', options);
}

// Helper function to capitalize words
function capitalizeWords(str) {
    return str.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
}

// Carousel navigation functions
function changeImage(event, direction) {
    event.preventDefault();
    event.stopPropagation();
    
    const card = event.target.closest('.equipment-card');
    const images = card.querySelectorAll('.carousel-image');
    const dots = card.querySelectorAll('.dot');
    
    let currentIndex = 0;
    images.forEach((img, index) => {
        if (img.classList.contains('active')) {
            currentIndex = index;
        }
    });
    
    images[currentIndex].classList.remove('active');
    dots[currentIndex].classList.remove('active');
    
    let newIndex = currentIndex + direction;
    if (newIndex >= images.length) newIndex = 0;
    if (newIndex < 0) newIndex = images.length - 1;
    
    images[newIndex].classList.add('active');
    dots[newIndex].classList.add('active');
}

function goToImage(event, index) {
    event.preventDefault();
    event.stopPropagation();
    
    const card = event.target.closest('.equipment-card');
    const images = card.querySelectorAll('.carousel-image');
    const dots = card.querySelectorAll('.dot');
    
    images.forEach(img => img.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    images[index].classList.add('active');
    dots[index].classList.add('active');
}