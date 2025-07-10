import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { connectDB } from './config/database';
import { errorMiddleware } from './middlewares/error.middleware';
import { logMiddleware } from './middlewares/log.middleware';

import userRoutes from './routes/user.routes';
import authRoutes from './routes/auth.routes';
import serviceRoutes from './routes/service.routes';
import carerRoutes from './routes/carer.routes';
import activityLogRoutes from './routes/activityLog.routes';
import carerScheduleRoutes from './routes/carerSchedule.routes';
import carerOffDaysRoutes from './routes/carerOffDays.routes';
import clientRoutes from './routes/client.routes';
import clientBooking from './routes/clientBooking.routes'
import clientMyBooking from './routes/clientMyBooking.routes'
import adminDeleteRequests from './routes/adminDeleteRequests.routes'

import clientDeleteRequests from './routes/clientDeleteRequests.routes'

import adminDashboard from './routes/adminDashboard.routes'

import adminBooking from './routes/adminBookings.routes'
import adminCalendar from './routes/adminCalendar.routes'
import API_ROUTES from './utils/apiRoutes';


dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json());
app.use(cors());
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "blob:"],     // ALow photo upload 
        scriptSrc: ["'self'", "'unsafe-inline'"],
        objectSrc: ["'none'"],
        frameSrc: ["'self'", "http://localhost:3000", "https://localhost:3000", "https://*.azurewebsites.net"],
        upgradeInsecureRequests: [],
      },
    },
  })
);
app.use(morgan('dev'));
app.use(logMiddleware);

// Auth Route
app.use(API_ROUTES.auth, authRoutes);

// Admin Routes
app.use(API_ROUTES.admin.users, userRoutes);
app.use(API_ROUTES.admin.services, serviceRoutes);
app.use(API_ROUTES.admin.carers, carerRoutes);
app.use(API_ROUTES.admin.activityLogs, activityLogRoutes);
app.use(API_ROUTES.admin.carerSchedule, carerScheduleRoutes);
app.use(API_ROUTES.admin.carerOffDays, carerOffDaysRoutes);
app.use(API_ROUTES.admin.deleteRequests, adminDeleteRequests);
app.use(API_ROUTES.admin.calendar, adminCalendar);
app.use(API_ROUTES.admin.bookings, adminBooking);
app.use(API_ROUTES.admin.dashboard, adminDashboard);

// Client Routes
app.use(API_ROUTES.client.base, clientRoutes);
app.use(API_ROUTES.client.booking, clientBooking);
app.use(API_ROUTES.client.myBookings, clientMyBooking);
app.use(API_ROUTES.client.deleteRequests, clientDeleteRequests);

(async () => {
  await connectDB();

  if (isProd) {
    try {
      const frontendPath = path.join(__dirname, '../frontend');
      const next = require(path.join(__dirname, '../frontend/node_modules/next'));
      const nextApp = next({ dev: false, dir: frontendPath });     
      const handle = nextApp.getRequestHandler();     
      await nextApp.prepare();
      app.all('*', (req, res) => {
        return handle(req, res);
      });
    } catch (err) {
      console.error('Error:', err);
    }
  } else {
    app.get('*', (_req, res) => {
      res.send('Backend running. Frontend served separately in development.');
    });
  }

  app.use(errorMiddleware);

  app.listen(PORT, () => {
    console.log(`Server running at ${PORT}`);
  });
})();
