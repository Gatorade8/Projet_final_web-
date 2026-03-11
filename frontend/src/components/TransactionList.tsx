import { useState } from 'react'
import type { Transaction, Category } from '../App'
import { CATEGORIES } from '../App'

// les props de la liste de transactions
type ListProps = {
    transactions: Transaction[]
    onDelete: (id: string) => void
    onReset: () => void
}

// formater un montant en EUR
function formatMoney(val: number): string {
    return val.toLocaleString('fr-FR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }) + ' EUR'
}

// composant pour l'historique des transactions
function TransactionList({ transactions, onDelete, onReset }: ListProps) {
    const [filter, setFilter] = useState<Category | 'tout'>('tout')

    // filtre les transactions selon la categorie selectionnee
    const filtered = filter === 'tout'
        ? transactions
        : transactions.filter(t => t.category === filter)

    return (
        <div className="panel history-section">
            <div className="history-header">
                <h2>Historique des transactions</h2>
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

            {filtered.length === 0 ? (
                <p className="no-data">Aucune transaction trouvee</p>
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
