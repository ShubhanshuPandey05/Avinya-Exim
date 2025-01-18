import webPush from "web-push";
import User from '../models/userModel.js';

// webPush.setVapidDetails(
//     'mailto:me@mail.com', // Contact email
//     process.env.VAPID_PUBLIC_KEY,
//     process.env.VAPID_PRIVATE_KEY
// );

export const subscribe = async (req, res) => {
    const { subscription, contactNumber } = req.body;

    console.log(subscription);
    console.log(contactNumber);

    const userr = await User.findOne({ MobileNo: contactNumber });
    console.log(userr);

    userr.Notify = true;
    userr.NotifySubscription = subscription;
    await userr.save();

    console.log('New subscription:', subscription);

    res.status(201).json({ message: 'Subscription added successfully!' });
}

export async function sendNotification(bellNo) {
    // const subscription = userr.NotifySubscription;
    const notificationPayload = {
        title: 'New Sale!!!',
        body: `New Sale for ${bellNo}`,
    };
    let users = await User.find({ City: "Surat" });
    users.map((user, index) => {
        if (user.NotifySubscription) {
            webPush
                .sendNotification(user.NotifySubscription, JSON.stringify(notificationPayload))
                .catch(error => console.error('Error sending notification:', error))
        }
    })
}