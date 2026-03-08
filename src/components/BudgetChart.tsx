import { useEffect, useRef, useState } from 'react'
import { Chart, ArcElement, Tooltip, Legend, DoughnutController } from 'chart.js'
import type { Transaction } from '../App'
import { CATEGORY_COLORS } from '../App'

// on enregistre les composant chart.js qu'on va utilser
Chart.register(ArcElement, Tooltip, Legend, DoughnutController)

// les props qu'on recoi du parent
type ChartProps = {
    transactions: Transaction[]
    theme: 'light' | 'dark'
}

// composant pour le graphique en doughnut
function BudgetChart({ transactions, theme }: ChartProps) {
    const [chartView, setChartView] = useState<'depenses' | 'revenus'>('depenses')

    // ref pour le canvas du chart
    const chartRef = useRef<HTMLCanvasElement>(null)
    const chartInstance = useRef<Chart | null>(null)

    // les transactions filtrées pour le graphique actuel
    const chartTransactions = transactions.filter(
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

    return (
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
    )
}

export default BudgetChart
