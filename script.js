// =====================================================
// EASYPARK - Application de Gestion de Parking
// Version: HTML/CSS/JavaScript Pure - Exactement comme React
// =====================================================

/* ==============================
   DONNÉES GLOBALES
============================== */
const appData = {
    isConfigured: false,
    sectors: [],
    places: [],
    history: [],
    tarifs: {
        tarifHoraire: 2.5,
        tarifMinute: 0.05,
        forfaitNuit: 8.0,
        forfaitJournee: 15.0,
        forfaitWeekend: 25.0
    },
    theme: 'dark',
    musicEnabled: true,
    currentFilter: 'toutes',
    currentPage: 'setup'
};

/* ==============================
   INITIALISATION
============================== */
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initialisation EASYPARK...');
    initializeApp();
    setupEventListeners();
    checkConfiguration();
    console.log('✅ EASYPARK initialisé');
});

function initializeApp() {
    const savedTheme = localStorage.getItem('easypark_theme') || 'dark';
    appData.theme = savedTheme;
    document.body.className = savedTheme === 'dark' ? 'dark-theme' : '';
}

function checkConfiguration() {
    const savedConfigured = localStorage.getItem('easypark_isConfigured');
    
    if (savedConfigured === 'true') {
        appData.isConfigured = true;
        loadFromLocalStorage();
        if (appData.sectors.length > 0 && appData.places.length > 0) {
            navigateToPage('home');
            renderSectors();
            updateStats();
        } else {
            // Données corrompues, recommencer
            appData.isConfigured = false;
            navigateToPage('setup');
        }
    } else {
        navigateToPage('setup');
    }
}

/* ==============================
   EVENT LISTENERS - SETUP
============================== */
function setupEventListeners() {
    // Setup - Étape 1
    const btnNextStep = document.getElementById('btnNextStep');
    if (btnNextStep) {
        btnNextStep.addEventListener('click', goToStep2);
    }

    // Setup - Étape 2
    const btnPrevStep = document.getElementById('btnPrevStep');
    if (btnPrevStep) {
        btnPrevStep.addEventListener('click', goToStep1);
    }

    const btnValidateSetup = document.getElementById('btnValidateSetup');
    if (btnValidateSetup) {
        btnValidateSetup.addEventListener('click', validateSetup);
    }

    // Setup - Nombre de secteurs change
    const numberOfSectors = document.getElementById('numberOfSectors');
    if (numberOfSectors) {
        numberOfSectors.addEventListener('input', updateSectorsConfig);
    }

    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (!appData.isConfigured) return;
            const page = this.dataset.page;
            navigateToPage(page);
        });
    });

    // Logo retour accueil
    const logoHome = document.getElementById('logoHome');
    if (logoHome) {
        logoHome.addEventListener('click', () => {
            if (appData.isConfigured) navigateToPage('home');
        });
    }

    // Thème
    const btnTheme = document.getElementById('btnTheme');
    if (btnTheme) {
        btnTheme.addEventListener('click', toggleTheme);
    }

    // Musique
    const btnMusic = document.getElementById('btnMusic');
    if (btnMusic) {
        btnMusic.addEventListener('click', toggleMusic);
    }

    // Vidéo Live
    const btnLive = document.getElementById('btnLive');
    if (btnLive) {
        btnLive.addEventListener('click', () => navigateToPage('live'));
    }

    const btnBackFromLive = document.getElementById('btnBackFromLive');
    if (btnBackFromLive) {
        btnBackFromLive.addEventListener('click', () => navigateToPage('home'));
    }

    // Sécurité Routière
    const btnSecurite = document.getElementById('btnSecurite');
    if (btnSecurite) {
        btnSecurite.addEventListener('click', () => navigateToPage('securite'));
    }

    const btnBackFromSecurite = document.getElementById('btnBackFromSecurite');
    if (btnBackFromSecurite) {
        btnBackFromSecurite.addEventListener('click', () => navigateToPage('home'));
    }

    // Filtres
    document.querySelectorAll('.btn-filter').forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.dataset.filter;
            applyFilter(filter);
        });
    });

    // Tarifs
    const btnSaveTarifs = document.getElementById('btnSaveTarifs');
    if (btnSaveTarifs) {
        btnSaveTarifs.addEventListener('click', saveTarifs);
    }

    // Export
    const btnExportCSV = document.getElementById('btnExportCSV');
    if (btnExportCSV) {
        btnExportCSV.addEventListener('click', exportCSV);
    }

    const btnExportPDF = document.getElementById('btnExportPDF');
    if (btnExportPDF) {
        btnExportPDF.addEventListener('click', exportPDF);
    }

    // Fermer menu contextuel
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.context-menu') && !e.target.closest('.place')) {
            closeContextMenu();
        }
    });

    // Actions menu contextuel
    document.querySelectorAll('.context-item').forEach(item => {
        item.addEventListener('click', function() {
            const action = this.dataset.action;
            handleContextAction(action);
        });
    });

    // Recherche historique
    const searchPlate = document.getElementById('searchPlate');
    const dateDebut = document.getElementById('dateDebut');
    const dateFin = document.getElementById('dateFin');
    if (searchPlate) searchPlate.addEventListener('input', filterHistory);
    if (dateDebut) dateDebut.addEventListener('change', filterHistory);
    if (dateFin) dateFin.addEventListener('change', filterHistory);
}

/* ==============================
   SETUP - CONFIGURATION INITIALE
============================== */
function goToStep2() {
    const numSectors = parseInt(document.getElementById('numberOfSectors').value) || 2;
    
    if (numSectors < 1 || numSectors > 10) {
        showToast('⚠️ Le nombre de secteurs doit être entre 1 et 10');
        return;
    }

    document.getElementById('setupStep1').classList.remove('active');
    document.getElementById('setupStep2').classList.add('active');
    
    renderSectorsConfig(numSectors);
}

function goToStep1() {
    document.getElementById('setupStep2').classList.remove('active');
    document.getElementById('setupStep1').classList.add('active');
}

function updateSectorsConfig() {
    const numSectors = parseInt(document.getElementById('numberOfSectors').value) || 2;
    // Ne pas rendre automatiquement, attendre le bouton Suivant
}

function renderSectorsConfig(numSectors) {
    const container = document.getElementById('sectorsConfig');
    if (!container) return;

    container.innerHTML = '';

    for (let i = 0; i < numSectors; i++) {
        const letter = String.fromCharCode(65 + i); // A, B, C...
        const div = document.createElement('div');
        div.className = 'sector-config-item';
        div.innerHTML = `
            <h4>Secteur ${i + 1}</h4>
            <div class="form-group">
                <label for="sectorName${i}">Nom du secteur</label>
                <input type="text" id="sectorName${i}" value="Secteur ${letter}" 
                       placeholder="Ex: Secteur A">
            </div>
            <div class="form-group">
                <label for="sectorPlaces${i}">Nombre de places</label>
                <input type="number" id="sectorPlaces${i}" value="15" min="1" max="100">
            </div>
        `;
        container.appendChild(div);
    }
}

function validateSetup() {
    const numSectors = document.getElementById('sectorsConfig').children.length;
    
    if (numSectors === 0) {
        showToast('⚠️ Aucun secteur configuré');
        return;
    }

    // Créer les secteurs
    const newSectors = [];
    for (let i = 0; i < numSectors; i++) {
        const name = document.getElementById(`sectorName${i}`).value || `Secteur ${i + 1}`;
        const totalPlaces = parseInt(document.getElementById(`sectorPlaces${i}`).value) || 15;
        
        newSectors.push({
            id: `sector-${i}`,
            name: name,
            totalPlaces: Math.max(1, Math.min(100, totalPlaces))
        });
    }

    appData.sectors = newSectors;

    // Générer toutes les places
    generatePlaces();

    // Marquer comme configuré
    appData.isConfigured = true;
    localStorage.setItem('easypark_isConfigured', 'true');
    saveToLocalStorage();

    showToast('✅ Configuration sauvegardée !');
    
    // Naviguer vers l'accueil
    setTimeout(() => {
        navigateToPage('home');
        renderSectors();
        updateStats();
        addDemoData();
    }, 500);
}

/* ==============================
   NAVIGATION
============================== */
function navigateToPage(pageName) {
    appData.currentPage = pageName;

    // Masquer toutes les pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    // Désactiver tous les boutons de navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Afficher ou masquer le header
    const header = document.getElementById('header');
    if (pageName === 'setup' || pageName === 'live' || pageName === 'securite') {
        if (header) header.style.display = 'none';
    } else {
        if (header) header.style.display = 'block';
    }

    // Afficher la page sélectionnée
    const targetPage = document.getElementById('page' + capitalizeFirst(pageName));
    if (targetPage) {
        targetPage.classList.add('active');
    }

    // Activer le bouton correspondant
    if (pageName !== 'setup' && pageName !== 'live' && pageName !== 'securite') {
        const activeBtn = document.querySelector(`.nav-btn[data-page="${pageName}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
    }

    // Mettre à jour les données si nécessaire
    switch(pageName) {
        case 'historique':
            renderHistory();
            break;
        case 'statistiques':
            updateStatistiques();
            renderCharts();
            break;
        case 'tarifs':
            loadTarifsToForm();
            break;
    }
}

/* ==============================
   THÈME & MUSIQUE
============================== */
function toggleTheme() {
    appData.theme = appData.theme === 'dark' ? 'light' : 'dark';
    document.body.className = appData.theme === 'dark' ? 'dark-theme' : '';
    localStorage.setItem('easypark_theme', appData.theme);
    showToast('🎨 Thème ' + (appData.theme === 'dark' ? 'sombre' : 'clair') + ' activé');
}

function toggleMusic() {
    appData.musicEnabled = !appData.musicEnabled;
    const audio = document.getElementById('backgroundMusic');
    const iconMusic = document.getElementById('iconMusic');
    
    if (appData.musicEnabled) {
        audio.play().catch(e => console.log('Auto-play bloqué:', e));
        iconMusic.innerHTML = `
            <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        `;
        showToast('🎵 Musique activée');
    } else {
        audio.pause();
        iconMusic.innerHTML = `
            <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
            <line x1="23" y1="9" x2="17" y2="15"></line>
            <line x1="17" y1="9" x2="23" y2="15"></line>
        `;
        showToast('🔇 Musique désactivée');
    }
}

/* ==============================
   PLACES DE PARKING - GÉNÉRATION
============================== */
function generatePlaces() {
    appData.places = [];
    appData.sectors.forEach(sector => {
        for (let i = 1; i <= sector.totalPlaces; i++) {
            appData.places.push({
                id: `${sector.id}-place-${i}`,
                sectorId: sector.id,
                number: i,
                status: 'libre',
                plate: null,
                entryTime: null,
                vipName: null
            });
        }
    });
}

function renderSectors() {
    const container = document.getElementById('sectorsContainer');
    if (!container) return;
    
    container.innerHTML = '';

    appData.sectors.forEach(sector => {
        const sectorDiv = document.createElement('div');
        sectorDiv.className = 'sector';
        sectorDiv.innerHTML = `
            <h2 class="sector-title">${escapeHtml(sector.name)} - ${sector.totalPlaces} places</h2>
            <div class="places-grid" id="places-${sector.id}"></div>
        `;
        container.appendChild(sectorDiv);
        renderPlaces(sector.id);
    });
}

function renderPlaces(sectorId) {
    const placesGrid = document.getElementById(`places-${sectorId}`);
    if (!placesGrid) return;

    const sectorPlaces = appData.places.filter(p => {
        if (p.sectorId !== sectorId) return false;
        
        // Appliquer le filtre
        if (appData.currentFilter === 'libres') return p.status === 'libre';
        if (appData.currentFilter === 'occupees') return p.status === 'occupee';
        if (appData.currentFilter === 'vip') return p.status === 'vip';
        return true;
    });

    placesGrid.innerHTML = '';

    sectorPlaces.forEach(place => {
        const placeDiv = document.createElement('div');
        placeDiv.className = `place ${place.status}`;
        placeDiv.dataset.placeId = place.id;
        
        let content = `<div class="place-number">#${place.number}</div>`;
        
        if (place.status === 'vip') {
            content += `<div class="place-crown">👑</div>`;
        }
        
        content += `<div class="place-content">`;
        
        if (place.status === 'libre') {
            content += `<div class="place-status">LIBRE</div>`;
        } else {
            content += `<div class="place-car">🚗</div>`;
            if (place.plate) {
                content += `<div class="place-plate">${escapeHtml(place.plate)}</div>`;
            }
            if (place.vipName) {
                content += `<div class="place-vip-name">${escapeHtml(place.vipName)}</div>`;
            }
            if (place.entryTime) {
                const date = new Date(place.entryTime);
                content += `<div class="place-time">${formatDate(date)}<br>${formatTime(date)}</div>`;
            }
        }
        
        content += `</div>`;
        placeDiv.innerHTML = content;
        
        // Événements
        placeDiv.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            openContextMenu(e, place);
        });
        
        placesGrid.appendChild(placeDiv);
    });
}

/* ==============================
   FILTRES
============================== */
function applyFilter(filter) {
    appData.currentFilter = filter;
    
    // Mettre à jour les boutons
    document.querySelectorAll('.btn-filter').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeBtn = document.querySelector(`.btn-filter[data-filter="${filter}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    // Re-render
    appData.sectors.forEach(sector => {
        renderPlaces(sector.id);
    });
}

/* ==============================
   STATISTIQUES - ACCUEIL
============================== */
function updateStats() {
    const total = appData.places.length;
    const libres = appData.places.filter(p => p.status === 'libre').length;
    const occupees = appData.places.filter(p => p.status === 'occupee').length;
    const vip = appData.places.filter(p => p.status === 'vip').length;

    const elTotal = document.getElementById('statTotal');
    const elLibres = document.getElementById('statLibres');
    const elOccupees = document.getElementById('statOccupees');
    const elVip = document.getElementById('statVip');

    if (elTotal) elTotal.textContent = total;
    if (elLibres) elLibres.textContent = libres;
    if (elOccupees) elOccupees.textContent = occupees;
    if (elVip) elVip.textContent = vip;
}

/* ==============================
   STATISTIQUES - PAGE DÉDIÉE
============================== */
function updateStatistiques() {
    const total = appData.places.length;
    const occupees = appData.places.filter(p => p.status === 'occupee' || p.status === 'vip').length;
    const taux = total > 0 ? (occupees / total * 100).toFixed(1) : 0;

    const elTaux = document.getElementById('tauxOccupation');
    const elProgress = document.getElementById('progressOccupation');
    if (elTaux) elTaux.textContent = taux + '%';
    if (elProgress) elProgress.style.width = taux + '%';

    const ca = appData.history.reduce((sum, entry) => sum + (entry.price || 0), 0);
    const elCA = document.getElementById('chiffreAffaires');
    if (elCA) elCA.textContent = ca.toFixed(2) + ' €';

    const entrees = appData.history.length;
    const sorties = appData.history.filter(e => e.exitTime).length;
    const elEntreeSortie = document.getElementById('entreeSortie');
    if (elEntreeSortie) elEntreeSortie.textContent = `${entrees} / ${sorties}`;

    // Durée moyenne
    let totalDuree = 0;
    let count = 0;
    appData.history.forEach(entry => {
        if (entry.exitTime && entry.entryTime) {
            const duree = new Date(entry.exitTime) - new Date(entry.entryTime);
            totalDuree += duree;
            count++;
        }
    });
    const moyenneMs = count > 0 ? totalDuree / count : 0;
    const moyenneHeures = Math.floor(moyenneMs / (1000 * 60 * 60));
    const moyenneMinutes = Math.floor((moyenneMs % (1000 * 60 * 60)) / (1000 * 60));
    const elDuree = document.getElementById('dureeMoyenne');
    if (elDuree) elDuree.textContent = `${moyenneHeures}h ${moyenneMinutes}m`;
}

function renderCharts() {
    renderSectorChart();
    renderRevenueChart();
}

function renderSectorChart() {
    const canvas = document.getElementById('chartSectors');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Données par secteur
    const sectorData = appData.sectors.map(sector => {
        const places = appData.places.filter(p => p.sectorId === sector.id);
        const occupied = places.filter(p => p.status !== 'libre').length;
        const total = places.length;
        return {
            name: sector.name,
            occupied,
            total,
            percentage: total > 0 ? (occupied / total * 100) : 0
        };
    });

    // Dessiner les barres
    const barWidth = 80;
    const gap = 60;
    const maxHeight = height - 80;
    const startX = 60;
    const startY = height - 40;

    sectorData.forEach((data, index) => {
        const x = startX + (index * (barWidth + gap));
        const barHeight = (data.percentage / 100) * maxHeight;
        const y = startY - barHeight;

        // Barre
        const gradient = ctx.createLinearGradient(x, y, x, startY);
        gradient.addColorStop(0, '#10b981');
        gradient.addColorStop(1, '#059669');
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth, barHeight);

        // Bordure
        ctx.strokeStyle = '#047857';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, barWidth, barHeight);

        // Texte - Nom du secteur
        ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--color-text');
        ctx.font = 'bold 14px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(data.name, x + barWidth / 2, startY + 20);

        // Texte - Pourcentage
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 16px Inter';
        ctx.fillText(data.percentage.toFixed(0) + '%', x + barWidth / 2, y - 10);

        // Texte - Occupation
        ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--color-text-secondary');
        ctx.font = '12px Inter';
        ctx.fillText(`${data.occupied}/${data.total}`, x + barWidth / 2, y - 25);
    });

    // Axe Y
    ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--color-border');
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(startX - 10, 20);
    ctx.lineTo(startX - 10, startY);
    ctx.stroke();

    // Axe X
    ctx.beginPath();
    ctx.moveTo(startX - 10, startY);
    ctx.lineTo(width - 20, startY);
    ctx.stroke();
}

function renderRevenueChart() {
    const canvas = document.getElementById('chartRevenue');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Générer données pour 7 derniers jours
    const days = [];
    const revenues = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        days.push(formatDateShort(date));
        
        // Calculer le revenu de ce jour
        const dayRevenue = appData.history
            .filter(entry => {
                if (!entry.exitTime) return false;
                const exitDate = new Date(entry.exitTime);
                return exitDate.toDateString() === date.toDateString();
            })
            .reduce((sum, entry) => sum + (entry.price || 0), 0);
        revenues.push(dayRevenue);
    }

    // Trouver le max pour l'échelle
    const maxRevenue = Math.max(...revenues, 100);

    // Dessiner la ligne
    const startX = 60;
    const startY = height - 40;
    const graphWidth = width - 100;
    const graphHeight = height - 80;
    const stepX = graphWidth / (days.length - 1);

    ctx.beginPath();
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';

    revenues.forEach((revenue, index) => {
        const x = startX + (index * stepX);
        const y = startY - ((revenue / maxRevenue) * graphHeight);
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    ctx.stroke();

    // Dessiner les points et valeurs
    revenues.forEach((revenue, index) => {
        const x = startX + (index * stepX);
        const y = startY - ((revenue / maxRevenue) * graphHeight);

        // Point
        ctx.beginPath();
        ctx.fillStyle = '#10b981';
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Jour
        ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--color-text');
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(days[index], x, startY + 20);

        // Valeur
        if (revenue > 0) {
            ctx.fillStyle = '#10b981';
            ctx.font = 'bold 12px Inter';
            ctx.fillText(revenue.toFixed(0) + '€', x, y - 15);
        }
    });

    // Axes
    ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--color-border');
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(startX, 20);
    ctx.lineTo(startX, startY);
    ctx.lineTo(width - 20, startY);
    ctx.stroke();
}

/* ==============================
   MENU CONTEXTUEL
============================== */
let currentContextPlace = null;

function openContextMenu(event, place) {
    currentContextPlace = place;
    const menu = document.getElementById('contextMenu');
    menu.style.left = event.pageX + 'px';
    menu.style.top = event.pageY + 'px';
    menu.classList.add('active');
}

function closeContextMenu() {
    const menu = document.getElementById('contextMenu');
    if (menu) {
        menu.classList.remove('active');
    }
    currentContextPlace = null;
}

function handleContextAction(action) {
    if (!currentContextPlace) return;

    const place = appData.places.find(p => p.id === currentContextPlace.id);
    if (!place) return;

    switch (action) {
        case 'libre':
            if (place.status !== 'libre') {
                // Ajouter à l'historique si c'était occupé
                if (place.entryTime) {
                    const dureeMs = Date.now() - new Date(place.entryTime);
                    const dureeHeures = dureeMs / (1000 * 60 * 60);
                    const prix = calculatePrice(dureeHeures, place.status === 'vip');
                    
                    appData.history.unshift({
                        id: 'history-' + Date.now(),
                        plate: place.plate || 'INCONNU',
                        sector: appData.sectors.find(s => s.id === place.sectorId)?.name || '',
                        place: place.number,
                        entryTime: new Date(place.entryTime),
                        exitTime: new Date(),
                        isVIP: place.status === 'vip',
                        price: prix
                    });
                    saveToLocalStorage();
                }
            }
            place.status = 'libre';
            place.plate = null;
            place.entryTime = null;
            place.vipName = null;
            showToast('✅ Place #' + place.number + ' rendue libre');
            break;

        case 'occupee':
            const plate = prompt('🚗 Entrez la plaque d\'immatriculation:', 'AB-123-CD');
            if (plate) {
                place.status = 'occupee';
                place.plate = plate.toUpperCase();
                place.entryTime = new Date().toISOString();
                showToast('✅ Place #' + place.number + ' occupée par ' + plate.toUpperCase());
            }
            break;

        case 'modifier-heure':
            const datetime = prompt('⏰ Entrez la nouvelle date/heure (YYYY-MM-DD HH:MM):', 
                place.entryTime ? formatDateTimeInput(new Date(place.entryTime)) : formatDateTimeInput(new Date()));
            if (datetime) {
                place.entryTime = new Date(datetime).toISOString();
                showToast('⏰ Heure modifiée');
            }
            break;

        case 'modifier-plaque':
            const newPlate = prompt('🔢 Entrez la nouvelle plaque:', place.plate || 'AB-123-CD');
            if (newPlate) {
                place.plate = newPlate.toUpperCase();
                showToast('🔢 Plaque modifiée: ' + newPlate.toUpperCase());
            }
            break;

        case 'assigner-vip':
            const vipName = prompt('👑 Nom du VIP:');
            if (vipName) {
                const vipPlate = prompt('🚗 Plaque du VIP:', place.plate || 'VIP-001');
                if (vipPlate) {
                    place.status = 'vip';
                    place.vipName = vipName;
                    place.plate = vipPlate.toUpperCase();
                    if (!place.entryTime) {
                        place.entryTime = new Date().toISOString();
                    }
                    showToast('👑 Place VIP assignée à ' + vipName);
                }
            }
            break;

        case 'retirer-vip':
            if (place.status === 'vip') {
                place.status = 'occupee';
                place.vipName = null;
                showToast('❌ Statut VIP retiré');
            }
            break;
    }

    closeContextMenu();
    renderSectors();
    updateStats();
    saveToLocalStorage();
}

/* ==============================
   TARIFS
============================== */
function loadTarifsToForm() {
    const fields = ['tarifHoraire', 'tarifMinute', 'forfaitNuit', 'forfaitJournee', 'forfaitWeekend'];
    
    fields.forEach(field => {
        const input = document.getElementById(field);
        if (input && appData.tarifs[field] !== undefined) {
            input.value = appData.tarifs[field];
        }
    });
}

function saveTarifs() {
    appData.tarifs.tarifHoraire = parseFloat(document.getElementById('tarifHoraire').value) || 0;
    appData.tarifs.tarifMinute = parseFloat(document.getElementById('tarifMinute').value) || 0;
    appData.tarifs.forfaitNuit = parseFloat(document.getElementById('forfaitNuit').value) || 0;
    appData.tarifs.forfaitJournee = parseFloat(document.getElementById('forfaitJournee').value) || 0;
    appData.tarifs.forfaitWeekend = parseFloat(document.getElementById('forfaitWeekend').value) || 0;
    
    saveToLocalStorage();
    showToast('💰 Tarifs sauvegardés avec succès');
}

function calculatePrice(dureeHeures, isVIP) {
    let prix = dureeHeures * appData.tarifs.tarifHoraire;
    if (isVIP) {
        prix += dureeHeures * 1.5; // Supplément VIP
    }
    return parseFloat(prix.toFixed(2));
}

/* ==============================
   HISTORIQUE
============================== */
function renderHistory() {
    const tbody = document.getElementById('historyTableBody');
    if (!tbody) return;

    const filteredHistory = getFilteredHistory();
    
    if (filteredHistory.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center">Aucun enregistrement</td></tr>';
        return;
    }

    tbody.innerHTML = '';
    filteredHistory.forEach(entry => {
        const duree = entry.exitTime && entry.entryTime 
            ? calculateDuration(new Date(entry.entryTime), new Date(entry.exitTime))
            : '-';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${escapeHtml(entry.plate)}</strong></td>
            <td>${escapeHtml(entry.sector)}</td>
            <td>#${entry.place}</td>
            <td>${formatDateTime(entry.entryTime)}</td>
            <td>${entry.exitTime ? formatDateTime(entry.exitTime) : '🔴 En cours'}</td>
            <td>${duree}</td>
            <td>${entry.isVIP ? '<span style="color: var(--color-vip)">👑 VIP</span>' : 'Normal'}</td>
            <td><strong>${entry.price ? entry.price.toFixed(2) + ' €' : '-'}</strong></td>
        `;
        tbody.appendChild(tr);
    });
}

function getFilteredHistory() {
    let filtered = [...appData.history];

    const searchPlate = document.getElementById('searchPlate')?.value.toLowerCase();
    const dateDebut = document.getElementById('dateDebut')?.value;
    const dateFin = document.getElementById('dateFin')?.value;

    if (searchPlate) {
        filtered = filtered.filter(entry => 
            entry.plate.toLowerCase().includes(searchPlate)
        );
    }

    if (dateDebut) {
        const debut = new Date(dateDebut);
        filtered = filtered.filter(entry => 
            new Date(entry.entryTime) >= debut
        );
    }

    if (dateFin) {
        const fin = new Date(dateFin);
        fin.setHours(23, 59, 59);
        filtered = filtered.filter(entry => 
            new Date(entry.entryTime) <= fin
        );
    }

    return filtered;
}

function filterHistory() {
    renderHistory();
}

function calculateDuration(start, end) {
    const ms = end - start;
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
}

/* ==============================
   EXPORT CSV / PDF
============================== */
function exportCSV() {
    const history = getFilteredHistory();
    
    if (history.length === 0) {
        showToast('⚠️ Aucune donnée à exporter');
        return;
    }

    let csv = 'Plaque,Secteur,Place,Entrée,Sortie,Durée,Type,Prix\n';
    
    history.forEach(entry => {
        const duree = entry.exitTime && entry.entryTime 
            ? calculateDuration(new Date(entry.entryTime), new Date(entry.exitTime))
            : '-';
        
        csv += `${entry.plate},`;
        csv += `${entry.sector},`;
        csv += `#${entry.place},`;
        csv += `${formatDateTime(entry.entryTime)},`;
        csv += `${entry.exitTime ? formatDateTime(entry.exitTime) : 'En cours'},`;
        csv += `${duree},`;
        csv += `${entry.isVIP ? 'VIP' : 'Normal'},`;
        csv += `${entry.price ? entry.price.toFixed(2) : '0.00'}\n`;
    });

    downloadFile(csv, 'easypark-historique.csv', 'text/csv');
    showToast('📄 Export CSV réussi');
}

function exportPDF() {
    showToast('📑 Export PDF - Fonctionnalité en développement');
}

/* ==============================
   TOAST NOTIFICATIONS
============================== */
function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add('active');
    
    setTimeout(() => {
        toast.classList.remove('active');
    }, 3000);
}

/* ==============================
   LOCAL STORAGE
============================== */
function saveToLocalStorage() {
    try {
        localStorage.setItem('easypark_places', JSON.stringify(appData.places));
        localStorage.setItem('easypark_history', JSON.stringify(appData.history));
        localStorage.setItem('easypark_tarifs', JSON.stringify(appData.tarifs));
        localStorage.setItem('easypark_sectors', JSON.stringify(appData.sectors));
    } catch (e) {
        console.error('Erreur sauvegarde localStorage:', e);
    }
}

function loadFromLocalStorage() {
    try {
        const savedPlaces = localStorage.getItem('easypark_places');
        const savedHistory = localStorage.getItem('easypark_history');
        const savedTarifs = localStorage.getItem('easypark_tarifs');
        const savedSectors = localStorage.getItem('easypark_sectors');

        if (savedPlaces) appData.places = JSON.parse(savedPlaces);
        if (savedHistory) appData.history = JSON.parse(savedHistory);
        if (savedTarifs) appData.tarifs = JSON.parse(savedTarifs);
        if (savedSectors) appData.sectors = JSON.parse(savedSectors);
    } catch (e) {
        console.error('Erreur chargement localStorage:', e);
    }
}

/* ==============================
   DONNÉES DE DÉMONSTRATION
============================== */
function addDemoData() {
    // Ne pas ajouter de données de démo si des données existent déjà
    if (appData.places.some(p => p.status !== 'libre')) {
        return;
    }

    console.log('📦 Ajout de données de démonstration...');

    // Ajouter des places occupées
    const demoPlaces = appData.places.slice(0, Math.min(8, appData.places.length));
    demoPlaces.forEach((place, index) => {
        setTimeout(() => {
            place.status = 'occupee';
            place.plate = generateRandomPlate();
            place.entryTime = new Date(Date.now() - Math.random() * 7200000).toISOString();
            renderSectors();
            updateStats();
        }, 100 * index);
    });

    // Ajouter des VIP
    const vipPlaces = appData.places.slice(8, Math.min(11, appData.places.length));
    const vipNames = ['M. Dupont', 'Mme Martin', 'Dr. Bernard'];
    setTimeout(() => {
        vipPlaces.forEach((place, index) => {
            if (place) {
                place.status = 'vip';
                place.vipName = vipNames[index] || 'VIP';
                place.plate = `VIP-${String(index + 1).padStart(3, '0')}`;
                place.entryTime = new Date(Date.now() - (3600000 * (index + 1))).toISOString();
            }
        });
        renderSectors();
        updateStats();
        saveToLocalStorage();
    }, 1000);

    // Ajouter de l'historique
    setTimeout(() => {
        for (let i = 0; i < 15; i++) {
            const entryTime = new Date(Date.now() - Math.random() * 86400000 * 7);
            const exitTime = new Date(entryTime.getTime() + Math.random() * 14400000);
            const isVIP = Math.random() > 0.8;
            const dureeHeures = (exitTime - entryTime) / (1000 * 60 * 60);
            
            appData.history.push({
                id: 'history-demo-' + i,
                plate: generateRandomPlate(),
                sector: appData.sectors[Math.floor(Math.random() * appData.sectors.length)]?.name || 'Secteur A',
                place: Math.floor(Math.random() * 20) + 1,
                entryTime: entryTime,
                exitTime: exitTime,
                isVIP: isVIP,
                price: calculatePrice(dureeHeures, isVIP)
            });
        }
        saveToLocalStorage();
        console.log('✅ Données de démonstration ajoutées');
    }, 1500);
}

/* ==============================
   UTILITAIRES
============================== */
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatDate(date) {
    return date.toLocaleDateString('fr-FR');
}

function formatTime(date) {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function formatDateTime(date) {
    if (!date) return '-';
    const d = new Date(date);
    return formatDate(d) + ' ' + formatTime(d);
}

function formatDateShort(date) {
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
}

function formatDateTimeInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function generateRandomPlate() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    return letters[Math.floor(Math.random() * letters.length)] +
           letters[Math.floor(Math.random() * letters.length)] + '-' +
           numbers[Math.floor(Math.random() * 10)] +
           numbers[Math.floor(Math.random() * 10)] +
           numbers[Math.floor(Math.random() * 10)] + '-' +
           letters[Math.floor(Math.random() * letters.length)] +
           letters[Math.floor(Math.random() * letters.length)];
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

console.log('✨ EASYPARK chargé avec succès');
