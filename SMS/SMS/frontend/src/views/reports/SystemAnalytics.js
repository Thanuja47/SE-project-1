import React from 'react'
import { CCard, CCardBody, CCardHeader, CCol, CContainer, CRow } from '@coreui/react'

const SystemAnalytics = () => {
  return (
    <CContainer>
      <CRow>
        <CCol>
          <CCard>
            <CCardHeader>System Analytics</CCardHeader>
            <CCardBody>
              <h1>System Analytics</h1>
              <p>This is the system analytics page.</p>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default SystemAnalytics
