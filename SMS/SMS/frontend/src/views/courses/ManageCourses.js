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

const ManageCourses = () => {
  const [courses, setCourses] = useState([])
  const [deleteModal, setDeleteModal] = useState(false)
  const [courseToDelete, setCourseToDelete] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get('http://localhost:5000/api/courses', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setCourses(response.data)
      } catch (error) {
        console.error('Failed to fetch courses:', error)
      }
    }

    fetchCourses()
  }, [])

  const handleAddNewCourse = () => {
    navigate('/courses/add')
  }

  const handleEditCourse = (id) => {
    navigate(`/courses/edit/${id}`)
  }

  const handleDeleteCourse = async () => {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`http://localhost:5000/api/courses/${courseToDelete.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setCourses(courses.filter((course) => course.id !== courseToDelete.id))
      setDeleteModal(false)
      setCourseToDelete(null)
    } catch (error) {
      console.error('Failed to delete course:', error)
    }
  }

  const confirmDeleteCourse = (course) => {
    setCourseToDelete(course)
    setDeleteModal(true)
  }

  return (
    <CContainer>
      <CRow className="mb-4">
        <CCol>
          <h1>Manage Courses</h1>
        </CCol>
        <CCol className="text-right">
          <CButton color="primary" onClick={handleAddNewCourse}>
            Add New Course
          </CButton>
        </CCol>
      </CRow>
      <CCard>
        <CCardHeader>Courses List</CCardHeader>
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
              {courses.map((course, index) => (
                <CTableRow key={course.id}>
                  <CTableDataCell>{index + 1}</CTableDataCell>
                  <CTableDataCell>{course.name}</CTableDataCell>
                  <CTableDataCell>
                    <CButton color="warning" onClick={() => handleEditCourse(course.id)}>
                      Edit
                    </CButton>{' '}
                    <CButton color="danger" onClick={() => confirmDeleteCourse(course)}>
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
          Are you sure you want to delete the course &quot;{courseToDelete?.name}&quot;?
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setDeleteModal(false)}>
            Cancel
          </CButton>
          <CButton color="danger" onClick={handleDeleteCourse}>
            Delete
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  )
}

export default ManageCourses
