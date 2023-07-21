const express = require('express');
const fs = require('fs');
const app = express();

app.use(express.json());

// app.get('/', (req, res) => {
//   res.status(200).json({ Name: 'Nikhil', Title: 'Software Developer' });
// });

// app.post('/', (req, res) => {
//   res.status(200).send('Send anything to Nikhil Laptop');
// });

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

//API 1- Get the list of all tours
app.get('/api/v1/tours', (req, res) => {
  res.status(200).json({
    result: 'success',
    length: tours.length, //A good habit to return the length if the data is array of documents.
    data: {
      tours: tours,
    },
  });
});

////API 2- Get the details of specific tour by giving tour ID
app.get('/api/v1/tours/:id', (req, res) => {
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
});

//API 3- Post a new tour to the list of tours
app.post('/api/v1/tours', (req, res) => {
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
});

const port = 8000;
app.listen(port, () => {
  console.log(`App is Running on local host with port ${port}`);
});
