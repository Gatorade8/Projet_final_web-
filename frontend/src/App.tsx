import { useReducer, useEffect, useState, useCallback } from 'react'
import TransactionForm from './components/TransactionForm'
import BudgetChart from './components/BudgetChart'
import TransactionList from './components/TransactionList'

// les categories disponible pour les transactions
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

export type Category = typeof CATEGORIES[number]

// le type d'une transaction (revenu ou depense)
export type TransactionType = 'revenu' | 'depense'

// type pour representer une transation
export type Transaction = {
    id: string
    name: string
    amount: number
    type: TransactionType
    category: Category
    date: string
}

// couleurs 
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

// l'etat gloal de notre app
type BudgetState = {
    transactions: Transaction[]
}

// toutes les actions possible avec le reducer
type BudgetAction =
    | { type: 'ADD_TRANSACTION'; payload: Transaction }
    | { type: 'DELETE_TRANSACTION'; payload: string }
    | { type: 'LOAD_TRANSACTIONS'; payload: Transaction[] }
    | { type: 'RESET_TRANSACTIONS' }

// url de base de l'api back-end (passe par le proxy vite en dev)
const API_URL = '/api/transactions'
const THEME_KEY = 'budget_theme'

// charge les transactions depuis le back-end
async function loadTransactions(): Promise<Transaction[]> {
    try {
        const response = await fetch(API_URL)
        const data: Transaction[] = await response.json()
        return data
    } catch {
        // si le serveur repond pas on retourne un tableau vide
        return []
    }
}


// les appel api sont fait dans les handlers avant le dispatch
function budgetReducer(state: BudgetState, action: BudgetAction): BudgetState {
    switch (action.type) {
        case 'ADD_TRANSACTION': {
            const updated = [action.payload, ...state.transactions]
            return { transactions: updated }
        }
        case 'DELETE_TRANSACTION': {
            const updated = state.transactions.filter(t => t.id !== action.payload)
            return { transactions: updated }
        }
        case 'LOAD_TRANSACTIONS':
            return { transactions: action.payload }
        // pour vider toute les transactions d'un coup
        case 'RESET_TRANSACTIONS': {
            return { transactions: [] }
        }
        default:
            return state
    }
}

function App() {
    // gestion du theme (clair / sombre)
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        const saved = localStorage.getItem(THEME_KEY)
        return (saved === 'dark') ? 'dark' : 'light'
    })

    // on charge les transaction au demarage
    const [state, dispatch] = useReducer(budgetReducer, { transactions: [] })

    // on applique le theme sur le document
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme)
        localStorage.setItem(THEME_KEY, theme)
    }, [theme])

    // toggle entre les deux themes
    const toggleTheme = useCallback(() => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light')
    }, [])

    // chargement initial depuis le back-end au demarage
    useEffect(() => {
        loadTransactions().then(loaded => {
            dispatch({ type: 'LOAD_TRANSACTIONS', payload: loaded })
        })
    }, [])

    // calcule le total des revenus
    const totalRevenu = state.transactions
        .filter(t => t.type === 'revenu')
        .reduce((sum, t) => sum + t.amount, 0)

    // calcul le total des depenses
    const totalDepense = state.transactions
        .filter(t => t.type === 'depense')
        .reduce((sum, t) => sum + t.amount, 0)

    // le solde c'est revenus - depenses
    const solde = totalRevenu - totalDepense

    // handler pour ajouter une nouvele transaction
    // on envoi d'abord au back-end puis on met a jour le state
    async function handleAddTransaction(name: string, amount: number, type: TransactionType, category: Category) {
        const newTransaction: Transaction = {
            id: Date.now().toString() + Math.random().toString(36).substring(2),
            name,
            amount,
            type,
            category,
            date: new Date().toISOString().split('T')[0],
        }

        try {
            // on envoi la transaction au serveur
            await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTransaction),
            })
            dispatch({ type: 'ADD_TRANSACTION', payload: newTransaction })
        } catch {
            // si ca plante on fait rien (le serveur est peut etre eteint)
            console.error('Erreur lors de l\'ajout de la transaction')
        }
    }

    // pour suprimer une transaction via l'api
    async function handleDelete(id: string) {
        try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' })
            dispatch({ type: 'DELETE_TRANSACTION', payload: id })
        } catch {
            console.error('Erreur lors de la supression')
        }
    }

    // pour reset tout l'historique des transactons
    async function handleReset() {
        if (window.confirm('Tu veux vraiment effacer toutes les transactions ?')) {
            try {
                await fetch(API_URL, { method: 'DELETE' })
                dispatch({ type: 'RESET_TRANSACTIONS' })
            } catch {
                console.error('Erreur lors du reset')
            }
        }
    }

    // formater un montant en EUR
    function formatMoney(val: number): string {
        return val.toLocaleString('fr-FR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }) + ' EUR'
    }

    return (
        <div id="app">
            {/* header avec le logo et le bouton de theme */}
            <header className="app-header">
                <div className="logo-section">
                    <img src="/fiance_zen.png" alt="Finance Zen" className="logo-img" />
                    <div className="logo-text">
                        <h1>Finance Zen</h1>
                        <p className="subtitle">Simplifiez votre budget</p>
                    </div>
                </div>
                <button className="theme-toggle" onClick={toggleTheme} title="Changer le theme">
                    <span className="theme-icon">{theme === 'light' ? 'Sombre' : 'Clair'}</span>
                </button>
            </header>

            {/* carte du solde actuel */}
            <div className="balance-card">
                <div className="label">Solde actuel</div>
                <div className="amount">{formatMoney(solde)}</div>
            </div>

            {/* resume revenus et depenses */}
            <div className="summary-row">
                <div className="summary-box">
                    <div className="label">Revenus</div>
                    <div className="amount income">+{formatMoney(totalRevenu)}</div>
                </div>
                <div className="summary-box">
                    <div className="label">Depenses</div>
                    <div className="amount expense">-{formatMoney(totalDepense)}</div>
                </div>
            </div>

            {/* grille formulaire + graphique */}
            <div className="main-grid">
                <TransactionForm onSubmit={handleAddTransaction} />
                <BudgetChart transactions={state.transactions} theme={theme} />
            </div>

            {/* historique des transactions */}
            <TransactionList
                transactions={state.transactions}
                onDelete={handleDelete}
                onReset={handleReset}
            />
        </div>
    )
}

export default App
