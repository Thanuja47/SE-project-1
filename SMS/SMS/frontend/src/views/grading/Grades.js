import React, { useEffect, useState } from 'react'
import axios from 'axios'
import PropTypes from 'prop-types'
import { CCard, CCardBody, CCardHeader, CCol, CContainer, CRow } from '@coreui/react'

const PerformanceReports = ({ studentId }) => {
  const [grades, setGrades] = useState([])

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/grades/student/${studentId}`)
        setGrades(response.data)
      } catch (error) {
        console.error('Error fetching grades', error)
      }
    }

    fetchGrades()
  }, [studentId])

  return (
    <CContainer>
      <CRow>
        <CCol>
          <CCard>
            <CCardHeader>Grades</CCardHeader>
            <CCardBody>
              <p>Gades of your Courses</p>
              <ul>
                {grades.map((grade, index) => (
                  <li key={index}>
                    {grade.subject}: {grade.score}
                  </li>
                ))}
              </ul>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  )
}
PerformanceReports.propTypes = {
  studentId: PropTypes.string.isRequired,
}

export default PerformanceReports
