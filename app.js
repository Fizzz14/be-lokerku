require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./models');

db.sequelize.authenticate()
  .then(() => console.log('Database berhasil tersambung'))
  .catch((err) => console.error('Gagal tersambung ke database:', err));

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const locationRoutes = require('./routes/locationRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const cardRoutes = require('./routes/cardRoutes');
const adminRoutes = require('./routes/adminRoutes');
const publicRoutes = require('./routes/publicRoutes');
const { notFound, errorMiddleware } = require('./middlewares/errorMiddleware');

const app = express();

const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS || '').split(',').filter(Boolean)

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true)

      // Always allow localhost for development
      if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        return callback(null, true)
      }

      // Allow configured origins (Vercel deployments, custom domains, etc.)
      if (ALLOWED_ORIGINS.some((allowed) => origin === allowed || origin.endsWith(allowed))) {
        return callback(null, true)
      }

      // In production, allow vercel.app domains if no specific origins configured
      if (ALLOWED_ORIGINS.length === 0 && origin.includes('.vercel.app')) {
        return callback(null, true)
      }

      callback(new Error('Not allowed by CORS'))
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
  res.json({ message: 'Lokerku API ready' });
});

const { Region, LockerSize } = db;

app.get('/api/regions', async (req, res, next) => {
  try {
    const rows = await Region.findAll({
      where: { status: 'Aktif' },
      order: [['name', 'ASC']],
    });
    res.json(rows.map((row) => ({ id: String(row.id), name: row.name, source: 'app.js' })));
  } catch (error) {
    next(error);
  }
});

app.get('/api/sizes', async (req, res, next) => {
  try {
    const rows = await LockerSize.findAll({
      where: { status: 'Aktif' },
      order: [['pricePerDay', 'ASC']],
    });
    res.json(rows.map((row) => ({ id: String(row.id), name: row.name, pricePerDay: row.pricePerDay })));
  } catch (error) {
    next(error);
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/public', publicRoutes);

app.get('/api/ping', (req, res) => res.json({ message: 'pong', time: new Date() }));

app.use(notFound);
app.use(errorMiddleware);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Lokerku API running on http://localhost:${PORT}`);
});

module.exports = app;
