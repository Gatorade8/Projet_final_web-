// point d'entree du serveur express
import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import transactionRoutes from './routes/transactionRoutes.js'

const app = express()
const PORT = process.env.PORT || 3001

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// on varifie que le dossier data est toujours là
const DATA_DIR = path.join(__dirname, 'data')
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
}

// middlewares de base
app.use(cors())
app.use(express.json())

// on lie les routes qu'on a séparé
app.use('/api/transactions', transactionRoutes)

// on sert les fichiers statics du front 
const frontendBuildPath = path.join(__dirname, '../frontend/dist')
app.use(express.static(frontendBuildPath))

// le catchall pour react router meme si on l'utilise pas encore on le laisse
app.use((req, res) => {
    res.sendFile(path.join(frontendBuildPath, 'index.html'))
})

// go on lance
app.listen(PORT, () => {
    console.log(`Serveur demarre sur le port ${PORT}`)
})
