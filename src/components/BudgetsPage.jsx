import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'

import {
    ChevronLeft,
    ChevronRight,
    Wallet,
    Plus,
    X,
    AlertTriangle,
    CircleAlert,
} from 'lucide-react'

import BudgetStats from './BudgetStats'
import BudgetCard from './BudgetCard'

const API_URL = import.meta.env.VITE_API_URL

const expenseCategories = [
    'Food & Dining',
    'Shopping',
    'Transportation',
    'Bills & Utilities',
    'Entertainment',
    'Healthcare',
    'Education',
    'Other',
]

const initialSummary = {
    totalBudget: 0,
    totalSpent: 0,
    totalRemaining: 0,
    percentageUsed: 0,
}

const BudgetsPage = ({ transactions = [] }) => {
    const { token, isAuthenticated } = useAuth()

    const currentDate = new Date()

    const [selectedMonth, setSelectedMonth] = useState(
        currentDate.getMonth() + 1
    )
    const [selectedYear, setSelectedYear] = useState(
        currentDate.getFullYear()
    )

    const [budgets, setBudgets] = useState([])
    const [budgetSummary, setBudgetSummary] = useState(initialSummary)

    // Pagination
    const [currentPage, setCurrentPage] = useState(1)
    const budgetsPerPage = 4

    const [isLoadingBudgets, setIsLoadingBudgets] = useState(true)
    const [budgetError, setBudgetError] = useState('')

    // Budget form states
    const [showBudgetModal, setShowBudgetModal] = useState(false)
    const [editingBudget, setEditingBudget] = useState(null)
    const [newCategory, setNewCategory] = useState('')
    const [newAmount, setNewAmount] = useState('')
    const [isSavingBudget, setIsSavingBudget] = useState(false)
    const [formError, setFormError] = useState('')

    // Delete states
    const [budgetToDelete, setBudgetToDelete] = useState(null)
    const [isDeletingBudget, setIsDeletingBudget] = useState(false)

    // Currency formatter
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount || 0)
    }

    // Fetch budgets for selected month
    const fetchBudgets = useCallback(async (signal) => {
        if (!isAuthenticated || !token) {
            setBudgets([])
            setBudgetSummary(initialSummary)
            setIsLoadingBudgets(false)
            return false
        }

        setIsLoadingBudgets(true)
        setBudgetError('')

        try {
            const response = await fetch(
                `${API_URL}/budgets?month=${selectedMonth}&year=${selectedYear}`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    signal,
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(
                    data.message || 'Failed to load budgets.'
                )
            }

            setBudgets(data.budgets || [])
            setBudgetSummary(data.summary || initialSummary)

            return true
        } catch (error) {
            if (error.name !== 'AbortError') {
                setBudgetError(
                    error.message || 'Unable to load budgets.'
                )
            }

            return false
        } finally {
            if (!signal?.aborted) {
                setIsLoadingBudgets(false)
            }
        }
    }, [isAuthenticated, token, selectedMonth, selectedYear])

    useEffect(() => {
        const controller = new AbortController()

        fetchBudgets(controller.signal)

        return () => controller.abort()
    }, [fetchBudgets])

    // Reset pagination when changing months
    useEffect(() => {
        setCurrentPage(1)
    }, [selectedMonth, selectedYear])

    // Pagination calculations
    const totalPages = Math.ceil(budgets.length / budgetsPerPage)

    const startIndex = (currentPage - 1) * budgetsPerPage
    const endIndex = startIndex + budgetsPerPage

    const paginatedBudgets = budgets.slice(startIndex, endIndex)

    // Keep current page valid after deleting budgets
    useEffect(() => {
        setCurrentPage((previousPage) => (
            Math.min(previousPage, Math.max(totalPages, 1))
        ))
    }, [totalPages])

    // Month navigation
    const changeMonth = (direction) => {
        const date = new Date(
            selectedYear,
            selectedMonth - 1 + direction
        )

        setSelectedMonth(date.getMonth() + 1)
        setSelectedYear(date.getFullYear())
    }

    // Open create form
    const openCreateBudget = () => {
        setEditingBudget(null)
        setNewCategory('')
        setNewAmount('')
        setFormError('')
        setShowBudgetModal(true)
    }

    // Open edit form
    const openEditBudget = (budget) => {
        setEditingBudget(budget)
        setNewCategory(budget.category)
        setNewAmount(String(budget.amount))
        setFormError('')
        setShowBudgetModal(true)
    }

    // Close form
    const closeBudgetModal = () => {
        if (isSavingBudget) return

        setShowBudgetModal(false)
        setEditingBudget(null)
        setNewCategory('')
        setNewAmount('')
        setFormError('')
    }

    // Check whether a category is already budgeted
    const isCategoryAlreadyUsed = (category) => {
        return budgets.some((budget) => (
            budget.category === category &&
            budget._id !== editingBudget?._id
        ))
    }

    // Create or update budget
    const handleSaveBudget = async (event) => {
        event.preventDefault()
        setFormError('')

        const amount = Number(newAmount)

        if (!newCategory) {
            setFormError('Please select a budget category.')
            return
        }

        if (!Number.isFinite(amount) || amount <= 0) {
            setFormError('Please enter a valid amount greater than zero.')
            return
        }

        if (
            isCategoryAlreadyUsed(newCategory)
        ) {
            setFormError(
                'A budget for this category already exists for this month.'
            )
            return
        }

        setIsSavingBudget(true)

        const isEditing = Boolean(editingBudget)

        const endpoint = isEditing
            ? `${API_URL}/budgets/${editingBudget._id}`
            : `${API_URL}/budgets`

        try {
            const response = await fetch(endpoint, {
                method: isEditing ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    category: newCategory,
                    amount,
                    month: selectedMonth,
                    year: selectedYear,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    `Failed to ${isEditing ? 'update' : 'create'} budget.`
                )
            }

            setShowBudgetModal(false)
            setEditingBudget(null)
            setNewCategory('')
            setNewAmount('')
            setFormError('')

            toast.success(
                isEditing
                    ? 'Budget updated successfully!'
                    : 'Budget created successfully!'
            )

            const refreshed = await fetchBudgets()

            if (!refreshed) {
                toast.error(
                    'Budget was saved, but the latest data could not be loaded. Please refresh.'
                )
            }
        } catch (error) {
            setFormError(
                error.message || 'Something went wrong. Please try again.'
            )
        } finally {
            setIsSavingBudget(false)
        }
    }

    // Delete budget
    const handleDeleteBudget = async () => {
        if (!budgetToDelete) return

        setIsDeletingBudget(true)

        try {
            const response = await fetch(
                `${API_URL}/budgets/${budgetToDelete._id}`,
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
                    data.message || 'Failed to delete budget.'
                )
            }

            setBudgetToDelete(null)

            toast.success('Budget deleted successfully!')

            const refreshed = await fetchBudgets()

            if (!refreshed) {
                toast.error(
                    'Budget was deleted, but the latest data could not be loaded. Please refresh.'
                )
            }
        } catch (error) {
            toast.error(
                error.message || 'Unable to delete budget.'
            )
        } finally {
            setIsDeletingBudget(false)
        }
    }

    // Budget alert counts
    const exceededBudgets = budgets.filter((budget) => (
        budget.isExceeded || Number(budget.percentageUsed) > 100
    ))

    const nearLimitBudgets = budgets.filter((budget) => {
        const percentage = Number(budget.percentageUsed) || 0

        return (
            percentage >= 80 &&
            percentage <= 100 &&
            !budget.isExceeded
        )
    })

    return (
        <div className="space-y-7">

            {/* Month Navigation */}
            <section>
                <div className="mb-6 flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() => changeMonth(-1)}
                        aria-label="Previous month"
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E1E5DB] bg-white text-[#637066] transition hover:bg-[#F3F6F0]"
                    >
                        <ChevronLeft size={18} />
                    </button>

                    <h3 className="text-base font-semibold text-[#263B2E]">
                        {new Date(
                            selectedYear,
                            selectedMonth - 1
                        ).toLocaleDateString('en-IN', {
                            month: 'long',
                            year: 'numeric',
                        })}
                    </h3>

                    <button
                        type="button"
                        onClick={() => changeMonth(1)}
                        aria-label="Next month"
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E1E5DB] bg-white text-[#637066] transition hover:bg-[#F3F6F0]"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>

                {/* Loading State */}
                {isLoadingBudgets ? (
                    <p className="text-sm text-stone-500">
                        Loading your budgets...
                    </p>
                ) : budgetError ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                        <p className="text-sm font-medium text-red-600">
                            {budgetError}
                        </p>

                        <button
                            type="button"
                            onClick={() => fetchBudgets()}
                            className="mt-2 text-sm font-semibold text-red-700 underline"
                        >
                            Try again
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Budget Summary */}
                        <BudgetStats
                            budgetSummary={budgetSummary}
                            formatCurrency={formatCurrency}
                        />

                        {/* Budget Alerts */}
                        {exceededBudgets.length > 0 && (
                            <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                                <AlertTriangle
                                    size={19}
                                    className="mt-0.5 shrink-0 text-red-600"
                                />

                                <div>
                                    <p className="text-sm font-semibold text-red-700">
                                        {exceededBudgets.length === 1
                                            ? 'A budget has been exceeded!'
                                            : `${exceededBudgets.length} budgets have been exceeded!`}
                                    </p>

                                    <p className="mt-1 text-sm text-red-600">
                                        {exceededBudgets.map((budget) => budget.category).join(', ')}. Review your spending in these categories.
                                    </p>
                                </div>
                            </div>
                        )}

                        {exceededBudgets.length === 0 && nearLimitBudgets.length > 0 && (
                            <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                                <CircleAlert
                                    size={19}
                                    className="mt-0.5 shrink-0 text-amber-600"
                                />

                                <div>
                                    <p className="text-sm font-semibold text-amber-700">
                                        You're approaching your budget limits.
                                    </p>

                                    <p className="mt-1 text-sm text-amber-600">
                                        {nearLimitBudgets.map((budget) => budget.category).join(', ')} has reached at least 80% of its allocated budget.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Category Budgets */}
                        <section className="mt-8">

                            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-[#263B2E]">
                                        Category-wise Budgets
                                    </h3>

                                    <p className="mt-1 text-sm text-[#899189]">
                                        Track how much you're spending in each category.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={openCreateBudget}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#315C42] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#264A35] active:scale-[0.98]"
                                >
                                    <Plus size={17} />
                                    Add Budget
                                </button>
                            </div>

                            {budgets.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-[#DCE3D8] bg-[#FAFBF8] px-5 py-12 text-center">
                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF1E8] text-[#527A58]">
                                        <Wallet size={25} />
                                    </div>

                                    <h4 className="mt-4 text-base font-semibold text-[#263B2E]">
                                        No budgets set up yet
                                    </h4>

                                    <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#899189]">
                                        Start planning your spending by creating your first category budget.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={openCreateBudget}
                                        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#315C42] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#264A35]"
                                    >
                                        <Plus size={16} />
                                        Create your first budget
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                    {paginatedBudgets.map((budget) => {
                                        const categoryTransactions = transactions.filter((transaction) => {
                                            if (transaction.type !== 'expense') return false
                                            if (transaction.category !== budget.category) return false
                                            if (!transaction.dateISO) return false

                                            const transactionDate = new Date(
                                                `${transaction.dateISO.slice(0, 10)}T12:00:00`
                                            )

                                            return (
                                                transactionDate.getMonth() + 1 === selectedMonth &&
                                                transactionDate.getFullYear() === selectedYear
                                            )
                                        })

                                        return (
                                            <BudgetCard
                                                key={budget._id}
                                                budget={budget}
                                                categoryTransactions={categoryTransactions}
                                                formatCurrency={formatCurrency}
                                                onEdit={openEditBudget}
                                                onDelete={setBudgetToDelete}
                                            />
                                        )
                                    })}
                                </div>
                            )}

                            {/* Budget Pagination */}
                            {totalPages > 1 && (
                                <div className="mt-7 flex flex-col items-center gap-4 border-t border-[#E8ECE5] pt-5">

                                    {/* Results Count */}
                                    <p className="text-sm text-[#899189]">
                                        Showing{' '}
                                        <span className="font-semibold text-[#405044]">
                                            {startIndex + 1}–{Math.min(endIndex, budgets.length)}
                                        </span>
                                        {' '}of{' '}
                                        <span className="font-semibold text-[#405044]">
                                            {budgets.length}
                                        </span>
                                        {' '}budgets
                                    </p>

                                    {/* Page Controls */}
                                    <div className="flex items-center justify-center gap-2">

                                        {/* Previous */}
                                        <button
                                            type="button"
                                            onClick={() => setCurrentPage((previous) => previous - 1)}
                                            disabled={currentPage === 1}
                                            aria-label="Previous page"
                                            className="
                                                flex h-9 w-9 items-center justify-center rounded-lg
                                                border border-[#E1E5DB] bg-white text-[#637066]
                                                transition hover:bg-[#F3F6F0]
                                                disabled:cursor-not-allowed disabled:opacity-40
                                            "
                                        >
                                            <ChevronLeft size={17} />
                                        </button>

                                        {/* Page Numbers */}
                                        {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                                            <button
                                                key={page}
                                                type="button"
                                                onClick={() => setCurrentPage(page)}
                                                aria-label={`Go to page ${page}`}
                                                aria-current={currentPage === page ? 'page' : undefined}
                                                className={`
                                                        flex h-9 w-9 items-center justify-center rounded-lg
                                                        text-sm font-semibold transition
                                                        ${currentPage === page
                                                        ? 'bg-[#315C42] text-white shadow-sm'
                                                        : 'border border-[#E1E5DB] bg-white text-[#637066] hover:bg-[#F3F6F0]'
                                                    }
                                                `}
                                            >
                                                {page}
                                            </button>
                                        ))}

                                        {/* Next */}
                                        <button
                                            type="button"
                                            onClick={() => setCurrentPage((previous) => previous + 1)}
                                            disabled={currentPage === totalPages}
                                            aria-label="Next page"
                                            className="
                                                flex h-9 w-9 items-center justify-center rounded-lg
                                                border border-[#E1E5DB] bg-white text-[#637066]
                                                transition hover:bg-[#F3F6F0]
                                                disabled:cursor-not-allowed disabled:opacity-40
                                            "
                                        >
                                            <ChevronRight size={17} />
                                        </button>

                                    </div>
                                </div>
                            )}
                        </section>
                    </>
                )}
            </section>

            {/* Create / Edit Budget Modal */}
            {showBudgetModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 px-4 py-6 backdrop-blur-[2px]"
                    onMouseDown={(event) => {
                        if (
                            event.target === event.currentTarget &&
                            !isSavingBudget
                        ) {
                            closeBudgetModal()
                        }
                    }}
                >
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

                        <div className="mb-6 flex items-start justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-[#263B2E]">
                                    {editingBudget ? 'Edit Budget' : 'Create Budget'}
                                </h3>

                                <p className="mt-1 text-sm text-[#899189]">
                                    {editingBudget
                                        ? 'Update your category spending limit.'
                                        : 'Set a spending limit for a category.'}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeBudgetModal}
                                disabled={isSavingBudget}
                                aria-label="Close modal"
                                className="flex h-9 w-9 items-center justify-center rounded-xl text-[#899189] transition hover:bg-[#F3F6F0] hover:text-[#263B2E] disabled:opacity-50"
                            >
                                <X size={19} />
                            </button>
                        </div>

                        {/* Budget Period */}
                        <div className="mb-5 rounded-xl bg-[#F3F6F0] px-4 py-3">
                            <p className="text-xs font-medium text-[#899189]">
                                BUDGET PERIOD
                            </p>

                            <p className="mt-1 text-sm font-semibold text-[#315C42]">
                                {new Date(
                                    selectedYear,
                                    selectedMonth - 1
                                ).toLocaleDateString('en-IN', {
                                    month: 'long',
                                    year: 'numeric',
                                })}
                            </p>
                        </div>

                        <form
                            onSubmit={handleSaveBudget}
                            className="space-y-5"
                        >
                            {/* Category */}
                            <div>
                                <label
                                    htmlFor="budget-category"
                                    className="mb-2 block text-sm font-semibold text-[#405044]"
                                >
                                    Budget Category
                                </label>

                                <select
                                    id="budget-category"
                                    value={newCategory}
                                    onChange={(event) => {
                                        setNewCategory(event.target.value)
                                        setFormError('')
                                    }}
                                    required
                                    disabled={isSavingBudget}
                                    className="w-full rounded-xl border border-[#E1E5DB] bg-white px-4 py-3 text-sm text-[#263B2E] outline-none transition focus:border-[#6B9270] focus:ring-2 focus:ring-[#6B9270]/15 disabled:opacity-60"
                                >
                                    <option value="" disabled>
                                        Select a category
                                    </option>

                                    {expenseCategories.map((category) => {
                                        const alreadyUsed = isCategoryAlreadyUsed(category)

                                        return (
                                            <option
                                                key={category}
                                                value={category}
                                                disabled={alreadyUsed}
                                            >
                                                {category}{alreadyUsed ? ' (Already budgeted)' : ''}
                                            </option>
                                        )
                                    })}
                                </select>

                                <p className="mt-2 text-xs text-[#899189]">
                                    Each category can have one budget per month.
                                </p>
                            </div>

                            {/* Amount */}
                            <div>
                                <label
                                    htmlFor="budget-amount"
                                    className="mb-2 block text-sm font-semibold text-[#405044]"
                                >
                                    Monthly Budget Limit
                                </label>

                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#899189]">
                                        ₹
                                    </span>

                                    <input
                                        id="budget-amount"
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        value={newAmount}
                                        onChange={(event) => {
                                            setNewAmount(event.target.value)
                                            setFormError('')
                                        }}
                                        placeholder="e.g. 5000"
                                        required
                                        disabled={isSavingBudget}
                                        className="w-full rounded-xl border border-[#E1E5DB] bg-white py-3 pl-9 pr-4 text-sm text-[#263B2E] outline-none transition placeholder:text-[#B0B8B0] focus:border-[#6B9270] focus:ring-2 focus:ring-[#6B9270]/15 disabled:opacity-60"
                                    />
                                </div>

                                <p className="mt-2 text-xs text-[#899189]">
                                    Enter the maximum amount you plan to spend in this category.
                                </p>
                            </div>

                            {/* Form Error */}
                            {formError && (
                                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                                    {formError}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={closeBudgetModal}
                                    disabled={isSavingBudget}
                                    className="rounded-xl border border-[#E1E5DB] px-5 py-3 text-sm font-semibold text-[#637066] transition hover:bg-[#F6F8F4] disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={isSavingBudget}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#315C42] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#264A35] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isSavingBudget
                                        ? 'Saving...'
                                        : editingBudget
                                            ? 'Save Changes'
                                            : 'Create Budget'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {budgetToDelete && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-[2px]"
                    onMouseDown={(event) => {
                        if (
                            event.target === event.currentTarget &&
                            !isDeletingBudget
                        ) {
                            setBudgetToDelete(null)
                        }
                    }}
                >
                    <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
                            <AlertTriangle size={23} />
                        </div>

                        <h3 className="mt-4 text-lg font-bold text-[#263B2E]">
                            Delete this budget?
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-[#788279]">
                            Are you sure you want to delete the{' '}
                            <span className="font-semibold text-[#263B2E]">
                                {budgetToDelete.category}
                            </span>{' '}
                            budget for{' '}
                            {new Date(
                                selectedYear,
                                selectedMonth - 1
                            ).toLocaleDateString('en-IN', {
                                month: 'long',
                                year: 'numeric',
                            })}
                            ? This action cannot be undone.
                        </p>

                        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => setBudgetToDelete(null)}
                                disabled={isDeletingBudget}
                                className="rounded-xl border border-[#E1E5DB] px-4 py-2.5 text-sm font-semibold text-[#637066] transition hover:bg-[#F6F8F4] disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleDeleteBudget}
                                disabled={isDeletingBudget}
                                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isDeletingBudget ? 'Deleting...' : 'Delete Budget'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}

export default BudgetsPage
