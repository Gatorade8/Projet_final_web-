import { useState } from 'react'
import type { Transaction, Category } from '../App'
import { CATEGORIES } from '../App'

// Ce bloc definit EXACTEMENT quelles proprietes sont exigees par ce Composant (les fameux cadeaux du chef, App.tsx)
type ListProps = {
    // 1. Il lui faut la liste complete des transactions stockees dans App.tsx
    transactions: Transaction[]
    // 2. Un outil de suppression qui lui permet d'informer App.tsx quand on clique sur X
    onDelete: (id: string) => void
    // 3. Un outil radical de reset total (sans argument)
    onReset: () => void
}

// Un petit utilitaire pour formater les sous de facon esthetique pour notre vue.
// Ca convertira "10" en "10,00 EUR"
function formatMoney(val: number): string {
    return val.toLocaleString('fr-FR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }) + ' EUR'
}

// Le gros composant visuel pour afficher l'historique de tout l'argent
function TransactionList({ transactions, onDelete, onReset }: ListProps) {
    // State (memoire interne du composant) pour savoir quel bouton filtre a ete selectionné recemment.
    // Par defaut 'tout'. Mais ca accepte aussi soit une categorie precise (comme logement, salaire)
    const [filter, setFilter] = useState<Category | 'tout'>('tout')

    // On pre-calcule EXACTEMENT ce qui va etre affiché sur le design html finnal
    // On utilise une ternaire : Si on a selectionné 'tout' au dessus ? Alors tu me montres la liste brute d'origine.
    const filtered = filter === 'tout'
        ? transactions
        // Sinon : tu utilises array.filter (le trieur JavaScript) qui laisse passer QUE les elements 't' dont la categorie matche avec ce qu on a filtré !!
        : transactions.filter(t => t.category === filter)

    // Le Rendu JSX de l'historique complet
    return (
        // Une boite class panel pour lui donner le style du glassmorphisme depuis index.css
        <div className="panel history-section">
            <div className="history-header">
                <h2>Historique des transactions</h2>
                {/* Le AND magique && de React. SI la longueur des transactions est strictement superieure zero ALORS.. affiche le bouton de nuking.. ! SINON cache le (rien du tout). */}
                {transactions.length > 0 && (
                    <button
                        className="btn-reset"
                        onClick={onReset} // Quand on clique, ca remonte via notre Prop jusqua App.tsx !
                        title="Effacer tout l'historique"
                    >
                        Tout effacer
                    </button>
                )}
            </div>

            {/*  La barre en haut qui liste tous les boutons filtres */}
            <div className="filter-row">
                <button
                    // Class name dynamique : si jamais le filtre stocké est 'tout', ajoute la class 'active' pour que le css l'allume en couleur foncee. Sinon string vide "". 
                    className={`filter-btn ${filter === 'tout' ? 'active' : ''}`}
                    onClick={() => setFilter('tout')}
                >
                    Tout
                </button>
                {/* On .map l'ancienne liste complete de CATEGORIES pour faire les autres boutons de filtrage. */}
                {/* Plus besoin d'ecrire 10 boutons a la main, l'ordi va boucler sur chaque nom de categorie ! */}
                {CATEGORIES.map(cat => (
                    <button
                        key={cat} // Obligation React ds une boucle! La clef 'key' (unique) permet juste a React de pas devnenir zinzin au scroll et bien ranger visuellement .
                        className={`filter-btn ${filter === cat ? 'active' : ''}`}
                        onClick={() => setFilter(cat)}
                    >
                        {/* 1ere lettre Majuscule ! */}
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                ))}
            </div>

            {/* Une autre condition teniare pour verifier s'y on a bien des choses a render ! */}
            {filtered.length === 0 ? (
                // SI y a ZERO transaction apres le filtre (ou que cest le premier jour d'utlisation) -> on met un msg tout doux
                <p className="no-data">Aucune transaction trouvee</p>
            ) : (
                // SINON (:) Oouuverture de l arbre de liste des elements. UL = list globale et LI = un point de la liste (bullet-point)
                <ul className="transactions-list">
                    {/* On reboucle maitenant sur tout notre tableau FILTRE ("filtered") . */}
                    {filtered.map(t => (
                        <li key={t.id} className="transaction-item"> 
                            {/* Gauche : le bloc des infos de textes */}
                            <div className="transaction-info">
                                <span className="name">{t.name}</span>
                                <span className="category">{t.category}</span>
                                <span className="date">{t.date}</span>
                            </div>
                            {/* Droite : le bloc des trucs financiers avec le bouton X. */}
                            <div className="transaction-right">
                                {/* CLASS CSS postive = texte vert, negative = texte rouge selon les cas. */}
                                <span className={`transaction-amount ${t.type === 'revenu' ? 'positive' : 'negative'}`}>
                                    {/* Un ptit signe "+" physique devznt le prix si ca rentre, "-" si ca sort (c mieu pour les yeux de l 'acheteur). */}
                                    {t.type === 'revenu' ? '+' : '-'}{formatMoney(t.amount)}
                                </span>
                                {/* Bouton de la mort pour cette specificue transaction.. */}
                                <button
                                    className="btn-delete"
                                    onClick={() => onDelete(t.id)} // On declenche prop en lui sussurant le "t.id" unique qu on as sous la main ! Vite a l'assassin de App.jsx de lavoir mntntenant 
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
    )
}

export default TransactionList
