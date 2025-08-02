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
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
} from '@coreui/react'
import axios from 'axios'

const PaymentOverview = () => {
  const [payments, setPayments] = useState([])
  const [modal, setModal] = useState(false)
  const [currentPayment, setCurrentPayment] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get('http://localhost:5000/api/payments/pending', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setPayments(response.data)
      } catch (error) {
        console.error('Error fetching pending payments:', error)
      }
    }

    fetchPayments()
  }, [])

  const handlePayFee = async () => {
    navigate('/financials/payment')
  }

  return (
    <div>
      <CCard>
        <CCardHeader>Pending Payments</CCardHeader>
        <CCardBody>
          <CTable hover>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Course Name</CTableHeaderCell>
                <CTableHeaderCell>Amount</CTableHeaderCell>
                <CTableHeaderCell>Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {payments.map((payment) => (
                <CTableRow key={payment.id}>
                  <CTableDataCell>{payment.courseName}</CTableDataCell>
                  <CTableDataCell>{payment.amount}</CTableDataCell>
                  <CTableDataCell>
                    <CButton color="success" onClick={handlePayFee}>
                      Pay Now
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>
    </div>
  )
}

export default PaymentOverview
