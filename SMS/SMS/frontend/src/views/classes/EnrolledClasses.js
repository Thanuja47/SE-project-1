import React, { useState, useEffect } from 'react'
import {
  CContainer,
  CCard,
  CCardBody,
  CCardHeader,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from '@coreui/react'

const EnrolledClasses = () => {
  const [classes, setClasses] = useState([])

  useEffect(() => {
    const fetchClasses = async () => {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/enrollments', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      setClasses(data)
    }
    fetchClasses()
  }, [])

  return (
    <CContainer>
      <CCard>
        <CCardHeader>
          <h2>Enrolled Classes</h2>
        </CCardHeader>
        <CCardBody>
          <CTable>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Course Name</CTableHeaderCell>
                <CTableHeaderCell>Class Name</CTableHeaderCell>
                <CTableHeaderCell>Class Code</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {classes.map((classItem) => (
                <CTableRow key={classItem.id}>
                  <CTableDataCell>{classItem.course_name}</CTableDataCell>
                  <CTableDataCell>{classItem.class_name}</CTableDataCell>
                  <CTableDataCell>{classItem.class_code}</CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>
    </CContainer>
  )
}

export default EnrolledClasses
