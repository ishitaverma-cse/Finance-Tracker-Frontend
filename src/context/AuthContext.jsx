import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const savedUser = localStorage.getItem('finora-user')
            return savedUser ? JSON.parse(savedUser) : null
        } catch {
            localStorage.removeItem('finora-user')
            return null
        }
    })

    const [token, setToken] = useState(
        () => localStorage.getItem('finora-token') || null
    )

    const login = (userData, authToken) => {
        localStorage.setItem('finora-user', JSON.stringify(userData))
        localStorage.setItem('finora-token', authToken)

        setUser(userData)
        setToken(authToken)
    }

    const logout = () => {
        localStorage.removeItem('finora-user')
        localStorage.removeItem('finora-token')

        setUser(null)
        setToken(null)
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: Boolean(user && token),
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }

    return context
}
