import React, { useState, useEffect } from 'react'
import {
  CForm,
  CFormLabel,
  CFormInput,
  CButton,
  CContainer,
  CCard,
  CCardBody,
  CCardHeader,
  CAlert,
  CFormSelect,
} from '@coreui/react'

const validateCreditCard = (cardNumber) => {
  const regex = /^\d{16}$/
  if (!regex.test(cardNumber)) {
    return false
  }

  let sum = 0
  for (let i = 0; i < cardNumber.length; i++) {
    let digit = parseInt(cardNumber[i])
    if (i % 2 === 0) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }
    sum += digit
  }
  return sum % 10 === 0
}

const PaymentForm = () => {
  const [courses, setCourses] = useState([])
  const [pendingPayments, setPendingPayments] = useState([])
  const [selectedCourse, setSelectedCourse] = useState('')
  const [amount, setAmount] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [cvv, setCvv] = useState('')
  const [message, setMessage] = useState('')
  const [alertType, setAlertType] = useState('success')

  useEffect(() => {
    // Fetch courses with pending payments
    const fetchPendingPayments = async () => {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/payments/pending', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      setPendingPayments(data)
    }

    // Fetch all courses
    const fetchCourses = async () => {
      const response = await fetch('http://localhost:5000/api/courses')
      const data = await response.json()
      setCourses(data)
    }

    fetchPendingPayments()
    fetchCourses()
  }, [])

  // Merge course names into pending payments data
  const mergedData = pendingPayments.map((payment) => {
    const course = courses.find((course) => course.id === payment.course_id)
    return {
      ...payment,
      course_name: course ? course.name : 'Unknown Course',
    }
  })

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate credit card
    if (!validateCreditCard(cardNumber)) {
      setAlertType('danger')
      setMessage('Invalid credit card number')
      return
    }

    const paymentData = {
      course_id: selectedCourse,
      amount,
      card_number: cardNumber,
      expiry_date: expiryDate,
      cvv,
    }

    const response = await fetch('/api/pay', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    })

    const result = await response.json()

    if (response.ok) {
      setAlertType('success')
      setMessage(`Payment Successful! Transaction ID: ${result.transaction_id}`)
    } else {
      setAlertType('danger')
      setMessage(`Payment Failed! ${result.message}`)
    }
  }

  return (
    <CContainer>
      <CCard>
        <CCardHeader>
          <h2>Make a Payment</h2>
        </CCardHeader>
        <CCardBody>
          {message && <CAlert color={alertType}>{message}</CAlert>}
          <CForm onSubmit={handleSubmit}>
            <div className="mb-3">
              <CFormLabel htmlFor="course_id">Course</CFormLabel>
              <CFormSelect
                id="course_id"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                required
              >
                <option value="">Select a course</option>
                {mergedData.map((course) => (
                  <option key={course.id} value={course.course_id}>
                    {course.course_name}
                  </option>
                ))}
              </CFormSelect>
            </div>
            <div className="mb-3">
              <CFormLabel htmlFor="amount">Amount</CFormLabel>
              <CFormInput
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <CFormLabel htmlFor="card_number">Card Number</CFormLabel>
              <CFormInput
                type="text"
                id="card_number"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <CFormLabel htmlFor="expiry_date">Expiry Date</CFormLabel>
              <CFormInput
                type="text"
                id="expiry_date"
                placeholder="MM/YY"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <CFormLabel htmlFor="cvv">CVV</CFormLabel>
              <CFormInput
                type="password"
                id="cvv"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                required
              />
            </div>
            <CButton type="submit" color="primary">
              Submit
            </CButton>
          </CForm>
        </CCardBody>
      </CCard>
    </CContainer>
  )
}

export default PaymentForm
