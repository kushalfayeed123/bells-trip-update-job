const express = require('express');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();
const app = express();
app.use(express.json());
const { env } = require('process');

const admin = require('firebase-admin');
const { getMessaging } = require('firebase-admin/messaging');

const { privateKey } = JSON.parse(process.env.PRIVATE_KEY);



admin.initializeApp({
    credential: admin.credential.cert({
        projectId: process.env.PROJECT_ID,
        privateKey,
        clientEmail: process.env.CLIENT_EMAIL,
    })
});

app.post('/send-notification', async (req, res) => {
    try {
        const { registrationToken, message } = req.body;
        console.log(registrationToken)

        // Create the multicast message object
        const payload = {
            notification: {
                title: message.title,
                body: message.body,
            },
            token: registrationToken,

        };

        // // Send the notification
        // getMessaging().send(payload).then((response) => {
        //     console.log('Notification sent:', response);
        // })
        //     .catch((error) => {
        //         console.error('Error sending notification:', error);
        //     });


        // Send a message to the device corresponding to the provided
        // registration token.
        getMessaging().send(payload)
            .then((response) => {
                // Response is a message ID string.
                console.log('Successfully sent message:', response);
            })
            .catch((error) => {
                console.log('Error sending message:', error);
            });


        res.status(200).json({ success: true, message: 'Notification sent successfully' });
    } catch (error) {
        console.error('Error sending notification:', error);
        res.status(500).json({ success: false, message: 'Error sending notification', error: error.message });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log(`listening for webhooks on port ${port}`);
});
