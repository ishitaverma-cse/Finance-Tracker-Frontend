import {
    LayoutDashboard,
    ArrowLeftRight,
    Wallet,
    ChartNoAxesCombined,
    Settings,
    CircleDollarSign,
} from 'lucide-react'

const navigationItems = [
    {
        label: 'Dashboard',
        icon: LayoutDashboard,
        page: 'dashboard',
    },
    {
        label: 'Transactions',
        icon: ArrowLeftRight,
        page: 'transactions',
    },
    {
        label: 'Budgets',
        icon: Wallet,
        page: 'budgets',
    },
    {
        label: 'Reports',
        icon: ChartNoAxesCombined,
        page: 'reports',
    },
]

function Sidebar({ activePage, setActivePage, onClose, isMobile = false }) {
    const handleNavigation = (page) => {
        setActivePage(page)
        onClose?.()
    }
    return (
        <aside className={`flex h-full ${isMobile ? 'w-full' : 'w-64'
            } shrink-0 flex-col bg-[#fffdf7] px-5 py-7`}>
            {/* Brand */}
            <div className="mb-8">
                <div className="flex items-center gap-3 px-2 mb-7">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-800 text-white shadow-sm">
                        <CircleDollarSign size={25} strokeWidth={2} />
                    </div>

                    <div>
                        <h1 className="text-lg font-bold tracking-tight text-emerald-950">
                            Thrive
                        </h1>
                        <p className="text-xs text-stone-500">
                            Personal Finance
                        </p>
                    </div>
                </div>

                {/* Brand Divider */}
                <div className="mt-0 border-b border-stone-200" />
            </div>

            {/* Navigation */}
            <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">
                Workspace
            </p>

            <nav className="flex flex-col gap-2">
                {navigationItems.map((item) => {
                    const Icon = item.icon
                    const isActive = activePage === item.page

                    return (
                        <button
                            key={item.page}
                            type="button"
                            onClick={() => handleNavigation(item.page)}
                            className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${isActive
                                ? 'bg-emerald-800 text-white shadow-sm'
                                : 'text-stone-600 hover:bg-emerald-50 hover:text-emerald-900'
                                }`}
                        >
                            <Icon size={19} strokeWidth={1.9} />
                            <span>{item.label}</span>
                        </button>
                    )
                })}
            </nav>

            {/* Bottom settings */}
            <div className="mt-auto border-t border-stone-200 pt-5">
                <button
                    type="button"
                    onClick={() => handleNavigation('settings')}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${activePage === 'settings'
                        ? 'bg-emerald-800 text-white shadow-sm'
                        : 'text-stone-600 hover:bg-emerald-50 hover:text-emerald-900'
                        }`}
                >
                    <Settings size={19} strokeWidth={1.9} />
                    <span>Settings</span>
                </button>

                <div className="mt-5 rounded-2xl bg-emerald-50 p-4">
                    <p className="text-sm font-semibold text-emerald-950">
                        Smart money habits
                    </p>
                    <p className="mt-1 text-xs leading-5 text-emerald-800/75">
                        Small steps today, stronger finances tomorrow.
                    </p>
                </div>
            </div>
        </aside>
    )
}

export default Sidebar
