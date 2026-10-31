import { useEffect, useState } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import TransactionsPage from './components/TransactionsPage'
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
  Menu,
  ChevronRight,
  Activity,
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

import { summaryCards } from './data/dashboardData'

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
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [startDateFilter, setStartDateFilter] = useState('')
  const [endDateFilter, setEndDateFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false)
  const [transactionError, setTransactionError] = useState('')
  const [transactionToDelete, setTransactionToDelete] = useState(null)
  const [isDeletingTransaction, setIsDeletingTransaction] = useState(false)
  const [transactionToEdit, setTransactionToEdit] = useState(null)
  const [openActionMenuId, setOpenActionMenuId] = useState(null)
  const [isUpdatingTransaction, setIsUpdatingTransaction] = useState(false)
  const [activePage, setActivePage] = useState('dashboard')
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

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

  // Dynamic monthly income and expense totals
  const monthlyChartData = (() => {
    const monthlyTotals = {}

    transactions.forEach((transaction) => {
      const date = new Date(`${transaction.dateISO}T12:00:00`)

      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, '0')}`

      if (!monthlyTotals[monthKey]) {
        monthlyTotals[monthKey] = {
          monthKey,
          month: date.toLocaleDateString('en-US', {
            month: 'short',
            year: '2-digit',
          }),
          income: 0,
          expenses: 0,
        }
      }

      if (transaction.type === 'income') {
        monthlyTotals[monthKey].income += Number(transaction.amount)
      } else if (transaction.type === 'expense') {
        monthlyTotals[monthKey].expenses += Number(transaction.amount)
      }
    })

    return Object.values(monthlyTotals)
      .sort((a, b) => a.monthKey.localeCompare(b.monthKey))
      .slice(-6)
  })()

  // Dynamic category-wise expense totals
  const expenseChartData = (() => {
    const categoryTotals = {}

    transactions.forEach((transaction) => {
      if (transaction.type !== 'expense') return

      const category = transaction.category || 'Uncategorized'

      categoryTotals[category] =
        (categoryTotals[category] || 0) + Number(transaction.amount)
    })

    return Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  })()

  const savingsRate =
    totalIncome > 0
      ? ((totalIncome - totalExpenses) / totalIncome) * 100
      : 0


  const filteredTransactions = transactions.filter((transaction) => {
    const matchesType =
      transactionFilter === 'all' ||
      transaction.type === transactionFilter

    const matchesCategory =
      categoryFilter === 'all' ||
      transaction.category === categoryFilter

    const matchesStartDate =
      !startDateFilter ||
      transaction.dateISO >= startDateFilter

    const matchesEndDate =
      !endDateFilter ||
      transaction.dateISO <= endDateFilter

    const search = searchTerm.trim().toLowerCase()

    const matchesSearch =
      !search ||
      transaction.title?.toLowerCase().includes(search) ||
      transaction.description?.toLowerCase().includes(search) ||
      transaction.category?.toLowerCase().includes(search)

    return (
      matchesType &&
      matchesCategory &&
      matchesStartDate &&
      matchesEndDate &&
      matchesSearch
    )
  })

  // Latest 3 transactions for Dashboard
  const recentTransactions = [...transactions]
    .sort((a, b) => b.dateISO.localeCompare(a.dateISO))
    .slice(0, 3)

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

  // Temporary pages for sidebar navigation
  if (activePage !== 'dashboard') {
    const pageDetails = {
      transactions: {
        title: 'Transactions',
        description: 'A complete overview of your money in and money out.',
      },
      budgets: {
        title: 'Budgets',
        description: 'Plan your spending and keep your finances on track.',
      },
      reports: {
        title: 'Reports',
        description: 'Understand your financial activity through detailed insights.',
      },
      settings: {
        title: 'Settings',
        description: 'Manage your account and application preferences.',
      },
    }

    const currentPage = pageDetails[activePage]

    return (
      <div className="min-h-screen bg-[#f8f7f2] text-stone-800 lg:flex">

        {/* Mobile Sidebar Drawer */}
        <div
          className={`fixed inset-0 z-[1000] lg:hidden ${isMobileSidebarOpen
            ? 'pointer-events-auto'
            : 'pointer-events-none'
            }`}
        >
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setIsMobileSidebarOpen(false)}
            className={`absolute inset-0 bg-stone-950/40 backdrop-blur-[2px] transition-opacity duration-300 ${isMobileSidebarOpen ? 'opacity-100' : 'opacity-0'
              }`}
          />

          {/* Sliding Sidebar */}
          <div
            className={`absolute inset-y-0 left-0 w-[min(20rem,88vw)] shadow-2xl transition-transform duration-300 ${isMobileSidebarOpen
              ? 'translate-x-0'
              : '-translate-x-full'
              }`}
          >
            <Sidebar
              activePage={activePage}
              setActivePage={setActivePage}
              isMobile
              onClose={() => setIsMobileSidebarOpen(false)}
            />
          </div>
        </div>

        <div className="hidden lg:block">
          <Sidebar
            activePage={activePage}
            setActivePage={setActivePage}
          />
        </div>

        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-9 lg:py-8">

          <header className="mb-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2.5 border-b border-stone-200 pb-5">
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(true)}
                aria-label="Open navigation menu"
                className="shrink-0 rounded-xl border border-stone-200 bg-white p-2.5 text-emerald-800 shadow-sm transition hover:bg-emerald-50 lg:hidden"
              >
                <Menu size={21} strokeWidth={2.2} />
              </button>

              <button
                type="button"
                onClick={() => setActivePage('dashboard')}
                className="text-sm font-semibold text-stone-500 hover:text-emerald-800 ps-2"
              >
                Dashboard
              </button>

              <ChevronRight size={18} strokeWidth={2} className="text-stone-500" />

              <span className="text-sm font-bold text-emerald-800">
                {currentPage?.title}
              </span>
            </div>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-emerald-950">
              {currentPage?.title}
            </h1>

            <p className="mt-2 text-sm text-stone-500">
              {currentPage?.description}
            </p>
          </header>

          {activePage === 'transactions' ? (
            <TransactionsPage
              transactions={transactions}
              filteredTransactions={filteredTransactions}
              totalIncome={totalIncome}
              totalExpenses={totalExpenses}
              formatCurrency={formatCurrency}

              transactionFilter={transactionFilter}
              setTransactionFilter={setTransactionFilter}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              startDateFilter={startDateFilter}
              setStartDateFilter={setStartDateFilter}
              endDateFilter={endDateFilter}
              setEndDateFilter={setEndDateFilter}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}

              isLoadingTransactions={isLoadingTransactions}
              transactionError={transactionError}

              openActionMenuId={openActionMenuId}
              setOpenActionMenuId={setOpenActionMenuId}
              setShowTransactionForm={setShowTransactionForm}
              setTransactionToEdit={setTransactionToEdit}
              setTransactionToDelete={setTransactionToDelete}

              showTransactionForm={showTransactionForm}
              transactionToEdit={transactionToEdit}
              handleAddTransaction={handleAddTransaction}
              handleUpdateTransaction={handleUpdateTransaction}
              isUpdatingTransaction={isUpdatingTransaction}

              transactionToDelete={transactionToDelete}
              handleDeleteTransaction={handleDeleteTransaction}
              isDeletingTransaction={isDeletingTransaction}
            />
          ) : (
            <section className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
              <h2 className="text-lg font-semibold text-emerald-950">
                Coming up next
              </h2>

              <p className="mt-2 text-sm text-stone-500">
                We're building this section of Thrive. Stay tuned!
              </p>
            </section>
          )}
        </main>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          theme="light"
        />
      </div>
    )
  }


  return (
    <div className="min-h-screen bg-[#f8f7f2] text-stone-800 lg:flex">

      {/* Mobile Sidebar Drawer */}
      <div
        className={`fixed inset-0 z-[1000] lg:hidden ${isMobileSidebarOpen
          ? 'pointer-events-auto'
          : 'pointer-events-none'
          }`}
      >
        {/* Backdrop */}
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setIsMobileSidebarOpen(false)}
          className={`absolute inset-0 bg-stone-950/40 backdrop-blur-[2px] transition-opacity duration-300 ${isMobileSidebarOpen ? 'opacity-100' : 'opacity-0'
            }`}
        />

        {/* Sliding Sidebar */}
        <div
          className={`absolute inset-y-0 left-0 w-[min(18rem,85vw)] shadow-2xl transition-transform duration-300 ${isMobileSidebarOpen
            ? 'translate-x-0'
            : '-translate-x-full'
            }`}
        >
          <Sidebar
            activePage={activePage}
            setActivePage={setActivePage}
            isMobile
            onClose={() => setIsMobileSidebarOpen(false)}
          />
        </div>
      </div>

      <div className="hidden lg:block">
        <Sidebar
          activePage={activePage}
          setActivePage={setActivePage}
        />
      </div>

      <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-9 lg:py-8">
        {/* Top bar */}
        <header className="mb-8 border-b border-stone-200 pb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              {/* Mobile Hamburger */}
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(true)}
                aria-label="Open navigation menu"
                className="mt-1 shrink-0 rounded-xl border border-stone-200 bg-white p-2.5 text-emerald-800 shadow-sm transition hover:bg-emerald-50 lg:hidden"
              >
                <Menu size={21} strokeWidth={2.2} />
              </button>

              {/* Date and Greeting */}
              <div className="min-w-0">
                <p className="text-sm font-medium text-emerald-700">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>

                <h1 className="mt-1 text-2xl font-bold tracking-tight text-emerald-950 sm:text-3xl">
                  Good afternoon, {user?.name || 'there'}! 👋
                </h1>

                <p className="mt-2 text-sm text-stone-500">
                  Let's see what's happening with your money.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="hidden items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2.5 md:flex">
                <Search size={17} className="text-stone-400" />
                <input
                  type="search"
                  placeholder="Search transactions..."
                  aria-label="Search transactions"
                  className="w-44 bg-transparent text-sm outline-none placeholder:text-stone-400"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
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
          </div>
        </header>

        {/* Page title and action */}
        <section className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#527A5B] text-white shadow-md shadow-[#527A5B]/20">
              <Wallet size={22} strokeWidth={2.2} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-emerald-950">
                Financial Overview
              </h2>
              <p className="mt-1 text-sm text-stone-500">
                Track your income, spending, and savings.
              </p>
            </div>
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
              {monthlyChartData.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-[#DDE4D8] bg-white/60 px-6 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#E8F3EC] text-[#047857]">
                    <ArrowUpRight size={22} />
                  </div>

                  <p className="text-sm font-semibold text-[#26382D]">
                    Your monthly overview starts here
                  </p>

                  <p className="mt-1 max-w-xs text-xs leading-5 text-[#7A857B]">
                    Add your first income or expense to see how your finances change month by month.
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyChartData}
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
                      tickFormatter={(value) => `${value / 1000}k`}
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
              )}
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
              {expenseChartData.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-[#DDE4D8] bg-white/60 px-5 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF4D8] text-[#A16207]">
                    <PieChart size={22} />
                  </div>

                  <p className="text-sm font-semibold text-[#26382D]">
                    Your spending story starts here
                  </p>

                  <p className="mt-1 max-w-xs text-xs leading-5 text-[#7A857B]">
                    Add your first expense to see a breakdown of where your money goes.
                  </p>
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseChartData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={62}
                        outerRadius={88}
                        paddingAngle={3}
                        stroke="none"
                      >
                        {expenseChartData.map((entry, index) => (
                          <Cell
                            key={entry.name}
                            fill={chartColors[index % chartColors.length]}
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
                      {formatCurrency(totalExpenses)}
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="mt-2 space-y-3">
              {expenseChartData.map((item, index) => (
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

        {/* Recent Transactions */}
        <section className="mt-6 overflow-hidden rounded-3xl border border-[#E6E9DF] bg-white shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 border-b border-[#EEF0E9] px-5 py-5 sm:px-7">
            <div className="flex items-center gap-3">

              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 Sidebar-0 items-center justify-center rounded-2xl bg-[#527A5B] text-white shadow-md shadow-[#527A5B]/20">
                  <Activity size={22} strokeWidth={2.2} />
                </div>

                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-lg font-bold text-emerald-950">
                      Recent Transactions
                    </h2>

                    <span className="rounded-lg bg-[#EAF2E8] px-2.5 py-1 text-[11px] font-extrabold tracking-wide text-[#527A5B]">
                      {recentTransactions.length} RECENT
                    </span>
                  </div>

                  <p className="mt-1 text-[13px] text-stone-500">
                    Your latest financial activity, at a glance.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActivePage('transactions')}
              className="flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold text-[#527A5B] transition hover:bg-[#F2F6F0]"
            >
              View all
              <ChevronRight size={17} strokeWidth={2.5} />
            </button>
          </div>

          {/* Transaction List */}
          <div className="px-5 sm:px-7">

            {isLoadingTransactions ? (
              <div className="space-y-5 py-6">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex animate-pulse items-center gap-4">
                    <div className="h-11 w-11 rounded-2xl bg-[#F0F2EC]" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-32 rounded bg-[#F0F2EC]" />
                      <div className="h-3 w-24 rounded bg-[#F0F2EC]" />
                    </div>
                    <div className="h-4 w-20 rounded bg-[#F0F2EC]" />
                  </div>
                ))}
              </div>

            ) : transactionError ? (
              <div className="py-10 text-center">
                <p className="text-sm font-medium text-red-500">
                  {transactionError}
                </p>
              </div>

            ) : recentTransactions.length === 0 ? (
              <div className="py-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F3F6F0]">
                  <Wallet size={25} className="text-[#82917F]" />
                </div>

                <h3 className="mt-4 text-sm font-bold text-[#354438]">
                  No transactions yet
                </h3>

                <p className="mt-1 text-sm text-[#929B91]">
                  Your recent activity will appear here.
                </p>
              </div>

            ) : (
              <div className="divide-y divide-[#EEF0E9]">
                {recentTransactions.map((transaction) => {
                  const isIncome = transaction.type === 'income'

                  return (
                    <div
                      key={transaction.id}
                      className="-mx-3 flex items-center gap-3 rounded-2xl border border-transparent px-3 py-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#DCE8D9] hover:bg-[#F1F6EF] hover:shadow-[0_5px_16px_rgba(65,95,66,0.09)] sm:gap-4"
                    >
                      {/* Icon */}
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${isIncome
                          ? 'bg-[#EAF5EC] text-[#4D9660]'
                          : 'bg-[#FBEEEE] text-[#D66B6B]'
                          }`}
                      >
                        {isIncome ? (
                          <ArrowDownLeft size={21} strokeWidth={2.3} />
                        ) : (
                          <ArrowUpRight size={21} strokeWidth={2.3} />
                        )}
                      </div>

                      {/* Transaction Details */}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-bold text-[#26352B]">
                          {transaction.title}
                        </p>

                        <div className="mt-1.5 flex items-center gap-2">
                          <span
                            className={`h-2 w-2 shrink-0 rounded-full ${isIncome ? 'bg-[#65A875]' : 'bg-[#D98282]'
                              }`}
                          />

                          <span className="truncate text-xs font-semibold text-[#657367]">
                            {transaction.category}
                          </span>
                        </div>

                        <p className="mt-1 text-[11px] font-medium text-[#A0A89F]">
                          {transaction.date}
                        </p>
                      </div>

                      {/* Amount */}
                      <div className="flex shrink-0 flex-col items-end gap-1.5">
                        <p
                          className={`text-sm font-extrabold tracking-tight ${isIncome ? 'text-[#4D9660]' : 'text-[#D66B6B]'
                            }`}
                        >
                          {isIncome ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </p>

                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${isIncome
                            ? 'bg-[#EAF5EC] text-[#4D9660]'
                            : 'bg-[#FBEEEE] text-[#D66B6B]'
                            }`}
                        >
                          {isIncome ? 'INCOME' : 'EXPENSE'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
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
