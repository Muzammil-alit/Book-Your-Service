'use client'

// Next Imports
import { useTheme } from '@mui/material/styles'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

type NotAuthorizedProps = {
  onRedirect?: () => void
}

const NotAuthorized = ({ onRedirect }: NotAuthorizedProps) => {
  const theme = useTheme()
  
  // Use theme.palette.mode instead of the settings context
  const isDarkMode = theme.palette.mode === 'dark'
  const miscBackground = isDarkMode 
    ? '/images/pages/misc-mask-4-dark.png' 
    : '/images/pages/misc-mask-4-light.png'

  return (
    <div className='flex items-center justify-center min-bs-[100dvh] relative p-6 overflow-x-hidden'>
      <div className='flex items-center flex-col text-center gap-10'>
        <div className='flex flex-col gap-2 is-[90vw] sm:is-[unset]'>
          <Typography className='text-8xl font-medium' color='text.primary'>
            401
          </Typography>
          <Typography variant='h4'>You are not authorized! 🔐</Typography>
          <Typography>You don&#39;t have permission to access this page.</Typography>
        </div>
        {/* <img
          alt='error-illustration'
          src='/images/illustrations/characters/6.png'
          className='object-cover bs-[400px] md:bs-[450px] lg:bs-[500px]'
        /> */}
        {onRedirect && (
          <Button variant='contained' onClick={onRedirect}>
            Go to Dashboard
          </Button>
        )}
      </div>
      <img src={miscBackground} className='absolute bottom-0 z-[-1] is-full max-md:hidden' />
    </div>
  )
}

export default NotAuthorized
