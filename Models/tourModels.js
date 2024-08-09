const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal then 40 characters'],
      minlength: [10, 'A tour name must have more or equal then 10 characters'],
      validate: {
        //Validator to check if the string after removing spaces contain letters from A-Z
        validator: function(val) {
          return validator.isAlpha(val.replace(/ /g, ''));
        },
        message: 'A tour name must only contain letters'
        // validate: [validator.isAlpha, "A tour name must only contain letters"]
      }
    },
    nameInCapital: {
      type: String
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'hard', 'difficult'],
        message: 'Difficulty must be either easy, medium or hard'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1.0, 'Ratings must be above 1.0'],
      max: [5.0, 'Ratings must be below 5.0']
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          if (val > this.price) return false;
        },
        message: 'Discount ({VALUE}) cannot be greater than cost price'
      }
    },

    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image']
    },
    images: [String],
    secretTour: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false //it vl hide this field to client.
    },
    startDates: [Date],
    startLocation: {
      //GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    guides: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ]
  },

  {
    toJSON: { virtuals: true }, //Because we are sending JSON response to client and we do virtuals for clients only
    toObject: { virtuals: true }
  }
);

//Virtual Properties to add the durationWeek field in the response
tourSchema.virtual('durationWeeks').get(function() {
  if (this.duration) {
    return this.duration / 7;
  }
});

//DOCUMENT MIDDLEWARE
//Before document get saved

tourSchema.pre('save', function(next) {
  this.nameInCapital = slugify(this.name, { lower: true });
  next();
});

//QUERY MIDDLEWARE

tourSchema.pre(/^find/, function(next) {
  //vl work for all find such as findById, findOne, find etc
  this.find({ secretTour: { $ne: true } }); //Only find the tours that are not secret.
  this.start = Date.now();
  next();
});

//We can add it directly to all the find functions but it is better to make a middleware rather than
//duplicating the code. It worked for Update operations too that start with Find.

// POPULATING TOUR GUIDES
tourSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'guides', //which document field to populate
    select: '-__v -passwordChangedAt' //to hide some fields
  });
  next();
});

tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

//Virtually Populating (We will display reviews in the getTour request without storing the reviews in Tour)

tourSchema.virtual('reviews', {
  ref: 'review', //Referening to Review Schema Model
  foreignField: 'tour', //tour field in Review Model
  localField: '_id' //id of our tour
});

// tourSchema.post(/^find/, function(docs, next) {
//   console.log(`Query took ${Date.now() - this.start} milliseconds!`);
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
