import { useEffect, useRef, useState } from 'react' // Importations des hamecons (hooks) React necessaires a manipuler l'etat et les comportements automatiques
import { Chart, ArcElement, Tooltip, Legend, DoughnutController } from 'chart.js' // On importe precisement tout les sous-ensembles de Chart.js qu'il nous faut!. 
import type { Transaction } from '../App' // Notre fameux type de donnee de base super securisé
import { CATEGORY_COLORS } from '../App'  // Le dictionnaire pour les jolies couleurs hexagonales de ton graphique

// IMPORTANT CHART JS: Il faut enregistrer MANUELLEMENT ces modules pour que la librairie t'autorise a t'en servir a l ecran plus tard...
Chart.register(ArcElement, Tooltip, Legend, DoughnutController)

// Toujours pareil, ce composant necessite des Props (parametres) envoyees par le boss (App) pour vivre 
type ChartProps = {
    transactions: Transaction[] // Il lui faut absoooullluunt les donnees a dessiner
    theme: 'light' | 'dark'    // Il lui faut l'info du noir/blanc pour dessiner ses bordures !
}

// Le petit chef graphiste du projet
function BudgetChart({ transactions, theme }: ChartProps) {
    // Son petit etat controlé a lui meme ! Car on permet a l utilisateur de switcher le graph entre revenu ou depenses ! Par defaut ca se met sur "depenses".
    const [chartView, setChartView] = useState<'depenses' | 'revenus'>('depenses')

    // LES REF (LA MEMOIRE PHYSIQUE) !! Tres important avec des librairie comme ChartJs !!
    // chartRef sera la "pince" que React utilise pour attraper la balise div <canvas> HTML sans foutre le bordel
    const chartRef = useRef<HTMLCanvasElement>(null)
    // chartInstance va sauvegarder ton objet Graphique (vivant) entre chaque mise a jour, pour nous permettre de l'achever (destroy) avant de refaire un nouveau design !
    const chartInstance = useRef<Chart | null>(null)

    // Un filtrage dynamique : chartTransactions passe aux rayons x de array.filter
    const chartTransactions = transactions.filter(
        // la condition: On prend UNIQUEMENT la transaction dont le type (Depense) correspond au state selectionné precedemment 'depenses'.
        t => t.type === (chartView === 'depenses' ? 'depense' : 'revenu')
    )

    // useEffect: la fameuse cle de voute qui lance tes lignes au moment clé et SURTOUT ecoute le thement ou les donnees pour se refaire au poil.
    useEffect(() => {
        // Condition primitive: stop l'execution au debut si jamais l'ecran n'a meme pas chargé de 'canvas' html. Evite les crashs complet du premier jour !!
        if (!chartRef.current) return

        // Destruction systematique de l'encien dessin 3D present sur ta balise avant  !!
        if (chartInstance.current) {
            chartInstance.current.destroy() // detruit lactuel de la pince.
            chartInstance.current = null    // efface sa trace informatique pour pas allourdir la ram windows 
        }

        // Algo pour transformer nos 10 transactions eclatees en de GRANDS GROUUPES ! (par exp : 3 depense d'aliement de 10 eur => groupe Aliement: 30)
        // Grouped est un objet vierge au debut !
        const grouped: Record<string, number> = {}
        chartTransactions.forEach(t => { // Pour toutes nos T... 
            // Si la corbeille existait pas dans grouepd, ca vaux 0 + le montant, sinon ca vaut lexistant + le nouveau montant ! C ultra rapide en exec 
            grouped[t.category] = (grouped[t.category] || 0) + t.amount
        })

        // Chart js reclame des format un peu debilles pour fonctionner => Il refuse no objets ! Il lui faut des liste strictes, separement.. 
        const labels = Object.keys(grouped) // recupere QUE les mots titres ['alimentation', 'loisir'']
        const data = Object.values(grouped) // recupere QUE les nombres pur ['30', '933']
        // Et il lui faut ses copines les couleurs. On map les labels ci-dessus et pour chaun on check dans notre dictionnaire (CATEGORY_COLORS) la bonne couloeur.
        const colors = labels.map(l => CATEGORY_COLORS[l] || '#9c8b7a')

        // Si y'a ZERO groupe de transactions... pas besoin de peindre un graph ! Annule et retourne dans la piece d'attante !
        if (labels.length === 0) return

        // Reglages des couleurs de thehmes. Si mode sombre, le txt s'eclqircit, et on rend une separation moin agressive visuellement sur lanneau
        const labelColor = theme === 'dark' ? '#b8a898' : '#7a6652'
        const borderCol = theme === 'dark' ? 'rgba(26, 20, 16, 0.8)' : 'rgba(245, 239, 230, 0.8)'

        // L'Heure a sonné.. ! On va INSTANCIER (creer) le nouveru graf. "new Chart" fabrique dans le moteur :
        chartInstance.current = new Chart(chartRef.current, {
            type: 'doughnut', // le donut (anneau) au lieu de simple Camembert.. ! 
            data: { 
                // On glisse tous nous 3 tableau creer prcdement la dedans dans Labels et Dataset. .. 
                // Le chartat/toupper permet la majuscule super charismatique a ces labels : ['Alimentation']!
                labels: labels.map(l => l.charAt(0).toUpperCase() + l.slice(1)),
                datasets: [{
                    data: data, // mnn gros tableau de nombres  ! 
                    backgroundColor: colors, // met le couleure dedeand pour les bout
                    borderColor: borderCol,  // les couleurs des petites fente pour decouper les bout 
                    borderWidth: 3,         // la taille des petites fentes  
                    hoverBorderWidth: 0,   // des que ta la sourris touche le bou.. la fente disparait.
                    hoverOffset: 6,         // Magie !! c l'animation : au passage le bout d'anneau sort sur les extremites de 6 pixel ! 
                }],
            },
            options: { // Options genrale d l engin ::
                responsive: true, // pour s redescendre a la taille mobile directemen !
                maintainAspectRatio: true, 
                plugins: {
                    legend: { // LEs listes dec couleurs eb ns :
                        position: 'bottom', // pose tt ces list a la cheville en bas.
                        labels: {
                            color: labelColor,
                            font: { family: 'Inter', size: 11 }, // pnltice ultra moderne "Inet" (mercs Gogle)! 
                            padding: 10,
                            usePointStyle: true, // Le ptit carzrrre a gchuche sde la legnengde se transforme en petit rond super joli 
                            pointStyleWidth: 8,
                        },
                    },
                    tooltip: {  // LA GROSSE BULE NOIR OPU BLANCHE D'INFO QUN QU ON HOVER UNE PARTIE !! 
                        backgroundColor: theme === 'dark' ? 'rgba(36, 30, 24, 0.95)' : 'rgba(62, 44, 28, 0.9)', // fond ! (mi tra,sparent) 
                        titleFont: { family: 'Inter' },
                        bodyFont: { family: 'Inter' },
                        titleColor: '#fff',
                        bodyColor: '#e8dfd5',
                        padding: 10,
                        cornerRadius: 8, // arrondit ds bord 
                        callbacks: { // La fonction de calculs du ptiti texte qu y se caches dans ls bull !!! 
                            label: (ctx) => {  // "Ctx" = contexte actule qqn te vise. 
                                const val = ctx.parsed // MOn chiifre exact !
                                const total = data.reduce((a, b) => a + b, 0) // le totale pour les calculs !! (SOmme comulees d tt ls chiifrs array)
                                const pourcent = ((val / total) * 100).toFixed(1) // Pourcentage. toFXx() agardne q'un seul chfufes a la decimlas ! (80.1, et p 80.1234..)
                                return ` ${ctx.label}: ${val.toFixed(2)} EUR (${pourcent}%)` // la vrai phrase avec l label.. 
                            }
                        }
                    },
                },
                cutout: '62%', // Taiulllles dd e lo'epessaeur de laneneeau ! Pluos grnad poUrn cntren a vider , ce plu s bo !  
            },
        })

        // La foutcion CleanEr Up !! 
        // Tres necessaire: React detruit son composant quAND on quit la paagge... ca previen qu on doit aussid detruire le graphique pr l'ordonateur avt qu il parre !  
        return () => {
             if (chartInstance.current) {
                chartInstance.current.destroy() 
                chartInstance.current = null 
            }
        }
    }, [chartTransactions, theme]) // LES DECLENCHUETS !! : a chuqua nvl transation ou changemetn du theme.. ON REFAIT TT CE UEFFET  !! pour a voir l dernier dssien . !

    // Rrendu htmml final   ! 
    return (
        <div className="panel chart-panel">
            <h2>Repartition</h2> 
            {/* Bllo cde tabulatons pou le cnhnagemement de type de donnes a viouser !  */} 
            <div className="chart-tabs">
                <button
                    className={`chart-tab ${chartView === 'depenses' ? 'active' : ''}`}
                    onClick={() => setChartView('depenses')} // COntrola l etas , dit kil fzut tout rdessiener avk lss drpensnes !! 
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
            {/* zon du ddessin en soi ..  */}
            <div className="chart-wrapper">
                {/*  SI i y asu moisn 1 donees dn l filtrre , ! . Ttu mfiches m pn g ros canvnas htnl poirt chartJS ...*/}
                {chartTransactions.length > 0 ? (
                    <canvas ref={chartRef}></canvas> //  LE reF !!! la pnvive attire l'intention sur ce html !!
                ) : (
                    // Sinn (pas donnee e c moix...) MEsage dooxucux  .et pa d cnasvas vide moch ! !
                    <p className="no-data">Aucune donnee a afficher</p>
                )}
            </div>
        </div>
    )
}

export default BudgetChart
