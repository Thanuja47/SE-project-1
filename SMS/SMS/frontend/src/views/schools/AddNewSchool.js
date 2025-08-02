import React, { useState } from 'react'
import { CAlert } from '@coreui/react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CFormSelect,
  CRow,
} from '@coreui/react'
import axios from 'axios'

const AddNewSchool = () => {
  const [name, setName] = useState('')
  const [type, setType] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        'http://localhost:5000/api/schools/schools',
        {
          name,
          description: type,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      console.log('School added:', response.data)
      setSuccessMessage('School added successfully!')
      setName('')
      setType('')
      setTimeout(() => {
        setSuccessMessage('')
      }, 3000)
    } catch (error) {
      console.error('Failed to add school:', error)
    }
  }

  return (
    <CContainer>
      <CRow className="justify-content-center">
        <CCol md={8}>
          <CCard>
            <CCardHeader>Add New School</CCardHeader>
            <CCardBody>
              <CForm onSubmit={handleSubmit}>
                <CRow className="mb-3">
                  <CCol>
                    <CFormInput
                      type="text"
                      placeholder="School Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </CCol>
                </CRow>
                <CRow className="mb-3">
                  <CCol>
                    <CFormSelect value={type} onChange={(e) => setType(e.target.value)} required>
                      <option value="" disabled>
                        School Type
                      </option>
                      <option value="Law School">Law School</option>
                      <option value="IT School">IT School</option>
                      <option value="Business School">Business School</option>
                    </CFormSelect>
                  </CCol>
                </CRow>
                <CRow>
                  <CCol className="text-right">
                    <CButton type="submit" color="primary">
                      Add School
                    </CButton>
                  </CCol>
                </CRow>
              </CForm>
              {successMessage && (
                <CAlert color="success" className="mt-3">
                  {successMessage}
                </CAlert>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default AddNewSchool
