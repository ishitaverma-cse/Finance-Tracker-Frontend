import { useState, useEffect } from 'react'
import {
    ArrowDownLeft,
    ArrowUpRight,
    CirclePlus,
    MoreVertical,
    Pencil,
    Search,
    Trash2,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react'
import TransactionForm from './TransactionForm'

const TransactionsPage = ({
    transactions,
    filteredTransactions,
    totalIncome,
    totalExpenses,
    formatCurrency,

    transactionFilter,
    setTransactionFilter,
    categoryFilter,
    setCategoryFilter,
    startDateFilter,
    setStartDateFilter,
    endDateFilter,
    setEndDateFilter,
    searchTerm,
    setSearchTerm,

    isLoadingTransactions,
    transactionError,

    openActionMenuId,
    setOpenActionMenuId,
    setShowTransactionForm,
    setTransactionToEdit,
    setTransactionToDelete,

    showTransactionForm,
    transactionToEdit,
    handleAddTransaction,
    handleUpdateTransaction,

    transactionToDelete,
    handleDeleteTransaction,
    isDeletingTransaction,
}) => {

    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(5)

    // Financial Insights
    const transactionCount = transactions.length
    const netCashFlow = totalIncome - totalExpenses

    const insightMessage = transactionCount === 0
        ? 'Your financial journey starts here. Add your first transaction to unlock personalized insights.'
        : totalExpenses === 0
            ? 'Great start! You have recorded income. Add your expenses too to understand your spending habits.'
            : netCashFlow > 0
                ? `You're maintaining a positive cash flow! Your income exceeds your expenses by ${formatCurrency(netCashFlow)}.`
                : netCashFlow < 0
                    ? `Your expenses are currently higher than your income by ${formatCurrency(Math.abs(netCashFlow))}. Keep an eye on your spending.`
                    : 'Your income and expenses are currently balanced. Keep tracking to understand your financial habits.'

    // Reset pagination when filters or search change
    useEffect(() => {
        setCurrentPage(1)
    }, [
        transactionFilter,
        categoryFilter,
        startDateFilter,
        endDateFilter,
        searchTerm,
    ])

    // Pagination calculations
    const totalPages = Math.ceil(filteredTransactions.length / rowsPerPage)

    const startIndex = (currentPage - 1) * rowsPerPage
    const endIndex = startIndex + rowsPerPage

    const paginatedTransactions = filteredTransactions.slice(
        startIndex,
        endIndex
    )

    return (
        <div className="space-y-7">
            {/* Transaction Activity */}
            <section className="overflow-hidden rounded-3xl border border-[#E3E9DF] bg-[#FBFCFA] shadow-md">
                {/* Header + Search */}
                <div className="flex flex-col justify-between gap-4 px-5 pb-5 pt-6 sm:flex-row sm:items-center sm:px-7 sm:pt-7">
                    <div>
                        <h2 className="text-xl font-bold text-[#252A22]">
                            All Activity
                        </h2>
                        <p className="mt-1 text-sm text-[#858B80]">
                            Review your income, expenses, and transaction history.
                        </p>
                    </div>

                    <div className="relative w-full sm:w-64 lg:w-72">
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

                {/* Money In / Money Out */}
                <div className="grid grid-cols-2 gap-3 px-5 pb-5 sm:gap-4 sm:px-7">
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
                <div className="flex flex-wrap items-center gap-2 px-5 pb-4 pt-3 sm:px-7">
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
                                    : transactions.filter(
                                        (transaction) => transaction.type === filter.value
                                    ).length}
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

                {/* Filters */}
                <div className="grid grid-cols-1 gap-3 px-5 pb-5 sm:grid-cols-2 sm:px-7 lg:grid-cols-4">
                    <div>
                        <label
                            htmlFor="category-filter"
                            className="mb-1.5 block text-xs font-semibold text-[#637066]"
                        >
                            Category
                        </label>
                        <select
                            id="category-filter"
                            value={categoryFilter}
                            onChange={(event) => setCategoryFilter(event.target.value)}
                            className="w-full rounded-xl border border-[#E1E5DB] bg-white px-3 py-2.5 text-sm text-[#34483B] outline-none transition focus:border-[#6D9B83] focus:ring-2 focus:ring-[#DDF2E5]"
                        >
                            <option value="all">All categories</option>
                            {[...new Set(
                                transactions
                                    .map((transaction) => transaction.category)
                                    .filter(Boolean)
                            )]
                                .sort()
                                .map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                        </select>
                    </div>

                    <div>
                        <label
                            htmlFor="start-date-filter"
                            className="mb-1.5 block text-xs font-semibold text-[#637066]"
                        >
                            From date
                        </label>
                        <input
                            id="start-date-filter"
                            type="date"
                            value={startDateFilter}
                            max={endDateFilter || undefined}
                            onChange={(event) => setStartDateFilter(event.target.value)}
                            className="w-full rounded-xl border border-[#E1E5DB] bg-white px-3 py-2.5 text-sm text-[#34483B] outline-none transition focus:border-[#6D9B83] focus:ring-2 focus:ring-[#DDF2E5]"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="end-date-filter"
                            className="mb-1.5 block text-xs font-semibold text-[#637066]"
                        >
                            To date
                        </label>
                        <input
                            id="end-date-filter"
                            type="date"
                            value={endDateFilter}
                            min={startDateFilter || undefined}
                            onChange={(event) => setEndDateFilter(event.target.value)}
                            className="w-full rounded-xl border border-[#E1E5DB] bg-white px-3 py-2.5 text-sm text-[#34483B] outline-none transition focus:border-[#6D9B83] focus:ring-2 focus:ring-[#DDF2E5]"
                        />
                    </div>

                    <div className="flex items-end">
                        <button
                            type="button"
                            onClick={() => {
                                setTransactionFilter('all')
                                setCategoryFilter('all')
                                setStartDateFilter('')
                                setEndDateFilter('')
                                setSearchTerm('')
                            }}
                            className="w-full rounded-xl border border-[#E1E5DB] bg-white px-3 py-2.5 text-sm font-semibold text-[#637066] transition hover:border-[#A9B9AB] hover:bg-[#F3F6F0] hover:text-[#173F35]"
                        >
                            Clear all filters
                        </button>
                    </div>
                </div>

                {/* Transaction Table */}
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
                                    ) : transactions.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-5 py-14 text-center">
                                                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#EAF5EC] text-5xl">
                                                    🌱
                                                </div>

                                                <p className="mt-5 text-lg font-bold text-[#173F35]">
                                                    No transactions yet!
                                                </p>

                                                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#7B8177]">
                                                    Start tracking your money by adding your first income or expense.
                                                    Your financial insights will grow with every transaction.
                                                </p>

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setTransactionToEdit(null)
                                                        setShowTransactionForm(true)
                                                    }}
                                                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#173F35] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#245548]"
                                                >
                                                    <CirclePlus size={16} />
                                                    Add your first transaction
                                                </button>
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedTransactions.map((transaction) => {
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
                                        filteredTransactions.length === 0 && (
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

                    {filteredTransactions.length > 0 && (
                        <div className="mt-5 flex flex-col items-center justify-center gap-4 px-1">

                            {/* Results information */}
                            <p className="text-xs font-medium text-[#858B80]">
                                Showing {startIndex + 1}–
                                {Math.min(endIndex, filteredTransactions.length)} of{' '}
                                {filteredTransactions.length} transactions
                            </p>

                            {/* Pagination controls */}
                            <div className="flex items-center justify-center gap-2">

                                <button
                                    type="button"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage((page) => page - 1)}
                                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E1E5DB] bg-white text-[#637066] transition hover:bg-[#F3F6F0] disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <ChevronLeft size={18} />
                                </button>

                                <div className="flex items-center gap-1">
                                    {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                                        <button
                                            key={page}
                                            type="button"
                                            onClick={() => setCurrentPage(page)}
                                            className={`h-9 min-w-9 rounded-lg px-3 text-sm font-semibold transition ${currentPage === page
                                                ? 'bg-[#173F35] text-white shadow-sm'
                                                : 'text-[#637066] hover:bg-[#EAF5EC]'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage((page) => page + 1)}
                                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E1E5DB] bg-white text-[#637066] transition hover:bg-[#F3F6F0] disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <ChevronRight size={18} />
                                </button>

                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Add / Edit Transaction Form */}
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

            {/* Delete Confirmation Modal */}
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
        </div>
    )
}

export default TransactionsPage
