'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  styled,
  Avatar,
  TextField,
  InputAdornment,
  Button,
  Modal,
  Backdrop,
  Fade,
  PaperProps
} from '@mui/material'
import { useRouter } from 'next/navigation'
import BookingStepper from '../stepper/BookingStepper'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { getClientCarerApiCall } from '../actions'
import filterCarers from '../../functions'

import { useBookingContext } from '@/contexts/bookingContexts/BookingContext'
import { useMultiBookingContext } from '@/contexts/bookingContexts/MultiBookingContext'


import { v4 as uuidv4 } from 'uuid';

interface CarerCardProps extends PaperProps {
  selected?: boolean;  // Add your custom prop
}

// Initialize dayjs plugins
dayjs.extend(utc)
dayjs.extend(timezone)

function hexToRgba(hex: string, alpha: number = 1): string {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map(ch => ch + ch).join('');
  }
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}



// Styled components (reusing some from other pages)
const GlassPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  background: 'rgba(255, 255, 255, 0.7)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  borderRadius: '16px',
  border: '1px solid rgba(255, 255, 255, 0.18)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
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
  width: '50px',
  height: '50px',
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

const CarerCard = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'selected',
})<CarerCardProps>(({ theme, selected }) => ({
  padding: theme.spacing(3),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(1),
  transition: 'all 0.3s ease',
  borderRadius: '12px',
  border: '1px solid rgba(0, 0, 0, 0.12)',
  background: selected ? 'rgba(76, 175, 80, 0.05)' : 'white',
  boxShadow: selected ? '0 4px 12px rgba(76, 175, 80, 0.15)' : 'none',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.1)',
  },
})
);


const ServiceInfoCard = styled(GlassPaper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
}))

// Modal styled components
const ModalContent = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: '600px',
  padding: 0,
  boxShadow: '0 24px 48px rgba(0, 0, 0, 0.2)',
  borderRadius: '16px',
  outline: 'none',
  overflow: 'hidden',
  background: 'white',
}))

const ModalHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(3),
  paddingBottom: theme.spacing(2),
  background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
  color: 'white',
}))

const ModalBody = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  maxHeight: 'calc(100vh - 200px)',
  overflowY: 'auto',
}))

const ModalCloseButton = styled(Button)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  right: theme.spacing(2),
  minWidth: 'auto',
  padding: theme.spacing(0.5),
  color: 'white',
  opacity: 0.8,
  '&:hover': {
    opacity: 1,
    background: 'rgba(255, 255, 255, 0.1)',
  }
}))

const CarerProfileHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
}))

interface ProfileAvatarProps {
  carercolor?: string;
}

const ProfileAvatar = styled(Avatar)<ProfileAvatarProps>(({ theme, carercolor }) => ({
  width: 200,
  height: 200,
  border: `3px solid white`,
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
  marginBottom: theme.spacing(2),
  transition: 'all 0.3s ease',
  animation: 'pulse 1.5s ease-in-out infinite',
  '@keyframes pulse': {
    '0%': {
      boxShadow: `0 8px 24px ${hexToRgba(carercolor, 0.1)}`,
    },
    '50%': {
      boxShadow: `0 8px 32px ${hexToRgba(carercolor, 0.3)}`,
    },
    '100%': {
      boxShadow: `0 8px 24px ${hexToRgba(carercolor, 0.1)}`,
    }
  }
}))


// Mock data for providers
const mockProviders = [
  {
    id: 1,
    name: 'Sarah Johnson',
    specialty: 'Senior Care Specialist',
    rating: 4.9,
    description: 'Professional caregiver with 10+ years of experience in elderly care. Specialized in dementia care and physical therapy assistance.',
    image: '/images/providers/provider1.jpg'
  },
  {
    id: 2,
    name: 'Michael Brown',
    specialty: 'Home Care Professional',
    rating: 4.7,
    description: 'Compassionate caregiver focusing on creating comfortable environments. Skilled in medication management and daily assistance.',
    image: '/images/providers/provider2.jpg'
  },
  {
    id: 3,
    name: 'Emma Wilson',
    specialty: 'Geriatric Specialist',
    rating: 4.8,
    description: 'Geriatric care specialist with nursing background. Expert in managing chronic conditions and post-surgery recovery care.',
    image: '/images/providers/provider3.jpg'
  },
  {
    id: 4,
    name: 'James Miller',
    specialty: 'Senior Care Assistant',
    rating: 4.6,
    description: 'Energetic caregiver dedicated to promoting active lifestyles for seniors. Experience in mobility assistance and rehabilitation.',
    image: '/images/providers/provider4.jpg'
  },
  {
    id: 5,
    name: 'Patricia Davis',
    specialty: 'Memory Care Specialist',
    rating: 4.9,
    description: 'Specialized in memory care and Alzheimers support. Creates engaging activities to maintain cognitive functions.',
    image: '/images/providers/provider5.jpg'
  },
  {
    id: 6,
    name: 'Robert Wilson',
    specialty: 'Companion Caregiver',
    rating: 4.8,
    description: 'Friendly companion caregiver who excels in creating meaningful connections. Provides emotional support and social engagement.',
    image: '/images/providers/provider6.jpg'
  }
];

const bufferToBase64 = (bufferData: number[]) => {
  const base64String = btoa(
    bufferData.reduce((data, byte) => data + String.fromCharCode(byte), '')
  );
  return `data:image/jpeg;base64,${base64String}`; // change to image/png if needed
};


const ProviderSelection = () => {
  const router = useRouter();
  const [selectedProviderId, setSelectedProviderId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTime, setCurrentTime] = useState(`${Intl.DateTimeFormat().resolvedOptions().timeZone} ${dayjs().format('h:mm:ss A')}`);
  const activeStep = 2; // Third step (Provider)


  const { bookingData, updateBookingData, clearBookingData } = useBookingContext();
  const { allBookings, addBooking, clearAllBookings, deleteBookingByIndex } = useMultiBookingContext();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);

  interface Carer {
    CarerID: number;
    CarerName: string;
    Descr: string;
    IsAvailable: boolean;
    Color?: string;
    ProfilePic?: { data: number[] };
    [key: string]: any; // for any extra properties
  }

  const [carers, setCarers] = useState<Carer[]>([]);


  const fetchCarers = async () => {
    try {
      if (bookingData.selectedServiceId && bookingData.selectedDuration && bookingData.selectedDate) {
        const serviceID = parseInt(bookingData.selectedServiceId);
        const duration = parseInt(bookingData.selectedDuration);
        const bookingDate = bookingData.selectedDate
        const bookingtime = dayjs(bookingData.selectedTime).utc().format('HH:mm:ss')

        const bookingID = bookingData.isEditMode ? bookingData.selectedBookingID : null


        const bookingDateTime = (`${bookingDate}T${bookingtime}`)

        const carers = await getClientCarerApiCall(serviceID, duration, bookingDateTime, bookingID);

        if (Array.isArray(carers)) {
          setCarers(carers);
        }
      }
    } catch (error) {
      console.error("Error fetching timeslots:", error);
    }
  };



  // Load saved provider from context if available
  useEffect(() => {
    const savedProviderId = bookingData.selectedProviderId;

    if (savedProviderId) {
      setSelectedProviderId(parseInt(savedProviderId, 10));
    }
  }, [bookingData]);

  // Add browser reload warning
  useEffect(() => {
    let shouldRedirect = false;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const message = "You have unsaved changes. Your progress will be lost if you leave or reload the page.";
      e.preventDefault();
      e.returnValue = message;
      shouldRedirect = true; // Set flag if warning is shown
      return message;
    };

    const handleUnload = () => {
      if (shouldRedirect) {
        // This won't work directly in unload, but we can use localStorage
        localStorage.setItem('shouldRedirect', 'true');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleUnload);
    };
  }, []);

  useEffect(() => {
    // Check on component mount if we need to redirect
    if (localStorage.getItem('shouldRedirect') === 'true') {
      localStorage.removeItem('shouldRedirect');
      router.push('/client/booking/service');
    }
  }, [router]);



  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(`${Intl.DateTimeFormat().resolvedOptions().timeZone} ${dayjs().format('h:mm:ss A')}`);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Get booking info from context
  const bookingInfo = {
    serviceName: bookingData.selectedServiceName || 'Home Care Service',
    duration: bookingData.selectedDuration || '4',
    date: bookingData.selectedDate || 'Not selected',
    time: bookingData.selectedTime || 'Not selected'
  };

  const handleProviderSelect = (providerId: number) => {
    setSelectedProviderId(providerId);

    const selectedCarer = carers.find(carer => carer?.CarerID === providerId)


    updateBookingData({
      selectedProviderId: providerId,
      selectedProviderName: selectedCarer.CarerName
    });




    addBooking({
      ...bookingData,
      id: uuidv4(),
      selectedProviderId: providerId,
      selectedProviderName: selectedCarer.CarerName
    })


    // Navigate to the confirmation page
    router.push('/client/booking/confirm');
  };


  const handleProviderMoreClick = (e: React.MouseEvent, provider: any) => {
    e.stopPropagation(); // Prevent card click event
    setSelectedProvider(provider);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const filteredCarers = carers?.filter(carer =>
    carer.CarerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    carer.Descr.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const handleBackToDashboard = () => {
    clearBookingData();
    clearAllBookings()
    router.push('/client/dashboard');
  }


  useEffect(() => {
    fetchCarers();
  }, [bookingData])






  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Back to Dashboard Button */}
      <Box sx={{ mb: 6, display: 'flex', justifyContent: 'flex-start' }}>
        <Button
          variant="outlined"
          color="primary"
          size="small"
          startIcon={<i className="ri-arrow-left-line" />}
          onClick={handleBackToDashboard}
        >
          Back to Dashboard
        </Button>
      </Box>

      {/* Use the common BookingStepper component */}
      <BookingStepper activeStep={activeStep} />

      <AnimatedBox delay={0.2}>
        <Box
          sx={{
            mb: 4,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            flexDirection: { xs: 'column', sm: 'row' }, // Flex column on small screens
            gap: 2 // Optional: add spacing between stacked items on small screens
          }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconWrapper sx={{ mr: 2, fontSize: 24 }}>
              <i className="ri-user-star-line" />
            </IconWrapper>
            <Box>
              <Typography variant="h4" style={{ marginBottom: 0 }} fontWeight={600} gutterBottom>
                Select a <HighlightText>Carer</HighlightText>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Choose who will provide your service
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignSelf: 'end' }}>



            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'end' }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {currentTime}
                </Typography>
              </Box>
              <Box>
                <Button
                  variant="text"
                  color="primary"
                  size="small"
                  startIcon={<i className="ri-arrow-left-line" />}
                  onClick={() => router.push('/client/booking/timeslot')}
                >
                  Back
                </Button>
              </Box>
            </Box>


          </Box>
        </Box>
      </AnimatedBox>


      {/* Search and Providers grid */}
      <AnimatedBox delay={0.4}>
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <i className="ri-search-line" />
                </InputAdornment>
              ),
            }}
            sx={{ maxWidth: 250, mb: 1 }}
          />
        </Box>

        <Grid container spacing={3}>
          {[...filterCarers(allBookings, bookingData, filteredCarers)].map((carer) => (
            <Grid item xs={12} sm={6} md={4} key={carer.CarerID}>
              <CarerCard
                selected={selectedProviderId === carer.CarerID}
                onClick={() => carer.IsAvailable && handleProviderSelect(carer.CarerID)}
                sx={{
                  borderTop: `4px solid ${carer.Color || '#1976d2'}`,
                  opacity: carer.IsAvailable ? 1 : 0.5,
                  filter: carer.IsAvailable ? 'none' : 'grayscale(50%)',
                  cursor: carer.IsAvailable ? 'pointer' : 'not-allowed',
                  transition: 'all 0.3s ease',
                  // isAvailable: carer.IsAvailable
                }}
              >
                <Avatar
                  src={carer.ProfilePic?.data ? bufferToBase64(carer.ProfilePic.data) : undefined}
                  alt={carer.CarerName}
                  sx={{ width: 100, height: 100, mb: 1 }}
                />

                <Typography variant="h6" align="center" gutterBottom>
                  {carer.CarerName}
                </Typography>



                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    // textAlign: 'justify'
                    mb: 3,

                    maxHeight: 80,
                    minHeight: 80,
                    whiteSpace: 'normal',
                    wordBreak: 'break-word',
                    lineHeight: 1.5,

                    WebkitLineClamp: 4,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    position: 'relative',
                    '&::after': carer.CarerID !== bookingData.selectedProviderId ? {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      width: '10em',
                      height: '1.5em',
                      background: 'linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,1))',
                      pointerEvents: 'none'
                    } : {}
                  }}
                >
                  {carer.Descr}
                </Typography>




                <Box sx={{
                  mt: 'auto',
                  alignSelf: 'flex-end',
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  pt: 1
                }}>
                  <Typography
                    variant="body2"
                    color="primary.main"
                    fontWeight={500}
                    sx={{ cursor: 'pointer' }}
                    onClick={(e) => {
                      if (carer.IsAvailable) {
                        handleProviderMoreClick(e, carer);
                      } else {
                        e.stopPropagation(); // Prevent event bubbling
                      }
                    }}
                  >
                    more
                  </Typography>
                </Box>
              </CarerCard>
            </Grid>
          ))}
        </Grid>


      </AnimatedBox>

      {/* Carer Detail Modal */}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={modalOpen}>
          <ModalContent>
            {selectedProvider && (
              <>
                {/* <ModalHeader>
                  <Typography variant="h6" fontWeight={600}>
                    Carer Profile
                  </Typography>
                  <ModalCloseButton onClick={handleCloseModal}>
                    <i className="ri-close-line" style={{ fontSize: 24 }} />
                  </ModalCloseButton>
                </ModalHeader> */}

                <Box
                  onClick={handleCloseModal}
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    cursor: 'pointer',
                    zIndex: 1,
                    padding: 1,
                  }}
                >
                  <i className="ri-close-line" style={{ fontSize: 24 }} />
                </Box>

                <ModalBody>
                  <CarerProfileHeader >
                    <ProfileAvatar
                      carercolor={selectedProvider.Color}
                      src={selectedProvider.ProfilePic?.data ? bufferToBase64(selectedProvider.ProfilePic.data) : undefined}
                      alt={selectedProvider.CarerName}
                    />
                    <Typography variant="h5" align="center" fontWeight={600} gutterBottom>
                      {selectedProvider.CarerName}
                    </Typography>
                  </CarerProfileHeader>

                  <Box sx={{ mb: 3, mx: 2 }}>
                    <Typography variant="h6" fontWeight={500} gutterBottom>
                      Description
                    </Typography>
                    <Typography variant="body2" sx={{ textAlign: 'justify' }} paragraph>
                      {selectedProvider.Descr}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => {
                        handleProviderSelect(selectedProvider.CarerID);
                        handleCloseModal();
                      }}
                    >
                      Select {selectedProvider.CarerName}
                    </Button>
                  </Box>
                </ModalBody>
              </>
            )}
          </ModalContent>
        </Fade>


      </Modal>
    </Container>
  );
};

export default ProviderSelection;

