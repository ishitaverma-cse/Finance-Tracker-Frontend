import {
    Wallet,
    TrendingDown,
    PiggyBank,
    ArrowUpRight,
    ArrowDownRight,
} from 'lucide-react'

const BudgetStats = ({ budgetSummary, formatCurrency }) => {
    const totalBudget = Number(budgetSummary.totalBudget) || 0
    const totalSpent = Number(budgetSummary.totalSpent) || 0
    const totalRemaining = Number(budgetSummary.totalRemaining) || 0
    const percentageUsed = Number(budgetSummary.percentageUsed) || 0

    const isOverBudget = totalRemaining < 0
    const progressWidth = Math.min(Math.max(percentageUsed, 0), 100)

    const stats = [
        {
            label: 'Total Monthly Budget',
            value: formatCurrency(totalBudget),
            description: 'Your planned spending limit',
            icon: Wallet,
            iconStyle: 'bg-emerald-50 text-emerald-700',
        },
        {
            label: 'Amount Spent',
            value: formatCurrency(totalSpent),
            description: `${percentageUsed.toFixed(0)}% of your total budget used`,
            icon: TrendingDown,
            iconStyle: 'bg-orange-50 text-orange-700',
        },
        {
            label: isOverBudget ? 'Amount Over Budget' : 'Remaining Budget',
            value: formatCurrency(Math.abs(totalRemaining)),
            description: isOverBudget
                ? 'You have exceeded your planned budget'
                : 'Available across your categories',
            icon: PiggyBank,
            iconStyle: isOverBudget
                ? 'bg-red-50 text-red-700'
                : 'bg-sky-50 text-sky-700',
        },
    ]

    return (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {stats.map((stat, index) => {
                const Icon = stat.icon

                return (
                    <article
                        key={stat.label}
                        className="
                            rounded-2xl border border-stone-200/80
                            bg-white p-5 shadow-sm
                            transition-all duration-300
                            hover:-translate-y-0.5
                            hover:border-emerald-200
                            hover:bg-[#F8FBF7]
                            hover:shadow-md
                            sm:p-6
                        "
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-xs font-medium text-stone-500">
                                    {stat.label}
                                </p>

                                <p className={`mt-3 text-2xl font-bold tracking-tight sm:text-3xl ${
                                    index === 2 && isOverBudget
                                        ? 'text-red-600'
                                        : 'text-stone-800'
                                }`}>
                                    {stat.value}
                                </p>
                            </div>

                            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${stat.iconStyle}`}>
                                <Icon size={21} strokeWidth={1.8} />
                            </div>
                        </div>

                        {index === 1 ? (
                            <div className="mt-5">
                                <div className="mb-2 flex items-center justify-between">
                                    <p className="text-[11px] text-stone-400">
                                        Budget utilisation
                                    </p>

                                    <p className={`text-[11px] font-bold ${
                                        isOverBudget ? 'text-red-600' : 'text-emerald-700'
                                    }`}>
                                        {percentageUsed.toFixed(0)}%
                                    </p>
                                </div>

                                <div className="h-2 overflow-hidden rounded-full bg-stone-100">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${
                                            isOverBudget
                                                ? 'bg-red-500'
                                                : 'bg-emerald-500'
                                        }`}
                                        style={{ width: `${progressWidth}%` }}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="mt-5 flex items-center gap-2 border-t border-stone-100 pt-4">
                                <span className={`flex h-6 w-6 items-center justify-center rounded-full ${
                                    index === 2 && isOverBudget
                                        ? 'bg-red-50 text-red-600'
                                        : 'bg-emerald-50 text-emerald-700'
                                }`}>
                                    {index === 2 && isOverBudget
                                        ? <ArrowDownRight size={14} />
                                        : <ArrowUpRight size={14} />}
                                </span>

                                <p className="text-[11px] text-stone-500">
                                    {stat.description}
                                </p>
                            </div>
                        )}
                    </article>
                )
            })}
        </section>
    )
}

export default BudgetStats
