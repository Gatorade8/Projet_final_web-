import { useReducer, useEffect, useRef, useState, useCallback } from 'react'
import { Chart, ArcElement, Tooltip, Legend, DoughnutController } from 'chart.js'

// on enregistre les composant chart.js qu'on va utilser
Chart.register(ArcElement, Tooltip, Legend, DoughnutController)

// les categories disponible pour les transactions
const CATEGORIES = [
    'alimentation',
    'transport',
    'loisirs',
    'logement',
    'sante',
    'salaire',
    'freelance',
    'autre',
] as const

type Category = typeof CATEGORIES[number]

// le type d'une transaction (revenu ou depense)
type TransactionType = 'revenu' | 'depense'

// interface pour representer une transation
interface Transaction {
    id: string
    name: string
    amount: number
    type: TransactionType
    category: Category
    date: string
}

// l'etat gloal de notre app
interface BudgetState {
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

// le reducer gere juste le state local maintenant
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

// couleurs adaptees au theme bois pour le chart
const CATEGORY_COLORS: Record<string, string> = {
    alimentation: '#d4a056',
    transport: '#5b8c5a',
    loisirs: '#c2785c',
    logement: '#8b6f47',
    sante: '#6b9e8a',
    salaire: '#2e8b57',
    freelance: '#7a9e7e',
    autre: '#9c8b7a',
}

function App() {
    // gestion du theme (clair / sombre)
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        const saved = localStorage.getItem(THEME_KEY)
        return (saved === 'dark') ? 'dark' : 'light'
    })

    // on charge les transaction au demarage
    const [state, dispatch] = useReducer(budgetReducer, { transactions: [] })
    const [filter, setFilter] = useState<Category | 'tout'>('tout')
    const [chartView, setChartView] = useState<'depenses' | 'revenus'>('depenses')

    // les champ du formulaire
    const [name, setName] = useState('')
    const [amount, setAmount] = useState('')
    const [type, setType] = useState<TransactionType>('depense')
    const [category, setCategory] = useState<Category>('alimentation')

    // ref pour le canvas du chart
    const chartRef = useRef<HTMLCanvasElement>(null)
    const chartInstance = useRef<Chart | null>(null)

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

    // filtre les transactions selon la categorie selectionnee
    const filteredTransactions = filter === 'tout'
        ? state.transactions
        : state.transactions.filter(t => t.category === filter)

    // les transactions filtrées pour le graphique actuel
    const chartTransactions = state.transactions.filter(
        t => t.type === (chartView === 'depenses' ? 'depense' : 'revenu')
    )

    // met a jour le graphique quand les transactions changent
    useEffect(() => {
        if (!chartRef.current) return

        // on detruit l'ancien graphique avant d'en creer un nouveau
        if (chartInstance.current) {
            chartInstance.current.destroy()
            chartInstance.current = null
        }

        // on regroupe les montant par categorie
        const grouped: Record<string, number> = {}
        chartTransactions.forEach(t => {
            grouped[t.category] = (grouped[t.category] || 0) + t.amount
        })

        const labels = Object.keys(grouped)
        const data = Object.values(grouped)
        const colors = labels.map(l => CATEGORY_COLORS[l] || '#9c8b7a')

        if (labels.length === 0) return

        // les couleurs du texte selon le theme
        const labelColor = theme === 'dark' ? '#b8a898' : '#7a6652'
        const borderCol = theme === 'dark' ? 'rgba(26, 20, 16, 0.8)' : 'rgba(245, 239, 230, 0.8)'

        // creation du doughnut chart
        chartInstance.current = new Chart(chartRef.current, {
            type: 'doughnut',
            data: {
                labels: labels.map(l => l.charAt(0).toUpperCase() + l.slice(1)),
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderColor: borderCol,
                    borderWidth: 3,
                    hoverBorderWidth: 0,
                    hoverOffset: 6,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: labelColor,
                            font: { family: 'Inter', size: 11 },
                            padding: 10,
                            usePointStyle: true,
                            pointStyleWidth: 8,
                        },
                    },
                    tooltip: {
                        backgroundColor: theme === 'dark' ? 'rgba(36, 30, 24, 0.95)' : 'rgba(62, 44, 28, 0.9)',
                        titleFont: { family: 'Inter' },
                        bodyFont: { family: 'Inter' },
                        titleColor: '#fff',
                        bodyColor: '#e8dfd5',
                        padding: 10,
                        cornerRadius: 8,
                        callbacks: {
                            label: (ctx) => {
                                const val = ctx.parsed
                                const total = data.reduce((a, b) => a + b, 0)
                                const pourcent = ((val / total) * 100).toFixed(1)
                                return ` ${ctx.label}: ${val.toFixed(2)} EUR (${pourcent}%)`
                            }
                        }
                    },
                },
                cutout: '62%',
            },
        })

        // cleanup quand le composent se demonte
        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy()
                chartInstance.current = null
            }
        }
    }, [chartTransactions, theme])

    // handler pour ajouter une nouvele transaction
    // on envoi d'abord au back-end puis on met a jour le state
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        if (!name.trim() || !amount || parseFloat(amount) <= 0) return

        const newTransaction: Transaction = {
            id: Date.now().toString() + Math.random().toString(36).substring(2),
            name: name.trim(),
            amount: parseFloat(parseFloat(amount).toFixed(2)),
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

            // on reset les champs du formulaire apres l'ajout
            setName('')
            setAmount('')
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
                {/* formulaire d'ajout */}
                <div className="panel">
                    <h2>Nouvelle transaction</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="type-selector">
                            <button
                                type="button"
                                className={`type-btn ${type === 'depense' ? 'expense-selected' : ''}`}
                                onClick={() => setType('depense')}
                            >
                                Depense
                            </button>
                            <button
                                type="button"
                                className={`type-btn ${type === 'revenu' ? 'income-selected' : ''}`}
                                onClick={() => setType('revenu')}
                            >
                                Revenu
                            </button>
                        </div>

                        <div className="form-group">
                            <label htmlFor="input-name">Description</label>
                            <input
                                id="input-name"
                                type="text"
                                placeholder="Ex: Courses au marche"
                                value={name}
                                onChange={e => setName(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="input-amount">Montant (EUR)</label>
                            <input
                                id="input-amount"
                                type="number"
                                placeholder="0.00"
                                min="0.01"
                                step="0.01"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="input-category">Categorie</label>
                            <select
                                id="input-category"
                                value={category}
                                onChange={e => setCategory(e.target.value as Category)}
                            >
                                {CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>
                                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button type="submit" className="btn-add">
                            Ajouter la transaction
                        </button>
                    </form>
                </div>

                {/* panneau du graphique */}
                <div className="panel chart-panel">
                    <h2>Repartition</h2>
                    <div className="chart-tabs">
                        <button
                            className={`chart-tab ${chartView === 'depenses' ? 'active' : ''}`}
                            onClick={() => setChartView('depenses')}
                        >
                            Depenses
                        </button>
                        <button
                            className={`chart-tab ${chartView === 'revenus' ? 'active' : ''}`}
                            onClick={() => setChartView('revenus')}
                        >
                            Revenus
                        </button>
                    </div>
                    <div className="chart-wrapper">
                        {chartTransactions.length > 0 ? (
                            <canvas ref={chartRef}></canvas>
                        ) : (
                            <p className="no-data">Aucune donnee a afficher</p>
                        )}
                    </div>
                </div>
            </div>

            {/* historique des transactions */}
            <div className="panel history-section">
                <div className="history-header">
                    <h2>Historique des transactions</h2>
                    {state.transactions.length > 0 && (
                        <button
                            className="btn-reset"
                            onClick={handleReset}
                            title="Effacer tout l'historique"
                        >
                            Tout effacer
                        </button>
                    )}
                </div>

                <div className="filter-row">
                    <button
                        className={`filter-btn ${filter === 'tout' ? 'active' : ''}`}
                        onClick={() => setFilter('tout')}
                    >
                        Tout
                    </button>
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            className={`filter-btn ${filter === cat ? 'active' : ''}`}
                            onClick={() => setFilter(cat)}
                        >
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </button>
                    ))}
                </div>

                {filteredTransactions.length === 0 ? (
                    <p className="no-data">Aucune transaction trouvee</p>
                ) : (
                    <ul className="transactions-list">
                        {filteredTransactions.map(t => (
                            <li key={t.id} className="transaction-item">
                                <div className="transaction-info">
                                    <span className="name">{t.name}</span>
                                    <span className="category">{t.category}</span>
                                    <span className="date">{t.date}</span>
                                </div>
                                <div className="transaction-right">
                                    <span className={`transaction-amount ${t.type === 'revenu' ? 'positive' : 'negative'}`}>
                                        {t.type === 'revenu' ? '+' : '-'}{formatMoney(t.amount)}
                                    </span>
                                    <button
                                        className="btn-delete"
                                        onClick={() => handleDelete(t.id)}
                                        title="Supprimer"
                                    >
                                        x
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}

export default App
