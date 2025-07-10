'use client'

import React from 'react'
import { Box, Container, Typography, Grid, Paper, Avatar, useTheme, Button } from '@mui/material'
import Link from 'next/link'
import { styled } from '@mui/material/styles'
import Image from 'next/image'
import { useAppSelector } from '@/redux/useAppSelector'

import { logout } from '@/views/auth/action'
import { logoutfn } from '@/redux/slices/login'
import { useDispatch, UseDispatch } from 'react-redux'
import { useParams, useRouter } from 'next/navigation'


// Styled components with Apple-like design language
const GlassPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(255, 255, 255, 0.7)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)', // For Safari support
  borderRadius: '16px',
  border: '1px solid rgba(255, 255, 255, 0.18)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 15px 30px rgba(0, 0, 0, 0.15)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #4caf50 0%, #2e7d32 100%)',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  '&:hover::before': {
    opacity: 1,
  }
}))

const ActionCard = styled(GlassPaper)(({ theme }) => ({
  height: '100px',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(3),
  gap: theme.spacing(2),
  cursor: 'pointer',
}))

const WelcomeCard = styled(GlassPaper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(3, 4),
  marginBottom: theme.spacing(5),
  background: 'rgba(255, 255, 255, 0.8)',
  animation: 'fadeIn 0.6s ease-out',
  '@keyframes fadeIn': {
    '0%': {
      opacity: 0,
      transform: 'translateY(10px)'
    },
    '100%': {
      opacity: 1,
      transform: 'translateY(0)'
    }
  }
}))




const AnimatedBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'delay'
})<{ delay?: number }>(({ theme, delay = 0 }) => ({
  animation: `fadeInUp 0.5s ease-out ${delay}s both`,
  '@keyframes fadeInUp': {
    '0%': {
      opacity: 0,
      transform: 'translateY(20px)'
    },
    '100%': {
      opacity: 1,
      transform: 'translateY(0)'
    }
  }
}))

const IconWrapper = styled(Box)(({ theme }) => ({
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
  color: '#fff',
  fontSize: '1.5rem',
}))

const HighlightText = styled('span')(({ theme }) => ({
  background: 'linear-gradient(90deg, #4caf50 0%, #2e7d32 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  textFillColor: 'transparent',
}))






const ClientDashboard = () => {
  const theme = useTheme();

  const getCurrentTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };


  const firstName = useAppSelector((state) => state?.authReducer?.client?.user?.firstName)
  const lastName = useAppSelector((state) => state?.authReducer?.client?.user?.lastName)

  const dispatch = useDispatch()
  const router = useRouter()

  const handleUserLogout = async () => {
    try {

      logout(router);
      dispatch(logoutfn(2));

    } catch (error) {
      console.error(error)
    }
  }



  return (
    <Container maxWidth="md">
      {/* Welcome Section with Avatar */}
      <WelcomeCard>
        <Box sx={{ maxWidth: '60%', display: 'flex', flexDirection: 'column',alignItems: 'space-between' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {getCurrentTimeOfDay()}, <HighlightText>{firstName}  {lastName}</HighlightText>
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Welcome to your dashboard. Here you can manage your services and profile.
          </Typography>

          <Button
            style={{width: '100px', marginTop: '20px'}}
            onClick={handleUserLogout}
            variant="outlined"
            color="error"
            size="small" >
            Logout
          </Button>


        </Box>
        <Box sx={{ position: 'relative', height: '150px', width: '120px' }}>
          <Image
            src="/images/illustrations/characters/1.png"
            alt="Welcome avatar"
            width={120}
            height={150}
            style={{ objectFit: 'contain' }}
          />
        </Box>
      </WelcomeCard>

      {/* Add Service Card */}
      <Link href="/client/booking/service" passHref style={{ textDecoration: 'none' }}>
        <AnimatedBox delay={0.1}>
          <GlassPaper sx={{ height: '120px', mb: 4, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', px: 4 }}>
            <Box>
              <Typography variant="h5" component="h2" sx={{ mb: 1 }} >
                Add New Booking Request
              </Typography>
              <Typography variant="body2" color="text.secondary" >
                Browse and book services with our trusted carers
              </Typography>
            </Box>
            <IconWrapper>
              <i className="ri-add-line" />
            </IconWrapper>
          </GlassPaper>
        </AnimatedBox>
      </Link>

      {/* Action Cards */}
      <AnimatedBox delay={0.2}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
          Quick Actions
        </Typography>
      </AnimatedBox>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Link href="/client/mybookings" passHref style={{ textDecoration: 'none' }}>
            <AnimatedBox delay={0.3}>
              <ActionCard>
                <IconWrapper  >
                  <i className="ri-calendar-line" />
                </IconWrapper>
                <Box className='w-[80%]'>
                  <Typography variant="h6" component="h3">
                    My Bookings
                  </Typography>
                  <Typography variant="body2" color="text.secondary" >
                    View and manage your scheduled services
                  </Typography>
                </Box>
              </ActionCard>
            </AnimatedBox>
          </Link>
        </Grid>

        <Grid item xs={12} md={6}>
          <Link href="/client/profile" passHref style={{ textDecoration: 'none' }}>
            <AnimatedBox delay={0.4}>
              <ActionCard>
                <IconWrapper>
                  <i className="ri-user-line" />
                </IconWrapper>
                <Box className='w-[80%]'>
                  <Typography variant="h6" component="h3">
                    My Profile
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Update your personal information
                  </Typography>
                </Box>
              </ActionCard>
            </AnimatedBox>
          </Link>
        </Grid>
      </Grid>

    </Container>
  )
}

export default ClientDashboard 