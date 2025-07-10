"use client"

// Third-party Imports
import classnames from 'classnames'



// Component Imports
import NavToggle from './NavToggle'
import UserDropdown from '@components/layout/shared/UserDropdown'
import { Icon } from '@iconify/react';

// Util Imports
import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'
import useVerticalNav from '@/@menu/hooks/useVerticalNav'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { useAppSelector } from '@/redux/useAppSelector'
import React from 'react'

import { logout } from '@/views/auth/action'
import { useRouter } from 'next/navigation'


const NavbarContent = () => {

  const [title, setTitle] = React.useState<string>('Dashboard');

  // const userType = useAppSelector((state) => state.authReducer.data.user.userType)
  
  const userType = parseInt(sessionStorage.getItem('userType'))

  const pathName = usePathname()



  const router = useRouter()

  const handleUserLogout = async () => {
    try {
      // Sign out from the app
      logout(router);

    } catch (error) {
      console.error(error)

      // Show above error in a toast like following
      // toastService.error((err as Error).message)
    }
  }



  React.useEffect(() => {
    const route = pathName.split('?')[0]; // Get the path without query parameters
    const routeTitles: Record<string, string> = {
      '/admin/dashboard': 'Dashboard',
      '/admin/calendar': 'Calendar',
      '/carer/dashboard': 'Calendar',
      '/carer/roster': 'Roster',
      '/admin/roster': 'Roster',
      '/admin/booking-requests': 'Bookings',
      '/admin/settings/carers': 'Carers',
      '/admin/settings/services': 'Services',
      '/admin/settings/user': 'Users',
      '/admin/settings/activitylogs': 'Activity Logs',
      '/admin/settings/carers-off-days': 'Carers Off Days',
      '/admin/settings/clients': 'Clients',
      '/admin/settings/account-delete-requests': 'Account Delete Requests',
      '/admin/settings/activity-log': 'Activity Logs',
      '/admin/carerOffDays': 'Carer Off Days' // Added this line for the new route
    };
    
    setTitle(routeTitles[route] || 'Dashboard');
  }, [pathName]);


  return (
    <>
      {(userType == 1 || userType == 3) && pathName !== '/iframe' && (
        <div className={classnames(verticalLayoutClasses.navbarContent, 'flex items-center justify-between gap-4 is-full')}>
          <div className='flex items-center gap-[7px]'>
      
  
            <NavToggle />
            {title && (
              <div className="text-2xl sm:text-3xl font-bold text-[#294C08] tracking-wide">
                {title}
              </div>
            )}
            {/* <NavSearch /> */}
          </div>
  
          <div className='flex items-center'>
            {/* <LanguageDropdown />
            <ModeDropdown />
            <ShortcutsDropdown shortcuts={shortcuts} />
            <NotificationsDropdown notifications={notifications} /> */}
  
            <UserDropdown />
          </div>
        </div>
      )}
    </>
  );
  
}

export default NavbarContent
