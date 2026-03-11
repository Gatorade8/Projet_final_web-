import express from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const router = express.Router()

// en ESM y'a pas __dirname donc faut le reconstruir
const __filename = fileURLToPath(import.meta.url)
// vu qu'on est dans routes/ faut remonter d'un niveau avec path.dirname(path.dirname())
const __dirname = path.dirname(path.dirname(__filename))

// chemin vers le fichier json qui stock nos transactions
const DATA_DIR = path.join(__dirname, 'data')
const DATA_FILE = path.join(DATA_DIR, 'transactions.json')

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

// GET / - recuperer toutes les transactons
router.get('/', (req, res) => {
    const transactions = readTransactions()
    res.json(transactions)
})

// POST / - ajouter une nouvelle transction
router.post('/', (req, res) => {
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

// DELETE /:id - suprimer une transacton par son id
router.delete('/:id', (req, res) => {
    const transactions = readTransactions()
    const filtered = transactions.filter(t => t.id !== req.params.id)

    if (filtered.length === transactions.length) {
        // si la longueur est pareille c'est que l'id a pas ete trouvé
        return res.status(404).json({ error: 'Transaction pas trouvee' })
    }

    writeTransactions(filtered)
    res.json({ message: 'Transaction supprimee' })
})

// DELETE / - tout effacer (reset complet)
router.delete('/', (req, res) => {
    writeTransactions([])
    res.json({ message: 'Toutes les transactions on ete supprimees' })
})

export default router
