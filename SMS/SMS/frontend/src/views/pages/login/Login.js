import React, { useState, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import axios from 'axios'
import { AuthContext } from '../../../hooks/AuthContext'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const { login, fetchUserData } = useContext(AuthContext)

  const handleSubmit = async (e) => {
    // Prevent default form submission
    e.preventDefault()
    try {
      // Create the credentials object
      const credentials = { email, password }

      // Log the credentials being sent
      console.log('Sending credentials:', credentials)

      // Make the login request
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password })

      // Log the response
      console.log('Login response:', response)

      // Check if the login was successful
      if (response.data.message === 'Login successful') {
        window.localStorage.setItem('isLogged', true)
        const token = response.data.token
        localStorage.setItem('token', token)
        // Log the token
        console.log('Token from response:', token)

        const userData = await fetchUserData(token)
        // Log the user data
        console.log('User data:', userData)

        if (userData) {
          login(userData)
          navigate('/')
        } else {
          console.error('Failed to fetch user data')
        }
      }
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm onSubmit={handleSubmit}>
                    <h1>Login</h1>
                    <p className="text-body-secondary">Sign In to your account</p>
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        type="email"
                        placeholder="Email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </CInputGroup>
                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="Password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </CInputGroup>
                    <CRow>
                      <CCol xs={6}>
                        <CButton type="submit" color="primary" className="px-4">
                          Login
                        </CButton>
                      </CCol>
                      <CCol xs={6} className="text-right">
                        <CButton color="link" className="px-0">
                          Forgot password?
                        </CButton>
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
              <CCard className="text-white bg-primary py-5" style={{ width: '44%' }}>
                <CCardBody className="text-center">
                  <div>
                    <h2>Student Sign up</h2>
                    <br></br>
                    <p>Don&apos;t have an account yet? Register now and start learning with us!</p>
                    <Link to="/students/register">
                      <CButton color="primary" className="mt-3" active tabIndex={-1}>
                        Register Now!
                      </CButton>
                    </Link>
                  </div>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login
