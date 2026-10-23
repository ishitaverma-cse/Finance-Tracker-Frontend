import { useState } from 'react'
import { X, ArrowDownLeft, ArrowUpRight } from 'lucide-react'

const initialForm = {
    title: '',
    amount: '',
    type: 'expense',
    category: '',
    date: new Date().toISOString().slice(0, 10),
    description: '',
}

const categories = {
    income: [
        'Salary',
        'Freelance',
        'Business',
        'Investments',
        'Other Income',
    ],
    expense: [
        'Food & Dining',
        'Shopping',
        'Transportation',
        'Bills & Utilities',
        'Entertainment',
        'Healthcare',
        'Education',
        'Other',
    ],
}

function TransactionForm({ onClose, onSubmit }) {
    const [form, setForm] = useState(initialForm)
    const [error, setError] = useState('')

    const handleChange = (event) => {
        const { name, value } = event.target

        setForm((previous) => ({
            ...previous,
            [name]: value,
            ...(name === 'type' ? { category: '' } : {}),
        }))

        setError('')
    }

    const handleSubmit = (event) => {
        event.preventDefault()

        const amount = Number(form.amount)

        if (!form.title.trim()) {
            setError('Please enter a transaction name.')
            return
        }

        if (!Number.isFinite(amount) || amount <= 0) {
            setError('Please enter an amount greater than zero.')
            return
        }

        if (!form.category) {
            setError('Please select a category.')
            return
        }

        if (!form.date) {
            setError('Please select a date.')
            return
        }

        onSubmit({
            ...form,
            title: form.title.trim(),
            amount,
            description: form.description.trim(),
        })
    }

    return (
        <div
            className="fixed inset-0 z-[1100] flex items-center justify-center bg-stone-950/40 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose()
            }}
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="transaction-form-title"
                className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-[#fffdf7] p-6 shadow-2xl sm:p-8"
            >
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                            Manage your money
                        </p>

                        <h2
                            id="transaction-form-title"
                            className="mt-2 text-2xl font-bold tracking-tight text-emerald-950"
                        >
                            Add Transaction
                        </h2>

                        <p className="mt-1 text-sm text-stone-500">
                            Record your income or expenses.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close transaction form"
                        className="rounded-xl p-2 text-stone-500 transition hover:bg-stone-100 hover:text-stone-800"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Transaction type */}
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-stone-700">
                            Transaction type
                        </label>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => handleChange({
                                    target: {
                                        name: 'type',
                                        value: 'expense',
                                    },
                                })}
                                className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                                    form.type === 'expense'
                                        ? 'border-rose-200 bg-rose-50 text-rose-700 ring-1 ring-rose-200'
                                        : 'border-stone-200 bg-white text-stone-500 hover:bg-stone-50'
                                }`}
                            >
                                <ArrowUpRight size={18} />
                                Expense
                            </button>

                            <button
                                type="button"
                                onClick={() => handleChange({
                                    target: {
                                        name: 'type',
                                        value: 'income',
                                    },
                                })}
                                className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                                    form.type === 'income'
                                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200'
                                        : 'border-stone-200 bg-white text-stone-500 hover:bg-stone-50'
                                }`}
                            >
                                <ArrowDownLeft size={18} />
                                Income
                            </button>
                        </div>
                    </div>

                    {/* Transaction name */}
                    <div>
                        <label
                            htmlFor="transaction-title"
                            className="mb-2 block text-sm font-semibold text-stone-700"
                        >
                            Transaction name
                        </label>

                        <input
                            id="transaction-title"
                            name="title"
                            type="text"
                            value={form.title}
                            onChange={handleChange}
                            placeholder="e.g. Grocery shopping"
                            maxLength={100}
                            required
                            className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-stone-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                        />
                    </div>

                    {/* Amount and date */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label
                                htmlFor="transaction-amount"
                                className="mb-2 block text-sm font-semibold text-stone-700"
                            >
                                Amount (₹)
                            </label>

                            <input
                                id="transaction-amount"
                                name="amount"
                                type="number"
                                value={form.amount}
                                onChange={handleChange}
                                placeholder="0.00"
                                min="0.01"
                                step="0.01"
                                required
                                className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-stone-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="transaction-date"
                                className="mb-2 block text-sm font-semibold text-stone-700"
                            >
                                Date
                            </label>

                            <input
                                id="transaction-date"
                                name="date"
                                type="date"
                                value={form.date}
                                onChange={handleChange}
                                required
                                className="w-full rounded-xl border border-stone-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                            />
                        </div>
                    </div>

                    {/* Category */}
                    <div>
                        <label
                            htmlFor="transaction-category"
                            className="mb-2 block text-sm font-semibold text-stone-700"
                        >
                            Category
                        </label>

                        <select
                            id="transaction-category"
                            name="category"
                            value={form.category}
                            onChange={handleChange}
                            required
                            className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                        >
                            <option value="" disabled>
                                Select a category
                            </option>

                            {categories[form.type].map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Optional description */}
                    <div>
                        <label
                            htmlFor="transaction-description"
                            className="mb-2 block text-sm font-semibold text-stone-700"
                        >
                            Description <span className="font-normal text-stone-400">(optional)</span>
                        </label>

                        <textarea
                            id="transaction-description"
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            placeholder="Add any extra details..."
                            rows={3}
                            maxLength={500}
                            className="w-full resize-y rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-stone-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                        />
                    </div>

                    {error && (
                        <p
                            role="alert"
                            className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
                        >
                            {error}
                        </p>
                    )}

                    <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-600 transition hover:bg-stone-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="rounded-xl bg-emerald-800 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-900"
                        >
                            Save Transaction
                        </button>
                    </div>
                </form>
            </section>
        </div>
    )
}

export default TransactionForm
