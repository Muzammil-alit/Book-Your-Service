// React Imports
import React, { useState } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// MUI Imports
import {
  Card,
  Typography,
  Box,
  Grid,
  Avatar,
  IconButton,
  Chip,
  Tooltip,
  CardContent,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Skeleton
} from '@mui/material'
import { alpha } from '@mui/material/styles'

// Type Imports
import { CarerType } from '@/types/apps/carerTypes'
import type { ThemeColor } from '@core/types'

// Animation Imports
import { motion } from 'framer-motion'

// Components Imports
import WeeklyOffModal from './WeeklyOffModal'

type CarerListCardsProps = {
  data: CarerType[]
  handleEditCarer: (carer: CarerType) => void
  handleDeleteCarer: (carerId: number) => void
  handleAssignCarer: (carerId: number, carerName: string) => void
  loading: boolean
}

type CarerStatusType = {
  [key: string]: ThemeColor
}

const carerStatusObj: CarerStatusType = {
  active: 'success',
  inactive: 'error'
}

const CarerListCards = ({
  data,
  handleEditCarer,
  handleDeleteCarer,
  handleAssignCarer,
  loading
}: CarerListCardsProps) => {
  // Add router
  const router = useRouter()

  // States for menu
  const [anchorElMenu, setAnchorElMenu] = useState<null | HTMLElement>(null);
  const [selectedCarerForMenu, setSelectedCarerForMenu] = useState<CarerType | null>(null);
  const [weeklyOffModalOpen, setWeeklyOffModalOpen] = useState<boolean>(false);

  // Helper function to get initials from carer name
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  // Menu handlers
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, carer: CarerType) => {
    setAnchorElMenu(event.currentTarget);
    setSelectedCarerForMenu(carer);
  };

  const handleMenuClose = () => {
    setAnchorElMenu(null);
  };

  const handleConfigureWeeklyOff = () => {
    setWeeklyOffModalOpen(true);
    handleMenuClose();
  };

  const handleManageOffDays = () => {
    handleMenuClose()
  }

  const handleCarerSchedule = () => {
    if (selectedCarerForMenu?.CarerID) {
      router.push(`/admin/calendar?carerId=${selectedCarerForMenu.CarerID}`);
    }
    handleMenuClose();
  };


  const handleRoster = () => {
    if (selectedCarerForMenu?.CarerID) {
      router.push(`/admin/roster?carerId=${selectedCarerForMenu.CarerID}`);
    }
    handleMenuClose();
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
      >
        <Grid container spacing={3}>
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={`skeleton-card-${i}`}>
                <Card
                  sx={{
                    borderRadius: 2,
                    padding: 3,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: theme => `0 2px 10px 0 ${alpha(theme.palette.grey[900], 0.1)}`
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Skeleton animation='wave' variant="circular" width={48} height={48} />
                    <Box sx={{ ml: 2 }}>
                      <Skeleton animation='wave' variant="text" width={100} height={24} />
                      <Skeleton animation='wave' variant="rectangular" width={60} height={24} sx={{ mt: 1, borderRadius: 1 }} />
                    </Box>
                  </Box>
                  <Skeleton animation='wave' variant="rectangular" height={80} sx={{ mb: 2, borderRadius: 1 }} />

                </Card>
              </Grid>
            ))
            : data.map(carer => {
              const buffer = carer?.ProfilePic;
              let imageSrc = '';

              if (buffer && buffer.data) {
                const base64String = btoa(
                  new Uint8Array(buffer.data).reduce((data, byte) => data + String.fromCharCode(byte), '')
                );
                imageSrc = `data:image/jpeg;base64,${base64String}`;
              }

              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={carer.CarerID}>
                  <motion.div variants={item}>
                    <Card
                      sx={{
                        position: 'relative',
                        height: '100%',
                        borderRadius: 2,
                        transition: 'all 0.25s ease',
                        boxShadow: theme => `0 2px 10px 0 ${alpha(theme.palette.grey[900], 0.1)}`,
                        borderLeft: theme => `4px solid ${carer.Color || theme.palette.primary.main}`,
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: theme => `0 5px 15px 0 ${alpha(theme.palette.grey[900], 0.15)}`,
                        }
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar
                              src={imageSrc || undefined}
                              alt={carer.CarerName}
                              sx={{
                                width: 48,
                                height: 48,
                                mr: 2,
                                bgcolor: carer.Color || '#1976d2',
                                fontSize: '1.2rem',
                                boxShadow: theme => `0 2px 5px 0 ${alpha(carer.Color || theme.palette.primary.main, 0.3)}`
                              }}
                            >
                              {getInitials(carer.CarerName)}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {carer.CarerName}
                              </Typography>
                              <Chip
                                variant="tonal"
                                label={carer.Active ? 'Active' : 'Inactive'}
                                size="small"
                                color={carer.Active ? carerStatusObj['active'] : carerStatusObj['inactive']}
                                sx={{ mt: 0.5, height: 24 }}
                              />
                            </Box>
                          </Box>
                        </Box>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
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
                            '&::after': {
                              content: '""',
                              position: 'absolute',
                              bottom: 0,
                              right: 0,
                              width: '10em',
                              height: '1.5em',
                              background: 'linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,1))',
                              pointerEvents: 'none'
                            }
                          }}
                        >
                          {carer.Descr}
                        </Typography>

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 'auto' }}>
                          <Tooltip title="Assign services">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleAssignCarer(carer.CarerID!, carer.CarerName)}
                              sx={{ mr: 0.5 }}
                            >
                              <i className="ri-user-add-line" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => handleEditCarer(carer)} sx={{ mr: 0.5 }}>
                              <i className="ri-edit-box-line text-textSecondary" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" onClick={() => handleDeleteCarer(carer.CarerID!)} sx={{ mr: 0.5 }}>
                              <i className="ri-delete-bin-7-line text-textSecondary" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="More options">
                            <IconButton
                              size="small"
                              onClick={e => handleMenuOpen(e, carer)}
                              aria-label="more options"
                            >
                              <i className="ri-more-2-fill" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              );
            })}
        </Grid>

      </motion.div>

      {/* Menu for additional options */}
      <Menu
        id="card-more-menu"
        anchorEl={anchorElMenu}
        open={Boolean(anchorElMenu)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            minWidth: '200px',
            boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        <MenuItem onClick={handleConfigureWeeklyOff}>
          <ListItemIcon>
            <i className="ri-calendar-schedule-line" />
          </ListItemIcon>
          <ListItemText>Configure Weekly Schedule</ListItemText>
        </MenuItem>
        <MenuItem component={Link}
          href={selectedCarerForMenu?.CarerID ? `/admin/carerOffDays?carerId=${selectedCarerForMenu.CarerID}` : '#'}
          onClick={handleMenuClose}
          prefetch={false}
          style={{ textDecoration: 'none', color: 'inherit' }}
          disabled={!selectedCarerForMenu?.Active}
        >
          <ListItemIcon sx={{ opacity: selectedCarerForMenu?.Active ? 1 : 0.5 }}>
            <i className="ri-calendar-event-line" />
          </ListItemIcon>
          <ListItemText sx={{ opacity: selectedCarerForMenu?.Active ? 1 : 0.5 }}>Manage Off Days</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleCarerSchedule} disabled={!selectedCarerForMenu?.Active}>
          <ListItemIcon sx={{ opacity: selectedCarerForMenu?.Active ? 1 : 0.5 }}>
            <i className="ri-time-line" />
          </ListItemIcon>
          <ListItemText sx={{ opacity: selectedCarerForMenu?.Active ? 1 : 0.5 }}>Calendar</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleRoster} disabled={!selectedCarerForMenu?.Active}>
          <ListItemIcon sx={{ opacity: selectedCarerForMenu?.Active ? 1 : 0.5 }}>
            <i className="ri-file-list-3-line" />
          </ListItemIcon>
          <ListItemText sx={{ opacity: selectedCarerForMenu?.Active ? 1 : 0.5 }}>Roster</ListItemText>
        </MenuItem>
      </Menu>

      {/* Weekly Off Modal */}
      <WeeklyOffModal
        open={weeklyOffModalOpen}
        onClose={() => setWeeklyOffModalOpen(false)}
        carer={selectedCarerForMenu}
      />
    </>
  )
}

export default CarerListCards 