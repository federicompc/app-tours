const path = require('path');
const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const morgan = require('morgan');
const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');
const tourRouter = require('./routes/tourRoutes');
const usersRouter = require('./routes/userRoutes');
const reviewsRouter = require('./routes/reviewsRoute');
const viewRouter = require('./routes/viewRoutes');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
//GLOBAL MIDDLEWARE
//Security HTTP headers
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// LIMIT REQUEST GLOBAL MIDDLEWARE
const limiter = rateLimit({
  max: 100,
  windowMS: 60 * 6 * 1000,
  message: 'too many request from this IP, wait an hour'
});
app.use('/api', limiter);

// BODY PARSER
app.use(
  express.json({
    limit: '10kb'
  })
);
app.use(cookieParser());

// data sanitization middleware against noSQL query injectionnpm i
app.use(mongoSanitize());

// data sanitization againts XSS protect for injection of html or js
app.use(xss());

//parameter pollution // whitelist all fields on model

app.use(
  hpp({
    whitelist: ['duration', 'ratingsQuantity', 'price']
  })
);
// ADDING REQ TIME
app.use((req, res, next) => {
  req.dateTime = new Date().toISOString();
  console.log(req);
  next();
});
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/reviews', reviewsRouter);

//error handling when routes does not match
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`));
});
//global error handle middleware
app.use(globalErrorHandler);
module.exports = app;
