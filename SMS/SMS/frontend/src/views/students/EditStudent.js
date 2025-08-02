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

const EditStudent = () => {
  const { id } = useParams()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [dob, setDob] = useState('')
  const [schoolId, setSchoolId] = useState('')
  const [schools, setSchools] = useState([])
  const [successMessage, setSuccessMessage] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(`http://localhost:5000/api/students/students/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const student = response.data
        setFirstName(student.first_name)
        setLastName(student.last_name)
        setEmail(student.email)
        setPhone(student.phone)
        setAddress(student.address)
        setDob(student.dob.split('T')[0])
        setSchoolId(student.school_id)
        console.log('Fetched student:', student)
      } catch (error) {
        console.error('Failed to fetch student:', error)
      }
    }

    const fetchSchools = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get('http://localhost:5000/api/schools/schools', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setSchools(response.data)
        console.log('Fetched schools:', response.data)
      } catch (error) {
        console.error('Failed to fetch schools:', error)
      }
    }

    fetchStudent().then(fetchSchools)
  }, [id])

  useEffect(() => {
    if (schools.length > 0 && schoolId) {
      const selectedSchool = schools.find((school) => school.id === schoolId)
      if (selectedSchool) {
        setSchoolId(selectedSchool.id)
        console.log('Selected school:', selectedSchool.id)
      }
    }
  }, [schools])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const response = await axios.put(
        `http://localhost:5000/api/students/students/${id}`,
        {
          first_name: firstName,
          last_name: lastName,
          email,
          phone,
          address,
          dob,
          school_id: schoolId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      console.log('Student updated:', response.data)
      setSuccessMessage('Student updated successfully!')
      setTimeout(() => {
        setSuccessMessage('')
        navigate('/students/manage')
      }, 3000)
    } catch (error) {
      console.error('Failed to update student:', error)
    }
  }

  return (
    <CContainer>
      <CRow className="justify-content-center">
        <CCol md={8}>
          <CCard>
            <CCardHeader>Edit Student</CCardHeader>
            <CCardBody>
              <CForm onSubmit={handleSubmit}>
                <CRow className="mb-3">
                  <CCol>
                    <CFormInput
                      type="text"
                      placeholder="First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </CCol>
                  <CCol>
                    <CFormInput
                      type="text"
                      placeholder="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </CCol>
                </CRow>
                <CRow className="mb-3">
                  <CCol>
                    <CFormInput
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </CCol>
                  <CCol>
                    <CFormInput
                      type="text"
                      placeholder="Phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </CCol>
                </CRow>
                <CRow className="mb-3">
                  <CCol>
                    <CFormInput
                      type="text"
                      placeholder="Address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                    />
                  </CCol>
                  <CCol>
                    <CFormInput
                      type="date"
                      placeholder="Date of Birth"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
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
                <CRow>
                  <CCol className="text-right">
                    <CButton type="submit" color="primary">
                      Update Student
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

export default EditStudent
