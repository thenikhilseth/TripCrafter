const express = require('express');
const fs = require('fs');
const path = require('path');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const tourRouter = require('./Routes/tourRoutes.js');
const userRouter = require('./Routes/userRoutes.js');
const reviewRouter = require('./Routes/reviewRoutes.js');
const viewRouter = require('./Routes/viewRoutes.js');
const bookingRouter = require('./Routes/bookingRoutes.js');
const appError = require('./Util/appError');
const errorMiddleware = require('./routeHandlers/errorController');
const ExpressMongoSanitize = require('express-mongo-sanitize');
const app = express();
//Global MIDDLEWARES

app.set('view engine', 'pug'); //Setting view engine as Pug
app.set('views', path.join(__dirname, 'views')); //views is the folder where we will store all the templates.

//Set Security HTTP Headers
app.use(helmet());
const scriptSrcUrls = [
  'https://api.tiles.mapbox.com/',
  'https://api.mapbox.com/'
];
const styleSrcUrls = [
  'https://api.mapbox.com/',
  'https://api.tiles.mapbox.com/',
  'https://fonts.googleapis.com/'
];
const connectSrcUrls = [
  'https://api.mapbox.com/',
  'https://a.tiles.mapbox.com/',
  'https://b.tiles.mapbox.com/',
  'https://events.mapbox.com/'
];
const fontSrcUrls = ['fonts.googleapis.com', 'fonts.gstatic.com'];
// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: [],
//       connectSrc: ["'self'", ...connectSrcUrls],
//       scriptSrc: ["'self'", ...scriptSrcUrls],
//       styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
//       workerSrc: ["'self'", 'blob:'],
//       objectSrc: [],
//       imgSrc: ["'self'", 'blob:', 'data:'],
//       fontSrc: ["'self'", ...fontSrcUrls]
//     }
//   })
// );
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", 'data:', 'blob:'],

      baseUri: ["'self'"],

      fontSrc: ["'self'", 'https:', 'data:'],

      scriptSrc: ["'self'", 'https://*.cloudflare.com'],

      scriptSrc: ["'self'", 'https://*.stripe.com'],

      scriptSrc: ["'self'", 'http:', 'https://*.mapbox.com', 'data:'],

      frameSrc: ["'self'", 'https://*.stripe.com'],

      objectSrc: ["'none'"],

      styleSrc: ["'self'", 'https:', "'unsafe-inline'"],

      workerSrc: ["'self'", 'data:', 'blob:'],

      childSrc: ["'self'", 'blob:'],

      imgSrc: ["'self'", 'data:', 'blob:'],

      connectSrc: ["'self'", 'blob:', 'https://*.mapbox.com'],

      upgradeInsecureRequests: []
    }
  })
);
app.use(express.json());
console.log(process.env.NODE_ENV); //Print environment

//Development Logging Middleware

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); //3rd party middleware
}

//Body parse, reading data from body to req.body- convert JSON to js object, here we set the maximum size of file
// our middleware can parse to 20kb
app.use(express.json({ limit: '20kb' }));
app.use(cookieParser()); //parses data from cookies coming from client

//Display static files middleware
app.use(express.static(`${__dirname}/public`)); //To display static files

app.use((req, res, next) => {
  console.log('Hello from the Middleware');
  next();
});

//Get the time of request//Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.requestTime);
  next();
});

//RATE LIMITER Middleware
const limiter = rateLimit({
  max: 20,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests! Please try again after 1 hour'
});
app.use('/api', limiter);

//NoSQL Query Injection
app.use(mongoSanitize());

//Data Sanitization using xss
app.use(xss());

// //Prevent Parameter Pollution using hpp
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

//ROUTERS MIDDLEWARES

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

//HANDLING UNHANDLED ROUTES
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server`
  // });

  next(new appError(`Can't find ${req.originalUrl} on this server`));
});

//Sending Error Message (Error Middleware)
app.use(errorMiddleware);

//EXPORTING APP TO SERVER TO START IT
module.exports = app;
