// MUI Imports
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

// Type Imports
import type { VerticalMenuContextProps } from '@menu/components/vertical-menu/Menu'

// Component Imports
import { Menu, MenuItem, SubMenu } from '@menu/vertical-menu'

// import { GenerateVerticalMenu } from '@components/GenerateMenu'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Styled Component Imports
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'

import { usePathname } from 'next/navigation'

// Menu Data Imports
// import menuData from '@/data/navigation/verticalMenuData'

type RenderExpandIconProps = {
  open?: boolean
  transitionDuration?: VerticalMenuContextProps['transitionDuration']
}

type Props = {
  scrollMenu: (container: any, isPerfectScrollbar: boolean) => void
}

const RenderExpandIcon = ({ open, transitionDuration }: RenderExpandIconProps) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='ri-arrow-right-s-line' />
  </StyledVerticalNavExpandIcon>
)

const VerticalMenu = ({ scrollMenu }: Props) => {
  // Hooks
  const theme = useTheme()
  const verticalNavOptions = useVerticalNav()

  // Vars
  const { isBreakpointReached, transitionDuration } = verticalNavOptions

  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  const pathname = usePathname()
  const userType = parseInt(sessionStorage.getItem('userType'))


  
  return (

    <>
    {pathname !== '/iframe' &&

    <ScrollWrapper
      {...(isBreakpointReached
        ? {
          className: 'bs-full overflow-y-auto overflow-x-hidden',
          onScroll: container => scrollMenu(container, false)
        }
        : {
          options: { wheelPropagation: false, suppressScrollX: true },
          onScrollY: container => scrollMenu(container, true)
        })}
    >
      <Menu
        popoutMenuOffset={{ mainAxis: 17 }}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='ri-circle-fill' /> }}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      >
        {userType === 3 ? (
          // Carer menu items - only Calendar and Roster
          <>
            <MenuItem href={`/carer/dashboard`} icon={<i className='ri-calendar-line' />}>
              Calendar
            </MenuItem>
            <MenuItem href={`/carer/roster`} icon={<i className='ri-team-line' />}>
              Roster
            </MenuItem>
          </>
        ) : (
          // Admin menu items
          <>
            <MenuItem href={`/admin/dashboard`} icon={<i className='ri-home-smile-line' />}>
              Home
            </MenuItem>
            <MenuItem href={`/admin/calendar`} icon={<i className='ri-calendar-line' />}>
              Calendar
            </MenuItem>
            <MenuItem href={`/admin/roster`} icon={<i className='ri-team-line' />}>
              Roster
            </MenuItem>
            <MenuItem href={`/admin/booking-requests`} icon={<i className='ri-calendar-check-line' />}>
              Bookings
            </MenuItem>
            <SubMenu label="Settings" icon={<i className='ri-settings-3-line' />}>
              <MenuItem href={`/admin/settings/carers`} icon={<i className='ri-user-heart-line' />}>
                Carers
              </MenuItem>
              <MenuItem href={`/admin/settings/services`} icon={<i className='ri-customer-service-2-line' />}>
                Services
              </MenuItem>
              <MenuItem href={`/admin/settings/user`} icon={<i className='ri-user-line' />}>
                Users
              </MenuItem>
              <MenuItem href={`/admin/settings/carers-off-days`} icon={<i className='ri-calendar-close-line' />}>
                Carers Off Days
              </MenuItem>
              <MenuItem href={`/admin/settings/clients`} icon={<i className='ri-group-line' />}>
                Clients
              </MenuItem>
              <MenuItem href={`/admin/settings/account-delete-requests`} icon={<i className='ri-account-circle-line' />}>
                Account Delete Requests
              </MenuItem>
              <MenuItem href={`/admin/settings/activity-log`} icon={<i className='ri-history-line' />}>
                Activity Logs
              </MenuItem>
            </SubMenu>
          </>
        )}
      </Menu>
      
    </ScrollWrapper>
}
    
    </>
  )
}

export default VerticalMenu
