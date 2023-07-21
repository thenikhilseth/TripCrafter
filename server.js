const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./Models/tourModels');
dotenv.config({ path: './config.env' }); //storing our variables in node js global variables
const app = require('./appv3');

const DBString = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DBString, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
  })
  .then(connection => {
    console.log(`DB Connection is successful`);
  });

// console.log(process.env); //to show the environment variables.

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`App is Running on local host with port ${port}`);
});
