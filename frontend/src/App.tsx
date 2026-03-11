import { useReducer, useEffect, useState, useCallback } from 'react'
import TransactionForm from './components/TransactionForm'
import BudgetChart from './components/BudgetChart'
import TransactionList from './components/TransactionList'

// Liste des catégories disponibles pour les transactions
// L'utilisation de "as const" permet à TypeScript de considérer ce tableau comme immuable.
export const CATEGORIES = [
    'alimentation',
    'transport',
    'loisirs',
    'logement',
    'sante',
    'salaire',
    'freelance',
    'autre',
] as const

// Création d'un type basé sur la liste ci-dessus, limitant les valeurs possibles à ces catégories.
export type Category = typeof CATEGORIES[number]

// Définition des types possibles pour une transaction
export type TransactionType = 'revenu' | 'depense'

// Interface décrivant la structure exacte d'une transaction pour TypeScript
export type Transaction = {
    id: string              // Identifiant unique
    name: string            // Description de la transaction
    amount: number          // Montant financier
    type: TransactionType   // Si c'est un revenu ou une dépense
    category: Category      // Catégorie associée
    date: string            // Date au format AAAA-MM-JJ
}

// Dictionnaire associant chaque catégorie à une couleur spécifique (utilisé pour les graphiques)
export const CATEGORY_COLORS: Record<string, string> = {
    alimentation: '#d4a056',
    transport: '#5b8c5a',
    loisirs: '#c2785c',
    logement: '#8b6f47',
    sante: '#6b9e8a',
    salaire: '#2e8b57',
    freelance: '#7a9e7e',
    autre: '#9c8b7a',
}

// État global de l'application, contenant la liste complète des transactions
type BudgetState = {
    transactions: Transaction[]
}

// Liste des actions possibles gérées par le reducer
type BudgetAction =
    | { type: 'ADD_TRANSACTION'; payload: Transaction }    // Ajout d'une nouvelle transaction
    | { type: 'DELETE_TRANSACTION'; payload: string }      // Suppression via l'identifiant (ID)
    | { type: 'LOAD_TRANSACTIONS'; payload: Transaction[] } // Chargement initial des données
    | { type: 'RESET_TRANSACTIONS' }                       // Réinitialisation complète de l'historique

// URL de l'API Node.js locale (configurée via le proxy Vite)
const API_URL = '/api/transactions'
// Clé utilisée pour sauvegarder le thème choisi dans le localStorage du navigateur
const THEME_KEY = 'budget_theme'

// Fonction asynchrone pour récupérer les données depuis le serveur sans bloquer l'interface
async function loadTransactions(): Promise<Transaction[]> {
    try {
        const response = await fetch(API_URL)
        const data: Transaction[] = await response.json() // Conversion de la réponse JSON en objet JavaScript
        return data
    } catch {
        // En cas d'erreur avec le serveur, on retourne un tableau vide pour éviter un crash
        return []
    }
}

// Le reducer agit comme le gestionnaire de l'état global de l'application
function budgetReducer(state: BudgetState, action: BudgetAction): BudgetState {
    switch (action.type) { 
        case 'ADD_TRANSACTION': {
            // Création d'un nouveau tableau contenant l'ancienne liste et la nouvelle transaction (respect de l'immuabilité)
            const updated = [action.payload, ...state.transactions]
            return { transactions: updated }
        }
        case 'DELETE_TRANSACTION': {
            // Filtrage pour ne conserver que les transactions dont l'ID est différent de celui fourni
            const updated = state.transactions.filter(t => t.id !== action.payload)
            return { transactions: updated }
        }
        case 'LOAD_TRANSACTIONS':
            // Remplacement total des transactions actuelles par les données chargées
            return { transactions: action.payload }
            
        case 'RESET_TRANSACTIONS': {
            // Vidage complet de l'historique
            return { transactions: [] }
        }
        default:
            return state // Retourne l'état actuel si l'action n'est pas reconnue
    }
}

// Composant central regroupant toute la logique applicative
function App() {
    // Gestion de l'état du thème (clair/sombre). L'état initial est calculé au chargement en lisant le localStorage.
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        const saved = localStorage.getItem(THEME_KEY)
        return (saved === 'dark') ? 'dark' : 'light'
    })

    // Initialisation du state centralisé et de son dispatch via useReducer
    const [state, dispatch] = useReducer(budgetReducer, { transactions: [] })

    // Déclenchement d'un effet secondaire à chaque changement du state 'theme'
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme) // Application de l'attribut HTML pour le CSS
        localStorage.setItem(THEME_KEY, theme) // Sauvegarde de la préférence pour la prochaine session
    }, [theme])

    // Utilisation de useCallback pour mémoriser la fonction et éviter des re-rendus de performance inutiles
    const toggleTheme = useCallback(() => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light')
    }, [])

    // Chargement dynamique des données lors du tout premier montage du composant
    useEffect(() => {
        loadTransactions().then(loaded => {
            dispatch({ type: 'LOAD_TRANSACTIONS', payload: loaded })
        })
    }, [])

    // Calcul du total des revenus (mise à jour automatique basée sur l'état)
    const totalRevenu = state.transactions
        .filter(t => t.type === 'revenu')
        .reduce((sum, t) => sum + t.amount, 0)

    // Calcul du total des dépenses
    const totalDepense = state.transactions
        .filter(t => t.type === 'depense')
        .reduce((sum, t) => sum + t.amount, 0)

    // Calcul du solde final
    const solde = totalRevenu - totalDepense

    // Fonction asynchrone pour gérer l'ajout d'une nouvelle transaction
    async function handleAddTransaction(name: string, amount: number, type: TransactionType, category: Category) {
        // Préparation de l'objet transaction
        const newTransaction: Transaction = {
            id: Date.now().toString() + Math.random().toString(36).substring(2), // Génération d'un UUID simple
            name,
            amount,
            type,
            category,
            date: new Date().toISOString().split('T')[0], // Formatage de la date à la racine ISO (YYYY-MM-DD)
        }

        try {
            // Envoi de la donnée au backend Node.js via une requête POST
            await fetch(API_URL, {
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTransaction), // Sérialisation de l'objet en JSON
            })
            // En cas de succès serveur, on notifie l'interface pour se mettre à jour
            dispatch({ type: 'ADD_TRANSACTION', payload: newTransaction })
        } catch {
            console.error('Erreur lors de l\'ajout de la transaction')
        }
    }

    // Fonction de suppression de transaction
    async function handleDelete(id: string) {
        try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' })
            dispatch({ type: 'DELETE_TRANSACTION', payload: id })
        } catch {
            console.error('Erreur lors de la suppression')
        }
    }

    // Fonction asynchrone pour traiter la réinitialisation complète des logs
    async function handleReset() {
        if (window.confirm('Voulez-vous vraiment effacer toutes les transactions ?')) {
            try {
                await fetch(API_URL, { method: 'DELETE' }) // La route sans paramètre ID gère l'effacement total de la collection
                dispatch({ type: 'RESET_TRANSACTIONS' })
            } catch {
                console.error('Erreur lors de la réinitialisation')
            }
        }
    }

    // Utilitaire de formatage pour l'affichage de la devise
    function formatMoney(val: number): string {
        return val.toLocaleString('fr-FR', {
            minimumFractionDigits: 2, // Forcer l'affichage strict de 2 décimales
            maximumFractionDigits: 2,
        }) + ' EUR'
    }

    return (
        <div id="app">
            <header className="app-header">
                <div className="logo-section">
                    <img src="/fiance_zen.png" alt="Finance Zen" className="logo-img" />
                    <div className="logo-text">
                        <h1>Finance Zen</h1>
                        <p className="subtitle">Simplifiez votre budget</p>
                    </div>
                </div>
                <button className="theme-toggle" onClick={toggleTheme} title="Changer le thème">
                    <span className="theme-icon">{theme === 'light' ? 'Sombre' : 'Clair'}</span>
                </button>
            </header>

            <div className="balance-card">
                <div className="label">Solde actuel</div>
                <div className="amount">{formatMoney(solde)}</div>
            </div>

            <div className="summary-row">
                <div className="summary-box">
                    <div className="label">Revenus</div>
                    <div className="amount income">+{formatMoney(totalRevenu)}</div>
                </div>
                <div className="summary-box">
                    <div className="label">Dépenses</div>
                    <div className="amount expense">-{formatMoney(totalDepense)}</div>
                </div>
            </div>

            <div className="main-grid">
                {/* Passage en prop de la fonction associée pour autoriser l'enfant à communiquer */}
                <TransactionForm onSubmit={handleAddTransaction} />
                <BudgetChart transactions={state.transactions} theme={theme} />
            </div>

            {/* Injection des données consolidées et des méthodes utilitaires à l'espace liste de l'interface */}
            <TransactionList
                transactions={state.transactions}
                onDelete={handleDelete}
                onReset={handleReset}
            />
        </div>
    )
}

export default App
