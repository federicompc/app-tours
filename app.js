const path = require('path');
const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');
const morgan = require('morgan');
const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');
const tourRouter = require('./routes/tourRoutes');
const usersRouter = require('./routes/userRoutes');
const reviewsRouter = require('./routes/reviewsRoute');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
//GLOBAL MIDDLEWARE
//Security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'", '/*'],
        baseUri: ["'self'"],
        fontSrc: ["'self'", 'https:', 'data:'],
        scriptSrc: [
          "'self'",
          'https://*.stripe.com',
          'https://cdnjs.cloudflare.com/ajax/libs/axios/0.21.1/axios.min.js',
        ],
        frameSrc: ["'self'", 'https://*.stripe.com'],
        objectSrc: ["'none'"],
        styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
        upgradeInsecureRequests: [],
      },
    },
  })
);

app.use(compression());
//allow origins to all api
app.use(cors());
//preflight pahse
app.options('*', cors());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// LIMIT REQUEST GLOBAL MIDDLEWARE
const limiter = rateLimit({
  max: 100,
  windowMS: 60 * 6 * 1000,
  message: 'too many request from this IP, wait an hour',
});
app.use('/api', limiter);

// BODY PARSER
app.use(
  express.json({
    limit: '10kb',
  })
);
app.use(cookieParser());
//to parse data from form
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// data sanitization middleware against noSQL query injectionnpm i
app.use(mongoSanitize());

// data sanitization againts XSS protect for injection of html or js
app.use(xss());

//parameter pollution // whitelist all fields on model

app.use(
  hpp({
    whitelist: ['duration', 'ratingsQuantity', 'price'],
  })
);
// ADDING REQ TIME
app.use((req, res, next) => {
  req.dateTime = new Date().toISOString();
  // console.log(req);
  next();
});
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/reviews', reviewsRouter);
app.use('/api/v1/booking', bookingRouter);

//error handling when routes does not match
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`));
});
//global error handle middleware
app.use(globalErrorHandler);
module.exports = app;
