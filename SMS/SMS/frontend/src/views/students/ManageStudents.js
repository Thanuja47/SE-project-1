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

const ManageStudents = () => {
  const [students, setStudents] = useState([])
  const [deleteModal, setDeleteModal] = useState(false)
  const [studentToDelete, setStudentToDelete] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
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

  const handleEditStudent = (id) => {
    navigate(`/students/edit/${id}`)
  }

  const handleDeleteStudent = async () => {
    try {
      const token = localStorage.getItem('token')
      console.log('Deleting student with ID:', studentToDelete.id)
      const response = await axios.delete(
        `http://localhost:5000/api/students/profile/${studentToDelete.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      console.log('Delete response:', response.data)
      setStudents(students.filter((student) => student.id !== studentToDelete.id))
      setDeleteModal(false)
      setStudentToDelete(null)
    } catch (error) {
      console.error('Failed to delete student:', error)
    }
  }

  const confirmDeleteStudent = (student) => {
    setStudentToDelete(student)
    setDeleteModal(true)
  }

  return (
    <CContainer>
      <CRow className="mb-4">
        <CCol>
          <h1>Manage Students</h1>
        </CCol>
      </CRow>
      <CCard>
        <CCardHeader>Students List</CCardHeader>
        <CCardBody>
          <CTable hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>#</CTableHeaderCell>
                <CTableHeaderCell>Name</CTableHeaderCell>
                <CTableHeaderCell>Email</CTableHeaderCell>
                <CTableHeaderCell>Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {students.map((student, index) => (
                <CTableRow key={student.id}>
                  <CTableDataCell>{index + 1}</CTableDataCell>
                  <CTableDataCell>{`${student.first_name} ${student.last_name}`}</CTableDataCell>
                  <CTableDataCell>{student.email}</CTableDataCell>
                  <CTableDataCell>
                    <CButton color="warning" onClick={() => handleEditStudent(student.id)}>
                      Edit
                    </CButton>{' '}
                    <CButton color="danger" onClick={() => confirmDeleteStudent(student)}>
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
          Are you sure you want to delete the student &quot;{studentToDelete?.first_name}{' '}
          {studentToDelete?.last_name}&quot;?
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setDeleteModal(false)}>
            Cancel
          </CButton>
          <CButton color="danger" onClick={handleDeleteStudent}>
            Delete
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  )
}

export default ManageStudents
