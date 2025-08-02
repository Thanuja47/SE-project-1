import React, { useState, useEffect } from 'react'
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
import { useParams, useHistory } from 'react-router-dom'
import axios from 'axios'

const EditPayment = () => {
  const { id } = useParams()
  const history = useHistory()
  const [studentId, setStudentId] = useState('')
  const [courseId, setCourseId] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState('')
  const [students, setStudents] = useState([])
  const [studentCourses, setStudentCourses] = useState([])
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(`http://localhost:5000/api/payments/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const payment = response.data
        setStudentId(payment.student_id)
        setCourseId(payment.course_id)
        setAmount(payment.amount)
        setDate(payment.date)
      } catch (error) {
        console.error('Failed to fetch payment:', error)
      }
    }

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
        console.error('Failed to fetch students:', error)
      }
    }

    fetchPayment()
    fetchStudents()
  }, [id])

  const handleStudentChange = async (e) => {
    const selectedStudentId = e.target.value
    setStudentId(selectedStudentId)

    if (selectedStudentId) {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(
          `http://localhost:5000/api/students/${selectedStudentId}/courses`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )
        setStudentCourses(response.data)
      } catch (error) {
        console.error('Failed to fetch student courses:', error)
      }
    } else {
      setStudentCourses([])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      await axios.put(
        `http://localhost:5000/api/payments/${id}`,
        {
          student_id: studentId,
          course_id: courseId,
          amount,
          date,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      setSuccessMessage('Payment successfully updated!')
      setTimeout(() => setSuccessMessage(''), 3000) // Hide message after 3 seconds
      history.push('/payment-management') // Redirect to the payment management page
    } catch (error) {
      console.error('Failed to update payment:', error)
    }
  }

  return (
    <CContainer>
      <CRow className="mb-4">
        <CCol>
          <h1>Edit Payment</h1>
        </CCol>
      </CRow>

      {successMessage && (
        <CRow className="mb-4">
          <CCol>
            <div className="alert alert-success">{successMessage}</div>
          </CCol>
        </CRow>
      )}

      <CCard>
        <CCardHeader>Edit Payment</CCardHeader>
        <CCardBody>
          <CForm onSubmit={handleSubmit}>
            <CRow className="mb-3">
              <CCol>
                <CFormSelect value={studentId} onChange={handleStudentChange} required>
                  <option value="" disabled>
                    Select Student
                  </option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.first_name} {student.last_name}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              {studentCourses.length > 0 && (
                <CCol>
                  <CFormSelect
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    required
                  >
                    <option value="" disabled>
                      Select Course
                    </option>
                    {studentCourses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.name}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
              )}
            </CRow>
            <CRow className="mb-3">
              <CCol>
                <CFormInput
                  type="number"
                  placeholder="Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </CCol>
              <CCol>
                <CFormInput
                  type="date"
                  placeholder="Date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </CCol>
            </CRow>
            <CRow>
              <CCol className="text-right">
                <CButton type="submit" color="primary">
                  Update Payment
                </CButton>
              </CCol>
            </CRow>
          </CForm>
        </CCardBody>
      </CCard>
    </CContainer>
  )
}

export default EditPayment
