import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import {
  CContainer,
  CRow,
  CCol,
  CCard,
  CCardHeader,
  CCardBody,
  CForm,
  CFormSelect,
  CFormInput,
  CButton,
  CInputGroup,
  CInputGroupText,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'

const ClassScheduling = () => {
  const [courseId, setCourseId] = useState('')
  const [instructorId, setInstructorId] = useState('')
  const [className, setClassName] = useState('')
  const [classCode, setClassCode] = useState('')
  const [schedule, setSchedule] = useState('')
  const [location, setLocation] = useState('')
  const [meetingLink, setMeetingLink] = useState('')
  const [classes, setClasses] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteModal, setDeleteModal] = useState(false)
  const [classToDelete, setClassToDelete] = useState(null)
  const [courses, setCourses] = useState([])
  const [instructors, setInstructors] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
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

    const fetchClasses = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get('http://localhost:5000/api/classes', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setClasses(response.data)
      } catch (error) {
        console.error('Failed to fetch classes:', error)
      }
    }

    fetchClasses()
    fetchCourses()
    fetchInstructors()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        'http://localhost:5000/api/classes',
        {
          course_id: courseId,
          instructor_id: instructorId,
          name: className,
          code: classCode,
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
      setClasses([...classes, response.data])
      setCourseId('')
      setInstructorId('')
      setClassName('')
      setClassCode('')
      setSchedule('')
      setLocation('')
      setMeetingLink('')
      navigate('/classes/schedule')
    } catch (error) {
      console.error('Failed to create class:', error)
    }
  }

  const handleEditClass = (id) => {
    // Navigate to the edit class page
    navigate(`/classes/edit/${id}`)
  }

  const handleDeleteClass = async () => {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`http://localhost:5000/api/classes/${classToDelete.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setClasses(classes.filter((cls) => cls.id !== classToDelete.id))
      setDeleteModal(false)
      setClassToDelete(null)
    } catch (error) {
      console.error('Failed to delete class:', error)
    }
  }

  const confirmDeleteClass = (cls) => {
    setClassToDelete(cls)
    setDeleteModal(true)
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  const filteredClasses = classes.filter((cls) => {
    return (
      (cls.course_id && cls.course_id.toString().includes(searchTerm)) ||
      (cls.instructor_id && cls.instructor_id.toString().includes(searchTerm)) ||
      (cls.name && cls.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (cls.code && cls.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (cls.schedule && cls.schedule.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (cls.location && cls.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (cls.meeting_link && cls.meeting_link.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  })

  console.log('classes:', classes)

  const formatDateTime = (dateTime) => {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }
    return new Date(dateTime).toLocaleDateString(undefined, options)
  }

  return (
    <CContainer>
      <CRow className="mb-4">
        <CCol>
          <h1>Class Scheduling</h1>
        </CCol>
      </CRow>
      <CCard>
        <CCardHeader>Create Class</CCardHeader>
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
                  type="text"
                  placeholder="Class Name"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  required
                />
              </CCol>
              <CCol>
                <CFormInput
                  type="text"
                  placeholder="Class Code"
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value)}
                  required
                />
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
                  Create Class
                </CButton>
              </CCol>
            </CRow>
          </CForm>
        </CCardBody>
      </CCard>

      <CCard className="mt-4">
        <CCardHeader>Scheduled Classes</CCardHeader>
        <CCardBody>
          <CInputGroup className="mb-3">
            <CInputGroupText>Search</CInputGroupText>
            <CFormInput
              type="text"
              placeholder="Search by Course, Instructor, Class name, Class code, Schedule, Location, or Meeting link"
              value={searchTerm}
              onChange={handleSearch}
            />
          </CInputGroup>
          <CTable hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Course</CTableHeaderCell>
                <CTableHeaderCell>Instructor</CTableHeaderCell>
                <CTableHeaderCell>Class Name</CTableHeaderCell>
                <CTableHeaderCell>Class Code</CTableHeaderCell>
                <CTableHeaderCell>Schedule</CTableHeaderCell>
                <CTableHeaderCell>Location</CTableHeaderCell>
                <CTableHeaderCell>Meeting Link</CTableHeaderCell>
                <CTableHeaderCell>Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {filteredClasses.map((cls) => {
                const course = courses.find((course) => course.id === cls.course_id)
                const instructor = instructors.find(
                  (instructor) => instructor.id === cls.instructor_id,
                )
                return (
                  <CTableRow key={cls.id}>
                    <CTableDataCell>{course ? course.name : 'N/A'}</CTableDataCell>
                    <CTableDataCell>{instructor ? instructor.name : 'N/A'}</CTableDataCell>
                    <CTableDataCell>{cls.name}</CTableDataCell>
                    <CTableDataCell>{cls.code}</CTableDataCell>
                    <CTableDataCell>{formatDateTime(cls.schedule)}</CTableDataCell>
                    <CTableDataCell>{cls.location}</CTableDataCell>
                    <CTableDataCell>{cls.meeting_link}</CTableDataCell>
                    <CTableDataCell>
                      <CButton color="warning" onClick={() => handleEditClass(cls.id)}>
                        Edit
                      </CButton>{' '}
                      <CButton color="danger" onClick={() => confirmDeleteClass(cls)}>
                        Delete
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                )
              })}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>

      <CModal visible={deleteModal} onClose={() => setDeleteModal(false)}>
        <CModalHeader>
          <CModalTitle>Confirm Delete</CModalTitle>
        </CModalHeader>
        <CModalBody>
          Are you sure you want to delete the class scheduled on &quot;{classToDelete?.schedule}
          &quot;?
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setDeleteModal(false)}>
            Cancel
          </CButton>
          <CButton color="danger" onClick={handleDeleteClass}>
            Delete
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  )
}

export default ClassScheduling
