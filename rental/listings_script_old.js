// Load listings when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadEquipmentListings();
    loadSavedLanguage();
});

// Translation dictionary
const translations = {
    en: {
        projectName: "Khet Sahayak",
        home: "Home",
        listEquipment: "List Equipment",
        pageTitle: "Available Equipment for Rent",
        pageSubtitle: "Browse through our collection of agricultural equipment",
        loading: "Loading equipment listings...",
        errorTitle: "Unable to Load Listings",
        errorMessage: "Please try again later or contact support.",
        noListingsTitle: "No Equipment Listed Yet",
        noListingsMessage: "Be the first to list your equipment!",
        listYourEquipment: "List Your Equipment",
        rentalPrice: "Rental Price",
        availability: "AVAILABILITY",
        viewFullListing: "View Full Listing",
        location: "Location"
    },
    hi: {
        projectName: "खेत सहायक",
        home: "होम",
        listEquipment: "उपकरण सूचीबद्ध करें",
        pageTitle: "किराए के लिए उपलब्ध उपकरण",
        pageSubtitle: "हमारे कृषि उपकरणों के संग्रह को देखें",
        loading: "उपकरण सूची लोड हो रही है...",
        errorTitle: "सूची लोड करने में असमर्थ",
        errorMessage: "कृपया बाद में पुनः प्रयास करें या सहायता से संपर्क करें।",
        noListingsTitle: "अभी तक कोई उपकरण सूचीबद्ध नहीं",
        noListingsMessage: "अपना उपकरण सूचीबद्ध करने वाले पहले बनें!",
        listYourEquipment: "अपना उपकरण सूचीबद्ध करें",
        rentalPrice: "किराया मूल्य",
        availability: "उपलब्धता",
        viewFullListing: "पूरी सूची देखें",
        location: "स्थान"
    },
    pa: {
        projectName: "ਖੇਤ ਸਹਾਇਕ",
        home: "ਹੋਮ",
        listEquipment: "ਸਾਜ਼ੋ-ਸਾਮਾਨ ਸੂਚੀਬੱਧ ਕਰੋ",
        pageTitle: "ਕਿਰਾਏ ਲਈ ਉਪਲਬਧ ਸਾਜ਼ੋ-ਸਾਮਾਨ",
        pageSubtitle: "ਸਾਡੇ ਖੇਤੀਬਾੜੀ ਸਾਜ਼ੋ-ਸਾਮਾਨ ਦੇ ਸੰਗ੍ਰਹਿ ਨੂੰ ਵੇਖੋ",
        loading: "ਸਾਜ਼ੋ-ਸਾਮਾਨ ਸੂਚੀ ਲੋਡ ਹੋ ਰਹੀ ਹੈ...",
        errorTitle: "ਸੂਚੀ ਲੋਡ ਕਰਨ ਵਿੱਚ ਅਸਮਰੱਥ",
        errorMessage: "ਕਿਰਪਾ ਕਰਕੇ ਬਾਅਦ ਵਿੱਚ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ ਜਾਂ ਸਹਾਇਤਾ ਨਾਲ ਸੰਪਰਕ ਕਰੋ।",
        noListingsTitle: "ਅਜੇ ਤੱਕ ਕੋਈ ਸਾਜ਼ੋ-ਸਾਮਾਨ ਸੂਚੀਬੱਧ ਨਹੀਂ",
        noListingsMessage: "ਆਪਣੇ ਸਾਜ਼ੋ-ਸਾਮਾਨ ਨੂੰ ਸੂਚੀਬੱਧ ਕਰਨ ਵਾਲੇ ਪਹਿਲੇ ਬਣੋ!",
        listYourEquipment: "ਆਪਣਾ ਸਾਜ਼ੋ-ਸਾਮਾਨ ਸੂਚੀਬੱਧ ਕਰੋ",
        rentalPrice: "ਕਿਰਾਏ ਦੀ ਕੀਮਤ",
        availability: "ਉਪਲਬਧਤਾ",
        viewFullListing: "ਪੂਰੀ ਸੂਚੀ ਦੇਖੋ",
        location: "ਸਥਾਨ"
    }
};

// Change language function
function changeLanguage(lang) {
    // Save preference
    localStorage.setItem('preferredLanguage', lang);
    
    // Update all elements with data-translate attribute
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[lang] && translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });
    
    // Update dynamically created cards
    updateCardTranslations(lang);
}

// Load saved language preference
function loadSavedLanguage() {
    const savedLang = localStorage.getItem('preferredLanguage') || 'en';
    document.getElementById('languageSelector').value = savedLang;
    if (savedLang !== 'en') {
        changeLanguage(savedLang);
    }
}

// Update translations in dynamically created cards
function updateCardTranslations(lang) {
    // Update rental price labels
    document.querySelectorAll('.price-label').forEach(element => {
        element.textContent = translations[lang].rentalPrice;
    });
    
    // Update availability labels
    document.querySelectorAll('.availability-label').forEach(element => {
        element.textContent = translations[lang].availability;
    });
    
    // Update view listing buttons
    document.querySelectorAll('.btn-primary span').forEach(element => {
        if (element.textContent.includes('View') || element.textContent.includes('देखें') || element.textContent.includes('ਦੇਖੋ')) {
            element.textContent = translations[lang].viewFullListing;
        }
    });
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
            // Show listings grid
            listingsGrid.style.display = 'grid';
            
            // Create cards for each equipment
            result.data.forEach(equipment => {
                const card = createEquipmentCard(equipment);
                listingsGrid.appendChild(card);
            });
            
            // Apply current language to new cards
            const currentLang = document.getElementById('languageSelector').value;
            if (currentLang !== 'en') {
                updateCardTranslations(currentLang);
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

function createEquipmentCard(equipment) {
    // Create card element
    const card = document.createElement('div');
    card.className = 'equipment-card';

    // Format price
    const formattedPrice = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(equipment.price);

    // Format dates
    const fromDate = formatDate(equipment.available_from);
    const untilDate = formatDate(equipment.available_until);

    // Equipment type display
    const equipmentTypeDisplay = capitalizeWords(equipment.machinery_type.replace(/_/g, ' '));

    // Create image carousel section
    let imageHTML = '';
    if (equipment.images && equipment.images.length > 0) {
        const imagesHtml = equipment.images.map((img, index) => 
    `<img src="${img}" alt="${equipmentTypeDisplay}" class="carousel-image ${index === 0 ? 'active' : ''}">`
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
            <span class="equipment-type">${equipmentTypeDisplay}</span>
            
            <h3 class="equipment-title">${equipmentTypeDisplay}</h3>
            
            <div class="card-details">
                <div class="detail-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${equipment.location}</span>
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