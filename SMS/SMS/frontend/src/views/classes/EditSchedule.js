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

const EditSchedule = () => {
  const { id } = useParams()
  const [courseId, setCourseId] = useState('')
  const [instructorId, setInstructorId] = useState('')
  const [schedule, setSchedule] = useState('')
  const [location, setLocation] = useState('')
  const [meetingLink, setMeetingLink] = useState('')
  const [courses, setCourses] = useState([])
  const [instructors, setInstructors] = useState([])
  const [successMessage, setSuccessMessage] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchClass = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(`http://localhost:5000/api/classes/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const cls = response.data
        setCourseId(cls.course_id)
        setInstructorId(cls.instructor_id)
        setSchedule(new Date(cls.schedule).toISOString().slice(0, 16)) // Format the schedule to 'YYYY-MM-DDTHH:MM'
        setLocation(cls.location)
        setMeetingLink(cls.meeting_link)
      } catch (error) {
        console.error('Failed to fetch class:', error)
      }
    }

    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get('http://localhost:5000/api/courses', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setCourses(response.data)
      } catch (error) {
        console.error('Failed to fetch courses:', error)
      }
    }

    const fetchInstructors = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get('http://localhost:5000/api/instructors', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setInstructors(response.data)
      } catch (error) {
        console.error('Failed to fetch instructors:', error)
      }
    }

    fetchClass()
    fetchCourses()
    fetchInstructors()
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const response = await axios.put(
        `http://localhost:5000/api/classes/${id}`,
        {
          course_id: courseId,
          instructor_id: instructorId,
          schedule,
          location,
          meeting_link: meetingLink,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      console.log('Class updated:', response.data)
      setSuccessMessage('Class updated successfully!')
      setTimeout(() => {
        setSuccessMessage('')
        navigate('/classes/schedule')
      }, 3000)
    } catch (error) {
      console.error('Failed to update class:', error)
    }
  }

  return (
    <CContainer>
      <CRow className="justify-content-center">
        <CCol md={8}>
          <CCard>
            <CCardHeader>Edit Schedule</CCardHeader>
            <CCardBody>
              <CForm onSubmit={handleSubmit}>
                <CRow className="mb-3">
                  <CCol>
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
                  </CCol>
                  <CCol>
                    <CFormSelect
                      value={instructorId}
                      onChange={(e) => setInstructorId(e.target.value)}
                      required
                    >
                      <option value="" disabled>
                        Select Instructor
                      </option>
                      {instructors.map((instructor) => (
                        <option key={instructor.id} value={instructor.id}>
                          {instructor.name}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>
                </CRow>
                <CRow className="mb-3">
                  <CCol>
                    <CFormInput
                      type="datetime-local"
                      placeholder="Schedule"
                      value={schedule}
                      onChange={(e) => setSchedule(e.target.value)}
                      required
                    />
                  </CCol>
                  <CCol>
                    <CFormInput
                      type="text"
                      placeholder="Location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </CCol>
                </CRow>
                <CRow className="mb-3">
                  <CCol>
                    <CFormInput
                      type="text"
                      placeholder="Meeting Link"
                      value={meetingLink}
                      onChange={(e) => setMeetingLink(e.target.value)}
                    />
                  </CCol>
                </CRow>
                <CRow>
                  <CCol className="text-right">
                    <CButton type="submit" color="primary">
                      Update Class
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

export default EditSchedule
