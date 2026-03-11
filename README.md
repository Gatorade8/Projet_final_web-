# Gestionnaire de Budget Personnel

Application web pour gerer ses revenus et depenses avec des graphiques.

## Comment lancer le projet

Le projet est divisé en 2 dossiers : un pour le backend et un pour le frontend.
Il faut ouvrir deux terminaux différents.

### 1. Lancer le backend

Ouvrir un premier terminal, se déplacer dans le dossier `backend` et installer les dépendances :
```bash
cd backend
npm install
```

Ensuite, démarrer l'API :
```bash
npm start
```
Le serveur répondra sur `http://localhost:3001`

### 2. Lancer le frontend (interface)

Ouvrir un deuxième terminal, aller dans le dossier `frontend` et installer les modules :
```bash
cd frontend
npm install
```

Puis lancer le serveur de développement Vite :
```bash
npm run dev
```

L'application sera disponible sur `http://localhost:5173`


## Fonctionnalites

- Ajouter des revenus et des depenses
- Voir le solde actuel, total revenus et total depenses
- Graphique en donut pour voir la repartition par categorie
- Filtre des transactions par categorie
- Supression de transactions
- Sauvegarde dans un fichier `data/transactions.json` via le serveur Express
- Site déployé sur https://projet-final-web-cjuf.onrender.com/ (Forfait gratuit donc une fois que le server se restart au bout de 15 min, les données ajouté/supprimer sont perdu. Pas eu le temps de mettre en place une base de donnée qui sauvegarde en PROD.)

## Technologies

- React + TypeScript
- Vite
- Chart.js
- Express.js (Backend)
- Render (PROD)