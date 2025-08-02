import React, { useState, useEffect } from 'react'
import {
  CContainer,
  CCard,
  CCardBody,
  CCardHeader,
  CListGroup,
  CListGroupItem,
  CFormSelect,
} from '@coreui/react'

const ClassSchedule = () => {
  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState('')
  const [schedule, setSchedule] = useState([])

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
      const fetchSchedule = async () => {
        const response = await fetch(`http://localhost:5000/api/classes/${selectedCourse}/schedule`)
        const data = await response.json()
        setSchedule(data)
      }
      fetchSchedule()
    }
  }, [selectedCourse])

  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', options).format(date)
  }

  return (
    <CContainer>
      <CCard>
        <CCardHeader>
          <h2>Class Schedule</h2>
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
            {schedule.map((classItem) => (
              <CListGroupItem key={classItem.id}>
                {classItem.name} - {formatDate(classItem.schedule)}
              </CListGroupItem>
            ))}
          </CListGroup>
        </CCardBody>
      </CCard>
    </CContainer>
  )
}

export default ClassSchedule
