// =====================================================
// NEXUS - Plateforme IA de Supervision Routière
// Gestion complète des boutons et interactions
// =====================================================

/* ==============================
   DONNÉES GLOBALES
============================== */
const nexusData = {
    currentView: 'dashboard',
    alerts: [],
    selectedAlert: null,
    incidents: [],
    cameras: [],
    timelineEvents: [],
    criticalMode: false,
    role: 'supervisor',
    stats: {
        activeIncidents: 0,
        detectionsDay: 145,
        riskZones: 8,
        activeCameras: 32
    }
};

/* ==============================
   INITIALISATION
============================== */
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initialisation NEXUS...');
    initializeApp();
    setupEventListeners();
    generateDemoData();
    updateClock();
    setInterval(updateClock, 1000);
    console.log('✅ NEXUS initialisé');
});

function initializeApp() {
    document.body.classList.add('dark-mode');
    updateClock();
}

function updateClock() {
    const timeDisplay = document.getElementById('timeDisplay');
    if (timeDisplay) {
        const now = new Date();
        timeDisplay.textContent = now.toLocaleTimeString('fr-FR');
    }
}

/* ==============================
   GESTION DES ÉVÉNEMENTS
============================== */
function setupEventListeners() {
    // Navigation principale
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            const view = this.dataset.view;
            switchView(view);
        });
    });

    // Bouton Mode Critique
    const btnCriticalMode = document.getElementById('btnCriticalMode');
    if (btnCriticalMode) {
        btnCriticalMode.addEventListener('click', toggleCriticalMode);
    }

    // Sélecteur de rôle
    const roleSelect = document.getElementById('roleSelect');
    if (roleSelect) {
        roleSelect.addEventListener('change', function() {
            nexusData.role = this.value;
            showToast(`👤 Rôle changé: ${this.options[this.selectedIndex].text}`);
        });
    }

    // Bouton Paramètres
    const btnSettings = document.getElementById('btnSettings');
    if (btnSettings) {
        btnSettings.addEventListener('click', openSettings);
    }

    // Filtres d'alertes
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.dataset.filter;
            applyAlertFilter(filter);
        });
    });

    // Contrôles de la carte
    const btnZoomIn = document.getElementById('btnZoomIn');
    const btnZoomOut = document.getElementById('btnZoomOut');
    const btnMapReset = document.getElementById('btnMapReset');
    
    if (btnZoomIn) btnZoomIn.addEventListener('click', () => zoomMap(1.2));
    if (btnZoomOut) btnZoomOut.addEventListener('click', () => zoomMap(0.8));
    if (btnMapReset) btnMapReset.addEventListener('click', resetMap);

    // Recherche de plaque
    const btnSearchPlate = document.getElementById('btnSearchPlate');
    const plateInput = document.getElementById('plateInput');
    
    if (btnSearchPlate) {
        btnSearchPlate.addEventListener('click', searchPlate);
    }
    if (plateInput) {
        plateInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') searchPlate();
        });
    }

    // Génération de rapports
    const btnGenerateReport = document.getElementById('btnGenerateReport');
    const btnExportCSV = document.getElementById('btnExportCSV');
    
    if (btnGenerateReport) {
        btnGenerateReport.addEventListener('click', generateReport);
    }
    if (btnExportCSV) {
        btnExportCSV.addEventListener('click', exportToCSV);
    }

    // Actions rapides
    const btnExportCurrent = document.getElementById('btnExportCurrent');
    const btnCallPolice = document.getElementById('btnCallPolice');
    const btnOpenCase = document.getElementById('btnOpenCase');
    const btnArchiveAlert = document.getElementById('btnArchiveAlert');
    
    if (btnExportCurrent) btnExportCurrent.addEventListener('click', () => showToast('📸 Export en cours...'));
    if (btnCallPolice) btnCallPolice.addEventListener('click', () => showToast('📞 Appel police en cours...'));
    if (btnOpenCase) btnOpenCase.addEventListener('click', () => showToast('📂 Dossier ouvert'));
    if (btnArchiveAlert) btnArchiveAlert.addEventListener('click', archiveSelectedAlert);

    // Modal close
    const btnCloseModal = document.getElementById('btnCloseModal');
    if (btnCloseModal) {
        btnCloseModal.addEventListener('click', closeModal);
    }

    // Fermer modal en cliquant dehors
    const alertModal = document.getElementById('alertModal');
    if (alertModal) {
        alertModal.addEventListener('click', function(e) {
            if (e.target === this) closeModal();
        });
    }

    initHeatmap();
}

/* ==============================
   NAVIGATION ENTRE VUES
============================== */
function switchView(viewName) {
    nexusData.currentView = viewName;

    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.view === viewName) {
            item.classList.add('active');
        }
    });

    document.getElementById('dashboardMain').style.display = 'none';
    document.getElementById('plateAnalysis').style.display = 'none';
    document.getElementById('analyticsView').style.display = 'none';
    document.getElementById('reportsView').style.display = 'none';

    switch(viewName) {
        case 'dashboard':
            document.getElementById('dashboardMain').style.display = 'block';
            renderDashboard();
            break;
        case 'plates':
            document.getElementById('plateAnalysis').style.display = 'block';
            break;
        case 'analytics':
            document.getElementById('analyticsView').style.display = 'block';
            renderAnalytics();
            break;
        case 'reports':
            document.getElementById('reportsView').style.display = 'block';
            break;
    }
}

/* ==============================
   MODE CRITIQUE
============================== */
function toggleCriticalMode() {
    nexusData.criticalMode = !nexusData.criticalMode;
    
    const btnCriticalMode = document.getElementById('btnCriticalMode');
    const systemStatus = document.getElementById('systemStatus');
    
    if (nexusData.criticalMode) {
        document.body.classList.add('critical-mode');
        btnCriticalMode.classList.add('active');
        systemStatus.innerHTML = '<span class="status-dot critical"></span><span>MODE CRITIQUE ACTIF</span>';
        showToast('⚠️ MODE CRITIQUE ACTIVÉ');
    } else {
        document.body.classList.remove('critical-mode');
        btnCriticalMode.classList.remove('active');
        systemStatus.innerHTML = '<span class="status-dot"></span><span>Système Actif</span>';
        showToast('✅ Mode critique désactivé');
    }
}

/* ==============================
   PARAMÈTRES
============================== */
function openSettings() {
    showToast('⚙️ Ouverture des paramètres...');
}

/* ==============================
   FILTRES D'ALERTES
============================== */
function applyAlertFilter(filter) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        }
    });
    renderAlerts(filter);
}

/* ==============================
   CARTE HEATMAP
============================== */
function initHeatmap() {
    const canvas = document.getElementById('mapCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth || 800;
    canvas.height = canvas.offsetHeight || 400;
    drawBaseMap(ctx, canvas.width, canvas.height);
    drawHeatPoints(ctx, canvas.width, canvas.height);
}

function drawBaseMap(ctx, width, height) {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#2d2d44';
    ctx.lineWidth = 1;
    
    for (let x = 0; x < width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }
    
    for (let y = 0; y < height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }

    ctx.strokeStyle = '#3d3d5c';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();
}

function drawHeatPoints(ctx, width, height) {
    const heatPoints = [
        { x: width * 0.3, y: height * 0.4, level: 'critical', radius: 60 },
        { x: width * 0.7, y: height * 0.6, level: 'important', radius: 50 },
        { x: width * 0.5, y: height * 0.3, level: 'watch', radius: 40 },
        { x: width * 0.2, y: height * 0.7, level: 'safe', radius: 30 }
    ];

    heatPoints.forEach(point => {
        const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, point.radius);
        
        let color;
        switch(point.level) {
            case 'critical': color = 'rgba(255, 0, 0, 0.6)'; break;
            case 'important': color = 'rgba(255, 165, 0, 0.5)'; break;
            case 'watch': color = 'rgba(255, 255, 0, 0.4)'; break;
            case 'safe': color = 'rgba(0, 255, 0, 0.3)'; break;
        }

        gradient.addColorStop(0, color);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
        ctx.fill();
    });
}

function zoomMap(factor) {
    showToast('🔍 Zoom ajusté');
    initHeatmap();
}

function resetMap() {
    showToast('🏠 Carte réinitialisée');
    initHeatmap();
}

/* ==============================
   RECHERCHE DE PLAQUE
============================== */
function searchPlate() {
    const plateInput = document.getElementById('plateInput');
    const plateResult = document.getElementById('plateResult');
    
    if (!plateInput || !plateResult) return;

    const plate = plateInput.value.trim().toUpperCase();
    
    if (!plate) {
        showToast('⚠️ Veuillez entrer une plaque');
        return;
    }

    plateResult.innerHTML = `
        <div class="plate-card">
            <div class="plate-header">
                <span class="plate-number">${escapeHtml(plate)}</span>
                <span class="plate-status found">TROUVÉE</span>
            </div>
            <div class="plate-info">
                <p><strong>Véhicule:</strong> Peugeot 308 - Gris</p>
                <p><strong>Propriétaire:</strong> M. DUPONT Jean</p>
                <p><strong>Dernière détection:</strong> Il y a 2 heures - Zone A3</p>
                <p><strong>Statut:</strong> Véhicule surveillé</p>
            </div>
            <div class="plate-actions">
                <button class="btn-action-small">📍 Localiser</button>
                <button class="btn-action-small">📋 Historique</button>
                <button class="btn-action-small">⚠️ Signaler</button>
            </div>
        </div>
    `;

    showToast(`🔍 Recherche effectuée: ${plate}`);
}

/* ==============================
   ANALYTICS
============================== */
function renderAnalytics() {
    renderChart('chartDangerZones', 'bar', ['Zone A', 'Zone B', 'Zone C', 'Zone D'], [25, 18, 12, 8]);
    renderChart('chartCriticalHours', 'line', ['00h', '04h', '08h', '12h', '16h', '20h'], [5, 3, 15, 22, 28, 18]);
    renderChart('chartCameraPerf', 'doughnut', ['OK', 'Maintenance', 'HS'], [28, 3, 1]);
    renderChart('chartRecidivism', 'pie', ['Première', 'Récidiviste'], [65, 35]);
    renderAnalyticsTable();
}

function renderChart(canvasId, type, labels, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth || 300;
    canvas.height = canvas.offsetHeight || 200;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const colors = ['#ff4757', '#ffa502', '#2ed573', '#1e90ff', '#3742fa'];

    if (type === 'bar') {
        const barWidth = (canvas.width - 60) / data.length - 10;
        const maxValue = Math.max(...data);

        data.forEach((value, index) => {
            const barHeight = (value / maxValue) * (canvas.height - 40);
            const x = 40 + index * (barWidth + 10);
            const y = canvas.height - 20 - barHeight;

            ctx.fillStyle = colors[index % colors.length];
            ctx.fillRect(x, y, barWidth, barHeight);

            ctx.fillStyle = '#ffffff';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(labels[index], x + barWidth / 2, canvas.height - 5);
            ctx.fillText(value.toString(), x + barWidth / 2, y - 5);
        });
    } else if (type === 'line') {
        const stepX = (canvas.width - 60) / (data.length - 1);
        const maxValue = Math.max(...data);

        ctx.strokeStyle = '#2ed573';
        ctx.lineWidth = 2;
        ctx.beginPath();

        data.forEach((value, index) => {
            const x = 40 + index * stepX;
            const y = canvas.height - 20 - (value / maxValue) * (canvas.height - 40);

            if (index === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);

            ctx.fillStyle = '#2ed573';
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        labels.forEach((label, index) => {
            const x = 40 + index * stepX;
            ctx.fillText(label, x, canvas.height - 5);
        });
    } else if (type === 'doughnut' || type === 'pie') {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2 + 10;
        const radius = Math.min(centerX, centerY) - 20;
        const total = data.reduce((a, b) => a + b, 0);

        let startAngle = -Math.PI / 2;

        data.forEach((value, index) => {
            const sliceAngle = (value / total) * Math.PI * 2;
            
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
            ctx.closePath();

            ctx.fillStyle = colors[index % colors.length];
            ctx.fill();

            startAngle += sliceAngle;
        });

        if (type === 'doughnut') {
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius * 0.5, 0, Math.PI * 2);
            ctx.fillStyle = '#1a1a2e';
            ctx.fill();
        }
    }
}

function renderAnalyticsTable() {
    const tbody = document.getElementById('analyticsTableBody');
    if (!tbody) return;

    const tableData = [
        { zone: 'Zone A - Centre', incidents: 25, fauxPositifs: 3, tauxResolution: '92%', cameras: 8 },
        { zone: 'Zone B - Nord', incidents: 18, fauxPositifs: 2, tauxResolution: '88%', cameras: 6 },
        { zone: 'Zone C - Sud', incidents: 12, fauxPositifs: 1, tauxResolution: '95%', cameras: 5 },
        { zone: 'Zone D - Est', incidents: 8, fauxPositifs: 0, tauxResolution: '97%', cameras: 4 }
    ];

    tbody.innerHTML = tableData.map(row => `
        <tr>
            <td>${row.zone}</td>
            <td>${row.incidents}</td>
            <td>${row.fauxPositifs}</td>
            <td>${row.tauxResolution}</td>
            <td>${row.cameras}</td>
        </tr>
    `).join('');
}

/* ==============================
   RAPPORTS
============================== */
function generateReport() {
    const reportType = document.getElementById('reportType').value;
    showToast(`📥 Génération du rapport ${reportType}...`);
    setTimeout(() => showToast('✅ Rapport généré avec succès!'), 1500);
}

function exportToCSV() {
    showToast('📊 Export CSV en cours...');
    setTimeout(() => showToast('✅ Export CSV terminé!'), 1000);
}

/* ==============================
   ALERTES
============================== */
function generateDemoData() {
    nexusData.alerts = [
        { id: 1, type: 'critical', title: 'Véhicule volé détecté', location: 'Zone A3 - Avenue Principale', time: 'Il y a 5 min', description: 'Plaque: 75ABC1234 - Correspondance base de données véhicules volés', confidence: 98 },
        { id: 2, type: 'important', title: 'Excès de vitesse', location: 'Zone B2 - Boulevard Central', time: 'Il y a 12 min', description: 'Véhicule: 92XYZ789 - Vitesse: 85 km/h dans zone 50', confidence: 95 },
        { id: 3, type: 'watch', title: 'Stationnement interdit', location: 'Zone C1 - Rue de la Paix', time: 'Il y a 25 min', description: 'Plaque: 69DEF456 - Véhicule en zone interdite depuis 15 min', confidence: 87 },
        { id: 4, type: 'critical', title: 'Conduite dangereuse', location: 'Zone D4 - Autoroute A1', time: 'Il y a 30 min', description: 'Changements de voie brusques détectés - Plaque: 13GHI321', confidence: 91 },
        { id: 5, type: 'important', title: 'Feu rouge non respecté', location: 'Zone A1 - Carrefour Principal', time: 'Il y a 45 min', description: 'Plaque: 34JKL654 - Intersection contrôlée', confidence: 99 }
    ];

    nexusData.timelineEvents = [
        { time: '14:32', event: 'Détection véhicule suspect', type: 'critical' },
        { time: '14:28', event: 'Alerte stationnement', type: 'watch' },
        { time: '14:25', event: 'Contrôle automatique', type: 'safe' },
        { time: '14:20', event: 'Excès vitesse signalé', type: 'important' },
        { time: '14:15', event: 'Système démarré', type: 'safe' }
    ];

    nexusData.cameras = [
        { id: 1, name: 'CAM-A01', status: 'online', quality: 98 },
        { id: 2, name: 'CAM-A02', status: 'online', quality: 95 },
        { id: 3, name: 'CAM-B01', status: 'maintenance', quality: 0 },
        { id: 4, name: 'CAM-B02', status: 'online', quality: 92 },
        { id: 5, name: 'CAM-C01', status: 'online', quality: 97 },
        { id: 6, name: 'CAM-D01', status: 'offline', quality: 0 }
    ];

    renderAlerts('all');
    renderTimeline();
    renderCameras();
    updateStats();
}

function renderAlerts(filter = 'all') {
    const container = document.getElementById('alertsContainer');
    if (!container) return;

    let filteredAlerts = nexusData.alerts;
    if (filter !== 'all') {
        filteredAlerts = nexusData.alerts.filter(alert => alert.type === filter);
    }

    container.innerHTML = filteredAlerts.map(alert => `
        <div class="alert-item ${alert.type}" data-alert-id="${alert.id}">
            <div class="alert-icon">${getAlertIcon(alert.type)}</div>
            <div class="alert-content">
                <div class="alert-title">${escapeHtml(alert.title)}</div>
                <div class="alert-location">${escapeHtml(alert.location)}</div>
                <div class="alert-time">${alert.time}</div>
            </div>
            <div class="alert-confidence">${alert.confidence}%</div>
        </div>
    `).join('');

    container.querySelectorAll('.alert-item').forEach(item => {
        item.addEventListener('click', function() {
            const alertId = parseInt(this.dataset.alertId);
            selectAlert(alertId);
        });
    });

    updateAlertStats();
}

function getAlertIcon(type) {
    switch(type) {
        case 'critical': return '🚨';
        case 'important': return '⚠️';
        case 'watch': return '👁️';
        default: return 'ℹ️';
    }
}

function selectAlert(alertId) {
    const alert = nexusData.alerts.find(a => a.id === alertId);
    if (!alert) return;

    nexusData.selectedAlert = alert;

    document.querySelectorAll('.alert-item').forEach(item => {
        item.classList.remove('selected');
        if (parseInt(item.dataset.alertId) === alertId) {
            item.classList.add('selected');
        }
    });

    showIncidentDetails(alert);
    showAISuggestion(alert);
}

function showIncidentDetails(alert) {
    const container = document.getElementById('incidentDetails');
    if (!container) return;

    container.innerHTML = `
        <div class="detail-row">
            <span class="detail-label">Type:</span>
            <span class="detail-value ${alert.type}">${alert.type.toUpperCase()}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Titre:</span>
            <span class="detail-value">${escapeHtml(alert.title)}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Localisation:</span>
            <span class="detail-value">${escapeHtml(alert.location)}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Heure:</span>
            <span class="detail-value">${alert.time}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Description:</span>
            <span class="detail-value">${escapeHtml(alert.description)}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Confiance IA:</span>
            <span class="detail-value">${alert.confidence}%</span>
        </div>
    `;
}

function showAISuggestion(alert) {
    const container = document.getElementById('aiSuggestion');
    if (!container) return;

    const suggestions = {
        critical: `<div class="suggestion-box critical"><h4>🤖 Recommandation IA Prioritaire</h4><ul><li>🚔 Déployer unité de police immédiate</li><li>📸 Activer toutes les caméras de la zone</li><li>📞 Contacter le centre de commandement</li><li>🔒 Verrouiller les accès périphériques</li></ul><div class="ai-confidence">Niveau de confiance: ${alert.confidence}%</div></div>`,
        important: `<div class="suggestion-box important"><h4>🤖 Recommandation IA</h4><ul><li>📋 Créer un rapport d'incident</li><li>👁️ Surveiller la zone pendant 30 min</li><li>📧Notifier l'équipe de terrain</li></ul><div class="ai-confidence">Niveau de confiance: ${alert.confidence}%</div></div>`,
        watch: `<div class="suggestion-box watch"><h4>🤖 Surveillance Recommandée</h4><ul><li>👁️ Maintenir surveillance passive</li><li>📊 Enregistrer les données pour analyse</li><li>⏰ Revérifier dans 1 heure</li></ul><div class="ai-confidence">Niveau de confiance: ${alert.confidence}%</div></div>`
    };

    container.innerHTML = suggestions[alert.type] || suggestions.watch;
}

function renderTimeline() {
    const container = document.getElementById('timelineContainer');
    if (!container) return;

    container.innerHTML = nexusData.timelineEvents.map(event => `
        <div class="timeline-item ${event.type}">
            <div class="timeline-time">${event.time}</div>
            <div class="timeline-dot"></div>
            <div class="timeline-event">${event.event}</div>
        </div>
    `).join('');
}

function renderCameras() {
    const container = document.getElementById('camerasList');
    if (!container) return;

    container.innerHTML = nexusData.cameras.map(camera => `
        <div class="camera-item ${camera.status}">
            <div class="camera-status-dot"></div>
            <div class="camera-info">
                <div class="camera-name">${escapeHtml(camera.name)}</div>
                <div class="camera-quality">${camera.quality > 0 ? camera.quality + '%' : '--'}</div>
            </div>
        </div>
    `).join('');
}

function updateAlertStats() {
    document.getElementById('statCritical').textContent = nexusData.alerts.filter(a => a.type === 'critical').length;
    document.getElementById('statImportant').textContent = nexusData.alerts.filter(a => a.type === 'important').length;
    document.getElementById('statWatch').textContent = nexusData.alerts.filter(a => a.type === 'watch').length;
}

function updateStats() {
    document.getElementById('statActiveIncidents').textContent = nexusData.alerts.length;
    document.getElementById('statDetectionsDay').textContent = nexusData.stats.detectionsDay;
    document.getElementById('statRiskZones').textContent = nexusData.stats.riskZones;
    document.getElementById('statCameras').textContent = nexusData.stats.activeCameras;
}

function archiveSelectedAlert() {
    if (!nexusData.selectedAlert) {
        showToast('⚠️ Aucune alerte sélectionnée');
        return;
    }
    showToast('📁 Alerte archivée avec succès');
    nexusData.selectedAlert = null;
    document.querySelectorAll('.alert-item').forEach(item => item.classList.remove('selected'));
    document.getElementById('incidentDetails').innerHTML = '<h3>📌 Détails Incident</h3><div class="details-placeholder"><p>Aucun incident sélectionné</p></div>';
    document.getElementById('aiSuggestion').innerHTML = '<div class="suggestion-placeholder"><p>Sélectionnez une alerte pour afficher les recommandations IA</p></div>';
}

/* ==============================
   MODAL
============================== */
function closeModal() {
    const modal = document.getElementById('alertModal');
    if (modal) modal.style.display = 'none';
}

/* ==============================
   TOAST NOTIFICATIONS
============================== */
function showToast(message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;

    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/* ==============================
   UTILITAIRES
============================== */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function renderDashboard() {
    updateStats();
}
