import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Select from 'react-select'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormLabel,
  CFormInput,
  CRow,
  CAlert,
} from '@coreui/react'

const AssignGrades = () => {
  const [students, setStudents] = useState([])
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [courses, setCourses] = useState([])
  const [courseId, setCourseId] = useState('')
  const [grade, setGrade] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get('http://localhost:5000/api/students/students', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setStudents(response.data)
      } catch (error) {
        console.error('Error fetching students:', error)
      }
    }

    fetchStudents()
  }, [])

  useEffect(() => {
    const fetchCourses = async () => {
      if (selectedStudent) {
        try {
          const token = localStorage.getItem('token')
          const response = await axios.get(
            `http://localhost:5000/api/students/students/${selectedStudent.value}/courses`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          )
          setCourses(response.data)
        } catch (error) {
          console.error('Error fetching courses:', error)
        }
      }
    }

    fetchCourses()
  }, [selectedStudent])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        'http://localhost:5000/api/grades',
        {
          student_id: selectedStudent.value,
          course_id: courseId,
          grade: grade,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      setMessage(response.data.message)
    } catch (error) {
      setMessage('Error assigning grade')
    }
  }

  const studentOptions = students.map((student) => ({
    value: student.id,
    label: `${student.first_name} ${student.last_name}`,
  }))

  const courseOptions = courses.map((course) => ({
    value: course.id,
    label: course.name,
  }))

  const customStyles = {
    control: (styles) => ({
      ...styles,
      borderColor: '#ced4da',
      backgroundColor: '#212631',
      color: '#fff',
    }),
    menu: (styles) => ({ ...styles, backgroundColor: '#212631' }),
    option: (styles, { isFocused, isSelected }) => ({
      ...styles,
      backgroundColor: isSelected ? '#007bff' : isFocused ? '#e9ecef' : undefined,
      color: isSelected ? '#fff' : isFocused ? '#000' : '#fff', // Default text color to white
    }),
    singleValue: (styles) => ({ ...styles, color: '#fff' }), // Selected value text color
  }

  return (
    <CRow>
      <CCol xs="12" md="6">
        <CCard>
          <CCardHeader>Assign Grades</CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit}>
              <div className="mb-3">
                <CFormLabel htmlFor="student">Select Student</CFormLabel>
                <Select
                  id="student"
                  options={studentOptions}
                  onChange={setSelectedStudent}
                  value={selectedStudent}
                  styles={customStyles}
                  classNamePrefix="react-select"
                />
              </div>
              <div className="mb-3">
                <CFormLabel htmlFor="courseId">Course</CFormLabel>
                <Select
                  id="courseId"
                  options={courseOptions}
                  onChange={(selectedOption) => setCourseId(selectedOption.value)}
                  value={courseOptions.find((option) => option.value === courseId)}
                  styles={customStyles}
                  classNamePrefix="react-select"
                />
              </div>
              <div className="mb-3">
                <CFormLabel htmlFor="grade">Grade</CFormLabel>
                <CFormInput
                  type="text"
                  id="grade"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                />
              </div>
              <CButton type="submit" color="primary">
                Assign Grade
              </CButton>
            </CForm>
            <br></br>
            {message && <CAlert color="success">{message}</CAlert>}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default AssignGrades
