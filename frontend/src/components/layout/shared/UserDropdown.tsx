'use client'

// React Imports
import { useRef, useState } from 'react'
import type { MouseEvent } from 'react'

// Next Imports
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import { styled } from '@mui/material/styles'
import Badge from '@mui/material/Badge'
import Avatar from '@mui/material/Avatar'
import Popper from '@mui/material/Popper'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import MenuList from '@mui/material/MenuList'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'

// Third-party Imports
import { signOut, useSession } from 'next-auth/react'

// Type Imports
import type { Locale } from '@configs/i18n'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'
import { useAppSelector } from '@/redux/useAppSelector'
import CustomAvatar from '@/@core/components/mui/Avatar'
import { getInitials } from '@/utils/getInitials'
import { logout } from '@/views/auth/action'
import UpdateProfileSideModal from '@/components/layout/shared/UpdateProfileSideModal'
import ChangePasswordSideModal from '@/components/layout/shared/ChangePasswordSideModal'

import { useDispatch } from 'react-redux'
import { logoutfn } from '../../../redux/slices/login';

// Styled component for badge content
const BadgeContentSpan = styled('span')({
  width: 8,
  height: 8,
  borderRadius: '50%',
  cursor: 'pointer',
  backgroundColor: 'var(--mui-palette-success-main)',
  boxShadow: '0 0 0 2px var(--mui-palette-background-paper)'
})

const UserDropdown = () => {
  const userType = sessionStorage.getItem('userType')
  const user = (userType == "1") ? useAppSelector((state) => state.authReducer.admin.user) : useAppSelector((state) => state.authReducer.carer.user)

  
  // States
  const [open, setOpen] = useState(false)
  const [updateProfileOpen, setUpdateProfileOpen] = useState(false)
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)

  // Refs
  const anchorRef = useRef<HTMLDivElement>(null)

  // Hooks
  const router = useRouter()
  const { data: session } = useSession()
  const { settings } = useSettings()
  const { lang: locale } = useParams()

  const dispatch = useDispatch()

  const handleDropdownOpen = () => {
    !open ? setOpen(true) : setOpen(false)
  }

  const handleDropdownClose = (event?: MouseEvent<HTMLLIElement> | (MouseEvent | TouchEvent), action?: string) => {
    if (action === 'updateProfile') {
      setUpdateProfileOpen(true)
    } else if (action === 'changePassword') {
      setChangePasswordOpen(true)
    }

    if (anchorRef.current && anchorRef.current.contains(event?.target as HTMLElement)) {
      return
    }

    setOpen(false)
  }

  const handleUserLogout = async () => {
    try {
      // Sign out from the app
      logout(router);
      dispatch(logoutfn(1));
  
    } catch (error) {
      console.error(error)

      // Show above error in a toast like following
      // toastService.error((err as Error).message)
    }
  }

  const getAvatar = (fullName: string) => {
    return (
      <CustomAvatar skin='light' size={34}>
        {getInitials(fullName as string)}
      </CustomAvatar>
    );
  }

  return (
    <>
      <Avatar
        ref={anchorRef}
        alt={''}
        src={""}
        onClick={handleDropdownOpen}
        className='cursor-pointer bs-[38px] is-[38px]'
      />
      <Popper
        open={open}
        transition
        disablePortal
        placement='bottom-end'
        anchorEl={anchorRef.current}
        className='min-is-[240px] !mbs-4 z-[1]'
      >
        {({ TransitionProps, placement }) => (
          <Fade
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom-end' ? 'right top' : 'left top'
            }}
          >
            <Paper
              elevation={settings.skin === 'bordered' ? 0 : 8}
              {...(settings.skin === 'bordered' && { className: 'border' })}
            >
              <ClickAwayListener onClickAway={e => handleDropdownClose(e as MouseEvent | TouchEvent)}>
                <MenuList>
                  <div className='flex items-center plb-2 pli-4 gap-2' tabIndex={-1}>
                    {getAvatar(user?.firstName + ' ' + user?.lastName)}
                    <div className='flex items-start flex-col'>
                      <Typography variant='body2' className='font-medium' color='text.primary'>
                        {(user?.firstName + " " + user?.lastName) || ''}
                      </Typography>
                      <Typography variant='caption'>{user?.emailID || ''}</Typography>
                    </div>
                  </div>
                  <Divider className='mlb-1' />
                  <MenuItem className='gap-3 pli-4' onClick={e => handleDropdownClose(e, 'updateProfile')}>
                    <i className='ri-user-3-line' />
                    <Typography color='text.primary'>Update Profile</Typography>
                  </MenuItem>
                  <MenuItem className='gap-3 pli-4' onClick={e => handleDropdownClose(e, 'changePassword')}>
                    <i className='ri-lock-password-line' />
                    <Typography color='text.primary'>Change Password</Typography>
                  </MenuItem>
                  <div className='flex items-center plb-1.5 pli-4'>
                    <Button
                      fullWidth
                      variant='contained'
                      color='error'
                      size='small'
                      endIcon={<i className='ri-logout-box-r-line' />}
                      onClick={handleUserLogout}
                    >
                      Logout
                    </Button>
                  </div>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>

      <UpdateProfileSideModal
        open={updateProfileOpen}
        onClose={() => setUpdateProfileOpen(false)}
      />
      <ChangePasswordSideModal
        open={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      />
    </>
  )
}

export default UserDropdown
