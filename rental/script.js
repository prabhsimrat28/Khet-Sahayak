// Store selected files
let selectedFiles = [];

// Translation cache
const translationCache = {};

// DOM Elements
const form = document.getElementById('equipmentForm');
const imageInput = document.getElementById('images');
const imagePreviewContainer = document.getElementById('imagePreviewContainer');
const uploadBox = document.querySelector('.upload-box');

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
    setupFormValidation();
    setupImageUpload();
    loadSavedLanguage();
});

// ===== TRANSLATION FUNCTIONS =====

// Load saved language preference
function loadSavedLanguage() {
    const savedLang = localStorage.getItem('preferredLanguage') || 'en';
    const selector = document.getElementById('languageSelector');
    if (selector) {
        selector.value = savedLang;
        if (savedLang !== 'en') {
            changeLanguage(savedLang);
        }
    }
}

// Change language with API translation
async function changeLanguage(lang) {
    localStorage.setItem('preferredLanguage', lang);
    const selector = document.getElementById('languageSelector');
    if (selector) {
        selector.value = lang;
    }
    
    if (lang === 'en') {
        location.reload();
        return;
    }
    
    showTranslationLoading(true);
    
    try {
        // Translate all elements with data-translate attribute
        const elementsToTranslate = document.querySelectorAll('[data-translate]');
        for (const element of elementsToTranslate) {
            const originalText = element.textContent.trim();
            if (originalText) {
                const translated = await translateText(originalText, lang);
                element.textContent = translated;
            }
        }
    } catch (error) {
        console.error('Translation error:', error);
    } finally {
        showTranslationLoading(false);
    }
}

// Translate text using MyMemory API
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

// ===== IMAGE UPLOAD HANDLING =====
function setupImageUpload() {
    const uploadLabel = document.querySelector('.upload-label');

    // Click to select files
    imageInput.addEventListener('change', handleFileSelection);

    // Drag and drop
    uploadBox.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadBox.classList.add('drag-over');
    });

    uploadBox.addEventListener('dragleave', () => {
        uploadBox.classList.remove('drag-over');
    });

    uploadBox.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadBox.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        handleFiles(files);
    });
}

function handleFileSelection(e) {
    handleFiles(e.target.files);
}

function handleFiles(files) {
    const errorMsg = document.getElementById('imagesError');
    errorMsg.textContent = '';

    // Check if adding new files would exceed limit
    if (selectedFiles.length + files.length > 5) {
        errorMsg.textContent = 'Maximum 5 images allowed. You have ' + selectedFiles.length + ' selected.';
        return;
    }

    // Validate and add each file
    Array.from(files).forEach(file => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            errorMsg.textContent = 'Only image files are allowed';
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            errorMsg.textContent = 'Each image must be less than 5MB';
            return;
        }

        // Add file to array
        selectedFiles.push(file);
    });

    updateImagePreviews();
    updateFileInput();
}

function updateImagePreviews() {
    imagePreviewContainer.innerHTML = '';

    selectedFiles.forEach((file, index) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const previewItem = document.createElement('div');
            previewItem.className = 'image-preview-item';

            const img = document.createElement('img');
            img.src = e.target.result;

            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-image-btn';
            removeBtn.innerHTML = '✕';
            removeBtn.type = 'button';
            removeBtn.onclick = (event) => {
                event.preventDefault();
                removeImage(index);
            };

            previewItem.appendChild(img);
            previewItem.appendChild(removeBtn);
            imagePreviewContainer.appendChild(previewItem);
        };

        reader.readAsDataURL(file);
    });
}

function removeImage(index) {
    selectedFiles.splice(index, 1);
    updateImagePreviews();
    updateFileInput();
}

function updateFileInput() {
    // Create a DataTransfer object and add the files
    const dataTransfer = new DataTransfer();
    selectedFiles.forEach(file => dataTransfer.items.add(file));
    imageInput.files = dataTransfer.files;
}

// ===== FORM VALIDATION =====
function setupFormValidation() {
    form.addEventListener('submit', handleSubmit);

    // Real-time validation
    document.getElementById('ownerName').addEventListener('blur', validateOwnerName);
    document.getElementById('phoneNumber').addEventListener('blur', validatePhoneNumber);
    document.getElementById('machineryType').addEventListener('change', validateMachineryType);
    document.getElementById('price').addEventListener('blur', validatePrice);
    document.getElementById('location').addEventListener('blur', validateLocation);
    document.getElementById('availableFrom').addEventListener('change', validateTimeSlot);
    document.getElementById('availableUntil').addEventListener('change', validateTimeSlot);
}

function validateOwnerName() {
    const field = document.getElementById('ownerName');
    const error = document.getElementById('ownerNameError');
    error.textContent = '';

    if (!field.value.trim()) {
        error.textContent = 'Owner name is required';
        return false;
    }

    if (field.value.trim().length < 2) {
        error.textContent = 'Name must be at least 2 characters';
        return false;
    }

    return true;
}

function validatePhoneNumber() {
    const field = document.getElementById('phoneNumber');
    const error = document.getElementById('phoneNumberError');
    error.textContent = '';

    const phoneRegex = /^[0-9]{10}$/;

    if (!field.value.trim()) {
        error.textContent = 'Phone number is required';
        return false;
    }

    if (!phoneRegex.test(field.value.replace(/\s+/g, ''))) {
        error.textContent = 'Phone number must be 10 digits';
        return false;
    }

    return true;
}

function validateMachineryType() {
    const field = document.getElementById('machineryType');
    const error = document.getElementById('machineryTypeError');
    error.textContent = '';

    if (!field.value) {
        error.textContent = 'Please select equipment type';
        return false;
    }

    return true;
}

function validatePrice() {
    const field = document.getElementById('price');
    const error = document.getElementById('priceError');
    error.textContent = '';

    if (!field.value) {
        error.textContent = 'Price is required';
        return false;
    }

    if (parseFloat(field.value) <= 0) {
        error.textContent = 'Price must be greater than 0';
        return false;
    }

    return true;
}

function validateLocation() {
    const field = document.getElementById('location');
    const error = document.getElementById('locationError');
    error.textContent = '';

    if (!field.value.trim()) {
        error.textContent = 'Location is required';
        return false;
    }

    if (field.value.trim().length < 3) {
        error.textContent = 'Location must be at least 3 characters';
        return false;
    }

    return true;
}

function validateTimeSlot() {
    const fromField = document.getElementById('availableFrom');
    const untilField = document.getElementById('availableUntil');
    const fromError = document.getElementById('availableFromError');
    const untilError = document.getElementById('availableUntilError');

    fromError.textContent = '';
    untilError.textContent = '';

    if (!fromField.value) {
        fromError.textContent = 'Start time is required';
        return false;
    }

    if (!untilField.value) {
        untilError.textContent = 'End time is required';
        return false;
    }

    const fromTime = new Date(fromField.value);
    const untilTime = new Date(untilField.value);

    if (fromTime >= untilTime) {
        untilError.textContent = 'End time must be after start time';
        return false;
    }

    return true;
}

// ===== FORM SUBMISSION =====
async function handleSubmit(e) {
    e.preventDefault();

    // Validate all fields
    const isValid = 
        validateOwnerName() &&
        validatePhoneNumber() &&
        validateMachineryType() &&
        validatePrice() &&
        validateLocation() &&
        validateTimeSlot();

    if (!isValid) {
        return;
    }

    // Create FormData object
    const formData = new FormData();
    formData.append('ownerName', document.getElementById('ownerName').value);
    formData.append('phoneNumber', document.getElementById('phoneNumber').value);
    formData.append('machineryType', document.getElementById('machineryType').value);
    formData.append('price', document.getElementById('price').value);
    formData.append('location', document.getElementById('location').value);
    formData.append('availableFrom', document.getElementById('availableFrom').value);
    formData.append('availableUntil', document.getElementById('availableUntil').value);

    // Add images
    selectedFiles.forEach((file, index) => {
        formData.append(`image_${index}`, file);
    });

    try {
        // Send to backend
        // Send to backend
        const response = await fetch('api/list_equipment.php', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            showSuccess('Equipment listed successfully!');
            form.reset();
            selectedFiles = [];
            imagePreviewContainer.innerHTML = '';
            updateFileInput();
        } else {
            alert('Error: ' + (data.message || 'Failed to list equipment'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error submitting form. Please try again.');
    }
}

function showSuccess(message) {
    const successMsg = document.getElementById('successMsg');
    successMsg.textContent = message;
    
    setTimeout(() => {
        successMsg.textContent = '';
    }, 5000);
}