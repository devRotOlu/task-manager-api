
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'olayinka3234@gmail.com',
    pass: 'fabnas1989'
  }
});


const sendWelcomeEmail=(email,name)=>{

    const mailOptions= {
        from: 'olayinka3234@gmail.com',
        to:email,
        subject: 'thanks for signing up',
        text: `welcome to the app ${name}. let us know how you get along with the app`
    };

    transporter.sendMail(mailOptions);
       
}

const sendCancellationEmail=(name,email)=>{

    const mailOptions= {
        from: 'olayinka3234@gmail.com',
        to:email,
        subject: 'cancellation email',
        text: ` Hi ${name}, hope you enjoyed our service while it last. if there is anything we could differently to retain you kindly let us know`
    };

    transporter.sendMail(mailOptions);

}


module.exports= { 
    sendWelcomeEmail,
    sendCancellationEmail
}

