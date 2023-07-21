const express = require('express');
const fs = require('fs');
const morgan = require('morgan');
const app = express();

//1) MIDDLEWARES
app.use(express.json());

app.use(morgan('dev')); //3rd party middleware

app.use((req, res, next) => {
  console.log('Hello from the Middleware');
  next();
});

//Get the time of request
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.requestTime);
  next();
});

//2) Top-level Code to read the files
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

//3) ROUTE HANDLERS
const getAllTours = (req, res) => {
  res.status(200).json({
    result: 'success',
    requestedAt: req.requestTime,
    length: tours.length, //A good habit to return the length if the data is array of documents.
    data: {
      tours: tours,
    },
  });
};

const getOneTour = (req, res) => {
  console.log(req.params);
  console.log(req.params.id);

  const specificTour = tours.find((document) => {
    return document.id === req.params.id;
  });

  if (specificTour == undefined) {
    return res.status(404).json({
      status: 'fail',
      id: 'Invalid ID',
    });
  }

  res.status(200).json({
    result: 'success',
    data: {
      tour: specificTour,
    },
  });
};

const createTour = (req, res) => {
  const newId = tours[tours.length - 1]._id + 1;
  const newTour = Object.assign({}, { id: newId }, req.body);
  tours.push(newTour);

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      if (err) {
        console.log(`Writing Operation Unsucessful because of ${err}`);
      }
      res.status(201).json({
        result: 'success',
        data: {
          newTour: newTour,
        },
      });
    }
  );
};

const getAllUsers = (req, res) => {
  res.status(500).json({
    status: 'Error',
    message: 'This route is not defined',
  });
};

const createUser = (req, res) => {
  res.status(500).json({
    status: 'Error',
    message: 'This route is not defined',
  });
};

const getUser = (req, res) => {
  res.status(500).json({
    status: 'Error',
    message: 'This route is not defined',
  });
};

const updateUser = (req, res) => {
  res.status(500).json({
    status: 'Error',
    message: 'This route is not defined',
  });
};

const deleteUser = (req, res) => {
  res.status(500).json({
    status: 'Error',
    message: 'This route is not defined',
  });
};

//4) ROUTES

// //API 1- Get the list of all tours
// app.get('/api/v1/tours', getAllTours);

// //API 2- Get the details of specific tour by giving tour ID
// app.get('/api/v1/tours/:id', getOneTour);

// //API 3- Post a new tour to the list of tours
// app.post('/api/v1/tours', createTour);

//Modified Way of Writing- Merging it all together

app.route('/api/v1/tours').get(getAllTours).post(createTour);
app.route('/api/v1/tours/:id').get(getOneTour);
app.route('/api/v1/users').get(getAllUsers).post(createUser);

app.route('/api/v1/user:id').get(getUser).patch(updateUser).delete(deleteUser);

//5) SERVER START
const port = 8000;
app.listen(port, () => {
  console.log(`App is Running on local host with port ${port}`);
});

/*Modifications Done-
1) Simply put all the arrow functions seperately in variables and use them for specific routes.
2) I put all the 3 arrow functions seperately and use them for each route get, create, getOne.
*/
