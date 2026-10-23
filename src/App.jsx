import { useState } from 'react'
import {
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  CalendarDays,
  ChevronDown,
  CirclePlus,
  Search,
  Wallet,
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
} from 'recharts'

import Sidebar from './components/Sidebar'
import StatCard from './components/StatCard'
import TransactionForm from './components/TransactionForm'

import {
  summaryCards,
  monthlyOverview,
  expenseBreakdown,
  recentTransactions,
} from './data/dashboardData'

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)

const chartColors = [
  '#047857',
  '#34d399',
  '#fbbf24',
  '#fb7185',
  '#60a5fa',
  '#a78bfa',
]

function App() {
  const [showTransactionForm, setShowTransactionForm] = useState(false)
  const [transactions, setTransactions] = useState(recentTransactions)


  const totalIncome = transactions
    .filter((transaction) => transaction.type === 'income')
    .reduce((total, transaction) => total + Number(transaction.amount), 0)

  const totalExpenses = transactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((total, transaction) => total + Number(transaction.amount), 0)

  const totalBalance = totalIncome - totalExpenses

  const savingsRate =
    totalIncome > 0
      ? ((totalIncome - totalExpenses) / totalIncome) * 100
      : 0

  const handleAddTransaction = (newTransaction) => {
    setTransactions((previous) => [
      {
        ...newTransaction,
        id: Date.now(),
        date: new Date(`${newTransaction.date}T12:00:00`).toLocaleDateString(
          'en-US',
          {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
          }
        ),
      },
      ...previous,
    ])

    setShowTransactionForm(false)
  }
  return (
    <div className="min-h-screen bg-[#f8f7f2] text-stone-800 lg:flex">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-9 lg:py-8">
        {/* Top bar */}
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-emerald-700">
              Friday, October 23, 2026
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-emerald-950 sm:text-3xl">
              Good afternoon!
            </h1>
            <p className="mt-2 text-sm text-stone-500">
              Here's what's happening with your money.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="hidden items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2.5 md:flex">
              <Search size={17} className="text-stone-400" />
              <input
                type="search"
                placeholder="Search transactions..."
                aria-label="Search transactions"
                className="w-44 bg-transparent text-sm outline-none placeholder:text-stone-400"
              />
            </label>

            <button
              type="button"
              aria-label="Notifications"
              className="relative rounded-xl border border-stone-200 bg-white p-3 text-stone-600 transition hover:bg-emerald-50"
            >
              <Bell size={19} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" />
            </button>

            <button
              type="button"
              className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white p-2"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-800 text-sm font-bold text-white">
                F
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-semibold text-stone-800">
                  Finance User
                </p>
                <p className="text-xs text-stone-500">
                  Personal Account
                </p>
              </div>
              <ChevronDown
                size={16}
                className="hidden text-stone-400 sm:block"
              />
            </button>
          </div>
        </header>

        {/* Page title and action */}
        <section className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-emerald-950">
              Financial Overview
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              Track your income, spending, and savings.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowTransactionForm(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-900"
          >
            <CirclePlus size={18} />
            Add Transaction
          </button>

        </section>


        {/* Summary cards */}
        <section
          aria-label="Financial summary"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          {summaryCards.map((card) => {
            let amount = card.amount

            if (card.id === 'balance') {
              amount = formatCurrency(totalBalance)
            } else if (card.id === 'income') {
              amount = formatCurrency(totalIncome)
            } else if (card.id === 'expenses') {
              amount = formatCurrency(totalExpenses)
            } else if (card.id === 'savings') {
              amount = `${savingsRate.toFixed(1)}%`
            }

            return (
              <StatCard
                key={card.id}
                {...card}
                amount={amount}
              />
            )
          })}
        </section>


        {/* Charts */}
        <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Monthly income and expenses */}
          <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm sm:p-6 xl:col-span-2">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-emerald-950">
                  Income vs. Expenses
                </h3>
                <p className="mt-1 text-sm text-stone-500">
                  Your monthly financial activity
                </p>
              </div>

              <button
                type="button"
                className="flex items-center gap-2 rounded-lg border border-stone-200 px-3 py-2 text-xs font-medium text-stone-600"
              >
                <CalendarDays size={15} />
                Last 6 months
                <ChevronDown size={14} />
              </button>
            </div>

            <div className="mt-6 h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyOverview}
                  margin={{
                    top: 8,
                    right: 4,
                    left: -16,
                    bottom: 0,
                  }}
                  barGap={6}
                >
                  <CartesianGrid
                    stroke="#f0eee8"
                    strokeDasharray="4 4"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#a8a29e', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#a8a29e', fontSize: 11 }}
                    tickFormatter={(value) =>
                      `${value / 1000}k`
                    }
                  />
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid #e7e5e4',
                      fontSize: 12,
                    }}
                  />
                  <Bar
                    dataKey="income"
                    name="Income"
                    fill="#047857"
                    radius={[5, 5, 0, 0]}
                    maxBarSize={24}
                  />
                  <Bar
                    dataKey="expenses"
                    name="Expenses"
                    fill="#fbbf24"
                    radius={[5, 5, 0, 0]}
                    maxBarSize={24}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-3 flex flex-wrap gap-5 text-xs text-stone-500">
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-sm bg-emerald-700" />
                Income
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-sm bg-amber-400" />
                Expenses
              </span>
            </div>
          </div>

          {/* Expense breakdown */}
          <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm sm:p-6">
            <div>
              <h3 className="font-bold text-emerald-950">
                Expense Breakdown
              </h3>
              <p className="mt-1 text-sm text-stone-500">
                Where your money goes
              </p>
            </div>

            <div className="relative mt-3 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseBreakdown}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={62}
                    outerRadius={88}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {expenseBreakdown.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={
                          chartColors[
                          index % chartColors.length
                          ]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid #e7e5e4',
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs text-stone-500">
                  Total spent
                </span>
                <span className="mt-1 text-xl font-bold text-emerald-950">
                  ₹32,450
                </span>
              </div>
            </div>

            <div className="mt-2 space-y-3">
              {expenseBreakdown.map((item, index) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between gap-3 text-xs"
                >
                  <span className="flex min-w-0 items-center gap-2 text-stone-600">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{
                        backgroundColor:
                          chartColors[
                          index % chartColors.length
                          ],
                      }}
                    />
                    <span className="truncate">
                      {item.name}
                    </span>
                  </span>
                  <span className="shrink-0 font-semibold text-stone-800">
                    {formatCurrency(item.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Recent transactions */}
        <section className="mt-6 rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-emerald-950">
                Recent Transactions
              </h3>
              <p className="mt-1 text-sm text-stone-500">
                A snapshot of your latest activity
              </p>
            </div>

            <button
              type="button"
              className="text-sm font-semibold text-emerald-800 transition hover:text-emerald-950"
            >
              View all
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[580px] text-left">
              <thead>
                <tr className="border-b border-stone-100 text-xs uppercase tracking-wider text-stone-400">
                  <th className="pb-3 pr-4 font-medium">
                    Transaction
                  </th>
                  <th className="pb-3 pr-4 font-medium">
                    Category
                  </th>
                  <th className="pb-3 pr-4 font-medium">
                    Date
                  </th>
                  <th className="pb-3 text-right font-medium">
                    Amount
                  </th>
                </tr>
              </thead>

              <tbody>
                {transactions.map((transaction) => {
                  const isIncome =
                    transaction.type === 'income'

                  return (
                    <tr
                      key={transaction.id}
                      className="border-b border-stone-50 last:border-0"
                    >
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isIncome
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-600'
                              }`}
                          >
                            {isIncome ? (
                              <ArrowDownLeft size={19} />
                            ) : (
                              <ArrowUpRight size={19} />
                            )}
                          </div>
                          <span className="text-sm font-semibold text-stone-800">
                            {transaction.title}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 pr-4 text-sm text-stone-500">
                        {transaction.category}
                      </td>

                      <td className="py-4 pr-4 text-sm text-stone-500">
                        {transaction.date}
                      </td>

                      <td
                        className={`py-4 text-right text-sm font-bold ${isIncome
                          ? 'text-emerald-700'
                          : 'text-stone-800'
                          }`}
                      >
                        {isIncome ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="py-7 text-center text-xs text-stone-400">
          Finora · Take control of your financial future
        </footer>
      </main>

      {showTransactionForm && (
        <TransactionForm
          onClose={() => setShowTransactionForm(false)}
          onSubmit={handleAddTransaction}
        />
      )}
    </div>
  )
}

export default App
