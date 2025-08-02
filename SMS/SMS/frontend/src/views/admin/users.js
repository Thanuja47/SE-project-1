import React, { useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CForm,
  CFormLabel,
  CFormInput,
  CFormSelect,
  CButton,
  CAlert,
} from '@coreui/react'
import axios from 'axios'

const AddInstructor = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [department, setDepartment] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const handleAddInstructor = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token')

    try {
      await axios.post(
        'http://localhost:5000/api/instructors',
        { name, email, department },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      setSuccessMessage('Instructor added successfully!')
      setName('')
      setEmail('')
      setDepartment('')
      setErrorMessage('') // Clear any previous error message
    } catch (error) {
      console.error('Error adding instructor:', error)
      setErrorMessage('Error adding instructor')
      setSuccessMessage('') // Clear any previous success message
    }
  }

  return (
    <div>
      <CCard>
        <CCardHeader>Add Instructor</CCardHeader>
        <CCardBody>
          <CForm onSubmit={handleAddInstructor}>
            <div className="mb-3">
              <CFormLabel>Name</CFormLabel>
              <CFormInput
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <CFormLabel>Email</CFormLabel>
              <CFormInput
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <CFormLabel>Department</CFormLabel>
              <CFormSelect
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
              >
                <option value="">Select Department</option>
                <option value="Law">Law</option>
                <option value="IT">IT</option>
                <option value="Business">Business</option>
              </CFormSelect>
            </div>
            <CButton color="primary" type="submit">
              Add Instructor
            </CButton>
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
    </div>
  )
}

export default AddInstructor
