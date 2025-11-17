# etat-4001-analyse

Site statique pour le rendu académique : analyse de la base de données de l'État 4001 (faits de délinquance).

## Structure

- `index.html` - Page d'accueil
- `style.css` - Feuille de style principale
- `header.js` - Script pour la navigation dynamique
- `map-france.js` - Script pour la carte interactive de France
- `donnee-dep-data.gouv-2024-geographie2025-produit-le2025-06-04.csv` - Données de délinquance par département
- Pages HTML : histoire, construction, observatoire, dépassé, SSMSI, table-index

## Déploiement GitHub Pages

✅ **Compatible GitHub Pages** - Le site est entièrement compatible avec GitHub Pages.

### Instructions de déploiement :

1. Pousser le code sur GitHub (branche `main` ou `master`)
2. Aller dans Settings > Pages
3. Sélectionner la branche `main` et le dossier `/ (root)`
4. Le site sera accessible à l'adresse : `https://[votre-username].github.io/etat-4001-analyse-main/`

### Fichiers importants pour GitHub Pages :

- `.nojekyll` - Empêche GitHub de traiter le site avec Jekyll
- Tous les chemins sont relatifs (compatible avec GitHub Pages)
- Le fichier CSV est chargé via `fetch()` avec un chemin relatif

### Fonctionnalités :

- ✅ Navigation dynamique avec menu mobile
- ✅ Carte interactive de France par département
- ✅ Visualisation des taux d'infractions pour 10 000 habitants
- ✅ Filtres par type d'infraction et département
- ✅ Responsive design

## Contenu

Sections disponibles :
- Histoire de la base de données
- Construction de la base
- Observatoire de la délinquance
- Limites de l'outil
- Outil dépassé
- SSMSI
- Table des index avec carte interactive

## Notes techniques

- Le fichier CSV est chargé dynamiquement via JavaScript
- La carte utilise une représentation SVG simplifiée (fallback si GeoJSON non disponible)
- Compatible avec tous les navigateurs modernes supportant ES6+

## Contribuer

Ouvrez une issue ou proposez une PR sur le dépôt.
