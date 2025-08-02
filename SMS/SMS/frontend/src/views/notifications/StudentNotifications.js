import React from 'react'
import { CCard, CCardBody, CCardHeader, CCol, CContainer, CRow } from '@coreui/react'

const StudentNotifications = () => {
  return (
    <CContainer>
      <CRow>
        <CCol>
          <CCard>
            <CCardHeader>Student Notifications</CCardHeader>
            <CCardBody>
              <h1>Student Notifications</h1>
              <p>This is the student notifications page.</p>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default StudentNotifications
