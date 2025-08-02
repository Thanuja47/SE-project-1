import React, { useState, useEffect } from 'react'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
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
  CFormSelect,
  CContainer,
  CRow,
  CCol,
} from '@coreui/react'
import axios from 'axios'

const ReportGenerator = () => {
  const [reportType, setReportType] = useState('')
  const [report, setReport] = useState('')
  const [reportData, setReportData] = useState([])

  const reportTypes = {
    'School and Course Management': [
      'School_Overview_Report',
      'Course_Details_Report',
      'Course_Enrollment_Report',
    ],
    'Student Management': ['Student_Registration_Report', 'Student_Profile_Report'],
    'Class Management': ['Class_Schedule_Report', 'Attendance_Report'],
    'Financial Management': [
      'Fee_Structure_Report',
      'Payment_History_Report',
      'Pending_Payments_Report',
    ],
    'Grading and Performance Tracking': ['Grades_Report', 'Performance_Report'],
  }

  useEffect(() => {
    if (report) {
      const fetchReportData = async () => {
        try {
          const token = localStorage.getItem('token')
          const response = await axios.get(`http://localhost:5000/api/reports/${report}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          setReportData(response.data)
        } catch (error) {
          console.error('Error fetching report data:', error)
        }
      }
      fetchReportData()
    }
  }, [report])

  const handleDownloadReport = () => {
    // Generate PDF
    const doc = new jsPDF()
    const tableColumn = Object.keys(reportData[0])
    const tableRows = []

    reportData.forEach((data) => {
      const rowData = tableColumn.map((column) => data[column])
      tableRows.push(rowData)
    })

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
    })

    doc.save(`${report}.pdf`)
  }

  const renderTableHeaders = () => {
    if (reportData.length > 0) {
      const headers = Object.keys(reportData[0])
      return (
        <CTableRow>
          {headers.map((header) => (
            <CTableHeaderCell key={header}>
              {header.replace(/_/g, ' ').toUpperCase()}
            </CTableHeaderCell>
          ))}
        </CTableRow>
      )
    }
    return null
  }

  const renderTableRows = () => {
    return reportData.map((row, index) => (
      <CTableRow key={index}>
        {Object.values(row).map((value, idx) => (
          <CTableDataCell key={idx}>{value}</CTableDataCell>
        ))}
      </CTableRow>
    ))
  }

  return (
    <CContainer>
      <CRow className="mb-4">
        <CCol>
          <h1>Report Generator</h1>
        </CCol>
      </CRow>
      <CCard>
        <CCardHeader>
          Generate Report
          <CRow className="mt-3">
            <CCol>
              <CFormSelect value={reportType} onChange={(e) => setReportType(e.target.value)}>
                <option value="">Select Report Type</option>
                {Object.keys(reportTypes).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
          </CRow>
          {reportType && (
            <CRow className="mt-3">
              <CCol>
                <CFormSelect value={report} onChange={(e) => setReport(e.target.value)}>
                  <option value="">Select Report</option>
                  {reportTypes[reportType].map((rep) => (
                    <option key={rep} value={rep}>
                      {rep.replace(/_/g, ' ')}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
            </CRow>
          )}
          {report && (
            <CRow className="mt-3">
              <CCol className="text-right">
                <CButton color="primary" onClick={handleDownloadReport}>
                  Download Report
                </CButton>
              </CCol>
            </CRow>
          )}
        </CCardHeader>
        <CCardBody>
          {report && reportData.length > 0 && (
            <CTable hover>
              <CTableHead>{renderTableHeaders()}</CTableHead>
              <CTableBody>{renderTableRows()}</CTableBody>
            </CTable>
          )}
        </CCardBody>
      </CCard>
    </CContainer>
  )
}

export default ReportGenerator
