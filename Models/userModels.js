const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: [true, 'please tell us your name']
  },

  email: {
    type: String,
    unique: true,
    required: [true, 'Please provide your email'],
    lowercase: true,
    // validate: { OUR OWN FUNCTION TO CHECK EMAIL
    //     validator: function(val) {
    //       if (val.endswith('@gmail.com')==false) {
    //         return false
    //       }
    //     },
    //     message: "Enter the correct email "
    //   }
    validate: [validator.isEmail, 'Please provide a valid email'] //inbuilt validator of validator module to check email
  },

  photo: {
    type: String
  },

  role: {
    type: String,
    enum: ['admin', 'user', 'lead-guide', 'guide'],
    default: 'user'
  },

  active: {
    //If user is active or not
    type: Boolean,
    default: true,
    select: false
  },

  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false
  },
  //This works only for CREATE or SAVE
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      //Only works for Save or Create, not for update
      validator: function(val) {
        if (val !== this.password) {
          return false;
        }
      },
      message: 'Password is not same'
    }
  },
  passwordResetToken: String,
  passwordResetExpires: Date
});

//Before giving the result for find operation, hide all the users with active status set to false,
//Therefore we are using query middleware

userSchema.pre(/^find/, function(next) {
  //this points to current query/path requested by the client
  this.find({ active: { $ne: false } }); //Only shows the users with active field not se to false.
  next();
});

//Before saving the password to database, encrypt it. (ONLY WORK FOR SAVE)
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 9); //11 is the salt level- level of encryption

  this.passwordConfirm = undefined; // we delete passwordConfirm field before saving it to database

  next();
});

userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; //The duration is 10 minutes from current date. We convert 10 minutes into milliseconds because now() returns milliseconds
  console.log(resetToken, this.passwordResetToken, this.passwordResetExpires);
  return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
