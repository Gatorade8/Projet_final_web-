# Gestionnaire de Budget Personnel

Application web pour gerer ses revenus et depenses avec des graphiques.

## Comment lancer le projet

### Installer les dependances

```bash
npm install
```

### Lancer le serveur de developpement

```bash
npm run dev
```

L'app sera dispo sur `http://localhost:5173`

### Build pour la production

```bash
npm run build
```

### Preview du build

```bash
npm run preview
```

## Fonctionnalites

- Ajouter des revenus et des depenses
- Voir le solde actuel, total revenus et total depenses
- Graphique en doughnut (Chart.js) pour voir la repartition par categorie
- Filtre des transactions par categorie
- Supression de transactions
- Sauvergarde dans le localStorage (simule un fichier `transactions.json`)

## Technologies

- React + TypeScript
- Vite
- Chart.js
