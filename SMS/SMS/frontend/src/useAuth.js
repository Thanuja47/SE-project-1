import { useContext } from 'react'
import { AuthContext } from './hooks/AuthContext'

const useAuth = () => {
  const { isAuthenticated } = useContext(AuthContext)
  return isAuthenticated
}

export default useAuth
