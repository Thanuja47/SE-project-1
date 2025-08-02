import React, { createContext, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'

export const AuthContext = createContext()

// Axios Interceptor to handle token refreshing
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const refreshToken = localStorage.getItem('refreshToken')
      try {
        const response = await axios.post('http://localhost:5000/api/auth/refresh', {
          refreshToken,
        })
        const newAccessToken = response.data.accessToken
        localStorage.setItem('userSession', JSON.stringify({ ...userData, token: newAccessToken }))
        axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`
        return axios(originalRequest)
      } catch (err) {
        console.error('Failed to refresh token:', err)
        logout()
      }
    }
    return Promise.reject(error)
  },
)

export const AuthProvider = ({ children }) => {
  AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
  }

  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userData, setUserData] = useState(null)

  useEffect(() => {
    const userSession = localStorage.getItem('userSession')
    if (userSession) {
      setIsAuthenticated(true)
      setUserData(JSON.parse(userSession))
    }
  }, [])

  const fetchUserData = async (token) => {
    try {
      const response = await axios.get('http://localhost:5000/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response.data.user
    } catch (error) {
      console.error('Failed to fetch user data:', error)
      return null
    }
  }

  const login = (data) => {
    localStorage.setItem('userSession', JSON.stringify(data))
    localStorage.setItem('refreshToken', data.refreshToken)
    setIsAuthenticated(true)
    setUserData(data)
  }

  const logout = () => {
    localStorage.removeItem('userSession')
    localStorage.removeItem('refreshToken')
    setIsAuthenticated(false)
    setUserData(null)
    console.log('User logged out')
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, userData, login, logout, fetchUserData }}>
      {children}
    </AuthContext.Provider>
  )
}
