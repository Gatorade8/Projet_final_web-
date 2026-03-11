import { useState } from 'react'
import type { Transaction, Category } from '../App'
import { CATEGORIES } from '../App'

// Interface déterminant les propriétés nécessaires au composant, incluant l'injection de méthodes d'action
type ListProps = {
    transactions: Transaction[]
    onDelete: (id: string) => void
    onReset: () => void
}

// Fonction utilitaire garantissant un formatage universel monétaire francophone
function formatMoney(val: number): string {
    return val.toLocaleString('fr-FR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }) + ' EUR'
}

// Composant responsable de l'affichage en liste du jeu de données courant
function TransactionList({ transactions, onDelete, onReset }: ListProps) {
    // État mémorisant le profil de filtrage sélectionné en liste
    const [filter, setFilter] = useState<Category | 'tout'>('tout')

    // Projection de liste à la volée : renvoie la source native, ou filtre séquentiellement ses occurrences
    const filtered = filter === 'tout'
        ? transactions
        : transactions.filter(t => t.category === filter)

    return (
        <div className="panel history-section">
            <div className="history-header">
                <h2>Historique des transactions</h2>
                {/* Restreint l'affichage du bouton d'annihilation globale en fonction d'une condition d'arrêts stricts (taille du tableau) */}
                {transactions.length > 0 && (
                    <button
                        className="btn-reset"
                        onClick={onReset} 
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
                {/* Intégration par liste de boutons des catégories existantes pour fournir les contrôles de l'état "filter" aux usagers */}
                {CATEGORIES.map(cat => (
                    <button
                        key={cat} // Identifiant pivot inhérent aux listes structurelles React permettant la tracabilité d'arbre logique (DOM virtuel)
                        className={`filter-btn ${filter === cat ? 'active' : ''}`}
                        onClick={() => setFilter(cat)}
                    >
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                ))}
            </div>

            {/* Condition ternaire évaluant de potentielles inconsistences du tableau final */}
            {filtered.length === 0 ? (
                <p className="no-data">Aucune transaction trouvée</p>
            ) : (
                <ul className="transactions-list">
                    {filtered.map(t => (
                        <li key={t.id} className="transaction-item"> 
                            <div className="transaction-info">
                                <span className="name">{t.name}</span>
                                <span className="category">{t.category}</span>
                                <span className="date">{t.date}</span>
                            </div>
                            <div className="transaction-right">
                                {/* Interversion conditionnelle et concaténation pour refléter les informations de flux sortant ou perçu */}
                                <span className={`transaction-amount ${t.type === 'revenu' ? 'positive' : 'negative'}`}>
                                    {t.type === 'revenu' ? '+' : '-'}{formatMoney(t.amount)}
                                </span>
                                <button
                                    className="btn-delete"
                                    onClick={() => onDelete(t.id)} 
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
