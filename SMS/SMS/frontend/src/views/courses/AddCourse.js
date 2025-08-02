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
  CFormSelect,
  CRow,
  CAlert,
} from '@coreui/react'
import axios from 'axios'

const AddCourse = () => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [schoolId, setSchoolId] = useState('')
  const [courseType, setCourseType] = useState('')
  const [duration, setDuration] = useState('')
  const [deliveryMode, setDeliveryMode] = useState('')
  const [feeAmount, setFeeAmount] = useState('')
  const [schools, setSchools] = useState([])
  const [successMessage, setSuccessMessage] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get('http://localhost:5000/api/schools/schools/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setSchools(response.data)
      } catch (error) {
        console.error('Failed to fetch schools:', error)
      }
    }
    fetchSchools()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        'http://localhost:5000/api/courses',
        {
          name,
          description,
          school_id: schoolId,
          course_type: courseType,
          duration,
          delivery_mode: deliveryMode,
          fee_amount: feeAmount,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      console.log('Course added:', response.data)
      setSuccessMessage('Course and fee structure added successfully!')
      setName('')
      setDescription('')
      setSchoolId('')
      setCourseType('')
      setDuration('')
      setDeliveryMode('')
      setFeeAmount('')
      setTimeout(() => {
        setSuccessMessage('')
      }, 3000)
    } catch (error) {
      console.error('Failed to add course and fee structure:', error)
    }
  }

  return (
    <CContainer>
      <CRow className="justify-content-center">
        <CCol md={8}>
          <CCard>
            <CCardHeader>Add New Course</CCardHeader>
            <CCardBody>
              <CForm onSubmit={handleSubmit}>
                <CRow className="mb-3">
                  <CCol>
                    <CFormInput
                      type="text"
                      placeholder="Course Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </CCol>
                </CRow>
                <CRow className="mb-3">
                  <CCol>
                    <CFormInput
                      type="text"
                      placeholder="Description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                  </CCol>
                </CRow>
                <CRow className="mb-3">
                  <CCol>
                    <CFormSelect
                      value={schoolId}
                      onChange={(e) => setSchoolId(e.target.value)}
                      required
                    >
                      <option value="" disabled>
                        Select School
                      </option>
                      {schools.map((school) => (
                        <option key={school.id} value={school.id}>
                          {school.name}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>
                </CRow>
                <CRow className="mb-3">
                  <CCol>
                    <CFormSelect
                      value={courseType}
                      onChange={(e) => setCourseType(e.target.value)}
                      required
                    >
                      <option value="" disabled>
                        Course Type
                      </option>
                      <option value="certificate">Certificate</option>
                      <option value="diploma">Diploma</option>
                      <option value="degree">Degree</option>
                    </CFormSelect>
                  </CCol>
                </CRow>
                <CRow className="mb-3">
                  <CCol>
                    <CFormInput
                      type="number"
                      placeholder="Duration (in months)"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      required
                    />
                  </CCol>
                </CRow>
                <CRow className="mb-3">
                  <CCol>
                    <CFormSelect
                      value={deliveryMode}
                      onChange={(e) => setDeliveryMode(e.target.value)}
                      required
                    >
                      <option value="" disabled>
                        Delivery Mode
                      </option>
                      <option value="physical">Physical</option>
                      <option value="remote">Remote</option>
                    </CFormSelect>
                  </CCol>
                </CRow>
                <CRow className="mb-3">
                  <CCol>
                    <CFormInput
                      type="number"
                      placeholder="Fee Amount"
                      value={feeAmount}
                      onChange={(e) => setFeeAmount(e.target.value)}
                      required
                    />
                  </CCol>
                </CRow>
                <CRow>
                  <CCol className="text-right">
                    <CButton type="submit" color="primary">
                      Add Course
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

export default AddCourse
