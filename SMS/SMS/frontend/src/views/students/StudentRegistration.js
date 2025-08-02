import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CFormSelect,
  CRow,
  CAlert,
  CInputGroup,
  CInputGroupText,
} from '@coreui/react'
import {
  cilLockLocked,
  cilUser,
  cilScreenSmartphone,
  cilLocationPin,
  cilBirthdayCake,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import axios from 'axios'

const StudentRegistration = () => {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [dob, setDob] = useState('')
  const [schoolId, setSchoolId] = useState('')
  const [courseId, setCourseId] = useState('')
  const [schools, setSchools] = useState([])
  const [courses, setCourses] = useState([])
  const [successMessage, setSuccessMessage] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchSchoolsAndCourses = async () => {
      try {
        const [schoolsResponse, coursesResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/schools/schools'),
          axios.get('http://localhost:5000/api/courses'),
        ])
        setSchools(schoolsResponse.data)
        setCourses(coursesResponse.data)
      } catch (error) {
        console.error('Failed to fetch schools and courses:', error)
      }
    }

    fetchSchoolsAndCourses()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post('http://localhost:5000/api/students/register', {
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        phone,
        address,
        dob,
        school_id: schoolId,
        enrolled_course: courseId,
      })
      console.log('Student registered:', response.data)
      setSuccessMessage('Student registered successfully!')
      setFirstName('')
      setLastName('')
      setEmail('')
      setPassword('')
      setPhone('')
      setAddress('')
      setDob('')
      setSchoolId('')
      setCourseId('')
      setTimeout(() => {
        setSuccessMessage('')
        navigate('/')
      }, 3000)
    } catch (error) {
      console.error('Failed to register student:', error)
    }
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={9} lg={7} xl={6}>
            <CCard className="mx-4">
              <CCardBody className="p-4">
                <CForm onSubmit={handleSubmit}>
                  <h1>Register</h1>
                  <p className="text-body-secondary">Create your account</p>
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilUser} />
                    </CInputGroupText>
                    <CFormInput
                      placeholder="First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </CInputGroup>
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilUser} />
                    </CInputGroupText>
                    <CFormInput
                      placeholder="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </CInputGroup>
                  <CInputGroup className="mb-3">
                    <CInputGroupText>@</CInputGroupText>
                    <CFormInput
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </CInputGroup>
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilLockLocked} />
                    </CInputGroupText>
                    <CFormInput
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </CInputGroup>
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilLockLocked} />
                    </CInputGroupText>
                    <CFormInput
                      type="password"
                      placeholder="Repeat Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </CInputGroup>
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilScreenSmartphone} />
                    </CInputGroupText>
                    <CFormInput
                      placeholder="Phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </CInputGroup>
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilLocationPin} />
                    </CInputGroupText>
                    <CFormInput
                      placeholder="Address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                    />
                  </CInputGroup>
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilBirthdayCake} />
                    </CInputGroupText>
                    <CFormInput
                      type="date"
                      placeholder="Date of Birth"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      required
                    />
                  </CInputGroup>
                  <CInputGroup className="mb-3">
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
                  </CInputGroup>
                  <CInputGroup className="mb-3">
                    <CFormSelect
                      value={courseId}
                      onChange={(e) => setCourseId(e.target.value)}
                      required
                    >
                      <option value="" disabled>
                        Select Course
                      </option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.name}
                        </option>
                      ))}
                    </CFormSelect>
                  </CInputGroup>
                  <div className="d-grid">
                    <CButton type="submit" color="success">
                      Create Account
                    </CButton>
                  </div>
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
    </div>
  )
}

export default StudentRegistration
