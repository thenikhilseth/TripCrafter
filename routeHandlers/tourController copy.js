const fs = require('fs');

//Reading File- Top level code
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);
//Now our dirname will leave us at routeHandlers directory, so therefore we need to go one folder up

//Middlewares

// 1) Middleware function to check if the id is valid or not
exports.checkID = (req, res, next, val) => {
  console.log(`Tour id is ${val}`);
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      id: 'Invalid ID'
    });
  }

  next();
};

//2) Middleware function to check if the post request coming from client has name and price property
exports.checkBody = (req, res, next) => {
  console.log('Hello from createTour middleware');
  if (req.body.name == null || req.body.price == null) {
    return res.status(404).json({
      status: 'fail',
      id: 'Invalid Request'
    });
  }

  next();
};

//2)  Tour Route Handlers
exports.getAllTours = (req, res) => {
  res.status(200).json({
    result: 'success',
    requestedAt: req.requestTime,
    length: tours.length, //A good habit to return the length if the data is array of documents.
    data: {
      tours: tours
    }
  });
};

//3) Get one tour
exports.getOneTour = (req, res) => {
  console.log(req.params);
  console.log(req.params.id);

  const specificTour = tours.find(document => {
    return document.id === req.params.id;
  });

  res.status(200).json({
    result: 'success',
    data: {
      tour: specificTour
    }
  });
};

//4) Create a new tour
exports.createTour = (req, res) => {
  console.log(tours[tours.length - 1]);
  const newId = tours[tours.length - 1].id + 1;
  console.log(tours[tours.length - 1]);
  const newTour = Object.assign({}, { id: newId }, req.body);
  tours.push(newTour);

  fs.writeFile(
    `${__dirname}/../dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    err => {
      if (err) {
        console.log(`Writing Operation Unsucessful because of ${err}`);
      }
      res.status(201).json({
        result: 'success',
        data: {
          newTour: newTour
        }
      });
    }
  );
};

/*
1) Now we are going to use MongoDB, check page 25 of Node JS 1 MS word file.
*/
