import { useState } from 'react'
import { CATEGORIES } from '../App'
import type { Category, TransactionType } from '../App' // On importe ici les Types stricts qu'on a declare a cote pour pas se planter !

// Les Props. Ca definit exactement ce que notre composant reclame a l'entree du composant parent !
// ici il veut absolument une fonction pour valider le formulaire.. avec ces 4 parametres :
type FormProps = {
    onSubmit: (name: string, amount: number, type: TransactionType, category: Category) => void
}

// Le fameux composant sous format de fonction 
function TransactionForm({ onSubmit }: FormProps) { // On chope sa fameuse prop onsubmit. 
    // Minis etats internes (state) : c'est pour retenir la valeur tapee dans les cases du HTML sans tout perdre a chaque milliseconde. 
    const [name, setName] = useState('')
    const [amount, setAmount] = useState('') // les input html sont des chaines de textes alors meme pour des chiffres on laisse "string" au state !
    const [type, setType] = useState<TransactionType>('depense') // la valeur de depart par defaut c'est depense 
    const [category, setCategory] = useState<Category>('alimentation') // le selecteur par defaut est sur alimentation

    // Quand on clique sur le bouton en bas de la page ("Ajouter")
    // le "e" c'est l evenement... (l'action javascript qui a recu ce bouton = clique)
    function handleSubmit(e: React.FormEvent) {
        // INDISPENSABLE: evite que le formulaire html ne reset completement la page web en flashant (le comportement prehistorique des annees 2000!) 
        e.preventDefault() 

        // Barriere de securite : si c'est vide, ou que les chiffres sont negatifs, on annule et on Return dans le vide avant d'appeler notre backend pour rien !
        if (!name.trim() || !amount || parseFloat(amount) <= 0) return

        // Maintenant ca passe ! 
        // L enfant appelle son parent grace a l'outil "prop" (onSubmit) en lui passant le nom nettoye, le prix converti en vrai nombre avec 2 decimales, etc...
        onSubmit(name.trim(), parseFloat(parseFloat(amount).toFixed(2)), type, category)

        // Ca a ete envoye au chef = donc on nettoie les 2 cases de text dans le visuel pour la prochaine fois ! (On vide la memoire mini du composant)
        setName('')
        setAmount('')
    }

    // Le rendu HTML final de ce formulaire
    return (
        <div className="panel">
            <h2>Nouvelle transaction</h2>
            <form onSubmit={handleSubmit}> {/* branchement de l action principale Submit sur le formulaire direct !! */}
                
                {/* zone pour choisir le type (revenu ou depense)  */}
                <div className="type-selector">
                    <button
                        type="button" // type "button" OBLIGATOIRE sinon ca soumettrai betement le form par erreur au lieu de juste chagner le state !
                        // Class CSS dynamique : le design s ajoute seulement si on a cliqué sur CE bouton de la ternaire !
                        className={`type-btn ${type === 'depense' ? 'expense-selected' : ''}`}
                        onClick={() => setType('depense')} // quand on clique ca change son etat 
                    >
                        Depense
                    </button>
                    {/* Le bouton frere pour revenu */}
                    <button
                        type="button"
                        className={`type-btn ${type === 'revenu' ? 'income-selected' : ''}`}
                        onClick={() => setType('revenu')}
                    >
                        Revenu
                    </button>
                </div>

                <div className="form-group">
                    {/* htmlfor utile pour lier ce label rouge direct a l'input via son ID ! comme ca si on cliq sur le titre ca focus la case direct ! */}
                    <label htmlFor="input-name">Description</label>
                    <input
                        id="input-name"
                        type="text"
                        placeholder="Ex: Courses au marche"
                        // Input controlé par React : sa valeur afficheé EST la variable d etat !..
                        value={name}
                        // Des qu'on tape une lettre physique, on "l'attrape l evenement" et on extrait sa valeur live pour la pousser dans le setName() !
                        onChange={e => setName(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="input-amount">Montant (EUR)</label>
                    <input
                        id="input-amount"
                        type="number" // forcera la boite HTML a accepter que des nombres pour pas nous faire crasher !
                        placeholder="0.00"
                        min="0.01" // par defaut tu tape un minimum de 1 centime
                        step="0.01" // les fleches native monteront de 1 centime
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="input-category">Categorie</label>
                    <select
                        id="input-category"
                        value={category}
                        // comme ça recoit un string classic html, on force Typescript a dire 'Tkt pas ca sera une Category'
                        onChange={e => setCategory(e.target.value as Category)}
                    >
                        {/* 
                          SUPER AUTOMATISATION !! plutot que decrire 50 options HTML a la main !! 
                          On prend notre liste globale des categories venant de App (CATEGORIES) , et on utilise .map . Chacun vas creer son rendu Html direct 
                         */}
                        {CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>
                                {/* Et on fait un petit formatage textuel pour avoir la premiere lettre en Majuscule au debut du mot ! (alim... -> Alimentation. ) */}
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Bouton de fin avec le type "submit", c'est lui qui declenche la methode ligne 38 !! */}
                <button type="submit" className="btn-add">
                    Ajouter la transaction
                </button>
            </form>
        </div>
    )
}

export default TransactionForm
