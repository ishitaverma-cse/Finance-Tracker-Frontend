import { TrendingDown, TrendingUp } from 'lucide-react'

function StatCard({
    title,
    amount,
    change,
    changeLabel,
    icon: Icon,
    trend = 'up',
    iconColor = 'emerald',
}) {
    const isPositive = trend === 'up'

    const iconStyles = {
        emerald: 'bg-emerald-100 text-emerald-800',
        blue: 'bg-blue-100 text-blue-700',
        rose: 'bg-rose-100 text-rose-700',
        amber: 'bg-amber-100 text-amber-700',
    }

    return (
        <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-medium text-stone-500">
                        {title}
                    </p>

                    <h2 className="mt-3 text-2xl font-bold tracking-tight text-emerald-950 sm:text-3xl">
                        {amount}
                    </h2>
                </div>

                {Icon && (
                    <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                            iconStyles[iconColor] || iconStyles.emerald
                        }`}
                    >
                        <Icon size={21} strokeWidth={1.9} />
                    </div>
                )}
            </div>

            {change && (
                <div className="mt-5 flex flex-wrap items-center gap-2">
                    <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
                            isPositive
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-rose-50 text-rose-700'
                        }`}
                    >
                        {isPositive ? (
                            <TrendingUp size={13} />
                        ) : (
                            <TrendingDown size={13} />
                        )}
                        {change}
                    </span>

                    {changeLabel && (
                        <span className="text-xs text-stone-400">
                            {changeLabel}
                        </span>
                    )}
                </div>
            )}
        </div>
    )
}

export default StatCard
