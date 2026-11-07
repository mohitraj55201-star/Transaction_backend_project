
require('dotenv').config();
const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
  host: "192.178.211.109", 
  port: 587,
  secure: false,
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
   tls: {
        servername: "smtp.gmail.com"
    }
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});



// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Backend-proj" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};


async function sendRegistrationEmail(userEmail,name){
    const subject='Welcome to Backend Ledger!';
    const text=`Hello ${name},\n\nThank you for registration at Backend Ledger.`;
    const html=`<p>Hello ${name},</p><p>Thank you for registration at Backend Ledger`;
    await sendEmail(userEmail,subject,text,html);
}


async function sendTransactionEmail(userEmail, name, amount, toAccount) {
    const subject = 'Transaction Successful - Backend Ledger!';

    const text = `Hello ${name},\n\nYour transaction of ₹${amount} to account ${toAccount} has been initiated successfully.\n\nThank you for using Backend Ledger.`;

    const html = `
        <p>Hello ${name},</p>
        <p>Your transaction of <strong>₹${amount}</strong> to account <strong>${toAccount}</strong> has been initiated successfully.</p>
        <p>Thank you for using Backend Ledger.</p>
    `;

    await sendEmail(userEmail, subject, text, html);
}



async function sendTransactionFailureEmail(userEmail, name, amount, toAccount) {
    const subject = 'Transaction Failed - Backend Ledger!';

    const text = `Hello ${name},\n\nUnfortunately, your transaction of ₹${amount} to account ${toAccount} has failed.\n\nPlease check your account details and try again. If the amount was deducted, please contact support.\n\nThank you for using Backend Ledger.`;

    const html = `
        <p>Hello ${name},</p>
        <p>Unfortunately, your transaction of <strong>₹${amount}</strong> to account <strong>${toAccount}</strong> has failed.</p>
        <p>Please check your account details and try again. If the amount was deducted, please contact support.</p>
        <p>Thank you for using Backend Ledger.</p>
    `;

    await sendEmail(userEmail, subject, text, html);
}





module.exports = {
  sendRegistrationEmail,
  sendTransactionEmail,
  sendTransactionFailureEmail
};