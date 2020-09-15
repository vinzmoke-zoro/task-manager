const nodemailer = require('nodemailer')
const transporter = nodemailer.createTransport({
    service : 'gmail',
    auth : {
        user : 'imtiazrahman2002@gmail.com',
        pass : process.env.MAIL_PASS
    }
})
const sendWelcomeEmail = (email, name) => {
const mailOptions = {
    from : 'imtiazrahman2002@gmail.com',
    to : email,
    subject : 'Thanks for joining in!',
    text : `Welcome to the app, ${name}.Let me know how you get along with the app.`
  }

 transporter.sendMail(mailOptions, (err, info) => {
     if(err){
         return console.log(err)
     }
     console.log('Email sent : ' + info.response)
 })
}
const sendCancelEmail = (email, name) => {
const mailOptions = {
    from : 'imtiazrahman2002@gmail.com',
    to : email,
    subject : 'Your account has been successfully removed!',
    text : `Hey ${name}.You have recently deleted your account on my task manager app.I am really sorry if I you didn't like the app.It would be really humble of you to send me back a detailed feedback on why you deleted your account so that I can improve it further and make it upto your preferences.Thanks for staying with me :)`
  }

 transporter.sendMail(mailOptions, (err, info) => {
     if(err){
         return console.log(err)
     }
     console.log('Email sent : ' + info.response)
 })
}
module.exports = {
    sendWelcomeEmail,
    sendCancelEmail
}
