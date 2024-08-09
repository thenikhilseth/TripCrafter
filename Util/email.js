const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Nikhil Seth <${process.env.EMAIL_FROM}>`;
  }
  //this function makes different transport for different environment variables.
  //1) Mailtrap in development and Sendgrid in Production to send real emails.
  newTransport() {
    //1) Create a transporter
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      // logger: true, //to know the errors.
      secure: false,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }
  //Actually send the email
  async send(template, subject) {
    //1) Render HTML based on pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject
    });

    //2) Define Email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: subject,
      html: html,
      text: htmlToText.convert(html)
    };
    //3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  //Send welcome email function
  async sendWelcome() {
    await this.send('Welcome', 'Welcome to the TripCrafter Family!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for 10 minutes'
    );
  }
};

// const sendEmail = async options => {
//   //1) Create a transporter
//   // const transporter = nodemailer.createTransport({
//   //   host: process.env.EMAIL_HOST,
//   //   port: process.env.EMAIL_PORT,
//   //   // logger: true, //to know the errors.
//   //   secure: false,
//   //   auth: {
//   //     user: process.env.EMAIL_USERNAME,
//   //     pass: process.env.EMAIL_PASSWORD
//   //   }
//   // });

//   //2) Define the Email Options
//   const mailOptions = {
//     from: 'Nikhil Seth <nikhilseth27@gmail.com>',
//     to: options.email,
//     subject: options.subject,
//     text: options.message
//   };

//   //3) Actually send the email
//   await transporter.sendMail(mailOptions);
// };
