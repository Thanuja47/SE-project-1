import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CInputGroup,
  CInputGroupText,
} from '@coreui/react'
import axios from 'axios'

const PaymentManagement = () => {
  const [studentId, setStudentId] = useState('')
  const [courseId, setCourseId] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState('')
  const [payments, setPayments] = useState([])
  const [students, setStudents] = useState([])
  const [studentCourses, setStudentCourses] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteModal, setDeleteModal] = useState(false)
  const [paymentToDelete, setPaymentToDelete] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')

  const navigator = useNavigate()

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('http://localhost:5000/api/payments/admin/payments', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setPayments(response.data)
    } catch (error) {
      console.error('Failed to fetch payments:', error)
    }
  }

  useEffect(() => {
    fetchPayments()
    console.log('Payments :', payments)
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

    fetchStudents()
  }, [])

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

  const generateTransactionId = () => {
    return 'TRX_' + Math.random().toString(36).substr(2, 9)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        'http://localhost:5000/api/payments/pay',
        {
          student_id: studentId,
          course_id: courseId,
          amount,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      fetchPayments() // Refresh the payments table
      setStudentId('')
      setCourseId('')
      setAmount('')
      setDate('')
      setSuccessMessage('Payment successfully added!')
      setTimeout(() => setSuccessMessage(''), 3000) // Hide message after 3 seconds
    } catch (error) {
      console.error('Failed to add payment:', error)
    }
  }

  const handleEditPayment = (id) => {
    // Navigate to the edit payment page
    navigator(`/financials/EditPayment/${id}`)
  }

  const handleDeletePayment = async () => {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`http://localhost:5000/api/payments/${paymentToDelete.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setPayments(payments.filter((payment) => payment.id !== paymentToDelete.id))
      setDeleteModal(false)
      setPaymentToDelete(null)
    } catch (error) {
      console.error('Failed to delete payment:', error)
    }
  }

  const confirmDeletePayment = (payment) => {
    setPaymentToDelete(payment)
    setDeleteModal(true)
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  const filteredPayments = payments.filter(
    (payment) =>
      payment.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.amount?.toString().includes(searchTerm) ||
      payment.status?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const formatDate = (date) => {
    if (!date) return 'Pending'
    else {
      const options = { year: 'numeric', month: 'long', day: 'numeric' }
      return new Date(date).toLocaleDateString(undefined, options)
    }
  }

  return (
    <CContainer>
      <CRow className="mb-4">
        <CCol>
          <h1>Payment Management</h1>
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
        <CCardHeader>Add Payment</CCardHeader>
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
                  Add Payment
                </CButton>
              </CCol>
            </CRow>
          </CForm>
        </CCardBody>
      </CCard>

      <CCard className="mt-4">
        <CCardHeader>Payments</CCardHeader>
        <CCardBody>
          <CInputGroup className="mb-3">
            <CInputGroupText>Search</CInputGroupText>
            <CFormInput
              type="text"
              placeholder="Search by student name, amount, or status"
              value={searchTerm}
              onChange={handleSearch}
            />
          </CInputGroup>
          <CTable hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Student</CTableHeaderCell>
                <CTableHeaderCell>Amount</CTableHeaderCell>
                <CTableHeaderCell>Status</CTableHeaderCell>
                <CTableHeaderCell>Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {filteredPayments.map((payment) => {
                return (
                  <CTableRow key={payment.id}>
                    <CTableDataCell>{payment.student_name}</CTableDataCell>
                    <CTableDataCell>{payment.amount ?? 'N/A'}</CTableDataCell>
                    <CTableDataCell>{formatDate(payment.payment_date) ?? 'N/A'}</CTableDataCell>
                    <CTableDataCell>
                      <CButton color="warning" onClick={() => handleEditPayment(payment.id)}>
                        Edit
                      </CButton>{' '}
                      <CButton color="danger" onClick={() => confirmDeletePayment(payment)}>
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
          Are you sure you want to delete the payment made by &quot;{paymentToDelete?.student_name}
          &quot;?
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setDeleteModal(false)}>
            Cancel
          </CButton>
          <CButton color="danger" onClick={handleDeletePayment}>
            Delete
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  )
}

export default PaymentManagement
