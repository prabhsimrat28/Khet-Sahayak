// Translation cache
const translationCache = {};

// Load saved language when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadSavedLanguage();
});

// Load saved language preference
function loadSavedLanguage() {
    const savedLang = localStorage.getItem('preferredLanguage') || 'en';
    document.getElementById('languageSelector').value = savedLang;
    if (savedLang !== 'en') {
        changeLanguage(savedLang);
    }
}

// Change language with API translation
async function changeLanguage(lang) {
    localStorage.setItem('preferredLanguage', lang);
    document.getElementById('languageSelector').value = lang;
    
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