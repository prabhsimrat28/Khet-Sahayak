// Global variables
let currentEquipment = null;
let currentImageIndex = 0;
let totalImages = 0;

// Translation cache
const translationCache = {};

// Load equipment details when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadSavedLanguage();
    loadEquipmentDetails();
});

// Get equipment ID from URL
function getEquipmentId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Load equipment details from API
async function loadEquipmentDetails() {
    const equipmentId = getEquipmentId();
    
    if (!equipmentId) {
        showError();
        return;
    }

    const loadingState = document.getElementById('loadingState');
    const errorState = document.getElementById('errorState');
    const equipmentDetails = document.getElementById('equipmentDetails');

    try {
        const response = await fetch(`api/get_equipment.php`);
        const result = await response.json();

        if (result.success && result.data) {
            // Find the specific equipment
            const equipment = result.data.find(item => item.id == equipmentId);
            
            if (equipment) {
                currentEquipment = equipment;
                displayEquipmentDetails(equipment);
                
                // Hide loading, show content
                loadingState.style.display = 'none';
                equipmentDetails.style.display = 'block';
                
                // Apply translation if needed
                const currentLang = document.getElementById('languageSelector').value;
                if (currentLang !== 'en') {
                    translatePage(currentLang);
                }
            } else {
                showError();
            }
        } else {
            showError();
        }
    } catch (error) {
        console.error('Error loading equipment:', error);
        showError();
    }
}

// Display equipment details
function displayEquipmentDetails(equipment) {
    // Display images
    displayImages(equipment.images);
    
    // Display basic info
    const equipmentTypeDisplay = capitalizeWords(equipment.machinery_type.replace(/_/g, ' '));
    document.getElementById('equipmentType').textContent = equipmentTypeDisplay;
    document.getElementById('equipmentTitle').textContent = equipmentTypeDisplay;
    
    // Format and display price
    const formattedPrice = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(equipment.price);
    document.getElementById('equipmentPrice').textContent = formattedPrice;
    
    // Display details
    document.getElementById('ownerName').textContent = equipment.owner_name;
    document.getElementById('location').textContent = equipment.location;
    document.getElementById('availableFrom').textContent = formatDate(equipment.available_from);
    document.getElementById('availableUntil').textContent = formatDate(equipment.available_until);
    
    // Store phone number (hidden initially)
    document.getElementById('phoneNumber').textContent = equipment.phone_number;
}

// Display images in carousel
function displayImages(images) {
    const mainCarousel = document.getElementById('mainCarousel');
    const carouselDots = document.getElementById('carouselDots');
    
    if (!images || images.length === 0) {
        mainCarousel.innerHTML = '<div class="carousel-image-placeholder active"><i class="fas fa-tractor"></i></div>';
        document.querySelector('.prev-btn').style.display = 'none';
        document.querySelector('.next-btn').style.display = 'none';
        return;
    }
    
    totalImages = images.length;
    
    // Create image elements
    images.forEach((imageSrc, index) => {
        const img = document.createElement('img');
        img.src = imageSrc;
        img.alt = 'Equipment Image';
        img.className = `carousel-image ${index === 0 ? 'active' : ''}`;
        mainCarousel.appendChild(img);
        
        // Create dot
        const dot = document.createElement('span');
        dot.className = `carousel-dot ${index === 0 ? 'active' : ''}`;
        dot.onclick = () => goToImage(index);
        carouselDots.appendChild(dot);
    });
    
    // Hide navigation if only one image
    if (images.length === 1) {
        document.querySelector('.prev-btn').style.display = 'none';
        document.querySelector('.next-btn').style.display = 'none';
    }
}

// Change main carousel image
function changeMainImage(direction) {
    const images = document.querySelectorAll('.carousel-image');
    const dots = document.querySelectorAll('.carousel-dot');
    
    images[currentImageIndex].classList.remove('active');
    dots[currentImageIndex].classList.remove('active');
    
    currentImageIndex += direction;
    
    if (currentImageIndex >= totalImages) currentImageIndex = 0;
    if (currentImageIndex < 0) currentImageIndex = totalImages - 1;
    
    images[currentImageIndex].classList.add('active');
    dots[currentImageIndex].classList.add('active');
}

// Go to specific image
function goToImage(index) {
    const images = document.querySelectorAll('.carousel-image');
    const dots = document.querySelectorAll('.carousel-dot');
    
    images[currentImageIndex].classList.remove('active');
    dots[currentImageIndex].classList.remove('active');
    
    currentImageIndex = index;
    
    images[currentImageIndex].classList.add('active');
    dots[currentImageIndex].classList.add('active');
}

// Reveal phone number - simplified version
function revealPhoneNumber() {
    document.getElementById('getPhoneBtn').style.display = 'none';
    document.getElementById('phoneNumberSection').style.display = 'block';
}

// Show error state
function showError() {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('errorState').style.display = 'block';
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('en-IN', options);
}

// Capitalize words
function capitalizeWords(str) {
    return str.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
}

// ===== TRANSLATION FUNCTIONS =====

// Load saved language preference
function loadSavedLanguage() {
    const savedLang = localStorage.getItem('preferredLanguage') || 'en';
    document.getElementById('languageSelector').value = savedLang;
}

// Change language with API translation
async function changeLanguage(lang) {
    localStorage.setItem('preferredLanguage', lang);
    document.getElementById('languageSelector').value = lang;
    
    if (lang === 'en') {
        location.reload();
        return;
    }
    
    await translatePage(lang);
}

// Translate entire page
async function translatePage(lang) {
    showTranslationLoading(true);
    
    try {
        // Translate static elements
        const elementsToTranslate = document.querySelectorAll('[data-translate]');
        for (const element of elementsToTranslate) {
            const originalText = element.textContent.trim();
            if (originalText) {
                const translated = await translateText(originalText, lang);
                element.textContent = translated;
            }
        }
        
        // Translate dynamic content
        if (currentEquipment) {
            const equipmentType = document.getElementById('equipmentType');
            const equipmentTitle = document.getElementById('equipmentTitle');
            const location = document.getElementById('location');
            const ownerName = document.getElementById('ownerName');
            
            if (equipmentType) {
                equipmentType.textContent = await translateText(equipmentType.textContent, lang);
            }
            if (equipmentTitle) {
                equipmentTitle.textContent = await translateText(equipmentTitle.textContent, lang);
            }
            if (location) {
                location.textContent = await translateText(currentEquipment.location, lang);
            }
            if (ownerName) {
                ownerName.textContent = await translateText(currentEquipment.owner_name, lang);
            }
            
            // Translate detail labels
            document.querySelectorAll('.detail-label').forEach(async (label) => {
                const text = label.textContent.trim();
                label.textContent = await translateText(text, lang);
            });
        }
        
    } catch (error) {
        console.error('Translation error:', error);
    } finally {
        showTranslationLoading(false);
    }
}

// Translate text using API
async function translateText(text, targetLang) {
    const cacheKey = `${text}_${targetLang}`;
    if (translationCache[cacheKey]) {
        return translationCache[cacheKey];
    }
    
    const langMap = {
        'hi': 'hi',
        'pa': 'pa'
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
        
        return text;
        
    } catch (error) {
        console.error('Translation API error:', error);
        return text;
    }
}

// Show/hide translation loading
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