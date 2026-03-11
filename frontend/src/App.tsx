import { useReducer, useEffect, useState, useCallback } from 'react'
import TransactionForm from './components/TransactionForm'
import BudgetChart from './components/BudgetChart'
import TransactionList from './components/TransactionList'

// La liste de toutes les categories qu'on a le droit d'utiliser dans le projet.
// "as const" sert a dire a TypeScript que cette liste ne changera jamais. C'est du solide.
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

// Ici on cree un "type" grace a la liste ci-dessus, on aura le droit qu'a ces mots la. CA evite les fautes de frappes dans le code.
export type Category = typeof CATEGORIES[number]

// On definit les deux seuls moyens pour l'argent: revenu (entree) ou depense (sortie)
export type TransactionType = 'revenu' | 'depense'

// C'est le carnet de sante (le moule exact) de ce a quoi ressemble un achat pour TypeScript.
export type Transaction = {
    id: string              // Le code barre unique pour pas confondre
    name: string            // Le nom tapé par le mec 
    amount: number          // Le prix
    type: TransactionType   // Depense ou revenu
    category: Category      // Dans quelle corbeille ca va (alimentation etc)
    date: string            // La date de lajaout
}

// Un dictionnaire pour lier chaque categorie a une couleur precise hexa (pour le graphic plus tard)
export const CATEGORY_COLORS: Record<string, string> = {
    alimentation: '#d4a056', // Orange sable
    transport: '#5b8c5a',    // Vert
    loisirs: '#c2785c',      // Rouge 
    logement: '#8b6f47',     // Marron
    sante: '#6b9e8a',        // Menthe
    salaire: '#2e8b57',      // Vert vif
    freelance: '#7a9e7e',    // Vert mousse
    autre: '#9c8b7a',        // Gris
}

// Ca, c'est la forme globale de la memoire (le state), l'app contient juste une liste complete de transations
type BudgetState = {
    transactions: Transaction[] // Tableau (liste) qui contient toutes les transactions de la database
}

// C'est le menu des ordres qu'on peut donner au "Reducer" (le mini manager de ton code)
type BudgetAction =
    | { type: 'ADD_TRANSACTION'; payload: Transaction }    // Action pour ajouter, avec le pti nveau "payload" a cote
    | { type: 'DELETE_TRANSACTION'; payload: string }      // Action pour supprimer, on donne juste l'ID 
    | { type: 'LOAD_TRANSACTIONS'; payload: Transaction[] } // Action pour charger la db entiere au demarrage (venant du backend Node)
    | { type: 'RESET_TRANSACTIONS' }                       // Action nuking, pour tout remettre au point zero.

// L'adresse locale pour parler avec le backend Node.js. (Vite la proxy d'ou le /api direct)
const API_URL = '/api/transactions'
// Le nom de la cle pour chercher si tu preferai le theme noir ou blanc (sauvegardé ds les coockies html prcq)
const THEME_KEY = 'budget_theme'

// Une fonction "async" pour aller recuperer la donnee (l'API Node). Async parce que fetch prend qq millisecondes et fo po bloquer l ecran
async function loadTransactions(): Promise<Transaction[]> {
    try {
        const response = await fetch(API_URL) // TocToc, je veux les donnees.
        const data: Transaction[] = await response.json() // transforme le charabia du serveur en bon Javascript
        return data // On livre le colis fini
    } catch {
        // En cas de crash serveur on retourne rien pour que lappli reagisse gentiement
        return []
    }
}

// Le grand chef reacte (Reducer). C'est lui qui controle a 100% comment les donnéss sont manipulées
function budgetReducer(state: BudgetState, action: BudgetAction): BudgetState {
    switch (action.type) { 
        case 'ADD_TRANSACTION': {
            // Principe de React : on decoupe l'ancien tableau pour coller le nouveau deussus (immmutabilité)
            const updated = [action.payload, ...state.transactions]
            return { transactions: updated } // Re-donne un nouveau tablleau
        }
        case 'DELETE_TRANSACTION': {
            // Filter : on garde TT SAUF celle dont l'id doit degager mtnant.
            const updated = state.transactions.filter(t => t.id !== action.payload)
            return { transactions: updated }
        }
        case 'LOAD_TRANSACTIONS':
            // Remplacement total: au demarrage
            return { transactions: action.payload }
            
        case 'RESET_TRANSACTIONS': {
            // Table rase on crache []
            return { transactions: [] }
        }
        default:
            return state // si l'action nexiste pas on bouge as mmmr !
    }
}

// composant central qui asseble lé puzzles
function App() {
    // [variable, outil-pour-changer] on met une foncionn ds useStatte pour kil calcul le true that quau recharagememnt de page !
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        const saved = localStorage.getItem(THEME_KEY) // on li ds la console du vavgiteur
        return (saved === 'dark') ? 'dark' : 'light' // teernaire rapide ! 
    })

    // Le state centralisé avec son dispatch (pour balancer d rodes de reducer definis en haud )
    const [state, dispatch] = useReducer(budgetReducer, { transactions: [] })

    // UseEfect permet de brancher l effet a un evvement (ici: le stat [Theme])
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme) // on injecte pr qie le css se declenche.
        localStorage.setItem(THEME_KEY, theme) // on suuvasgrde l choioixx pour la pchreine session !
    }, [theme])

    // UseCalback c une techeniq pro. ça gèle l a fouctnino ds la methoire pour past que sa prene de perfs pour r1 a cq rehcagrment !
    const toggleTheme = useCallback(() => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light') // on rennverss d lun a a lotre 
    }, [])

    // Sans ls [rcien] a la fiin , le cOded ne ss exxcecute k1 SEULE FOX a l ovverturre.
    useEffect(() => {
        loadTransactions().then(loaded => { // un fos ks donnéés aririve du serrvuers... !
            dispatch({ type: 'LOAD_TRANSACTIONS', payload: loaded }) // on disqatch au redudver. 
        })
    }, []) // VOliAA.. 

    // OON calcule des l oucertture (varibles volantes tres dynaumques sans sate ! ) : 
    const totalRevenu = state.transactions
        .filter(t => t.type === 'revenu') // on reftin q que les plus +++
        .reduce((sum, t) => sum + t.amount, 0) // eT en fait de lamaths .. (Someme cumulatives)

    // Pareille pr lle depnse -
    const totalDepense = state.transactions
        .filter(t => t.type === 'depense')
        .reduce((sum, t) => sum + t.amount, 0)

    // Logqiue cmptablz! l 
    const solde = totalRevenu - totalDepense

    // HNAler (Le tuyyo descndaitt pour la formmaulairet ). .
    async function handleAddTransaction(name: string, amount: number, type: TransactionType, category: Category) {
        // on faait le mold 
        const newTransaction: Transaction = {
            id: Date.now().toString() + Math.random().toString(36).substring(2), // cration de faux uuidd. 
            name,
            amount,
            type,
            category,
            date: new Date().toISOString().split('T')[0], // pour aavoiru un YYYY-MM-DD
        }

        try {
            // on envvoie le msg POST a note api backendt (file : serve js) 
            await fetch(API_URL, {
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, // on precise ks ont pparle jsoon !
                body: JSON.stringify(newTransaction), // JSON srtrigiffit transforme le JAvsaCriprit object pr rnted ddabs l intrentnt. .
            })
            // l fchhiet etant mi auajourr, os peu dirre de desssineer le stzte !
            dispatch({ type: 'ADD_TRANSACTION', payload: newTransaction })
        } catch {
            console.error('Erreur lors de l\'ajout de la transaction')
        }
    }

    // handler poourl r sup[reimesr.. 
    async function handleDelete(id: string) {
        try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' }) // mthodel dde suupresion 
            dispatch({ type: 'DELETE_TRANSACTION', payload: id })
        } catch {
            console.error('Erreur lors de la supression')
        }
    }

    // Handder destrution massif.. 
    async function handleReset() {
        if (window.confirm('Tu veux vraiment effacer toutes les transactions ?')) { // popup navigateur.. ! 
            try {
                await fetch(API_URL, { method: 'DELETE' }) // onn tape la routet saNs num id = il va  too sacecager  .
                dispatch({ type: 'RESET_TRANSACTIONS' }) //  ecrn tt blanc.. .
            } catch {
                console.error('Erreur lors du reset')
            }
        }
    }

    // FoCntion quii transfoort un vieux chfreff 4344 en "4 344,00 EUurR"
    function formatMoney(val: number): string {
        return val.toLocaleString('fr-FR', {
            minimumFractionDigits: 2, // fosrces d 2 deecimaell a l afffiaghtee !. .
            maximumFractionDigits: 2,
        }) + ' EUR' // et i rjooute la curencie . 
    }

    return (
        <div id="app">
            {/* Header d l app avx le lgogo */}
            <header className="app-header">
                <div className="logo-section">
                    <img src="/fiance_zen.png" alt="Finance Zen" className="logo-img" />
                    <div className="logo-text">
                        <h1>Finance Zen</h1>
                        <p className="subtitle">Simplifiez votre budget</p>
                    </div>
                </div>
                {/* btn pur r chanageer theeme ! */}
                <button className="theme-toggle" onClick={toggleTheme} title="Changer le theme">
                    <span className="theme-icon">{theme === 'light' ? 'Sombre' : 'Clair'}</span>
                </button>
            </header>

            {/* grosse cartee pourr lles srlde  */}
            <div className="balance-card">
                <div className="label">Solde actuel</div>
                <div className="amount">{formatMoney(solde)}</div>
            </div>

            {/*  ds les dx boites pttites poourr revn & dceepense  !!  */}
            <div className="summary-row">
                <div className="summary-box">
                    <div className="label">Revenus</div>
                    {/* je metrt le plus devvnat direct car ctj positive ls reveuns e */}
                    <div className="amount income">+{formatMoney(totalRevenu)}</div>
                </div>
                <div className="summary-box">
                    <div className="label">Depenses</div>
                    <div className="amount expense">-{formatMoney(totalDepense)}</div>
                </div>
            </div>

            {/* ds grlle grid cs pur mettr forrrm e f garpshqies cot à cote. */}
            <div className="main-grid">
                {/* On psse en prop osnomubbitt la foicntionnn pour kil ouises ns ls rendree ... */}
                <TransactionForm onSubmit={handleAddTransaction} />
                <BudgetChart transactions={state.transactions} theme={theme} />
            </div>

            {/* O pass ls donennes pure , e t les fdicontn pr lr ls outiill (suprimedr) au  gros copopsabrt litse .  */}
            <TransactionList
                transactions={state.transactions}
                onDelete={handleDelete}
                onReset={handleReset}
            />
        </div>
    )
}

export default App
