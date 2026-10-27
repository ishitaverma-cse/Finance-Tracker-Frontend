import { useEffect, useState } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import {
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  CalendarDays,
  ChevronDown,
  CirclePlus,
  LogOut,
  MoreVertical,
  Pencil,
  Search,
  Trash2,
  Wallet,
  X,
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

import { useAuth } from './context/AuthContext'
import Login from './components/Login'
import Register from './components/Register'

import Sidebar from './components/Sidebar'
import StatCard from './components/StatCard'
import TransactionForm from './components/TransactionForm'

import {
  summaryCards,
  monthlyOverview,
  expenseBreakdown,
  recentTransactions,
} from './data/dashboardData'

const API_URL = import.meta.env.VITE_API_URL

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
  const { user, token, isAuthenticated, logout } = useAuth()

  const [authScreen, setAuthScreen] = useState('login')
  const [showTransactionForm, setShowTransactionForm] = useState(false)
  const [transactions, setTransactions] = useState([])
  const [transactionFilter, setTransactionFilter] = useState('all')
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false)
  const [transactionError, setTransactionError] = useState('')
  const [transactionToDelete, setTransactionToDelete] = useState(null)
  const [isDeletingTransaction, setIsDeletingTransaction] = useState(false)
  const [transactionToEdit, setTransactionToEdit] = useState(null)
  const [openActionMenuId, setOpenActionMenuId] = useState(null)
  const [isUpdatingTransaction, setIsUpdatingTransaction] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setTransactions([])
      return
    }

    const controller = new AbortController()

    const fetchTransactions = async () => {
      setIsLoadingTransactions(true)
      setTransactionError('')

      try {
        const response = await fetch(`${API_URL}/transactions`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data.message || 'Failed to load transactions.'
          )
        }

        setTransactions(
          data.transactions.map((transaction) => ({
            ...transaction,
            id: transaction._id,
            title: transaction.name,
            dateISO: transaction.date.slice(0, 10),
            date: new Date(
              `${transaction.date.slice(0, 10)}T12:00:00`
            ).toLocaleDateString('en-US', {
              month: 'short',
              day: '2-digit',
              year: 'numeric',
            }),
          }))
        )
      } catch (error) {
        if (error.name !== 'AbortError') {
          setTransactionError(
            error.message || 'Unable to load transactions.'
          )
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingTransactions(false)
        }
      }
    }
    fetchTransactions()

    return () => controller.abort()
  }, [isAuthenticated, token])

  const [isProfileOpen, setIsProfileOpen] = useState(false)

  if (!isAuthenticated) {
    if (authScreen === 'register') {
      return (
        <Register
          onSwitchToLogin={() => setAuthScreen('login')}
        />
      )
    }

    return (
      <Login
        onSwitchToRegister={() => setAuthScreen('register')}
      />
    )
  }


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


  const handleAddTransaction = async (newTransaction) => {
    setTransactionError('')

    try {
      const response = await fetch(`${API_URL}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: newTransaction.type,
          name: newTransaction.title.trim(),
          amount: Number(newTransaction.amount),
          category: newTransaction.category,
          description: newTransaction.description.trim(),
          date: newTransaction.date,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to save transaction.'
        )
      }


      const savedTransaction = data.transaction

      setTransactions((previous) => [
        {
          ...savedTransaction,
          id: savedTransaction._id,
          title: savedTransaction.name,
          dateISO: savedTransaction.date.slice(0, 10),
          date: new Date(
            `${savedTransaction.date.slice(0, 10)}T12:00:00`
          ).toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
          }),
        },
        ...previous,
      ])
      setShowTransactionForm(false)

      toast.success('Transaction added successfully!')
    } catch (error) {
      setTransactionError(
        error.message || 'Unable to save transaction.'
      )
    }
  }

  const handleUpdateTransaction = async (updatedTransaction) => {
    if (!transactionToEdit || isUpdatingTransaction) return

    setIsUpdatingTransaction(true)
    setTransactionError('')

    try {
      const response = await fetch(
        `${API_URL}/transactions/${transactionToEdit.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            type: updatedTransaction.type,
            name: updatedTransaction.title.trim(),
            amount: Number(updatedTransaction.amount),
            category: updatedTransaction.category,
            description: updatedTransaction.description.trim(),
            date: updatedTransaction.date,
          }),
        }
      )
      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to update transaction.'
        )
      }

      const savedTransaction = data.transaction
      const originalDate = savedTransaction.date.slice(0, 10)

      const updatedRecord = {
        ...savedTransaction,
        id: savedTransaction._id,
        title: savedTransaction.name,
        dateISO: originalDate,
        date: new Date(
          `${originalDate}T12:00:00`
        ).toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
        }),
      }

      setTransactions((previous) =>
        previous.map((transaction) =>
          transaction.id === updatedRecord.id
            ? updatedRecord
            : transaction
        )
      )

      setShowTransactionForm(false)
      setTransactionToEdit(null)

      toast.success('Transaction updated successfully!')
    } catch (error) {
      setTransactionError(
        error.message || 'Unable to update transaction.'
      )
    } finally {
      setIsUpdatingTransaction(false)
    }
  }

  const handleDeleteTransaction = async () => {
    if (!transactionToDelete || isDeletingTransaction) return

    setIsDeletingTransaction(true)
    setTransactionError('')

    try {
      const response = await fetch(
        `${API_URL}/transactions/${transactionToDelete.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to delete transaction.'
        )
      }

      setTransactions((previous) =>
        previous.filter(
          (transaction) =>
            transaction.id !== transactionToDelete.id
        )
      )
      setTransactionToDelete(null)

      toast.success('Transaction deleted successfully!')
    } catch (error) {
      setTransactionError(
        error.message || 'Unable to delete transaction.'
      )
    } finally {
      setIsDeletingTransaction(false)
    }
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


            <div className="relative">
              <button
                type="button"
                onClick={() => setIsProfileOpen((open) => !open)}
                aria-expanded={isProfileOpen}
                aria-haspopup="true"
                className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white p-2 transition hover:bg-emerald-50"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-800 text-sm font-bold text-white">
                  {(user?.name || 'T').charAt(0).toUpperCase()}
                </div>

                <div className="hidden text-left sm:block">
                  <p className="text-sm font-semibold text-stone-800">
                    {user?.name || 'Thrive User'}
                  </p>
                  <p className="text-xs text-stone-500">
                    Personal Account
                  </p>
                </div>

                <ChevronDown
                  size={16}
                  className={`hidden text-stone-400 transition-transform sm:block ${isProfileOpen ? 'rotate-180' : ''
                    }`}
                />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-52 rounded-xl border border-stone-200 bg-white p-2 shadow-lg">
                  <div className="border-b border-stone-100 px-3 py-2">
                    <p className="text-sm font-semibold text-stone-800">
                      {user?.name || 'Thrive User'}
                    </p>
                    <p className="text-xs text-stone-500">
                      Personal Account
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false)
                      logout()
                      setAuthScreen('login')
                    }}
                    className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                  >
                    <LogOut size={16} />
                    Sign out
                  </button>
                </div>
              )}
            </div>

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
            onClick={() => {
              setTransactionToEdit(null)
              setShowTransactionForm(true)
            }}
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

        {/* Money Activity */}
        <section className="mt-6 overflow-hidden rounded-3xl border border-[#E6E9DF] bg-[#F7F8F4] shadow-sm">

          {/* Header */}
          <div className="flex items-center justify-between gap-4 px-5 pb-5 pt-6 sm:px-7 sm:pt-7">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#173F35] text-white">
                <Wallet size={21} />
              </div>
              <div>
                <h3 className="text-lg font-bold tracking-tight text-[#173F35]">
                  Money Activity
                </h3>
                <p className="mt-1 text-sm text-[#7B8177]">
                  Your financial life, at a glance
                </p>
              </div>
            </div>

            <div className="hidden rounded-xl border border-[#E4E8DE] bg-white px-3 py-2 text-xs font-medium text-[#657268] sm:block">
              {transactions.length} {transactions.length === 1 ? 'entry' : 'entries'}
            </div>
          </div>

          {/* Loading and errors */}
          <div className="px-5 sm:px-7">
            {isLoadingTransactions && (
              <p className="mb-4 rounded-xl bg-white px-4 py-3 text-sm text-stone-500" role="status">
                Loading your transactions...
              </p>
            )}

            {transactionError && (
              <p className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700" role="alert">
                {transactionError}
              </p>
            )}
          </div>

          {/* Money in / Money out */}
          <div className="grid grid-cols-2 gap-3 px-5 sm:gap-4 sm:px-7">
            <div className="rounded-2xl border border-[#E1EAE0] bg-white p-4 sm:p-5">
              <div className="flex items-center gap-2 text-sm font-medium text-[#738076]">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#DDF2E5] text-[#177452]">
                  <ArrowDownLeft size={17} />
                </span>
                Money in
              </div>
              <p className="mt-3 break-words text-xl font-bold tracking-tight text-[#177452] sm:text-2xl">
                {formatCurrency(totalIncome)}
              </p>
              <p className="mt-1 text-xs text-[#899187]">Recorded income</p>
            </div>

            <div className="rounded-2xl border border-[#EEE3DC] bg-white p-4 sm:p-5">
              <div className="flex items-center gap-2 text-sm font-medium text-[#738076]">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FBE8E3] text-[#B95B51]">
                  <ArrowUpRight size={17} />
                </span>
                Money out
              </div>
              <p className="mt-3 break-words text-xl font-bold tracking-tight text-[#B95B51] sm:text-2xl">
                {formatCurrency(totalExpenses)}
              </p>
              <p className="mt-1 text-xs text-[#899187]">Recorded expenses</p>
            </div>
          </div>

          {/* Filter chips */}
          <div className="flex flex-wrap items-center gap-2 px-5 pb-4 pt-6 sm:px-7">
            {[
              { label: 'All activity', value: 'all' },
              { label: 'Income', value: 'income' },
              { label: 'Expenses', value: 'expense' },
            ].map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setTransactionFilter(filter.value)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${transactionFilter === filter.value
                  ? 'bg-[#173F35] text-white shadow-sm'
                  : 'border border-[#E1E5DB] bg-white text-[#637066] hover:border-[#A9B9AB] hover:text-[#173F35]'
                  }`}
              >
                {filter.label}
                <span className="ml-2 text-xs opacity-70">
                  {filter.value === 'all'
                    ? transactions.length
                    : transactions.filter((transaction) => transaction.type === filter.value).length}
                </span>
              </button>
            ))}

            <button
              type="button"
              onClick={() => {
                setTransactionToEdit(null)
                setShowTransactionForm(true)
              }}
              className="ml-auto inline-flex items-center gap-2 rounded-full bg-[#173F35] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#245548] focus:outline-none focus:ring-2 focus:ring-[#6D9B83] focus:ring-offset-2"
            >
              <CirclePlus size={16} />
              <span className="hidden sm:inline">Add transaction</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>

          {/* Transaction table */}
          <div className="px-5 pb-5 sm:px-7 sm:pb-7">
            <div className="overflow-hidden rounded-2xl border border-[#E5E8DF] bg-white">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] text-left">
                  <thead>
                    <tr className="border-b border-[#E1E6DC] bg-[#F3F6F0]">
                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-[#40574A]">
                        Transaction
                      </th>
                      <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-[#40574A]">
                        Description
                      </th>
                      <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-[#40574A]">
                        Date
                      </th>
                      <th className="w-[170px] px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-[#40574A]">
                        Amount
                      </th>
                      <th className="w-[80px] px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-[#40574A]">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {transactions.length === 0 && isLoadingTransactions ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-12 text-center text-sm text-[#7B8177]">
                          Loading your transactions...
                        </td>
                      </tr>
                    ) : transactions.length === 0 && !transactionError ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-12 text-center">
                          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#DDF2E5] text-[#177452]">
                            <Wallet size={26} />
                          </div>
                          <p className="mt-4 font-semibold text-[#173F35]">
                            Your story starts here
                          </p>
                          <p className="mt-2 text-sm text-[#7B8177]">
                            Add your first transaction to see it appear here.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setTransactionToEdit(null)
                              setShowTransactionForm(true)
                            }}
                            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#173F35] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#245548]"
                          >
                            <CirclePlus size={16} />
                            Add transaction
                          </button>
                        </td>
                      </tr>
                    ) : (
                      transactions
                        .filter((transaction) =>
                          transactionFilter === 'all' ||
                          transaction.type === transactionFilter
                        )
                        .map((transaction) => {
                          const isIncome = transaction.type === 'income'

                          return (
                            <tr
                              key={transaction.id}
                              className="group border-b border-[#EEF0E9] transition-colors duration-200 hover:bg-[#EAF5EC]"
                            >
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isIncome
                                      ? 'bg-[#DDF2E5] text-[#177452]'
                                      : 'bg-[#FBE8E3] text-[#B95B51]'
                                      }`}
                                  >
                                    {isIncome ? (
                                      <ArrowDownLeft size={19} />
                                    ) : (
                                      <ArrowUpRight size={19} />
                                    )}
                                  </div>

                                  <div className="min-w-0">
                                    <p className="max-w-[220px] truncate text-sm font-semibold text-[#243A30]">
                                      {transaction.title}
                                    </p>

                                    <p
                                      className={`mt-1 text-xs ${isIncome ? 'text-[#177452]' : 'text-[#B95B51]'
                                        }`}
                                    >
                                      {isIncome ? 'Income' : 'Expense'}
                                      <span className="text-[#A0A69D]"> · </span>
                                      <span className="text-[#7B8177]">
                                        {transaction.category}
                                      </span>
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-4 py-4">
                                {transaction.description?.trim() ? (
                                  <p
                                    title={transaction.description}
                                    className="max-w-[280px] truncate text-sm text-[#68766E]"
                                  >
                                    {transaction.description}
                                  </p>
                                ) : (
                                  <span className="text-sm text-[#A0A69D]">—</span>
                                )}
                              </td>

                              <td className="whitespace-nowrap px-4 py-4 text-sm text-[#7B8177]">
                                {transaction.date}
                              </td>

                              <td className="w-[170px] whitespace-nowrap px-6 py-4 text-right">
                                <span
                                  className={`inline-block min-w-[110px] text-right text-sm font-bold tabular-nums ${isIncome ? 'text-[#177452]' : 'text-[#B95B51]'
                                    }`}
                                >
                                  {isIncome ? '+' : '−'}{formatCurrency(transaction.amount)}
                                </span>
                              </td>


                              <td className="w-[80px] px-5 py-4 text-right">
                                <div className="relative inline-block">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setOpenActionMenuId((currentId) =>
                                        currentId === transaction.id ? null : transaction.id
                                      )
                                    }
                                    aria-label={`Actions for ${transaction.title}`}
                                    aria-expanded={openActionMenuId === transaction.id}
                                    aria-haspopup="menu"
                                    title="Transaction actions"
                                    className={`inline-flex h-9 w-9 items-center justify-center rounded-xl transition focus:outline-none focus:ring-2 focus:ring-[#A9B9AB] ${openActionMenuId === transaction.id
                                      ? 'bg-[#EAF5EC] text-[#173F35]'
                                      : 'text-[#A6ADA2] hover:bg-[#EAF5EC] hover:text-[#173F35]'
                                      }`}
                                  >
                                    <MoreVertical size={18} />
                                  </button>

                                  {openActionMenuId === transaction.id && (
                                    <div
                                      role="menu"
                                      className="absolute right-0 top-full z-[100] mt-1 w-40 rounded-xl border border-[#E1E6DC] bg-white p-1.5 text-left shadow-xl"
                                    >
                                      <button
                                        type="button"
                                        role="menuitem"
                                        onClick={() => {
                                          setTransactionToEdit(transaction)
                                          setOpenActionMenuId(null)
                                          setShowTransactionForm(true)
                                        }}
                                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-[#34483B] transition hover:bg-[#EAF5EC]"
                                      >
                                        <Pencil size={15} />
                                        Edit
                                      </button>

                                      <button
                                        type="button"
                                        role="menuitem"
                                        onClick={() => {
                                          setTransactionToDelete(transaction)
                                          setOpenActionMenuId(null)
                                        }}
                                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-[#B95B51] transition hover:bg-[#FBE8E3]"
                                      >
                                        <Trash2 size={15} />
                                        Delete
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </td>

                            </tr>
                          )
                        })
                    )}

                    {transactions.length > 0 &&
                      transactions.filter((transaction) =>
                        transactionFilter === 'all' ||
                        transaction.type === transactionFilter
                      ).length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-5 py-12 text-center">
                            <p className="font-semibold text-[#173F35]">
                              No matching transactions
                            </p>
                            <p className="mt-2 text-sm text-[#7B8177]">
                              Choose another filter to see your activity.
                            </p>
                          </td>
                        </tr>
                      )}
                  </tbody>
                </table>
              </div>
            </div>

            {transactions.length > 0 && (
              <p className="mt-3 px-1 text-xs text-[#8B9186]">
                Showing{' '}
                {transactions.filter((transaction) =>
                  transactionFilter === 'all' ||
                  transaction.type === transactionFilter
                ).length}{' '}
                of {transactions.length} transactions
              </p>
            )}
          </div>

        </section>


        <footer className="py-7 text-center text-xs text-stone-400">
          Thrive · Take control of your financial future
        </footer>
      </main>

      {showTransactionForm && (
        <TransactionForm
          transaction={transactionToEdit}
          onClose={() => {
            setShowTransactionForm(false)
            setTransactionToEdit(null)
          }}
          onSubmit={
            transactionToEdit
              ? handleUpdateTransaction
              : handleAddTransaction
          }
        />
      )}

      {transactionToDelete && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-stone-950/40 p-4 backdrop-blur-sm">
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
            aria-describedby="delete-dialog-description"
            className="w-full max-w-md rounded-3xl border border-stone-200 bg-[#fffdf7] p-6 shadow-2xl sm:p-8"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <Trash2 size={23} />
            </div>

            <h2
              id="delete-dialog-title"
              className="mt-5 text-xl font-bold text-emerald-950"
            >
              Delete transaction?
            </h2>

            <p
              id="delete-dialog-description"
              className="mt-2 text-sm leading-6 text-stone-500"
            >
              Are you sure you want to delete{' '}
              <span className="font-semibold text-stone-800">
                {transactionToDelete.title}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={isDeletingTransaction}
                onClick={() => setTransactionToDelete(null)}
                className="rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-600 transition hover:bg-stone-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isDeletingTransaction}
                onClick={handleDeleteTransaction}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Trash2 size={16} />
                {isDeletingTransaction ? 'Deleting...' : 'Delete transaction'}
              </button>
            </div>
          </section>
        </div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="light"
      />
    </div>
  )
}

export default App
