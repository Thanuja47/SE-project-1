import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
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
  CAlert,
} from '@coreui/react'
import axios from 'axios'

const EditSchool = () => {
  const { id } = useParams()
  const [name, setName] = useState('')
  const [type, setType] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchSchool = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(`http://localhost:5000/api/schools/schools/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const school = response.data
        setName(school.name)
        setType(school.description)
      } catch (error) {
        console.error('Failed to fetch school:', error)
      }
    }

    fetchSchool()
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const response = await axios.put(
        `http://localhost:5000/api/schools/schools/${id}`,
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
      console.log('School updated:', response.data)
      setSuccessMessage('School updated successfully!')
      setTimeout(() => {
        setSuccessMessage('')
        navigate('/schools')
      }, 3000)
    } catch (error) {
      console.error('Failed to update school:', error)
    }
  }

  return (
    <CContainer>
      <CRow className="justify-content-center">
        <CCol md={8}>
          <CCard>
            <CCardHeader>Edit School</CCardHeader>
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
                      Update School
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

export default EditSchool
