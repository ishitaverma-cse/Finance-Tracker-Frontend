import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

const USER_KEY = 'thrive-user'
const TOKEN_KEY = 'thrive-token'

const getSavedValue = (newKey, oldKey, parseJson = false) => {
    try {
        let value = localStorage.getItem(newKey)

        if (value === null) {
            value = localStorage.getItem(oldKey)

            if (value !== null) {
                localStorage.setItem(newKey, value)
                localStorage.removeItem(oldKey)
            }
        }

        if (value === null) return null

        return parseJson ? JSON.parse(value) : value
    } catch {
        localStorage.removeItem(newKey)
        localStorage.removeItem(oldKey)
        return null
    }
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(
        () => getSavedValue(USER_KEY, 'finora-user', true)
    )

    const [token, setToken] = useState(
        () => getSavedValue(TOKEN_KEY, 'finora-token')
    )

    const login = (userData, authToken) => {
        localStorage.setItem(USER_KEY, JSON.stringify(userData))
        localStorage.setItem(TOKEN_KEY, authToken)

        localStorage.removeItem('finora-user')
        localStorage.removeItem('finora-token')

        setUser(userData)
        setToken(authToken)
    }

    const logout = () => {
        localStorage.removeItem(USER_KEY)
        localStorage.removeItem(TOKEN_KEY)

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
