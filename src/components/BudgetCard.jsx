import { useState } from 'react'
import {
    Wallet,
    Utensils,
    ShoppingBag,
    CarFront,
    ReceiptText,
    Clapperboard,
    HeartPulse,
    GraduationCap,
    CircleEllipsis,
    CircleCheck,
    AlertTriangle,
    Pencil,
    Trash2,
    ChevronDown,
    ChevronUp,
    CalendarDays,
} from 'lucide-react'

const categoryStyles = {
    'Food & Dining': {
        icon: Utensils,
        accent: 'bg-orange-100 text-orange-700',
    },
    Shopping: {
        icon: ShoppingBag,
        accent: 'bg-pink-100 text-pink-700',
    },
    Transportation: {
        icon: CarFront,
        accent: 'bg-sky-100 text-sky-700',
    },
    'Bills & Utilities': {
        icon: ReceiptText,
        accent: 'bg-amber-100 text-amber-700',
    },
    Entertainment: {
        icon: Clapperboard,
        accent: 'bg-purple-100 text-purple-700',
    },
    Healthcare: {
        icon: HeartPulse,
        accent: 'bg-rose-100 text-rose-700',
    },
    Education: {
        icon: GraduationCap,
        accent: 'bg-blue-100 text-blue-700',
    },
    Other: {
        icon: CircleEllipsis,
        accent: 'bg-violet-100 text-violet-700',
    },
}

const BudgetCard = ({
    budget,
    categoryTransactions = [],
    formatCurrency,
    onEdit,
    onDelete,
}) => {
    const [showAllTransactions, setShowAllTransactions] = useState(false)

    const percentage = Number(budget.percentageUsed) || 0
    const spent = Number(budget.spent) || 0
    const budgetAmount = Number(budget.amount) || 0
    const remaining = Number(budget.remaining) || 0

    const isExceeded = budget.isExceeded || spent > budgetAmount
    const isLimitReached = percentage >= 100 && !isExceeded
    const isNearLimit = percentage >= 80 && !isExceeded && !isLimitReached

    const overAmount = Math.max(spent - budgetAmount, 0)

    const status = isExceeded
        ? {
            label: 'Budget exceeded',
            icon: AlertTriangle,
            color: 'text-red-600',
            bg: 'bg-red-50',
            bar: 'bg-red-500',
        }
        : isLimitReached
            ? {
                label: 'Limit reached',
                icon: AlertTriangle,
                color: 'text-orange-600',
                bg: 'bg-orange-50',
                bar: 'bg-orange-500',
            }
            : isNearLimit
                ? {
                    label: 'Approaching limit',
                    icon: AlertTriangle,
                    color: 'text-amber-600',
                    bg: 'bg-amber-50',
                    bar: 'bg-amber-400',
                }
                : {
                    label: 'On track',
                    icon: CircleCheck,
                    color: 'text-emerald-600',
                    bg: 'bg-emerald-50',
                    bar: 'bg-emerald-500',
                }

    const StatusIcon = status.icon

    const categoryStyle = categoryStyles[budget.category] || {
        icon: Wallet,
        accent: 'bg-emerald-100 text-emerald-700',
    }

    const CategoryIcon = categoryStyle.icon

    const sortedTransactions = [...categoryTransactions].sort(
        (a, b) => Number(b.amount) - Number(a.amount)
    )

    const visibleTransactions = showAllTransactions
        ? sortedTransactions
        : sortedTransactions.slice(0, 3)

    const withinBudgetWidth = isExceeded && spent > 0
        ? (budgetAmount / spent) * 100
        : Math.min(Math.max(percentage, 0), 100)

    const excessWidth = isExceeded && spent > 0
        ? (overAmount / spent) * 100
        : 0

    const formatTransactionDate = (dateISO) => {
        if (!dateISO) return ''

        const date = new Date(`${dateISO.slice(0, 10)}T12:00:00`)

        if (Number.isNaN(date.getTime())) return ''

        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
        })
    }

    return (
        <article className="
            group overflow-hidden rounded-2xl
            border border-stone-200/80 bg-white
            shadow-sm
            transition-all duration-300 ease-out
            hover:-translate-y-1
            hover:border-[#C9DCC9]
            hover:bg-[#EAF2E8]
            hover:shadow-[0_10px_25px_rgba(82,122,88,0.10)]
        ">

            {/* Card Header */}
            <div className="p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className={`
                            flex h-11 w-11 shrink-0 items-center justify-center
                            rounded-xl
                            ${categoryStyle.accent}
                        `}>
                            <CategoryIcon size={21} strokeWidth={1.9} />
                        </div>

                        <div className="min-w-0">
                            <h3 className="truncate text-base font-bold text-stone-800 transition-colors duration-300">
                                {budget.category}
                            </h3>

                            <p className="mt-0.5 text-xs text-stone-400 transition-colors duration-300 group-hover:text-[#718574]">
                                Monthly category budget
                            </p>
                        </div>
                    </div>

                    <div className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[10px] font-semibold ${status.bg} ${status.color}`}>
                        <StatusIcon size={12} />
                        <span className="hidden sm:inline">{status.label}</span>
                        <span className="sm:hidden">
                            {isExceeded
                                ? 'Exceeded'
                                : isNearLimit
                                    ? 'Near limit'
                                    : isLimitReached
                                        ? 'Reached'
                                        : 'On track'}
                        </span>
                    </div>
                </div>

                {/* Spending Summary */}
                <div className="mt-6 flex items-end justify-between gap-3">
                    <div>
                        <p className="text-xs font-medium text-stone-400 transition-colors duration-300 group-hover:text-[#718574]">
                            Amount spent
                        </p>

                        <p className="mt-1 text-2xl font-bold tracking-tight text-stone-800">
                            {formatCurrency(spent)}
                        </p>
                    </div>

                    <div className="text-right">
                        <p className="text-xs text-stone-400 transition-colors duration-300 group-hover:text-[#718574]">
                            Budget used
                        </p>

                        <p className={`mt-1 text-xl font-bold transition-colors duration-300 ${
                            isExceeded
                                ? 'text-red-600'
                                : 'text-[#527A58]'
                        }`}>
                            {percentage.toFixed(0)}%
                        </p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                    <div className="flex h-2.5 overflow-hidden rounded-full bg-stone-100 transition-colors duration-300 group-hover:bg-[#DCE9DA]">
                        {spent > 0 && (
                            <>
                                <div
                                    className={`h-full transition-all duration-500 ${
                                        isExceeded ? 'bg-emerald-400' : status.bar
                                    }`}
                                    style={{ width: `${withinBudgetWidth}%` }}
                                />

                                {isExceeded && (
                                    <div
                                        className="h-full bg-red-400 transition-all duration-500"
                                        style={{ width: `${excessWidth}%` }}
                                    />
                                )}
                            </>
                        )}
                    </div>

                    {isExceeded && (
                        <div className="mt-2 flex items-center gap-3 text-[10px] text-stone-400 transition-colors duration-300 group-hover:text-[#718574]">
                            <span className="inline-flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                Within budget
                            </span>

                            <span className="inline-flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-red-400" />
                                Overspent
                            </span>
                        </div>
                    )}
                </div>

                {/* Budget and Remaining */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="text-stone-500 transition-colors duration-300 group-hover:text-[#718574]">
                        Budget: {formatCurrency(budgetAmount)}
                    </span>

                    <span className={`font-semibold transition-colors duration-300 ${
                        isExceeded
                            ? 'text-red-600'
                            : 'text-[#527A58]'
                    }`}>
                        {isExceeded
                            ? `${formatCurrency(overAmount)} over`
                            : `${formatCurrency(Math.max(remaining, 0))} left`}
                    </span>
                </div>
            </div>

            {/* Transaction Breakdown */}
            <div className="border-t border-stone-100 px-5 py-5 transition-colors duration-300 group-hover:border-[#D5E3D2] sm:px-6">
                <div className="mb-4 flex items-center justify-between gap-2">
                    <div>
                        <h4 className="text-sm font-bold text-stone-700">
                            Where your money went
                        </h4>

                        <p className="mt-1 text-[11px] text-stone-400 transition-colors duration-300 group-hover:text-[#718574]">
                            Actual category transactions
                        </p>
                    </div>

                    <span className="shrink-0 rounded-full bg-stone-100 px-2.5 py-1 text-[10px] font-semibold text-stone-600 transition-colors duration-300 group-hover:bg-white/80">
                        {sortedTransactions.length} {sortedTransactions.length === 1 ? 'transaction' : 'transactions'}
                    </span>
                </div>

                {sortedTransactions.length > 0 ? (
                    <>
                        <div className="space-y-2">
                            {visibleTransactions.map((transaction) => (
                                <div
                                    key={transaction.id || transaction._id}
                                    className="
                                        flex items-center gap-3 rounded-xl
                                        bg-stone-50 px-3 py-3
                                        transition-colors duration-300
                                        group-hover:bg-white/75
                                    "
                                >
                                    <div className={`
                                        flex h-9 w-9 shrink-0 items-center justify-center
                                        rounded-lg
                                        ${categoryStyle.accent}
                                    `}>
                                        <ReceiptText size={16} />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-xs font-semibold text-stone-700">
                                            {transaction.title || transaction.name || 'Untitled transaction'}
                                        </p>

                                        <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                                            {transaction.dateISO && (
                                                <span className="inline-flex items-center gap-1 text-[10px] text-stone-400 transition-colors duration-300 group-hover:text-[#718574]">
                                                    <CalendarDays size={10} />
                                                    {formatTransactionDate(transaction.dateISO)}
                                                </span>
                                            )}

                                            {transaction.description && (
                                                <span className="max-w-full truncate text-[10px] text-stone-400 transition-colors duration-300 group-hover:text-[#718574]">
                                                    · {transaction.description}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <p className="shrink-0 text-xs font-bold tabular-nums text-stone-700">
                                        {formatCurrency(transaction.amount)}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {sortedTransactions.length > 3 && (
                            <button
                                type="button"
                                onClick={() => setShowAllTransactions((previous) => !previous)}
                                className="
                                    mt-3 inline-flex w-full items-center justify-center gap-1.5
                                    rounded-lg py-2 text-xs font-semibold
                                    text-[#527A58] transition-colors duration-300
                                    hover:bg-emerald-50
                                    group-hover:hover:bg-white/75
                                "
                            >
                                {showAllTransactions ? (
                                    <>
                                        Show less
                                        <ChevronUp size={14} />
                                    </>
                                ) : (
                                    <>
                                        View all {sortedTransactions.length} transactions
                                        <ChevronDown size={14} />
                                    </>
                                )}
                            </button>
                        )}
                    </>
                ) : (
                    <div className="rounded-xl border border-dashed border-stone-200 bg-stone-50 px-4 py-6 text-center transition-colors duration-300 group-hover:border-[#D5E3D2] group-hover:bg-white/75">
                        <ReceiptText className="mx-auto text-stone-400" size={20} />

                        <p className="mt-2 text-xs font-semibold text-stone-600">
                            No transactions recorded yet
                        </p>

                        <p className="mt-1 text-[10px] text-stone-400 transition-colors duration-300 group-hover:text-[#718574]">
                            Expenses in this category will appear here.
                        </p>
                    </div>
                )}

                {/* Actions */}
                <div className="mt-5 flex items-center justify-end gap-2 border-t border-stone-100 pt-4 transition-colors duration-300 group-hover:border-[#D5E3D2]">
                    <button
                        type="button"
                        onClick={() => onEdit(budget)}
                        className="
                            inline-flex items-center gap-1.5 rounded-lg
                            border border-stone-200 px-3 py-2
                            text-xs font-semibold text-stone-600
                            transition-all duration-300
                            hover:border-[#527A58] hover:bg-emerald-50
                            group-hover:border-[#C9DCC9]
                            group-hover:hover:bg-white/75
                        "
                    >
                        <Pencil size={13} />
                        Edit
                    </button>

                    <button
                        type="button"
                        onClick={() => onDelete(budget)}
                        className="
                            inline-flex items-center gap-1.5 rounded-lg
                            border border-red-100 px-3 py-2
                            text-xs font-semibold text-red-600
                            transition-all duration-300
                            hover:border-red-200 hover:bg-red-50
                            group-hover:hover:bg-red-50
                        "
                    >
                        <Trash2 size={13} />
                        Delete
                    </button>
                </div>
            </div>
        </article>
    )
}

export default BudgetCard
