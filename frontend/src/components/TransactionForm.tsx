import { useState } from 'react'
import { CATEGORIES } from '../App'
import type { Category, TransactionType } from '../App'

// Interface définissant les propriétés exactes attendues par le composant
type FormProps = {
    onSubmit: (name: string, amount: number, type: TransactionType, category: Category) => void
}

function TransactionForm({ onSubmit }: FormProps) {
    // États locaux (states) mémorisant en temps réel les interactions de l'utilisateur avec le formulaire
    const [name, setName] = useState('')
    const [amount, setAmount] = useState('') 
    const [type, setType] = useState<TransactionType>('depense') 
    const [category, setCategory] = useState<Category>('alimentation')

    // Méthode de soumission du formulaire
    function handleSubmit(e: React.FormEvent) {
        // Intercepte l'évènement de soumission natif pour empêcher le navigateur de recharger entièrement la page
        e.preventDefault() 

        // Règle de validation logicielle évitant les envois non conformes au serveur 
        if (!name.trim() || !amount || parseFloat(amount) <= 0) return

        // Transmission des données validées et transformées à destination de la méthode parente "onSubmit"
        onSubmit(name.trim(), parseFloat(parseFloat(amount).toFixed(2)), type, category)

        // Réinitialisation des inputs visuels post-succès pour fluidifier l'expérience d'utilisation
        setName('')
        setAmount('')
    }

    return (
        <div className="panel">
            <h2>Nouvelle transaction</h2>
            <form onSubmit={handleSubmit}> 
                
                {/* Sélecteur personnalisé pour le type de la transaction */}
                <div className="type-selector">
                    <button
                        type="button" // Prévient la soumission accidentelle du formulaire ("button" vs "submit")
                        className={`type-btn ${type === 'depense' ? 'expense-selected' : ''}`}
                        onClick={() => setType('depense')} 
                    >
                        Dépense
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
                    {/* Lien d'accessibilité entre le label et l'input correspondant via l'identifiant (htmlFor/id) */}
                    <label htmlFor="input-name">Description</label>
                    <input
                        id="input-name"
                        type="text"
                        placeholder="Ex: Courses au marché"
                        // Paradigme de composant contrôlé : l'interface reflète formellement la valeur du state React
                        value={name}
                        // Mise à jour de ce même state dès qu'un évènement de modification (frappe clavier) se produit
                        onChange={e => setName(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="input-amount">Montant (EUR)</label>
                    <input
                        id="input-amount"
                        type="number" // Force l'interface HTML à exiger un format strictement numérique
                        placeholder="0.00"
                        min="0.01" 
                        step="0.01" 
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="input-category">Catégorie</label>
                    <select
                        id="input-category"
                        value={category}
                        // Forçage de type explicite pour maintenir le contrat d'interface en amont
                        onChange={e => setCategory(e.target.value as Category)}
                    >
                        {/* Boucle itérant sur le conteneur constant CATEGORIES pour générer la vue HTML associée de façon dynamique */}
                        {CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>
                                {/* Formatage manuel du texte : mise en lettre capitale sur le premier index du paramètre visuel */}
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
