const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Setup View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes API
app.get('/', (req, res) => {
    res.redirect('/api/orders/view-orders');
});

app.use('/api/orders', orderRoutes);

module.exports = app;
