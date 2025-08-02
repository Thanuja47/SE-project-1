import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CForm,
  CFormLabel,
  CFormSelect,
  CFormInput,
} from '@coreui/react'
import axios from 'axios'

const FeeStructure = () => {
  const [feeStructures, setFeeStructures] = useState([])
  const [currentFee, setCurrentFee] = useState({ courseId: '', feeAmount: '' })
  const [courses, setCourses] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    // Fetch fee structures from the backend with Bearer token
    const fetchFeeStructures = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get('http://localhost:5000/api/fee_structures', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setFeeStructures(response.data)
      } catch (error) {
        console.error('Error fetching fee structures:', error)
      }
    }

    // Fetch courses for the dropdown list
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
        console.error('Error fetching courses:', error)
      }
    }

    fetchFeeStructures()
    fetchCourses()
  }, [])

  const handleAddEditFee = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token')

    try {
      if (currentFee.id) {
        // Update fee structure
        await axios.put(
          `http://localhost:5000/api/fee_structures/${currentFee.id}`,
          { course_id: currentFee.courseId, fee_amount: currentFee.feeAmount },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )
        setFeeStructures(feeStructures.map((f) => (f.id === currentFee.id ? currentFee : f)))
      } else {
        // Add new fee structure
        const response = await axios.post(
          'http://localhost:5000/api/fee_structures',
          { course_id: currentFee.courseId, fee_amount: currentFee.feeAmount },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )
        setFeeStructures([...feeStructures, response.data])
      }
      setCurrentFee({ courseId: '', feeAmount: '' })
      navigate('/financials/fees')
    } catch (error) {
      console.error('Error adding/updating fee structure:', error)
    }
  }

  const handleDeleteFee = async (id) => {
    const token = localStorage.getItem('token')

    try {
      await axios.delete(`http://localhost:5000/api/fee_structures/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setFeeStructures(feeStructures.filter((f) => f.id !== id))
    } catch (error) {
      console.error('Error deleting fee structure:', error)
    }
  }

  return (
    <div>
      <CCard>
        <CCardHeader>Add Fee Structure</CCardHeader>
        <CCardBody>
          <CForm onSubmit={handleAddEditFee}>
            <div className="mb-3">
              <CFormLabel>Course</CFormLabel>
              <CFormSelect
                value={currentFee.courseId}
                onChange={(e) => setCurrentFee({ ...currentFee, courseId: e.target.value })}
                required
              >
                <option value="">Select a course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </CFormSelect>
            </div>
            <div className="mb-3">
              <CFormLabel>Fee Amount</CFormLabel>
              <CFormInput
                type="number"
                value={currentFee.feeAmount}
                onChange={(e) => setCurrentFee({ ...currentFee, feeAmount: e.target.value })}
                required
              />
            </div>
            <CButton color="primary" type="submit">
              Save
            </CButton>
          </CForm>
        </CCardBody>
      </CCard>
      <br />
      <CCard>
        <CCardHeader>Fee Structures</CCardHeader>
        <CCardBody>
          <CTable hover>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Course Name</CTableHeaderCell>
                <CTableHeaderCell>Fee Amount</CTableHeaderCell>
                <CTableHeaderCell>Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {feeStructures.map((fee) => {
                const course = courses.find((c) => c.id === fee.course_id)
                return (
                  <CTableRow key={fee.id}>
                    <CTableDataCell>{course ? course.name : 'Unknown Course'}</CTableDataCell>
                    <CTableDataCell>{fee.fee_amount}</CTableDataCell>
                    <CTableDataCell>
                      <CButton
                        color="info"
                        onClick={() => setCurrentFee({ ...fee, courseId: course?.id })}
                      >
                        Edit
                      </CButton>
                      {'  |  '}
                      <CButton color="danger" onClick={() => handleDeleteFee(fee.id)}>
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
    </div>
  )
}

export default FeeStructure
