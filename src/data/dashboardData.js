import {
    Wallet,
    TrendingUp,
    TrendingDown,
    PiggyBank,
} from 'lucide-react'

// Temporary dashboard data for UI development.
// We will replace these values with backend data later.

export const summaryCards = [
    {
        id: 'balance',
        title: 'Total Balance',
        amount: '₹84,250.00',
        change: '+12.8%',
        changeLabel: 'vs. last month',
        icon: Wallet,
        trend: 'up',
        iconColor: 'emerald',
    },
    {
        id: 'income',
        title: 'Total Income',
        amount: '₹65,000.00',
        change: '+8.2%',
        changeLabel: 'vs. last month',
        icon: TrendingUp,
        trend: 'up',
        iconColor: 'blue',
    },
    {
        id: 'expenses',
        title: 'Total Expenses',
        amount: '₹32,450.00',
        change: '+4.3%',
        changeLabel: 'vs. last month',
        icon: TrendingDown,
        trend: 'down',
        iconColor: 'rose',
    },
    {
        id: 'savings',
        title: 'Savings Rate',
        amount: '50.1%',
        change: '+3.5%',
        changeLabel: 'vs. last month',
        icon: PiggyBank,
        trend: 'up',
        iconColor: 'amber',
    },
]

export const monthlyOverview = [
    { month: 'May', income: 48000, expenses: 29000 },
    { month: 'Jun', income: 55000, expenses: 34000 },
    { month: 'Jul', income: 51000, expenses: 31000 },
    { month: 'Aug', income: 62000, expenses: 37000 },
    { month: 'Sep', income: 58000, expenses: 35000 },
    { month: 'Oct', income: 65000, expenses: 32450 },
]

export const expenseBreakdown = [
    { name: 'Food & Dining', value: 9500 },
    { name: 'Shopping', value: 7200 },
    { name: 'Transportation', value: 4800 },
    { name: 'Bills & Utilities', value: 6500 },
    { name: 'Entertainment', value: 2450 },
    { name: 'Other', value: 2000 },
]

export const recentTransactions = [
    {
        id: 1,
        title: 'Monthly Salary',
        category: 'Salary',
        date: 'Oct 22, 2026',
        type: 'income',
        amount: 65000,
    },
    {
        id: 2,
        title: 'Grocery Shopping',
        category: 'Food & Dining',
        date: 'Oct 21, 2026',
        type: 'expense',
        amount: 2450,
    },
    {
        id: 3,
        title: 'Electricity Bill',
        category: 'Bills & Utilities',
        date: 'Oct 20, 2026',
        type: 'expense',
        amount: 1800,
    },
    {
        id: 4,
        title: 'Freelance Project',
        category: 'Freelance',
        date: 'Oct 18, 2026',
        type: 'income',
        amount: 8500,
    },
    {
        id: 5,
        title: 'Cab Ride',
        category: 'Transportation',
        date: 'Oct 17, 2026',
        type: 'expense',
        amount: 650,
    },
]
