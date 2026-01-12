require('dotenv').config();

const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');

const app = express();

/* ===========================
   BODY PARSER
=========================== */
app.use(bodyParser.json({ limit: '10mb' }));

/* ===========================
   CREATE UPLOADS FOLDER (SERVER SAFE)
=========================== */
const uploadsPath = path.join('uploads', 'images');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

/* ===========================
   STATIC FILES
=========================== */
app.use('/uploads/images', express.static(uploadsPath));

/* ===========================
   CORS
=========================== */
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, DELETE'
  );
  next();
});

/* ===========================
   ROUTES
=========================== */
app.use('/api/places', placesRoutes);
app.use('/api/users', usersRoutes);

/* ===========================
   HEALTH CHECK (IMPORTANT)
=========================== */
let isDbConnected = false;

app.get('/api/status', (req, res) => {
  res.json({
    server: 'running',
    mongoDB: isDbConnected ? 'connected' : 'not connected'
  });
});

/* ===========================
   404 HANDLER
=========================== */
app.use((req, res, next) => {
  next(new HttpError('Could not find this route.', 404));
});

/* ===========================
   ERROR HANDLER
=========================== */
app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, err => {
      if (err) console.error(err);
    });
  }

  if (res.headersSent) {
    return next(error);
  }

  res.status(error.code || 500);
  res.json({
    message: error.message || 'An unknown error occurred!'
  });
});

/* ===========================
   DATABASE + SERVER
=========================== */
const mongoUri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.i5qw1rs.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

mongoose
  .connect(mongoUri)
  .then(() => {
    isDbConnected = true;
    console.log('✅ MongoDB connected');

    app.listen(process.env.PORT || 5000, () => {
      console.log('✅ Server running on port', process.env.PORT || 5000);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
  });
