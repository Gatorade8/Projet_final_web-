const fs = require('fs')

const cells = []
function md(src) {
    cells.push({ "cell_type": "markdown", "metadata": {}, "source": src.split("\n").map((l, i, arr) => i < arr.length - 1 ? l + '\n' : l), "id": `c${cells.length}` })
}

md(`# Notebook ULTRA-Detaillé - Gestionnaire de Budget : Finance Zen\n# (Version debutant - CHAQUE LIGNE est expliquee en detail)\n\n---\n\n## C'est quoi ce projet exactement ?\n\nC'est une **application web** qui te permet de gerer ton argent. Concretement :\n- Tu peux **ajouter** des depenses (courses, loyer, metro...) et des revenus (salaire, freelance...)\n- Tu vois ton **solde en temps reel** (combien il te reste = revenus - depenses)\n- Tu as un **graphique en donut** qui te montre visuellement ou va ton argent\n- Tu peux **filtrer** par categorie (alimentation, transport, loisirs...)\n- Tu peux **switcher** entre mode clair et mode sombre\n\n### Pourquoi c'est un bon exercice ?\n\nParce qu'on touche a TOUT ce qu'un dev web junior doit maitriser :\n\n| Competence | Ce qu'on apprend ici | Pourquoi c'est important |\n|---|---|---|\n| **React** | Composants, hooks, etat | C'est LE framework le plus demande en entreprise |\n| **TypeScript** | Types, interfaces | Evite des bugs en production |\n| **Backend** | API REST avec Express.js | Savoir creer un serveur qui traite des requetes |\n| **Communication** | fetch, HTTP, JSON | Faire parler le front et le back ensemble |\n| **Persistance** | Sauvegarder dans un fichier | Comprendre comment stocker des donnees |\n| **CSS moderne** | Variables, themes, animations | Faire une interface qui a l'air pro |\n| **Graphiques** | Chart.js, donut | Afficher des donnees visuellement |\n\n### Les prerequis (ce que tu dois savoir avant)\n\n1. **HTML/CSS de base** : ce qu'est une balise \`<DIV>\`, un selecteur CSS \`.class\`\n2. **JavaScript de base** : variables (\`let\`, \`const\`), fonctions, tableaux, objets\n3. **Node.js installe** : c'est le moteur qui fait tourner JavaScript en dehors du navigateur\n4. **Terminal** : savoir ouvrir un terminal et taper des commandes\n\n> Si tu connais pas encore React ou TypeScript, PAS DE PANIQUE !\n> Ce notebook explique chaque concept au fur et a mesure.`)

md(`---\n\n# PARTIE 1 : L'architecture (Comment l'application est organisee)\n\n## Le modele "Client-Serveur" - c'est quoi ?\n\nImagine un restaurant :\n- **Le client** (toi au resto) = ton **navigateur web** (Chrome, Firefox...)\n- **Le serveur** (le cuistot en cuisine) = le **backend Express.js**\n- **Le menu** que tu lis = le **frontend React** (l'interface visuelle)\n- **La cuisine** ou on prepare = le **serveur** qui traite tes demandes\n- **Le frigo** = le **fichier JSON** (la ou on stocke les donnees)\n\n### Le flux quand tu ajoutes une transaction\n\n1. Tu remplis le formulaire dans le navigateur\n2. Tu cliques "Ajouter"\n3. React prepare les donnees en JSON\n4. fetch() envoie une requete HTTP POST au serveur\n5. Le serveur Express recoit la requete\n6. Il ecrit dans le fichier transactions.json\n7. Il repond "OK c'est fait" (status 201)\n8. React met a jour l'affichage`)

md(`---\n\n# PARTIE 2 : \`package.json\` - La carte d'identite du projet\n\n\`package.json\` c'est **le fichier le plus important** d'un projet Node.js. Il dit comment s'appelle le projet, quelles librairies il utilise, et les commandes qu'on peut lancer.\n\n\`\`\`json\n{\n  "scripts": {\n    "dev": "vite",               // Lance le frontend (React)\n    "server": "node server.js" // Lance le backend (Express)\n  },\n  "dependencies": {\n    "express": "^5.2.1",       // Pour creer notre serveur API\n    "react": "^19.2.0",        // Le coeur de l'interface\n    "chart.js": "^4.4.7"       // Pour le donut graphique\n  }\n}\n\`\`\`\n\nOn a besoin de 2 terminaux differents : Un pour le serveur, et l'autre pour React !`)

md(`---\n\n# PARTIE 3 : App.tsx - Le Chef d'Orchestre React\n\nC'est la piece maitresse qui contient la donnee et manipule les composants enfants.\n\n### Les Hooks React (use...)\n\nEn React, une variable normale perd sa valeur des que l'ecran se rafraichit (re-render).\n\n- \`useState\`: Un "post-it" persistant ! Si on change le post-it, React va automatiquement redessiner l'ecran avec la nouvelle information.\n- \`useReducer\`: Le "Gros Post-It". C'est pour les objets complexes. C'est le boss qui s'occupe \`d'Ajouter\`, \`de Supprimer\` ou \`de Lire\` l'ensemble des transactions quand on lui dit.\n- \`useEffect\`: L'assistant delegue ! On l'envoie interroger l'API distante avec \`fetch()\` et il nous revient plus tard quand il a le resultat.`)

md(`---\n\n# PARTIE 4 : Server.js - L'API Express en arriere plan\n\nReact tourne sur ton navigateur et c'est un fichier local, donc il ne peut PAS ecrire sur ton Disque Dur. Impossible de sauvegarder ! C'est le serveur, qui lui a les droits sur la machine, qui va lire et ecrire dans le "\`transactions.json\`".\n\n\`\`\`javascript\n// POST : Pour enregistrer un achat\napp.post('/api/transactions', (req, res) => {\n    // 1. Lire le json existant (lire le frigo)\n    const transactions = readTransactions()\n    \n    // 2. Prendre notre nouvelle transaction recue\n    const newTransaction = req.body\n\n    // 3. Lui ajouter un code bar unique et la date !\n    newTransaction.id = Date.now().toString() + Math.random().toString(36).substring(2)\n\n    // 4. L'inserer au tout debut du tableau \n    transactions.unshift(newTransaction)\n    \n    // 5. Sauvegarder dans le fichier transactions.json (remettre au frigo)\n    writeTransactions(transactions)\n    res.status(201).json(newTransaction)\n})\n\`\`\``)

const notebook = {
    "cells": cells,
    "metadata": {
        "kernelspec": {
            "display_name": "Python 3",
            "language": "python",
            "name": "python3"
        }
    },
    "nbformat": 4,
    "nbformat_minor": 5
}

fs.writeFileSync("c:/Users/doria/Documents/Web_Dev/EXERCICES-1/gestionnaire-budget/NOTEBOOK_EXPLICATION_MIEUX.ipynb", JSON.stringify(notebook, null, 2))
console.log("Notebook ultra detaille cree avec succes")
