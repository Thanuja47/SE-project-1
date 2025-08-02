import React, { useState, useEffect } from 'react'
import {
  CContainer,
  CCard,
  CCardBody,
  CCardHeader,
  CFormSelect,
  CListGroup,
  CListGroupItem,
  CButton,
} from '@coreui/react'

const ClassEnrollment = () => {
  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState('')
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState(null)

  useEffect(() => {
    const fetchCourses = async () => {
      const response = await fetch('http://localhost:5000/api/courses')
      const data = await response.json()
      setCourses(data)
    }
    fetchCourses()
  }, [])

  useEffect(() => {
    if (selectedCourse) {
      const fetchClasses = async () => {
        const response = await fetch(`http://localhost:5000/api/classes/${selectedCourse}/classes`)
        const data = await response.json()
        setClasses(data)
      }
      fetchClasses()
    }
  }, [selectedCourse])

  const handleClassSelect = (classItem) => {
    setSelectedClass(classItem)
  }

  const handleEnroll = async () => {
    if (selectedClass) {
      // Make an API call to enroll in the selected class
      const response = await fetch(`http://localhost:5000/api/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ classId: selectedClass.id }),
      })
      if (response.ok) {
        alert('Enrolled successfully!')
      } else {
        alert('Failed to enroll.')
      }
    }
  }

  return (
    <CContainer>
      <CCard>
        <CCardHeader>
          <h2>Class Enrollment</h2>
        </CCardHeader>
        <CCardBody>
          <div className="mb-3">
            <CFormSelect value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
              <option value="">Select a course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </CFormSelect>
          </div>
          <CListGroup>
            {classes.map((classItem) => (
              <CListGroupItem
                key={classItem.id}
                onClick={() => handleClassSelect(classItem)}
                active={selectedClass && selectedClass.id === classItem.id}
                style={{ cursor: 'pointer' }}
              >
                {classItem.name}
              </CListGroupItem>
            ))}
          </CListGroup>
          {selectedClass && (
            <div className="mt-3">
              <h5>Class Details</h5>
              <p>
                <strong>Instructor:</strong> {selectedClass.instructor}
              </p>
              <p>
                <strong>Course Fees:</strong> ${selectedClass.fees}
              </p>
              <CButton color="primary" onClick={handleEnroll}>
                Enroll
              </CButton>
            </div>
          )}
        </CCardBody>
      </CCard>
    </CContainer>
  )
}

export default ClassEnrollment
