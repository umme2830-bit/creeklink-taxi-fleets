require('dotenv').config();
const express = require('express');
const path    = require('path');
const cookieParser = require('cookie-parser');
const mongoose     = require('mongoose');

const app = express();

// ── View engine ─────────────────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// ── DB connection (graceful fallback) ────────────────────────────────────────
if (process.env.MONGO_URI) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.warn('⚠️  MongoDB not connected — using mock data:', err.message));
}

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/',          require('./routes/index'));
app.use('/services',  require('./routes/services'));
app.use('/book',      require('./routes/book'));
app.use('/about',     require('./routes/about'));
app.use('/contact',   require('./routes/contact'));
app.use('/',          require('./routes/auth'));
app.use('/dashboard', require('./routes/dashboard'));

// ── 404 ──────────────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).render('404', { title: 'Page Not Found — CreekLink' }));

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).render('404', { title: 'Server Error — CreekLink' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚕 CreekLink running → http://localhost:${PORT}`));
