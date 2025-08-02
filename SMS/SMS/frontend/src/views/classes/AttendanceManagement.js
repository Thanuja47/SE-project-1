import React, { useState, useEffect } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CContainer,
  CForm,
  CFormCheck,
  CFormSelect,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CAlert,
  CSpinner,
} from '@coreui/react'
import axios from 'axios'

const AttendanceManagement = () => {
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [students, setStudents] = useState([])
  const [attendance, setAttendance] = useState({})
  const [alertVisible, setAlertVisible] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
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
  }, [])

  useEffect(() => {
    if (selectedClass) {
      const fetchStudents = async () => {
        try {
          const token = localStorage.getItem('token')
          const response = await axios.get(
            `http://localhost:5000/api/classes/class/${selectedClass}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          )
          setStudents(response.data)
          const initialAttendance = response.data.reduce((acc, student) => {
            acc[student.id] = false
            return acc
          }, {})
          setAttendance(initialAttendance)
        } catch (error) {
          console.error('Failed to fetch students:', error)
        }
      }

      fetchStudents()
    }
  }, [selectedClass])

  const handleAttendanceChange = (studentId) => {
    setAttendance((prevAttendance) => ({
      ...prevAttendance,
      [studentId]: !prevAttendance[studentId],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      await axios.post(
        `http://localhost:5000/api/classes/${selectedClass}/attendance`,
        { attendance },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      setAlertVisible(true)
    } catch (error) {
      console.error('Failed to record attendance:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <CContainer>
      {loading && (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9999,
          }}
        >
          <CSpinner color="primary" style={{ width: '3rem', height: '3rem' }} />
        </div>
      )}
      <CRow className="mb-4">
        <CCol>
          <h1>Attendance Management</h1>
        </CCol>
      </CRow>
      <CCard>
        <CCardHeader>Select Class</CCardHeader>
        <CCardBody>
          <CForm onSubmit={handleSubmit}>
            <CRow className="mb-3">
              <CCol>
                <CFormSelect
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Select Class
                  </option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.course_name} - {cls.name} ({cls.code})
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
            </CRow>
            {students.length > 0 && (
              <CCard className="mt-4">
                <CCardHeader>Students</CCardHeader>
                <CCardBody>
                  <CTable hover responsive>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>#</CTableHeaderCell>
                        <CTableHeaderCell>Name</CTableHeaderCell>
                        <CTableHeaderCell>Present</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {students.map((student, index) => (
                        <CTableRow key={student.id}>
                          <CTableDataCell>{index + 1}</CTableDataCell>
                          <CTableDataCell>{`${student.first_name} ${student.last_name}`}</CTableDataCell>
                          <CTableDataCell>
                            <CFormCheck
                              checked={attendance[student.id]}
                              onChange={() => handleAttendanceChange(student.id)}
                            />
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                </CCardBody>
              </CCard>
            )}
            <CRow className="mt-4">
              <CCol className="text-right">
                <CButton type="submit" color="primary" disabled={loading}>
                  Record Attendance
                </CButton>
              </CCol>
            </CRow>
          </CForm>
        </CCardBody>
      </CCard>
      {alertVisible && (
        <CAlert color="success" onClose={() => setAlertVisible(false)} dismissible>
          Attendance recorded successfully!
        </CAlert>
      )}
    </CContainer>
  )
}

export default AttendanceManagement
