'use client'

// MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion';


const CardStatWithImage = (props: any) => {
  // Props
  const { title, src, stats, trendNumber, trend, chipText, chipColor, handleRedirect, type } = props

  const [displayedCount, setDisplayedCount] = useState(0);

    

  useEffect(() => {
    const target = Number(stats);
    const duration = 750; // total animation time in ms
    const frameDuration = 30;
    const totalFrames = Math.round(duration / frameDuration);
    let frame = 0;

    const counter = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const currentCount = Math.round(target * progress);

      setDisplayedCount(currentCount);

      if (frame === totalFrames) {
        clearInterval(counter);
      }
    }, frameDuration);

    return () => clearInterval(counter);
  }, [stats]);





  return (
    <motion.div
      whileHover={{
        rotateX: 5,
        rotateY: -5,
        scale: 1.02,
        transition: { type: 'spring', stiffness: 300, damping: 15 }
      }}
      style={{ perspective: 1000, backfaceVisibility: 'hidden' }}
    >
      <Card className='relative bs-full'

        style={{
          transform: 'translateZ(0)',
          willChange: 'transform'
        }}
      >
        <CardContent>
          <Grid container>
            <Grid size={{ xs: 7 }} className='flex flex-col justify-between gap-5'>
              <div className='flex flex-col items-start gap-2'>
                <Typography color='text.primary' className='text-nowrap font-medium'>
                  {title}
                </Typography>
                <Chip size='small' variant='tonal' label={chipText} color={chipColor} sx={{ cursor: 'pointer' }} onClick={() => { handleRedirect(type) }} />
              </div>
              <div className='flex flex-wrap items-center gap-x-2'>
                <Typography variant='h4'>{displayedCount}</Typography>
                <Typography color={trend === 'negative' ? 'error.main' : 'success.main'}>
                  {`${trendNumber}`}
                </Typography>
              </div>
            </Grid>
            <img src={src} alt={title} className='absolute block-end-0 inline-end-5 self-end bs-[130px] is-auto' />
          </Grid>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default CardStatWithImage
