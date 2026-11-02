import { useEffect, useMemo, useState } from 'react'
import {
    ArrowDownLeft,
    ArrowUpRight,
    TrendingUp,
    TrendingDown,
    Wallet,
    Download,
    CalendarDays,
    ChartNoAxesCombined,
    ReceiptText,
    Search,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react'

import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    Legend,
} from 'recharts'

const COLORS = [
    '#177452',
    '#6D9B83',
    '#B95B51',
    '#D4A373',
    '#7C83DB',
    '#5B9AA0',
    '#A3B18A',
    '#C08497',
    '#8D99AE',
    '#E09F3E',
]

const ReportsPage = ({ transactions = [], formatCurrency }) => {
    const [period, setPeriod] = useState('month')
    const [customStart, setCustomStart] = useState('')
    const [customEnd, setCustomEnd] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [typeFilter, setTypeFilter] = useState('all')
    const [categoryFilter, setCategoryFilter] = useState('all')

    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 5


    const today = new Date()

    const getDateKey = (date) => {
        if (!date) return ''

        const parsedDate = new Date(date)

        if (Number.isNaN(parsedDate.getTime())) return ''

        const year = parsedDate.getFullYear()
        const month = String(parsedDate.getMonth() + 1).padStart(2, '0')
        const day = String(parsedDate.getDate()).padStart(2, '0')

        return `${year}-${month}-${day}`
    }

    const getRange = () => {
        const end = new Date(today)
        const start = new Date(today)

        if (period === 'week') {
            start.setDate(today.getDate() - 6)
        } else if (period === 'month') {
            start.setDate(1)
        } else if (period === 'year') {
            start.setMonth(0, 1)
        } else if (period === 'custom') {
            return {
                start: customStart || '0000-01-01',
                end: customEnd || '9999-12-31',
            }
        }

        return {
            start: getDateKey(start),
            end: getDateKey(end),
        }
    }

    const dateRange = getRange()

    const periodTransactions = useMemo(() => {
        return transactions.filter((transaction) => {
            const date = transaction.dateISO || getDateKey(transaction.date)

            return date >= dateRange.start && date <= dateRange.end
        })
    }, [transactions, dateRange.start, dateRange.end])

    const incomeTransactions = periodTransactions.filter(
        (transaction) => transaction.type === 'income'
    )

    const expenseTransactions = periodTransactions.filter(
        (transaction) => transaction.type === 'expense'
    )

    const totalIncome = incomeTransactions.reduce(
        (sum, transaction) => sum + Number(transaction.amount || 0),
        0
    )

    const totalExpenses = expenseTransactions.reduce(
        (sum, transaction) => sum + Number(transaction.amount || 0),
        0
    )

    const netCashFlow = totalIncome - totalExpenses

    const savingsRate = totalIncome > 0
        ? (netCashFlow / totalIncome) * 100
        : 0

    const categoryData = useMemo(() => {
        const categoryTotals = {}

        expenseTransactions.forEach((transaction) => {
            const category = transaction.category || 'Other'

            categoryTotals[category] =
                (categoryTotals[category] || 0) +
                Number(transaction.amount || 0)
        })

        return Object.entries(categoryTotals)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
    }, [expenseTransactions])

    const monthlyData = useMemo(() => {
        const monthlyTotals = {}

        periodTransactions.forEach((transaction) => {
            const date = transaction.dateISO || getDateKey(transaction.date)

            if (!date) return

            const monthKey = date.slice(0, 7)
            const [year, month] = monthKey.split('-')

            const monthLabel = new Date(
                Number(year),
                Number(month) - 1,
                1
            ).toLocaleDateString('en-IN', {
                month: 'short',
                year: '2-digit',
            })

            if (!monthlyTotals[monthKey]) {
                monthlyTotals[monthKey] = {
                    monthKey,
                    month: monthLabel,
                    income: 0,
                    expenses: 0,
                    savings: 0,
                }
            }

            const amount = Number(transaction.amount || 0)

            if (transaction.type === 'income') {
                monthlyTotals[monthKey].income += amount
            } else {
                monthlyTotals[monthKey].expenses += amount
            }
        })

        return Object.values(monthlyTotals)
            .map((item) => ({
                ...item,
                savings: item.income - item.expenses,
            }))
            .sort((a, b) => a.monthKey.localeCompare(b.monthKey))
    }, [periodTransactions])

    const filteredTransactions = useMemo(() => {
        const term = searchTerm.trim().toLowerCase()

        return periodTransactions
            .filter((transaction) => {
                const matchesType =
                    typeFilter === 'all' || transaction.type === typeFilter

                const matchesCategory =
                    categoryFilter === 'all' ||
                    transaction.category === categoryFilter

                const matchesSearch =
                    !term ||
                    transaction.title?.toLowerCase().includes(term) ||
                    transaction.category?.toLowerCase().includes(term) ||
                    transaction.description?.toLowerCase().includes(term)

                return matchesType && matchesCategory && matchesSearch
            })
            .sort((a, b) => {
                const dateA = a.dateISO || getDateKey(a.date)
                const dateB = b.dateISO || getDateKey(b.date)

                return dateB.localeCompare(dateA)
            })
    }, [periodTransactions, typeFilter, categoryFilter, searchTerm])

    // Reset pagination when report filters change
    useEffect(() => {
        setCurrentPage(1)
    }, [period, customStart, customEnd, searchTerm, typeFilter, categoryFilter])

    // Pagination calculations
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)

    const startIndex = (currentPage - 1) * itemsPerPage

    const paginatedTransactions = filteredTransactions.slice(
        startIndex,
        startIndex + itemsPerPage
    )

    // Display up to 5 page numbers at a time
    const startPage = Math.max(
        1,
        Math.min(currentPage - 2, totalPages - 4)
    )

    const endPage = Math.min(totalPages, startPage + 4)

    const pageNumbers = Array.from(
        { length: endPage - startPage + 1 },
        (_, index) => startPage + index
    )

    const categories = [
        ...new Set(
            periodTransactions
                .map((transaction) => transaction.category)
                .filter(Boolean)
        ),
    ].sort()

    const largestExpenses = [...expenseTransactions]
        .sort((a, b) => Number(b.amount) - Number(a.amount))
        .slice(0, 5)

    const highestCategory = categoryData[0]

    const periodLabel = period === 'week'
        ? 'Last 7 days'
        : period === 'month'
            ? 'This month'
            : period === 'year'
                ? 'This year'
                : 'Custom range'

    const exportCSV = () => {
        const headers = [
            'Date',
            'Transaction',
            'Type',
            'Category',
            'Description',
            'Amount',
        ]

        const rows = filteredTransactions.map((transaction) => [
            transaction.dateISO || getDateKey(transaction.date),
            transaction.title || '',
            transaction.type,
            transaction.category || '',
            transaction.description || '',
            transaction.amount,
        ])

        const escapeCSV = (value) =>
            `"${String(value ?? '').replace(/"/g, '""')}"`

        const csvContent = [
            headers.map(escapeCSV).join(','),
            ...rows.map((row) => row.map(escapeCSV).join(',')),
        ].join('\n')

        const blob = new Blob([csvContent], {
            type: 'text/csv;charset=utf-8;',
        })

        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')

        link.href = url
        link.download = `thrive-report-${dateRange.start}-to-${dateRange.end}.csv`
        link.click()

        URL.revokeObjectURL(url)
    }

    const statCards = [
        {
            label: 'Total Income',
            value: totalIncome,
            caption: `${incomeTransactions.length} income entries`,
            icon: ArrowDownLeft,
            iconBg: 'bg-[#DDF2E5]',
            iconColor: 'text-[#177452]',
            valueColor: 'text-[#177452]',
        },
        {
            label: 'Total Expenses',
            value: totalExpenses,
            caption: `${expenseTransactions.length} expense entries`,
            icon: ArrowUpRight,
            iconBg: 'bg-[#FBE8E3]',
            iconColor: 'text-[#B95B51]',
            valueColor: 'text-[#B95B51]',
        },
        {
            label: 'Net Cash Flow',
            value: netCashFlow,
            caption: netCashFlow >= 0 ? 'Positive cash flow' : 'Negative cash flow',
            icon: Wallet,
            iconBg: netCashFlow >= 0 ? 'bg-[#DDF2E5]' : 'bg-[#FBE8E3]',
            iconColor: netCashFlow >= 0 ? 'text-[#177452]' : 'text-[#B95B51]',
            valueColor: netCashFlow >= 0 ? 'text-[#177452]' : 'text-[#B95B51]',
        },
        {
            label: 'Savings Rate',
            value: `${savingsRate.toFixed(1)}%`,
            caption: 'Net cash flow relative to income',
            icon: ChartNoAxesCombined,
            iconBg: 'bg-[#E8EAFB]',
            iconColor: 'text-[#646CC4]',
            valueColor: 'text-[#343B8A]',
            isPercentage: true,
        },
    ]

    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload?.length) return null

        return (
            <div className="rounded-xl border border-[#E1E6DC] bg-white p-3 shadow-lg">
                {label && (
                    <p className="mb-2 text-xs font-semibold text-[#637066]">
                        {label}
                    </p>
                )}

                {payload.map((item) => (
                    <p
                        key={item.dataKey}
                        className="text-sm font-semibold"
                        style={{ color: item.color }}
                    >
                        {item.name}: {formatCurrency(item.value)}
                    </p>
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-7">


            {/* Reports Heading and Export Action */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-emerald-950">
                        Reports
                    </h1>

                    <p className="mt-2 text-sm text-stone-500">
                        Understand your financial activity through detailed insights.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={exportCSV}
                    disabled={filteredTransactions.length === 0}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#173F35] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#245548] disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <Download size={17} />
                    Export CSV
                </button>
            </div>

            {/* Date period controls */}
            <section className="rounded-2xl border border-[#E3E9DF] bg-[#FBFCFA] p-4 shadow-sm sm:p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-2 text-sm font-semibold text-[#40574A]">
                        <CalendarDays size={18} className="text-[#6D9B83]" />
                        Report period
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {[
                            { label: '7 days', value: 'week' },
                            { label: 'This month', value: 'month' },
                            { label: 'This year', value: 'year' },
                            { label: 'Custom', value: 'custom' },
                        ].map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => setPeriod(option.value)}
                                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${period === option.value
                                    ? 'bg-[#173F35] text-white shadow-sm'
                                    : 'border border-[#E1E5DB] bg-white text-[#637066] hover:border-[#A9B9AB] hover:text-[#173F35]'
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                {period === 'custom' && (
                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                            <label className="mb-1.5 block text-xs font-semibold text-[#637066]">
                                From date
                            </label>
                            <input
                                type="date"
                                value={customStart}
                                max={customEnd || undefined}
                                onChange={(event) => setCustomStart(event.target.value)}
                                className="w-full rounded-xl border border-[#E1E5DB] bg-white px-3 py-2.5 text-sm text-[#34483B] outline-none focus:border-[#6D9B83] focus:ring-2 focus:ring-[#DDF2E5]"
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-semibold text-[#637066]">
                                To date
                            </label>
                            <input
                                type="date"
                                value={customEnd}
                                min={customStart || undefined}
                                onChange={(event) => setCustomEnd(event.target.value)}
                                className="w-full rounded-xl border border-[#E1E5DB] bg-white px-3 py-2.5 text-sm text-[#34483B] outline-none focus:border-[#6D9B83] focus:ring-2 focus:ring-[#DDF2E5]"
                            />
                        </div>
                    </div>
                )}

                <p className="mt-3 text-xs font-medium text-[#858B80]">
                    Showing report for: {periodLabel} · {dateRange.start} to {dateRange.end}
                </p>
            </section>

            {/* Overview stats */}
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {statCards.map((card) => {
                    const Icon = card.icon

                    return (
                        <div
                            key={card.label}
                            className="group rounded-2xl border border-[#E3E9DF] bg-white p-5 shadow-sm transition duration-200 hover:border-[#C6D8C8] hover:bg-[#EAF5EC] hover:shadow-md"
                        >
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-[#738076]">
                                    {card.label}
                                </p>

                                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.iconBg} ${card.iconColor}`}>
                                    <Icon size={19} />
                                </span>
                            </div>

                            <p className={`mt-4 break-words text-2xl font-bold tracking-tight ${card.valueColor}`}>
                                {card.isPercentage
                                    ? card.value
                                    : formatCurrency(card.value)}
                            </p>

                            <p className="mt-2 text-xs text-[#899187]">
                                {card.caption}
                            </p>
                        </div>
                    )
                })}
            </section>

            {/* Charts */}
            <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                {/* Income vs expense */}
                <div className="rounded-3xl border border-[#E3E9DF] bg-[#FBFCFA] p-5 shadow-sm sm:p-6">
                    <div>
                        <h2 className="text-lg font-bold text-[#252A22]">
                            Income vs. Expenses
                        </h2>
                        <p className="mt-1 text-sm text-[#858B80]">
                            Compare money coming in and going out.
                        </p>
                    </div>

                    <div className="mt-6 h-[300px]">
                        {monthlyData.length === 0 ? (
                            <div className="flex h-full items-center justify-center text-sm text-[#858B80]">
                                No financial data for this period yet.
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyData} barGap={8}>
                                    <CartesianGrid
                                        stroke="#E5EAE1"
                                        strokeDasharray="3 3"
                                        vertical={false}
                                    />
                                    <XAxis
                                        dataKey="month"
                                        tick={{ fill: '#858B80', fontSize: 12 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        tick={{ fill: '#858B80', fontSize: 11 }}
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={(value) => `${value / 1000}k`}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Bar
                                        dataKey="income"
                                        name="Income"
                                        fill="#177452"
                                        radius={[6, 6, 0, 0]}
                                    />
                                    <Bar
                                        dataKey="expenses"
                                        name="Expenses"
                                        fill="#B95B51"
                                        radius={[6, 6, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Expense category pie */}
                <div className="rounded-3xl border border-[#E3E9DF] bg-[#FBFCFA] p-5 shadow-sm sm:p-6">
                    <div>
                        <h2 className="text-lg font-bold text-[#252A22]">
                            Expense Breakdown
                        </h2>
                        <p className="mt-1 text-sm text-[#858B80]">
                            Discover where your money is being spent.
                        </p>
                    </div>

                    <div className="mt-5 h-[300px]">
                        {categoryData.length === 0 ? (
                            <div className="flex h-full items-center justify-center text-sm text-[#858B80]">
                                No expenses recorded for this period.
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={105}
                                        paddingAngle={3}
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell
                                                key={entry.name}
                                                fill={COLORS[index % COLORS.length]}
                                            />
                                        ))}
                                    </Pie>

                                    <Tooltip
                                        formatter={(value) => formatCurrency(value)}
                                    />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                        formatter={(value) => (
                                            <span className="text-xs text-[#637066]">
                                                {value}
                                            </span>
                                        )}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Monthly savings trend */}
                <div className="rounded-3xl border border-[#E3E9DF] bg-[#FBFCFA] p-5 shadow-sm sm:p-6 xl:col-span-2">
                    <div>
                        <h2 className="text-lg font-bold text-[#252A22]">
                            Cash Flow Trend
                        </h2>
                        <p className="mt-1 text-sm text-[#858B80]">
                            Track how your savings change over the selected period.
                        </p>
                    </div>

                    <div className="mt-6 h-[300px]">
                        {monthlyData.length === 0 ? (
                            <div className="flex h-full items-center justify-center text-sm text-[#858B80]">
                                Your cash flow trend will appear here.
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyData}>
                                    <CartesianGrid
                                        stroke="#E5EAE1"
                                        strokeDasharray="3 3"
                                        vertical={false}
                                    />
                                    <XAxis
                                        dataKey="month"
                                        tick={{ fill: '#858B80', fontSize: 12 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        tick={{ fill: '#858B80', fontSize: 11 }}
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={(value) => `${value / 1000}k`}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar
                                        dataKey="savings"
                                        name="Net savings"
                                        fill="#6D9B83"
                                        radius={[6, 6, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </section>

            {/* Spending insights */}
            <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                <div className="rounded-3xl border border-[#E3E9DF] bg-[#FBFCFA] p-5 shadow-sm sm:p-6">
                    <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DDF2E5] text-[#177452]">
                            <TrendingDown size={19} />
                        </span>

                        <div>
                            <h2 className="text-lg font-bold text-[#252A22]">
                                Top Spending Category
                            </h2>
                            <p className="text-sm text-[#858B80]">
                                Your largest expense category in this period.
                            </p>
                        </div>
                    </div>

                    {highestCategory ? (
                        <div className="mt-5 rounded-2xl border border-[#E1EAE0] bg-white p-5">
                            <p className="text-sm font-semibold text-[#637066]">
                                {highestCategory.name}
                            </p>

                            <p className="mt-2 text-2xl font-bold text-[#B95B51]">
                                {formatCurrency(highestCategory.value)}
                            </p>

                            <p className="mt-2 text-xs text-[#899187]">
                                {totalExpenses > 0
                                    ? `${((highestCategory.value / totalExpenses) * 100).toFixed(1)}% of your total expenses`
                                    : 'No expenses recorded'}
                            </p>
                        </div>
                    ) : (
                        <p className="mt-5 rounded-2xl bg-white p-5 text-sm text-[#858B80]">
                            Add expenses to discover your top spending category.
                        </p>
                    )}

                    {categoryData.length > 0 && (
                        <div className="mt-5 space-y-4">
                            {categoryData.slice(0, 5).map((category, index) => {
                                const percentage = totalExpenses > 0
                                    ? (category.value / totalExpenses) * 100
                                    : 0

                                return (
                                    <div key={category.name}>
                                        <div className="mb-2 flex items-center justify-between gap-3">
                                            <span className="truncate text-sm font-medium text-[#40574A]">
                                                {category.name}
                                            </span>

                                            <span className="whitespace-nowrap text-sm font-semibold text-[#637066]">
                                                {formatCurrency(category.value)}
                                            </span>
                                        </div>

                                        <div className="h-2 overflow-hidden rounded-full bg-[#E8EDE5]">
                                            <div
                                                className="h-full rounded-full transition-all"
                                                style={{
                                                    width: `${percentage}%`,
                                                    backgroundColor: COLORS[index % COLORS.length],
                                                }}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Largest transactions */}
                <div className="rounded-3xl border border-[#E3E9DF] bg-[#FBFCFA] p-5 shadow-sm sm:p-6">
                    <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FBE8E3] text-[#B95B51]">
                            <ReceiptText size={19} />
                        </span>

                        <div>
                            <h2 className="text-lg font-bold text-[#252A22]">
                                Largest Expenses
                            </h2>
                            <p className="text-sm text-[#858B80]">
                                Your five highest individual expenses.
                            </p>
                        </div>
                    </div>

                    {largestExpenses.length === 0 ? (
                        <p className="mt-5 rounded-2xl bg-white p-5 text-sm text-[#858B80]">
                            No expenses recorded in this period.
                        </p>
                    ) : (
                        <div className="mt-5 space-y-3">
                            {largestExpenses.map((transaction, index) => (
                                <div
                                    key={transaction.id || transaction._id}
                                    className="flex items-center justify-between gap-3 rounded-2xl border border-[#E5E8DF] bg-white p-4"
                                >
                                    <div className="flex min-w-0 items-center gap-3">
                                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FBE8E3] text-xs font-bold text-[#B95B51]">
                                            {index + 1}
                                        </span>

                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-[#243A30]">
                                                {transaction.title}
                                            </p>
                                            <p className="mt-1 truncate text-xs text-[#858B80]">
                                                {transaction.category} · {transaction.date}
                                            </p>
                                        </div>
                                    </div>

                                    <p className="whitespace-nowrap text-sm font-bold text-[#B95B51]">
                                        −{formatCurrency(transaction.amount)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Transaction analysis table */}
            <section className="overflow-hidden rounded-3xl border border-[#E3E9DF] bg-[#FBFCFA] shadow-sm">
                <div className="flex flex-col justify-between gap-4 px-5 pb-5 pt-6 sm:flex-row sm:items-center sm:px-7 sm:pt-7">
                    <div>
                        <h2 className="text-xl font-bold text-[#252A22]">
                            Transaction Analysis
                        </h2>
                        <p className="mt-1 text-sm text-[#858B80]">
                            Review transactions within your selected report period.
                        </p>
                    </div>

                    <div className="relative w-full sm:w-64">
                        <Search
                            size={17}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#92988C]"
                        />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            placeholder="Search transactions..."
                            className="w-full rounded-lg border border-[#E1E5DB] bg-white py-2.5 pl-10 pr-4 text-sm text-[#34483B] outline-none transition placeholder:text-[#A0A69D] focus:border-[#6D9B83] focus:ring-2 focus:ring-[#DDF2E5]"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3 px-5 pb-5 sm:grid-cols-2 sm:px-7">
                    <select
                        value={typeFilter}
                        onChange={(event) => setTypeFilter(event.target.value)}
                        className="w-full rounded-xl border border-[#E1E5DB] bg-white px-3 py-2.5 text-sm text-[#34483B] outline-none focus:border-[#6D9B83]"
                    >
                        <option value="all">All transaction types</option>
                        <option value="income">Income</option>
                        <option value="expense">Expenses</option>
                    </select>

                    <select
                        value={categoryFilter}
                        onChange={(event) => setCategoryFilter(event.target.value)}
                        className="w-full rounded-xl border border-[#E1E5DB] bg-white px-3 py-2.5 text-sm text-[#34483B] outline-none focus:border-[#6D9B83]"
                    >
                        <option value="all">All categories</option>
                        {categories.map((category) => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="px-5 pb-5 sm:px-7 sm:pb-7">
                    <div className="overflow-hidden rounded-2xl border border-[#E5E8DF] bg-white">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[650px] text-left">
                                <thead>
                                    <tr className="border-b border-[#E1E6DC] bg-[#F3F6F0]">
                                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-[#40574A]">
                                            Transaction
                                        </th>
                                        <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-[#40574A]">
                                            Category
                                        </th>
                                        <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-[#40574A]">
                                            Date
                                        </th>
                                        <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-[#40574A]">
                                            Amount
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredTransactions.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-5 py-12 text-center">
                                                <p className="font-semibold text-[#173F35]">
                                                    No matching transactions
                                                </p>
                                                <p className="mt-2 text-sm text-[#7B8177]">
                                                    Adjust your report filters to see activity.
                                                </p>
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedTransactions.map((transaction) => {
                                            const isIncome = transaction.type === 'income'

                                            return (
                                                <tr
                                                    key={transaction.id || transaction._id}
                                                    className="border-b border-[#EEF0E9] transition-colors hover:bg-[#EAF5EC]"
                                                >
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${isIncome
                                                                ? 'bg-[#DDF2E5] text-[#177452]'
                                                                : 'bg-[#FBE8E3] text-[#B95B51]'
                                                                }`}>
                                                                {isIncome
                                                                    ? <ArrowDownLeft size={17} />
                                                                    : <ArrowUpRight size={17} />}
                                                            </span>

                                                            <div className="min-w-0">
                                                                <p className="max-w-[220px] truncate text-sm font-semibold text-[#243A30]">
                                                                    {transaction.title}
                                                                </p>
                                                                <p className={`mt-1 text-xs ${isIncome ? 'text-[#177452]' : 'text-[#B95B51]'
                                                                    }`}>
                                                                    {isIncome ? 'Income' : 'Expense'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-4 py-4 text-sm text-[#68766E]">
                                                        {transaction.category}
                                                    </td>

                                                    <td className="whitespace-nowrap px-4 py-4 text-sm text-[#7B8177]">
                                                        {transaction.date}
                                                    </td>

                                                    <td className="whitespace-nowrap px-5 py-4 text-right">
                                                        <span className={`text-sm font-bold tabular-nums ${isIncome ? 'text-[#177452]' : 'text-[#B95B51]'
                                                            }`}>
                                                            {isIncome ? '+' : '−'}
                                                            {formatCurrency(transaction.amount)}
                                                        </span>
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination Footer */}
                    <div className="mt-5 flex flex-col items-center gap-4">
                        <p className="text-center text-xs font-medium text-[#858B80]">
                            Showing {filteredTransactions.length === 0 ? 0 : startIndex + 1}
                            {'–'}
                            {Math.min(startIndex + itemsPerPage, filteredTransactions.length)}
                            {' '}of {filteredTransactions.length} transactions
                        </p>

                        {totalPages > 1 && (
                            <div className="flex flex-wrap items-center justify-center gap-2">
                                {/* Previous */}
                                <button
                                    type="button"
                                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                                    disabled={currentPage === 1}
                                    className="rounded-lg border border-[#E1E5DB] bg-white px-3 py-2 text-sm font-semibold text-[#637066] transition hover:bg-[#EAF5EC] disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <ChevronLeft size={17} />
                                </button>

                                {/* Page Numbers */}
                                {pageNumbers.map((page) => (
                                    <button
                                        key={page}
                                        type="button"
                                        onClick={() => setCurrentPage(page)}
                                        aria-current={currentPage === page ? 'page' : undefined}
                                        className={`h-9 min-w-9 rounded-lg px-3 text-sm font-semibold transition ${currentPage === page
                                            ? 'bg-[#173F35] text-white shadow-sm'
                                            : 'border border-[#E1E5DB] bg-white text-[#637066] hover:bg-[#EAF5EC] hover:text-[#173F35]'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}

                                {/* Next */}
                                <button
                                    type="button"
                                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                                    disabled={currentPage === totalPages}
                                    className="rounded-lg border border-[#E1E5DB] bg-white px-3 py-2 text-sm font-semibold text-[#637066] transition hover:bg-[#EAF5EC] disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <ChevronRight size={17} />
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            </section>
        </div>
    )
}

export default ReportsPage
