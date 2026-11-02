import {
    UserRound,
    Mail,
    ShieldCheck,
    LogOut,
} from 'lucide-react'

const ProfilePage = ({ user, onSignOut }) => {
    const userName = user?.name || 'Thrive User'
    const userEmail = user?.email || 'Email not available'

    const initials = userName
        .split(' ')
        .filter(Boolean)
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()

    return (
        <div className="mx-auto w-full max-w-4xl space-y-6">

            {/* Profile Overview */}
            <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">

                    {/* Avatar */}
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-2xl font-bold text-emerald-900">
                        {initials || <UserRound size={30} />}
                    </div>

                    {/* User Details */}
                    <div className="text-center sm:text-left">
                        <h2 className="text-2xl font-semibold tracking-tight text-stone-900">
                            {userName}
                        </h2>

                        <p className="mt-1 text-sm text-stone-500">
                            Personal Account
                        </p>

                        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800">
                            <ShieldCheck size={15} />
                            Account active
                        </div>
                    </div>
                </div>
            </section>

            {/* Account Information */}
            <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
                <div>
                    <h3 className="text-lg font-semibold text-stone-900">
                        Account Information
                    </h3>

                    <p className="mt-1 text-sm text-stone-500">
                        Your personal account details.
                    </p>
                </div>

                <div className="mt-6 space-y-4">

                    {/* Name */}
                    <div className="flex items-center gap-4 rounded-xl bg-stone-50 p-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-stone-600">
                            <UserRound size={19} />
                        </div>

                        <div className="min-w-0">
                            <p className="text-xs font-medium text-stone-500">
                                Full Name
                            </p>

                            <p className="mt-1 truncate text-sm font-semibold text-stone-800">
                                {userName}
                            </p>
                        </div>
                    </div>

                    {/* Email */}
                    <div className="flex items-center gap-4 rounded-xl bg-stone-50 p-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-stone-600">
                            <Mail size={19} />
                        </div>

                        <div className="min-w-0">
                            <p className="text-xs font-medium text-stone-500">
                                Email Address
                            </p>

                            <p className="mt-1 truncate text-sm font-semibold text-stone-800">
                                {userEmail}
                            </p>
                        </div>
                    </div>

                </div>
            </section>

            {/* Sign Out */}
            <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                        <h3 className="text-lg font-semibold text-stone-900">
                            Sign Out
                        </h3>

                        <p className="mt-1 text-sm text-stone-500">
                            Sign out of your Thrive account on this device.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onSignOut}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700"
                    >
                        <LogOut size={17} />
                        Sign Out
                    </button>

                </div>
            </section>

        </div>
    )
}

export default ProfilePage