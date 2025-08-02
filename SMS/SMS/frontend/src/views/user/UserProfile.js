import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CRow,
  CAlert,
} from '@coreui/react'
import axios from 'axios'

const Profile = () => {
  const [userData, setUserData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    dob: '',
    school_id: '',
    financial_status: '',
  })
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get('http://localhost:5000/api/admin/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        // Format the date of birth to YYYY-MM-DD
        // "2000-01-01T00:00:00.000Z" -> "2000-01-01"
        // response ? True : False
        const formattedDOB = response.data.dob
          ? new Date(response.data.dob).toISOString().substring(0, 10)
          : ''
        setUserData({ ...response.data, dob: formattedDOB })
      } catch (error) {
        console.error('Failed to fetch user profile:', error)
      }
    }

    fetchUserProfile()
  }, [])

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      await axios.put('http://localhost:5000/api/admin/profile', userData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setSuccessMessage('Profile updated successfully')
    } catch (error) {
      console.error('Failed to update profile:', error)
      setErrorMessage('Failed to update profile')
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match')
      return
    }

    try {
      const token = localStorage.getItem('token')
      await axios.put(
        'http://localhost:5000/api/profile/change-password',
        { old_password: oldPassword, new_password: newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      setSuccessMessage('Password changed successfully')
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      console.error('Failed to change password:', error)
      setErrorMessage('Failed to change password')
    }
  }

  const renderProfileDetails = () => {
    if (!userData) return null

    return (
      <div>
        <h5>Profile Details</h5>
        <CForm onSubmit={handleProfileUpdate}>
          <CRow className="mb-3">
            <CCol>
              <CFormInput
                type="text"
                placeholder="First Name"
                value={userData.first_name}
                onChange={(e) => setUserData({ ...userData, first_name: e.target.value })}
                required
              />
            </CCol>
            <CCol>
              <CFormInput
                type="text"
                placeholder="Last Name"
                value={userData.last_name}
                onChange={(e) => setUserData({ ...userData, last_name: e.target.value })}
                required
              />
            </CCol>
          </CRow>
          <CRow className="mb-3">
            <CCol>
              <CFormInput
                type="text"
                placeholder="Phone"
                value={userData.phone}
                onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                required
              />
            </CCol>
            <CCol>
              <CFormInput
                type="text"
                placeholder="Email"
                value={userData.email}
                disabled
                required
              />
            </CCol>
          </CRow>
          <CRow className="mb-3">
            <CCol>
              <CFormInput
                type="text"
                placeholder="Address"
                value={userData.address}
                onChange={(e) => setUserData({ ...userData, address: e.target.value })}
                required
              />
            </CCol>
            <CCol>
              <CFormInput
                type="date"
                placeholder="Date of Birth"
                value={userData.dob}
                onChange={(e) => setUserData({ ...userData, dob: e.target.value })}
                required
              />
            </CCol>
          </CRow>
          <CRow>
            <CCol className="text-right">
              <CButton type="submit" color="primary">
                Update Profile
              </CButton>
            </CCol>
          </CRow>
        </CForm>
      </div>
    )
  }

  return (
    <CContainer>
      <CRow className="justify-content-center">
        <CCol md={8}>
          <CCard>
            <CCardHeader>Profile</CCardHeader>
            <CCardBody>
              {renderProfileDetails()}
              <br />
              <h5>Change Password</h5>
              <CForm onSubmit={handlePasswordChange}>
                <CRow className="mb-3">
                  <CCol>
                    <CFormInput
                      type="password"
                      placeholder="Old Password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      required
                    />
                  </CCol>
                </CRow>
                <CRow className="mb-3">
                  <CCol>
                    <CFormInput
                      type="password"
                      placeholder="New Password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </CCol>
                  <CCol>
                    <CFormInput
                      type="password"
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </CCol>
                </CRow>
                <CRow>
                  <CCol className="text-right">
                    <CButton type="submit" color="primary">
                      Change Password
                    </CButton>
                  </CCol>
                </CRow>
              </CForm>
              {successMessage && (
                <CAlert color="success" className="mt-3">
                  {successMessage}
                </CAlert>
              )}
              {errorMessage && (
                <CAlert color="danger" className="mt-3">
                  {errorMessage}
                </CAlert>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default Profile
