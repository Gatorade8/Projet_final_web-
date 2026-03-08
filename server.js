// serveur express pour le gestionnaire de budget
// il lit et ecrit dans data/transactions.json comme bdd
import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const app = express()
const PORT = process.env.PORT || 3001

// en ESM y'a pas __dirname donc faut le reconstruir
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// chemin vers le fichier json qui stock nos transactions
const DATA_DIR = path.join(__dirname, 'data')
const DATA_FILE = path.join(DATA_DIR, 'transactions.json')

// on s'assure que le dossier data existe sinon ca va crash sur Render
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
}

// middleware pour parser le json et autoriser les requete cross-origin
app.use(cors())
app.use(express.json())

// on sert les fichiers statiques du front (le build de Vite)
app.use(express.static(path.join(__dirname, 'dist')))

// fonction utilitaire pour lire les trasactions depuis le fichier
function readTransactions() {
    try {
        if (!fs.existsSync(DATA_FILE)) return []
        const data = fs.readFileSync(DATA_FILE, 'utf-8')
        return JSON.parse(data)
    } catch (err) {
        // si le fichier exite pas ou est corrompu on retourne un tableau vide
        return []
    }
}

// fonction utilitaire pour ecrire les transactions dans le fichier
function writeTransactions(transactions) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(transactions, null, 4), 'utf-8')
}

// GET /api/transactions - recuperer toutes les transactons
app.get('/api/transactions', (req, res) => {
    const transactions = readTransactions()
    res.json(transactions)
})

// POST /api/transactions - ajouter une nouvelle transction
app.post('/api/transactions', (req, res) => {
    const transactions = readTransactions()
    const newTransaction = req.body

    // on genere un id si y'en a pas
    if (!newTransaction.id) {
        newTransaction.id = Date.now().toString() + Math.random().toString(36).substring(2)
    }

    // on ajoute la date du jour si elle est pas renseigné
    if (!newTransaction.date) {
        newTransaction.date = new Date().toISOString().split('T')[0]
    }

    // on met la nouvelle en premier (plus recent en haut)
    transactions.unshift(newTransaction)
    writeTransactions(transactions)

    res.status(201).json(newTransaction)
})

// DELETE /api/transactions/:id - suprimer une transacton par son id
app.delete('/api/transactions/:id', (req, res) => {
    const transactions = readTransactions()
    const filtered = transactions.filter(t => t.id !== req.params.id)

    if (filtered.length === transactions.length) {
        // si la longueur est pareille c'est que l'id a pas ete trouvé
        return res.status(404).json({ error: 'Transaction pas trouvee' })
    }

    writeTransactions(filtered)
    res.json({ message: 'Transaction supprimee' })
})

// DELETE /api/transactions - tout effacer (reset complet)
app.delete('/api/transactions', (req, res) => {
    writeTransactions([])
    res.json({ message: 'Toutes les transactions on ete supprimees' })
})

// pour toutes les autres routes on renvoie l'index.html de React (SPAs)
app.get('/:path*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

// on demarre le serveur
app.listen(PORT, () => {
    console.log(`Serveur demarre sur le port ${PORT}`)
    console.log(`Les donnees sont stockees dans ${DATA_FILE}`)
})
