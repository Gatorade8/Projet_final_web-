# Gestionnaire de Budget Personnel

Application web pour gerer ses revenus et depenses avec des graphiques.

## Comment lancer le projet

### 1. Installer les dependances

```bash
npm install
```

### 2. Lancer le serveur backend

Ouvre un terminal et tape :
```bash
npm run server
```
Le back sera sur `http://localhost:3001`

### 3. Lancer le serveur de developpement (frontend)

Ouvre un **deuxieme** terminal :
```bash
npm run dev
```

L'app sera dispo sur `http://localhost:5173`


## Fonctionnalites

- Ajouter des revenus et des depenses
- Voir le solde actuel, total revenus et total depenses
- Graphique en donut pour voir la repartition par categorie
- Filtre des transactions par categorie
- Supression de transactions
- Sauvegarde dans un fichier `data/transactions.json` via le serveur Express

## Technologies

- React + TypeScript
- Vite
- Chart.js
- Express.js (Backend)
