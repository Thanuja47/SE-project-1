import React from 'react'
import {
  CAvatar,
  CBadge,
  CDropdown,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import { cilCreditCard, cilSettings, cilUser } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { AuthContext } from '../../hooks/AuthContext'

const AppHeaderDropdown = () => {
  const { userData } = React.useContext(AuthContext)
  const userName = userData.name
  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end" className="py-2 pe-0" caret={false}>
        {userName}
        <CIcon icon={cilUser} className="ms-2" />
      </CDropdownToggle>
      <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownHeader className="bg-body-secondary fw-semibold my-2">Settings</CDropdownHeader>
        <CDropdownItem href="/user/profile">
          <CIcon icon={cilUser} className="me-2" />
          Profile
        </CDropdownItem>
        <CDropdownItem href="#">
          <CIcon icon={cilSettings} className="me-2" />
          Settings
        </CDropdownItem>
        <CDropdownItem href="#">
          <CIcon icon={cilCreditCard} className="me-2" />
          Payments
          <CBadge color="secondary" className="ms-2">
            42
          </CBadge>
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown
