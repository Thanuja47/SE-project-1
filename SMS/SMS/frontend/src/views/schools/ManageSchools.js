import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CContainer,
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
} from '@coreui/react'
import axios from 'axios'

const ManageSchools = () => {
  const [schools, setSchools] = useState([])
  const [deleteModal, setDeleteModal] = useState(false)
  const [schoolToDelete, setSchoolToDelete] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Fetch schools
    const fetchSchools = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get('http://localhost:5000/api/schools/schools/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setSchools(response.data)
      } catch (error) {
        console.error('Failed to fetch schools:', error)
      }
    }

    fetchSchools()
  }, [])

  const handleAddNewSchool = () => {
    navigate('/schools/add')
  }

  const handleEditSchool = (id) => {
    navigate(`/schools/edit/${id}`)
  }

  const handleDeleteSchool = async () => {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`http://localhost:5000/api/schools/schools/${schoolToDelete.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setSchools(schools.filter((school) => school.id !== schoolToDelete.id))
      setDeleteModal(false)
      setSchoolToDelete(null)
    } catch (error) {
      console.error('Failed to delete school:', error)
    }
  }

  const confirmDeleteSchool = (school) => {
    setSchoolToDelete(school)
    setDeleteModal(true)
  }

  return (
    <CContainer>
      <CRow className="mb-4">
        <CCol>
          <h1>Manage Schools</h1>
        </CCol>
        <CCol className="text-right">
          <CButton color="primary" onClick={handleAddNewSchool}>
            Add New School
          </CButton>
        </CCol>
      </CRow>
      <CCard>
        <CCardHeader>Schools List</CCardHeader>
        <CCardBody>
          <CTable hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>#</CTableHeaderCell>
                <CTableHeaderCell>Name</CTableHeaderCell>
                <CTableHeaderCell>Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {schools.map((school, index) => (
                <CTableRow key={school.id}>
                  <CTableDataCell>{index + 1}</CTableDataCell>
                  <CTableDataCell>{school.name}</CTableDataCell>
                  <CTableDataCell>
                    <CButton color="warning" onClick={() => handleEditSchool(school.id)}>
                      Edit
                    </CButton>{' '}
                    <CButton color="danger" onClick={() => confirmDeleteSchool(school)}>
                      Delete
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>

      <CModal visible={deleteModal} onClose={() => setDeleteModal(false)}>
        <CModalHeader>
          <CModalTitle>Confirm Delete</CModalTitle>
        </CModalHeader>
        <CModalBody>
          Are you sure you want to delete the school &quot;{schoolToDelete?.name}&quot;?
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setDeleteModal(false)}>
            Cancel
          </CButton>
          <CButton color="danger" onClick={handleDeleteSchool}>
            Delete
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  )
}

export default ManageSchools
