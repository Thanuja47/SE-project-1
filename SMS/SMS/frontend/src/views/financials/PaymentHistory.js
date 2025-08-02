import React, { useState, useEffect } from 'react'
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
} from '@coreui/react'
import axios from 'axios'

const PaymentHistory = () => {
  const [payments, setPayments] = useState([])

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get('http://localhost:5000/api/payments/student', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setPayments(response.data)
      } catch (error) {
        console.error('Error fetching payment history:', error)
      }
    }

    fetchPaymentHistory()
  }, [])

  return (
    <div>
      <CCard>
        <CCardHeader>Payment History</CCardHeader>
        <CCardBody>
          <CTable hover>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Course Name</CTableHeaderCell>
                <CTableHeaderCell>Amount</CTableHeaderCell>
                <CTableHeaderCell>Payment Date</CTableHeaderCell>
                <CTableHeaderCell>Status</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {payments.map((payment) => (
                <CTableRow key={payment.id}>
                  <CTableDataCell>{payment.courseName}</CTableDataCell>
                  <CTableDataCell>{payment.amount}</CTableDataCell>
                  <CTableDataCell>{payment.paymentDate}</CTableDataCell>
                  <CTableDataCell>{payment.status}</CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>
    </div>
  )
}

export default PaymentHistory
