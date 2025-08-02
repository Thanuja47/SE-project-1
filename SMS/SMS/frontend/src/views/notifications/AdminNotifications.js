import React from 'react'
import { CCard, CCardBody, CCardHeader, CCol, CContainer, CRow } from '@coreui/react'

const AdminNotifications = () => {
  return (
    <CContainer>
      <CRow>
        <CCol>
          <CCard>
            <CCardHeader>Admin Notifications</CCardHeader>
            <CCardBody>
              <h1>Admin Notifications</h1>
              <p>This is the admin notifications page.</p>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default AdminNotifications
