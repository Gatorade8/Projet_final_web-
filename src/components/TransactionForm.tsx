import { useState } from 'react'
import { CATEGORIES } from '../App'
import type { Category, TransactionType } from '../App'

// les props du composant formulaire
type FormProps = {
    onSubmit: (name: string, amount: number, type: TransactionType, category: Category) => void
}

// composant pour le formulaire d'ajout de transaction
function TransactionForm({ onSubmit }: FormProps) {
    // les champ du formulaire
    const [name, setName] = useState('')
    const [amount, setAmount] = useState('')
    const [type, setType] = useState<TransactionType>('depense')
    const [category, setCategory] = useState<Category>('alimentation')

    // quand on soumet le formulaire
    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        if (!name.trim() || !amount || parseFloat(amount) <= 0) return

        onSubmit(name.trim(), parseFloat(parseFloat(amount).toFixed(2)), type, category)

        // on reset les champs apres l'ajout
        setName('')
        setAmount('')
    }

    return (
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
    )
}

export default TransactionForm
