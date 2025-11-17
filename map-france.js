// Script pour la carte interactive de France
let csvData = [];
let currentIndicateur = '';
let currentDepartement = '';

// Noms des départements
const departements = {
  '01': 'Ain', '02': 'Aisne', '03': 'Allier', '04': 'Alpes-de-Haute-Provence', '05': 'Hautes-Alpes',
  '06': 'Alpes-Maritimes', '07': 'Ardèche', '08': 'Ardennes', '09': 'Ariège', '10': 'Aube',
  '11': 'Aude', '12': 'Aveyron', '13': 'Bouches-du-Rhône', '14': 'Calvados', '15': 'Cantal',
  '16': 'Charente', '17': 'Charente-Maritime', '18': 'Cher', '19': 'Corrèze', '21': 'Côte-d\'Or',
  '22': 'Côtes-d\'Armor', '23': 'Creuse', '24': 'Dordogne', '25': 'Doubs', '26': 'Drôme',
  '27': 'Eure', '28': 'Eure-et-Loir', '29': 'Finistère', '2A': 'Corse-du-Sud', '2B': 'Haute-Corse',
  '30': 'Gard', '31': 'Haute-Garonne', '32': 'Gers', '33': 'Gironde', '34': 'Hérault',
  '35': 'Ille-et-Vilaine', '36': 'Indre', '37': 'Indre-et-Loire', '38': 'Isère', '39': 'Jura',
  '40': 'Landes', '41': 'Loir-et-Cher', '42': 'Loire', '43': 'Haute-Loire', '44': 'Loire-Atlantique',
  '45': 'Loiret', '46': 'Lot', '47': 'Lot-et-Garonne', '48': 'Lozère', '49': 'Maine-et-Loire',
  '50': 'Manche', '51': 'Marne', '52': 'Haute-Marne', '53': 'Mayenne', '54': 'Meurthe-et-Moselle',
  '55': 'Meuse', '56': 'Morbihan', '57': 'Moselle', '58': 'Nièvre', '59': 'Nord',
  '60': 'Oise', '61': 'Orne', '62': 'Pas-de-Calais', '63': 'Puy-de-Dôme', '64': 'Pyrénées-Atlantiques',
  '65': 'Hautes-Pyrénées', '66': 'Pyrénées-Orientales', '67': 'Bas-Rhin', '68': 'Haut-Rhin',
  '69': 'Rhône', '70': 'Haute-Saône', '71': 'Saône-et-Loire', '72': 'Sarthe', '73': 'Savoie',
  '74': 'Haute-Savoie', '75': 'Paris', '76': 'Seine-Maritime', '77': 'Seine-et-Marne',
  '78': 'Yvelines', '79': 'Deux-Sèvres', '80': 'Somme', '81': 'Tarn', '82': 'Tarn-et-Garonne',
  '83': 'Var', '84': 'Vaucluse', '85': 'Vendée', '86': 'Vienne', '87': 'Haute-Vienne',
  '88': 'Vosges', '89': 'Yonne', '90': 'Territoire de Belfort', '91': 'Essonne',
  '92': 'Hauts-de-Seine', '93': 'Seine-Saint-Denis', '94': 'Val-de-Marne', '95': 'Val-d\'Oise'
};

const excludedDepartements = new Set(['971', '972', '973', '974', '976']);

// Parser CSV simple
function parseCSV(text) {
  const lines = text.split('\n');
  const headers = lines[0].split(';').map(h => h.replace(/"/g, ''));
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const values = lines[i].split(';').map(v => v.replace(/"/g, ''));
    if (values.length < headers.length) continue;
    
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = values[index];
    });
    data.push(obj);
  }
  
  return data;
}

// Charger et traiter les données
async function loadData() {
  const mapContainer = document.getElementById('map-container');
  const mapSvg = document.getElementById('map-svg');
  
  try {
    // Afficher un message de chargement
    if (mapSvg) {
      mapSvg.innerHTML = '<p>Chargement des données...</p>';
    }
    
    // Utiliser un chemin relatif compatible GitHub Pages
    const csvPath = './donnee-dep-data.gouv-2024-geographie2025-produit-le2025-06-04.csv';
    const response = await fetch(csvPath);
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
    }
    
    const text = await response.text();
    
    if (!text || text.trim().length === 0) {
      throw new Error('Le fichier CSV est vide');
    }
    
    csvData = parseCSV(text);
    
    if (!csvData || csvData.length === 0) {
      throw new Error('Aucune donnée trouvée dans le fichier CSV');
    }
    
    // Extraire les indicateurs uniques
    const indicateurs = [...new Set(csvData.map(d => d.indicateur))].filter(Boolean).sort();
    
    if (indicateurs.length === 0) {
      throw new Error('Aucun indicateur trouvé dans les données');
    }
    
    // Remplir le menu déroulant des indicateurs
    const indicateurSelect = document.getElementById('indicateur-select');
    if (indicateurSelect) {
      indicateurSelect.innerHTML = '<option value="">Sélectionner une infraction</option>';
      indicateurs.forEach(ind => {
        const option = document.createElement('option');
        option.value = ind;
        option.textContent = ind;
        indicateurSelect.appendChild(option);
      });
    }
    
    // Remplir le menu déroulant des départements
    const deptSelect = document.getElementById('departement-select');
    if (deptSelect) {
      deptSelect.innerHTML = '<option value="">Tous les départements</option>';
      Object.keys(departements).sort().forEach(code => {
        const option = document.createElement('option');
        option.value = code;
        option.textContent = `${code} - ${departements[code]}`;
        deptSelect.appendChild(option);
      });
    }
    
    // Charger la carte SVG
    loadMap();
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error);
    const errorMsg = `
      <div class="error">
        <p><strong>Erreur lors du chargement des données</strong></p>
        <p>${error.message}</p>
        <p><small>Vérifiez que le fichier CSV est bien présent dans le répertoire et accessible.</small></p>
      </div>
    `;
    if (mapContainer) {
      mapContainer.innerHTML = errorMsg;
    } else if (mapSvg) {
      mapSvg.innerHTML = errorMsg;
    }
  }
}

// Charger la carte SVG de France depuis le fichier local coordonnes (GeoJSON)
async function loadMap() {
  try {
    const response = await fetch('./coordonnes', {
      mode: 'cors',
      cache: 'default'
    });
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP lors du chargement de coordonnes: ${response.status}`);
    }
    
    const geoData = await response.json();
    
    if (!geoData || !Array.isArray(geoData.features) || geoData.features.length === 0) {
      throw new Error('Le fichier coordonnes ne contient aucune feature GeoJSON valide.');
    }
    
    drawMapWithGeoJSON(geoData);
  } catch (error) {
    console.error('Impossible de charger la carte détaillée, utilisation du fallback simplifié.', error);
    createDepartementMap();
  }
}

// Dessiner la carte avec GeoJSON réel
function drawMapWithGeoJSON(geoData) {
  const container = document.getElementById('map-svg');
  if (!container) return;
  
  container.innerHTML = '';
  
  const width = 1000;
  const height = 1000;
  const padding = 40;
  const features = Array.isArray(geoData.features) ? geoData.features : [];
  const bounds = getGeoBounds(features);
  const project = createProjector(bounds, width, height, padding);
  
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('class', 'france-map');
  svg.style.width = '100%';
  svg.style.height = 'auto';
  container.appendChild(svg);
  
  features.forEach(feature => {
    const geometry = feature.geometry;
    const code = feature.properties?.code || feature.properties?.code_insee || feature.properties?.code_departement;
    
    if (!code || excludedDepartements.has(code)) {
      return;
    }
    
    if (!geometry || !code) {
      return;
    }
    
    const pathData = geometryToPath(geometry, project);
    
    if (!pathData) {
      return;
    }
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    path.setAttribute('class', 'departement-path');
    path.setAttribute('data-code', code);
    path.setAttribute('fill', '#e0e0e0');
    path.setAttribute('stroke', '#999');
    path.setAttribute('stroke-width', '0.8');
    
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    title.textContent = `${code} - ${departements[code] || 'Département'}`;
    path.appendChild(title);
    
    svg.appendChild(path);
  });
  
  updateMapColors();
}

function getGeoBounds(features) {
  const bounds = {
    minLon: Infinity,
    maxLon: -Infinity,
    minLat: Infinity,
    maxLat: -Infinity
  };
  
  features.forEach(feature => {
    forEachCoordinate(feature.geometry, coord => {
      const [lon, lat] = coord;
      
      if (typeof lon !== 'number' || typeof lat !== 'number') {
        return;
      }
      
      bounds.minLon = Math.min(bounds.minLon, lon);
      bounds.maxLon = Math.max(bounds.maxLon, lon);
      bounds.minLat = Math.min(bounds.minLat, lat);
      bounds.maxLat = Math.max(bounds.maxLat, lat);
    });
  });
  
  if (!isFinite(bounds.minLon) || !isFinite(bounds.maxLon) || !isFinite(bounds.minLat) || !isFinite(bounds.maxLat)) {
    return {minLon: 0, maxLon: 1, minLat: 0, maxLat: 1};
  }
  
  return bounds;
}

function createProjector(bounds, width, height, padding) {
  const lonRange = bounds.maxLon - bounds.minLon || 1;
  const latRange = bounds.maxLat - bounds.minLat || 1;
  
  const usableWidth = width - padding * 2;
  const usableHeight = height - padding * 2;
  const scale = Math.min(usableWidth / lonRange, usableHeight / latRange);
  const offsetX = padding + (usableWidth - lonRange * scale) / 2;
  const offsetY = padding + (usableHeight - latRange * scale) / 2;
  
  return ([lon, lat]) => {
    const x = offsetX + (lon - bounds.minLon) * scale;
    const y = height - (offsetY + (lat - bounds.minLat) * scale);
    return [Number(x.toFixed(2)), Number(y.toFixed(2))];
  };
}

function geometryToPath(geometry, project) {
  if (!geometry || !geometry.type || !geometry.coordinates) {
    return '';
  }
  
  if (geometry.type === 'Polygon') {
    return polygonToPath(geometry.coordinates, project);
  }
  
  if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates.map(poly => polygonToPath(poly, project)).join(' ');
  }
  
  return '';
}

function polygonToPath(rings, project) {
  if (!Array.isArray(rings)) return '';
  
  return rings.map(ring => {
    if (!Array.isArray(ring) || ring.length === 0) {
      return '';
    }
    
    const commands = ring.map((coord, index) => {
      const projected = project(coord);
      if (!projected) return '';
      const [x, y] = projected;
      const cmd = index === 0 ? 'M' : 'L';
      return `${cmd}${x} ${y}`;
    }).filter(Boolean);
    
    if (commands.length === 0) {
      return '';
    }
    
    return `${commands.join(' ')} Z`;
  }).filter(Boolean).join(' ');
}

function forEachCoordinate(geometry, callback) {
  if (!geometry || !geometry.coordinates) return;
  
  const iterate = (coords) => {
    if (!Array.isArray(coords)) return;
    
    if (typeof coords[0] === 'number' && typeof coords[1] === 'number') {
      callback(coords);
      return;
    }
    
    coords.forEach(iterate);
  };
  
  iterate(geometry.coordinates);
}

// Créer une carte basique avec les départements (version simplifiée)
function createDepartementMap() {
  const container = document.getElementById('map-svg');
  const existingSvg = container.querySelector('svg');
  
  if (!existingSvg) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 1000 800');
    svg.setAttribute('class', 'france-map');
    svg.style.width = '100%';
    svg.style.height = 'auto';
    container.appendChild(svg);
  }
  
  const svg = container.querySelector('svg');
  svg.innerHTML = '';
  
  // Créer une grille simplifiée représentant les départements
  // Position approximative des départements sur une carte de France
  const deptPositions = {
    '75': {x: 480, y: 350, width: 20, height: 20}, // Paris
    '77': {x: 500, y: 320, width: 40, height: 30}, // Seine-et-Marne
    '78': {x: 450, y: 320, width: 30, height: 30}, // Yvelines
    '91': {x: 480, y: 370, width: 30, height: 30}, // Essonne
    '92': {x: 460, y: 340, width: 25, height: 20}, // Hauts-de-Seine
    '93': {x: 500, y: 340, width: 25, height: 20}, // Seine-Saint-Denis
    '94': {x: 510, y: 360, width: 25, height: 20}, // Val-de-Marne
    '95': {x: 480, y: 300, width: 30, height: 30}, // Val-d'Oise
    '13': {x: 600, y: 500, width: 40, height: 50}, // Bouches-du-Rhône
    '69': {x: 550, y: 450, width: 30, height: 40}, // Rhône
    '31': {x: 450, y: 550, width: 40, height: 50}, // Haute-Garonne
    '33': {x: 400, y: 580, width: 50, height: 40}, // Gironde
    '44': {x: 300, y: 400, width: 50, height: 60}, // Loire-Atlantique
    '59': {x: 500, y: 200, width: 40, height: 50}, // Nord
    '06': {x: 650, y: 520, width: 30, height: 40}, // Alpes-Maritimes
    '34': {x: 500, y: 520, width: 40, height: 40}, // Hérault
    '67': {x: 600, y: 350, width: 30, height: 40}, // Bas-Rhin
    '68': {x: 620, y: 360, width: 30, height: 40}, // Haut-Rhin
    '76': {x: 450, y: 250, width: 50, height: 40}, // Seine-Maritime
  };
  
  // Créer les paths pour chaque département
  Object.keys(departements).forEach(code => {
    const dept = departements[code];
    let path;
    
    if (deptPositions[code]) {
      const pos = deptPositions[code];
      path = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      path.setAttribute('x', pos.x);
      path.setAttribute('y', pos.y);
      path.setAttribute('width', pos.width);
      path.setAttribute('height', pos.height);
    } else {
      // Pour les autres départements, créer un rectangle générique positionné approximativement
      path = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      // Position approximative basée sur le code départemental
      let x, y;
      const codeNum = parseInt(code);
      
      // Gérer les cas spéciaux (Corse, DOM-TOM)
      if (code === '2A' || code === '2B') {
        // Corse
        x = code === '2A' ? 650 : 680;
        y = 520;
      } else if (!isNaN(codeNum)) {
        if (codeNum < 100) {
          // Départements métropolitains
          x = 150 + (codeNum % 10) * 80;
          y = 150 + Math.floor(codeNum / 10) * 60;
        } else {
          // DOM-TOM (971-976)
          x = 50 + ((codeNum - 970) % 3) * 120;
          y = 700 + Math.floor((codeNum - 970) / 3) * 60;
        }
      } else {
        // Code non reconnu, position par défaut
        x = 100;
        y = 100;
      }
      
      path.setAttribute('x', x);
      path.setAttribute('y', y);
      path.setAttribute('width', 35);
      path.setAttribute('height', 35);
    }
    
    path.setAttribute('class', 'departement-path');
    path.setAttribute('data-code', code);
    path.setAttribute('rx', '3');
    
    // Ajouter le nom du département comme titre
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    title.textContent = `${code} - ${dept}`;
    path.appendChild(title);
    
    svg.appendChild(path);
    
    // Ajouter le code du département sur la carte (optionnel, peut être encombrant)
    if (deptPositions[code]) {
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', deptPositions[code].x + deptPositions[code].width / 2);
      text.setAttribute('y', deptPositions[code].y + deptPositions[code].height / 2);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'middle');
      text.setAttribute('font-size', '10');
      text.setAttribute('fill', '#333');
      text.textContent = code;
      svg.appendChild(text);
    }
  });
  
  // Mettre à jour les couleurs
  updateMapColors();
}

// Mettre à jour les couleurs de la carte
function updateMapColors() {
  if (!currentIndicateur) {
    // Réinitialiser toutes les couleurs
    document.querySelectorAll('.departement-path').forEach(path => {
      path.style.fill = '#e0e0e0';
      path.style.stroke = '#999';
    });
    return;
  }
  
  // Filtrer les données pour l'indicateur sélectionné
  let filteredData = csvData.filter(d => d.indicateur === currentIndicateur);
  
  // Si un département est sélectionné, filtrer aussi
  if (currentDepartement) {
    filteredData = filteredData.filter(d => d.Code_departement === currentDepartement);
  }
  
  // Calculer les taux pour 10 000 habitants (le CSV a taux_pour_mille, donc * 10)
  const tauxData = {};
  filteredData.forEach(d => {
    const code = d.Code_departement;
    if (!code || excludedDepartements.has(code)) {
      return;
    }
    const tauxPourMille = parseFloat(d.taux_pour_mille.replace(',', '.'));
    const tauxPourDixMille = tauxPourMille * 10;
    
    if (!tauxData[code] || tauxPourDixMille > tauxData[code].taux) {
      tauxData[code] = {
        taux: tauxPourDixMille,
        nombre: parseInt(d.nombre) || 0,
        population: parseInt(d.insee_pop) || 0
      };
    }
  });
  
  // Trouver min et max pour l'échelle de couleurs
  const tauxValues = Object.values(tauxData).map(d => d.taux).filter(v => !isNaN(v) && v > 0);
  const minTaux = tauxValues.length > 0 ? Math.min(...tauxValues) : 0;
  const maxTaux = tauxValues.length > 0 ? Math.max(...tauxValues) : 1;
  
  // Fonction pour obtenir la couleur selon le taux
  function getColor(taux) {
    if (isNaN(taux) || taux === 0) return '#e0e0e0';
    
    const normalized = (taux - minTaux) / (maxTaux - minTaux || 1);
    // Dégradé du bleu clair au rouge foncé
    const r = Math.round(255 * normalized);
    const b = Math.round(255 * (1 - normalized));
    return `rgb(${r}, 100, ${b})`;
  }
  
  // Mettre à jour les couleurs des départements
  document.querySelectorAll('.departement-path').forEach(path => {
    const code = path.getAttribute('data-code');
    const data = tauxData[code];
    
    // Supprimer les anciens titres
    const oldTitle = path.querySelector('title');
    if (oldTitle) {
      oldTitle.remove();
    }
    
    if (data && data.taux > 0) {
      path.style.fill = getColor(data.taux);
      path.style.stroke = '#333';
      path.style.strokeWidth = '1';
      
      // Ajouter un titre pour l'info-bulle
      const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      title.textContent = `${departements[code] || code}: ${data.taux.toFixed(2)} pour 10 000 hab. (${data.nombre} cas)`;
      path.appendChild(title);
    } else {
      path.style.fill = '#e0e0e0';
      path.style.stroke = '#999';
      
      // Ajouter un titre même sans données
      const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      title.textContent = `${departements[code] || code}: Aucune donnée disponible`;
      path.appendChild(title);
    }
  });
  
  // Mettre à jour la légende
  updateLegend(minTaux, maxTaux);
  
  // Mettre à jour les statistiques
  updateStats(tauxData);
}

// Mettre à jour la légende
function updateLegend(min, max) {
  const legend = document.getElementById('legend');
  if (!legend) return;
  
  legend.innerHTML = `
    <h4>Légende (taux pour 10 000 habitants)</h4>
    <div class="legend-scale">
      <div class="legend-item">
        <span class="legend-color" style="background: rgb(0, 100, 255);"></span>
        <span>${min.toFixed(2)}</span>
      </div>
      <div class="legend-gradient"></div>
      <div class="legend-item">
        <span class="legend-color" style="background: rgb(255, 100, 0);"></span>
        <span>${max.toFixed(2)}</span>
      </div>
    </div>
  `;
}

// Mettre à jour les statistiques
function updateStats(tauxData) {
  const stats = document.getElementById('stats');
  if (!stats) return;
  
  const codes = Object.keys(tauxData);
  if (codes.length === 0) {
    stats.innerHTML = '<p>Aucune donnée disponible pour cette sélection.</p>';
    return;
  }
  
  const tauxValues = Object.values(tauxData).map(d => d.taux).filter(v => !isNaN(v) && v > 0);
  const total = Object.values(tauxData).reduce((sum, d) => sum + d.nombre, 0);
  const avgTaux = tauxValues.length > 0 ? tauxValues.reduce((a, b) => a + b, 0) / tauxValues.length : 0;
  
  const maxCode = codes.reduce((a, b) => tauxData[a].taux > tauxData[b].taux ? a : b);
  const minCode = codes.reduce((a, b) => tauxData[a].taux < tauxData[b].taux ? a : b);
  
  stats.innerHTML = `
    <h4>Statistiques</h4>
    <ul>
      <li><strong>Total de cas:</strong> ${total.toLocaleString()}</li>
      <li><strong>Taux moyen:</strong> ${avgTaux.toFixed(2)} pour 10 000 hab.</li>
      <li><strong>Département le plus élevé:</strong> ${departements[maxCode] || maxCode} (${tauxData[maxCode].taux.toFixed(2)})</li>
      <li><strong>Département le plus bas:</strong> ${departements[minCode] || minCode} (${tauxData[minCode].taux.toFixed(2)})</li>
    </ul>
  `;
}

// Gestionnaires d'événements
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  
  const indicateurSelect = document.getElementById('indicateur-select');
  const deptSelect = document.getElementById('departement-select');
  
  if (indicateurSelect) {
    indicateurSelect.addEventListener('change', (e) => {
      currentIndicateur = e.target.value;
      updateMapColors();
    });
  }
  
  if (deptSelect) {
    deptSelect.addEventListener('change', (e) => {
      currentDepartement = e.target.value;
      updateMapColors();
    });
  }
});

