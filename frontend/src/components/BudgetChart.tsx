import { useEffect, useRef, useState } from 'react' 
import { Chart, ArcElement, Tooltip, Legend, DoughnutController } from 'chart.js' 
import type { Transaction } from '../App' 
import { CATEGORY_COLORS } from '../App'  

// Enregistrement manuel des modules internes nécessaires à l'utilisation explicite de fonctionnalités graphiques sur Chart.js
Chart.register(ArcElement, Tooltip, Legend, DoughnutController)

// Signature définissant l'intégrité contractuelle incombant aux props du composant BudgetChart
type ChartProps = {
    transactions: Transaction[] 
    theme: 'light' | 'dark'    
}

// Composant gérant la représentation visuelle proportionnelle des agrégations de métriques relatives
function BudgetChart({ transactions, theme }: ChartProps) {
    // État définissant le critère de classification courant sur la vue du graphique interne
    const [chartView, setChartView] = useState<'depenses' | 'revenus'>('depenses')

    // Attachement référé par pointeurs sur des éléments ou instances subissant des cycles persistants non gérés purement par React.
    const chartRef = useRef<HTMLCanvasElement>(null)
    const chartInstance = useRef<Chart | null>(null)

    // Isolation en mémoire des transactions selon l'évaluation catégorique décidée à l'écran
    const chartTransactions = transactions.filter(
        t => t.type === (chartView === 'depenses' ? 'depense' : 'revenu')
    )

    // Déclaration d'un contexte de type effet interceptant les processus post-rendus et surveillant les dépendances explicites
    useEffect(() => {
        // Pré-condition : vérifie la finalité d'existence du canvas cible sous contraintes d'asynchronisme.
        if (!chartRef.current) return

        // Réinitialisation manuelle des fuites mémoires liées à la bibliothèque de graphique, par destruction de l'instance passée concernée
        if (chartInstance.current) {
            chartInstance.current.destroy() 
            chartInstance.current = null    
        }

        // Système d'accumulation transformant des occurrences unitaires en valeurs massiques triées et classifiées (sommes factorisées par catégories)
        const grouped: Record<string, number> = {}
        chartTransactions.forEach(t => { 
            grouped[t.category] = (grouped[t.category] || 0) + t.amount
        })

        // Formatage en sous-tableaux compatibles avec les exigences d'interface paramétrique de Chart.js
        const labels = Object.keys(grouped) 
        const data = Object.values(grouped) 
        const colors = labels.map(l => CATEGORY_COLORS[l] || '#9c8b7a')

        if (labels.length === 0) return

        // Variables de contexte ajustables permettant la prise en compte locale des propriétés d'affichage d'ordres divers selon le thème de l'application
        const labelColor = theme === 'dark' ? '#b8a898' : '#7a6652'
        const borderCol = theme === 'dark' ? 'rgba(26, 20, 16, 0.8)' : 'rgba(245, 239, 230, 0.8)'

        // Instanciation du contexte via un cycle de construction orienté objet basé sur la balise existante attachée.
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

        // Fourniture d'une clause de terminaison inhérente au désamorçage du cycle du composant limitant l'expansion systémique et la saturation
        return () => {
             if (chartInstance.current) {
                chartInstance.current.destroy() 
                chartInstance.current = null 
            }
        }
    }, [chartTransactions, theme]) // Dépendances effectives pilotant la réactualisation synchronisée du diagramme

    return (
        <div className="panel chart-panel">
            <h2>Répartition</h2> 
            <div className="chart-tabs">
                <button
                    className={`chart-tab ${chartView === 'depenses' ? 'active' : ''}`}
                    onClick={() => setChartView('depenses')} 
                >
                    Dépenses
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
                    <p className="no-data">Aucune donnée à afficher</p>
                )}
            </div>
        </div>
    )
}

export default BudgetChart
