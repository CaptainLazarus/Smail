const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const app = express();
const AWS = require('aws-sdk');
require('dotenv').config();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var transporter = nodemailer.createTransport({
    name: 'endpoint' , 
    host: 'hostname', 
    secure: true,
    auth:{
        user:`${process.env.EMAIL}`,
        pass:`${process.env.PASSWORD}`
    }
});

transporter.verify(function (error, success) {
    if (error) {
        console.log(error);
    } else {
        console.log("Server is ready to take our messages");
    }
});

app.post("/", (req, res) => {


    function Send() {
        
        var verify = Math.floor((Math.random() * 10000000) + 1);
        
        var params = {
            Message: `To verify your`,
            PhoneNumber: "+" + req.body.number,
            MessageAttributes: {
                // 'AWS.SNS.SMS.Subject': {
                //     'DataType': 'String',
                //     'StringValue': req.query.subject
                // },
                "AWS.SNS.SMS.SMSType": {
                    DataType: "String",
                    StringValue: "Transactional",
                },
            },
        };

        var mailOption = {
            from :`${process.env.EMAIL}`, // sender this is your email here
            to : `${req.body.email}`, // receiver email2
            subject: "Account Verification",
            html: `<p>Please verify your account</p><br><hr>
        <br><a href="http://localhost:3000/verification/?verify=${verify}"><p>Click here to verify mail</p></a>`
        };

        var publishTextPromise = new AWS.SNS({apiVersion: "2010-03-31"}).publish(params).promise();

        transporter.sendMail(mailOption,(error,info)=>{
            if(error){
                console.log(error)
            }else{
                console.log("Mail Sent");
            }
        });

        publishTextPromise.then(function (data) {
            res.end(JSON.stringify({
                MessageID: data.MessageId
            }));
        })
        .catch(function (err) {
            console.log(err);
        });
    }

    Send();

});

app.listen(3000, () => console.log('Server Running on port 3000'));