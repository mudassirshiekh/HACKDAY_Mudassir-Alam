// Global state management
const appState = {
    currentPage: 'home',
    uploadedImage: null,
    analysisResults: null,
    history: JSON.parse(localStorage.getItem('ecovision_history')) || [],
    tips: [
        {
            icon: 'fas fa-recycle',
            title: 'Reduce Single-Use Plastics',
            description: 'Carry reusable water bottles, shopping bags, and containers to minimize plastic waste.'
        },
        {
            icon: 'fas fa-bicycle',
            title: 'Choose Sustainable Transportation',
            description: 'Walk, bike, or use public transport instead of driving when possible to reduce carbon emissions.'
        },
        {
            icon: 'fas fa-leaf',
            title: 'Plant Native Trees',
            description: 'Plant trees native to your region to improve air quality and support local ecosystems.'
        },
        {
            icon: 'fas fa-solar-panel',
            title: 'Switch to Renewable Energy',
            description: 'Consider solar panels or choose energy providers that use renewable sources.'
        },
        {
            icon: 'fas fa-seedling',
            title: 'Start a Compost Pile',
            description: 'Compost organic waste to reduce landfill contributions and create nutrient-rich soil.'
        },
        {
            icon: 'fas fa-tint',
            title: 'Conserve Water',
            description: 'Fix leaks, use water-efficient appliances, and collect rainwater for gardening.'
        },
        {
            icon: 'fas fa-lightbulb',
            title: 'Use LED Light Bulbs',
            description: 'Replace incandescent bulbs with energy-efficient LEDs to reduce electricity consumption.'
        },
        {
            icon: 'fas fa-shopping-bag',
            title: 'Buy Local and Seasonal',
            description: 'Purchase locally grown, seasonal produce to reduce transportation emissions.'
        },
        {
            icon: 'fas fa-wind',
            title: 'Reduce Air Conditioning',
            description: 'Use fans, natural ventilation, and proper insulation to reduce energy consumption.'
        },
        {
            icon: 'fas fa-heart',
            title: 'Support Eco-Friendly Brands',
            description: 'Choose products from companies committed to sustainable and ethical practices.'
        }
    ]
};

// DOM elements
const sidebar = document.getElementById('sidebar');
const mainContent = document.getElementById('mainContent');
const sidebarToggle = document.getElementById('sidebarToggle');
const imageInput = document.getElementById('imageInput');
const uploadArea = document.getElementById('uploadArea');
const imagePreview = document.getElementById('imagePreview');
const previewImage = document.getElementById('previewImage');
const analyzeBtn = document.getElementById('analyzeBtn');
const removeImage = document.getElementById('removeImage');
const loadingContainer = document.getElementById('loadingContainer');
const resultsContainer = document.getElementById('resultsContainer');
const tipsGrid = document.getElementById('tipsGrid');
const refreshTips = document.getElementById('refreshTips');
const historyContainer = document.getElementById('historyContainer');
const demoModal = document.getElementById('demoModal');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('EcoVision AI: Initializing application...');
    try {
        initializeApp();
        setupEventListeners();
        generateRandomTips();
        console.log('EcoVision AI: Application initialized successfully');
    } catch (error) {
        console.error('EcoVision AI: Initialization error:', error);
    }
});

function initializeApp() {
    // Set initial page
    navigateToPage('home');
    
    // Initialize sidebar
    updateSidebarState();
    
    // Load history
    renderHistory();
}

function setupEventListeners() {
    // Sidebar toggle for mobile
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }
    
    // Menu navigation
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', function() {
            const page = this.dataset.page;
            navigateToPage(page);
        });
    });
    
    // Upload functionality
    if (uploadArea) {
        uploadArea.addEventListener('click', () => imageInput.click());
        uploadArea.addEventListener('dragover', handleDragOver);
        uploadArea.addEventListener('dragleave', handleDragLeave);
        uploadArea.addEventListener('drop', handleDrop);
    }
    
    if (imageInput) {
        imageInput.addEventListener('change', handleImageUpload);
    }
    
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', analyzeImage);
    }
    
    if (removeImage) {
        removeImage.addEventListener('click', removeUploadedImage);
    }
    
    if (refreshTips) {
        refreshTips.addEventListener('click', generateRandomTips);
    }
    
    // Close modal when clicking outside
    if (demoModal) {
        demoModal.addEventListener('click', function(e) {
            if (e.target === demoModal) {
                closeDemo();
            }
        });
    }
}

// Navigation functions
function navigateToPage(page) {
    console.log('EcoVision AI: Navigating to page:', page);
    
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    // Show target page
    const targetPage = document.getElementById(page + 'Page');
    if (targetPage) {
        targetPage.classList.add('active');
        appState.currentPage = page;
        console.log('EcoVision AI: Successfully navigated to', page);
    } else {
        console.error('EcoVision AI: Page not found:', page + 'Page');
    }
    
    // Update sidebar
    updateSidebarState();
    
    // Handle specific page logic
    switch(page) {
        case 'dashboard':
            renderDashboard();
            break;
        case 'tips':
            generateRandomTips();
            break;
        case 'history':
            renderHistory();
            break;
    }
    
    // Close sidebar on mobile
    if (window.innerWidth <= 768) {
        sidebar.classList.remove('open');
    }
}

function updateSidebarState() {
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === appState.currentPage) {
            item.classList.add('active');
        }
    });
}

function toggleSidebar() {
    sidebar.classList.toggle('open');
}

// Upload functionality
function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

function handleImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
}

function handleFile(file) {
    console.log('EcoVision AI: Handling file:', file.name, file.type, file.size);
    
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB.');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        console.log('EcoVision AI: File loaded successfully');
        appState.uploadedImage = {
            file: file,
            dataUrl: e.target.result
        };
        
        previewImage.src = e.target.result;
        uploadArea.style.display = 'none';
        imagePreview.classList.add('show');
        console.log('EcoVision AI: Image preview shown');
    };
    reader.onerror = function() {
        console.error('EcoVision AI: Error reading file');
        alert('Error reading file. Please try again.');
    };
    reader.readAsDataURL(file);
}

function removeUploadedImage() {
    appState.uploadedImage = null;
    imageInput.value = '';
    uploadArea.style.display = 'block';
    imagePreview.classList.remove('show');
}

// Analysis functionality
async function analyzeImage() {
    if (!appState.uploadedImage) {
        alert('Please upload an image first.');
        return;
    }
    
    // Show loading
    imagePreview.classList.remove('show');
    loadingContainer.classList.add('show');
    
    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Generate mock analysis results
    const results = generateMockAnalysis();
    appState.analysisResults = results;
    
    // Add to history
    const historyItem = {
        id: Date.now(),
        image: appState.uploadedImage.dataUrl,
        results: results,
        date: new Date().toISOString()
    };
    appState.history.unshift(historyItem);
    localStorage.setItem('ecovision_history', JSON.stringify(appState.history));
    
    // Navigate to dashboard
    navigateToPage('dashboard');
    
    // Hide loading
    loadingContainer.classList.remove('show');
}

function generateMockAnalysis() {
    const pollutionTypes = ['air', 'water', 'land'];
    const riskLevels = ['low', 'medium', 'high'];
    
    const detectedPollution = pollutionTypes.filter(() => Math.random() > 0.3);
    const riskLevel = riskLevels[Math.floor(Math.random() * riskLevels.length)];
    
    const tips = {
        air: [
            'Wear a mask when outdoors in polluted areas',
            'Use air purifiers in your home',
            'Avoid outdoor exercise during high pollution days',
            'Plant air-purifying plants like spider plants and peace lilies'
        ],
        water: [
            'Use water filters for drinking water',
            'Avoid swimming in contaminated water',
            'Report water pollution to local authorities',
            'Support clean water initiatives in your community'
        ],
        land: [
            'Avoid contact with contaminated soil',
            'Wash hands thoroughly after outdoor activities',
            'Support soil remediation efforts',
            'Choose organic produce when possible'
        ]
    };
    
    const recommendations = [];
    detectedPollution.forEach(type => {
        recommendations.push(...tips[type].slice(0, 2));
    });
    
    return {
        pollutionTypes: detectedPollution,
        riskLevel: riskLevel,
        confidence: Math.floor(Math.random() * 30) + 70,
        recommendations: recommendations,
        summary: `Analysis detected ${detectedPollution.length} type(s) of pollution with ${riskLevel} risk level.`,
        timestamp: new Date().toISOString()
    };
}

// Dashboard rendering
function renderDashboard() {
    if (!appState.analysisResults) {
        resultsContainer.innerHTML = `
            <div class="no-results">
                <i class="fas fa-chart-line"></i>
                <h3>No Analysis Results Yet</h3>
                <p>Upload an image to see environmental analysis results</p>
                <button class="btn btn-primary" onclick="navigateToPage('upload')">
                    <i class="fas fa-upload"></i>
                    Upload Image
                </button>
            </div>
        `;
        return;
    }
    
    const results = appState.analysisResults;
    const pollutionIcons = {
        air: 'fas fa-smog',
        water: 'fas fa-tint',
        land: 'fas fa-seedling'
    };
    
    const pollutionColors = {
        air: '#ff6b6b',
        water: '#4ecdc4',
        land: '#45b7d1'
    };
    
    const pollutionNames = {
        air: 'Air Pollution',
        water: 'Water Contamination',
        land: 'Land Contamination'
    };
    
    let resultsHTML = '<div class="results-grid">';
    
    results.pollutionTypes.forEach(type => {
        resultsHTML += `
            <div class="result-card">
                <div class="result-header">
                    <div class="result-icon" style="background: ${pollutionColors[type]}">
                        <i class="${pollutionIcons[type]}"></i>
                    </div>
                    <div>
                        <div class="result-title">${pollutionNames[type]}</div>
                        <span class="risk-badge risk-${results.riskLevel}">${results.riskLevel.toUpperCase()} RISK</span>
                    </div>
                </div>
                <div class="result-content">
                    <p>Confidence: ${results.confidence}%</p>
                    <p>${results.summary}</p>
                </div>
            </div>
        `;
    });
    
    resultsHTML += '</div>';
    
    // Add recommendations
    if (results.recommendations.length > 0) {
        resultsHTML += `
            <div class="result-card">
                <div class="result-header">
                    <div class="result-icon" style="background: #4caf50">
                        <i class="fas fa-lightbulb"></i>
                    </div>
                    <div class="result-title">Actionable Recommendations</div>
                </div>
                <div class="result-content">
                    <ul class="tips-list">
                        ${results.recommendations.map(tip => `<li><i class="fas fa-check"></i>${tip}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
    }
    
    // Add download section
    resultsHTML += `
        <div class="download-section">
            <button class="btn btn-primary" onclick="downloadResults()">
                <i class="fas fa-download"></i>
                Download Awareness Poster
            </button>
        </div>
    `;
    
    resultsContainer.innerHTML = resultsHTML;
}

function downloadResults() {
    // Create a simple awareness poster
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 600;
    
    // Background
    ctx.fillStyle = '#f0f8ff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Title
    ctx.fillStyle = '#2d5a27';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('EcoVision AI Analysis Report', canvas.width / 2, 60);
    
    // Results
    ctx.fillStyle = '#333';
    ctx.font = '18px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Risk Level: ${appState.analysisResults.riskLevel.toUpperCase()}`, 50, 120);
    ctx.fillText(`Pollution Types: ${appState.analysisResults.pollutionTypes.join(', ')}`, 50, 150);
    ctx.fillText(`Confidence: ${appState.analysisResults.confidence}%`, 50, 180);
    
    // Recommendations
    ctx.fillText('Recommendations:', 50, 220);
    appState.analysisResults.recommendations.forEach((rec, index) => {
        ctx.fillText(`• ${rec}`, 70, 250 + (index * 25));
    });
    
    // Download
    const link = document.createElement('a');
    link.download = 'ecovision-analysis.png';
    link.href = canvas.toDataURL();
    link.click();
}

// Tips functionality
function generateRandomTips() {
    const shuffled = [...appState.tips].sort(() => 0.5 - Math.random());
    const selectedTips = shuffled.slice(0, 6);
    
    tipsGrid.innerHTML = selectedTips.map(tip => `
        <div class="tip-card">
            <div class="tip-icon">
                <i class="${tip.icon}"></i>
            </div>
            <h3>${tip.title}</h3>
            <p>${tip.description}</p>
        </div>
    `).join('');
}

// History functionality
function renderHistory() {
    if (appState.history.length === 0) {
        historyContainer.innerHTML = `
            <div class="no-history">
                <i class="fas fa-history"></i>
                <h3>No Analysis History</h3>
                <p>Your analysis history will appear here after uploading images</p>
            </div>
        `;
        return;
    }
    
    historyContainer.innerHTML = appState.history.map(item => `
        <div class="history-item">
            <img src="${item.image}" alt="Analysis" class="history-image">
            <div class="history-content">
                <div class="history-title">Analysis ${item.id}</div>
                <div class="history-date">${new Date(item.date).toLocaleDateString()}</div>
                <div>Risk: ${item.results.riskLevel.toUpperCase()} | Types: ${item.results.pollutionTypes.join(', ')}</div>
            </div>
            <div class="history-actions">
                <button class="btn btn-primary btn-small" onclick="viewHistoryItem(${item.id})">
                    <i class="fas fa-eye"></i>
                    View
                </button>
                <button class="btn btn-secondary btn-small" onclick="deleteHistoryItem(${item.id})">
                    <i class="fas fa-trash"></i>
                    Delete
                </button>
            </div>
        </div>
    `).join('');
}

function viewHistoryItem(id) {
    const item = appState.history.find(h => h.id === id);
    if (item) {
        appState.analysisResults = item.results;
        navigateToPage('dashboard');
    }
}

function deleteHistoryItem(id) {
    appState.history = appState.history.filter(h => h.id !== id);
    localStorage.setItem('ecovision_history', JSON.stringify(appState.history));
    renderHistory();
}

// Demo functionality
function showDemo() {
    demoModal.classList.add('active');
}

function closeDemo() {
    demoModal.classList.remove('active');
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Handle window resize
window.addEventListener('resize', debounce(() => {
    if (window.innerWidth > 768) {
        sidebar.classList.remove('open');
    }
}, 250));

// Add some interactive animations
document.addEventListener('mousemove', function(e) {
    const cards = document.querySelectorAll('.floating-cards .card');
    cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
        } else {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
        }
    });
});

// Add loading animation for buttons
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('btn')) {
        e.target.style.transform = 'scale(0.95)';
        setTimeout(() => {
            e.target.style.transform = '';
        }, 150);
    }
});

// Add smooth scrolling for anchor links
document.addEventListener('click', function(e) {
    if (e.target.matches('a[href^="#"]')) {
        e.preventDefault();
        const target = document.querySelector(e.target.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    }
});

// Add keyboard navigation
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeDemo();
        if (sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
        }
    }
});

// Add touch gestures for mobile
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', function(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

document.addEventListener('touchend', function(e) {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;
    
    // Swipe left to close sidebar
    if (diffX > 50 && Math.abs(diffY) < 100) {
        sidebar.classList.remove('open');
    }
    
    // Swipe right to open sidebar
    if (diffX < -50 && Math.abs(diffY) < 100) {
        sidebar.classList.add('open');
    }
});

// Add performance monitoring
const performanceObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
        if (entry.entryType === 'measure') {
            console.log(`${entry.name}: ${entry.duration}ms`);
        }
    }
});

performanceObserver.observe({ entryTypes: ['measure'] });

// Add error handling
window.addEventListener('error', function(e) {
    console.error('Application error:', e.error);
    // You could send this to an error tracking service
});

// Add offline detection
window.addEventListener('online', function() {
    console.log('Application is online');
});

window.addEventListener('offline', function() {
    console.log('Application is offline');
    alert('You are offline. Some features may not work properly.');
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { appState, navigateToPage, analyzeImage };
}
