const nodemailer = require("nodemailer");
const smtp = process.env.SMTP
const from_email = process.env.FROM_EMAIL
const pass = process.env.PASSWORD
  let transporter = nodemailer.createTransport({
    host: smtp,
    port: 587,
    secure: false,
      auth : {
        user: from_email,
        pass: pass
      } 
  });


const sendWelcomeEmail = async (email,name) => {
    const message = {
      from: from_email,
      to: email,
      subject: "Welcome To Task Manager.",
      html: `
      <h1>Hello ${name}</h1>
      <h2>Thanks for Joining In </h2>
      <h3>You can now upload your profile picture</h3>
      <h3> And manage your tasks.. </h3> `
    };
      transporter.sendMail(message, (err,info) => {
         if(err) {
            console.log(err);
         }
         else {
            console.log(info);
         }
      })
}

const sendCancellationEmail = async(email,name) => {
    const message = {
        from: from_email,
        to: email,
        subject: "Good Bye From Task Manager App.",
        html: `
        <h1>GoodBye  ${name}</h1>
        <h2>Is there anything we could have done to kept you back? </h2> `
      };
        transporter.sendMail(message, (err,info) => {
           if(err) {
              console.log(err);
           }
           else {
              console.log(info);
           }
        })
}

module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
}