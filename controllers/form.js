const sgMail = require('@sendgrid/mail'); // SENDGRID_API_KEY
sgMail.setApiKey(process.env.SENDGRID_API_KEY);


exports.contactForm = (req, res) => {
    const { email, name, message } = req.body;
    // console.log(req.body);

    const emailData = {
        from: process.env.EMAIL_FROM,
        to:process.env.EMAIL_TO ,
        subject: `Contact form - ${process.env.APP_NAME}`,
        text: `Email received from contact from \n Sender name: ${name} \n Sender email: ${email} \n Sender message: ${message}`,
        html: `
            <h4>Email received from contact form:</h4>
            <p>Sender name: ${name}</p>
            <p>Sender email: ${email}</p>
            <p>Sender message: ${message}</p>
            <hr />
            <p>This email may contain sensetive information</p>
            <p>https://stikboard.com</p>
        `
    };

    sgMail
    .send(emailData)
    .then(() => {
        return res.json({
            message: `Email has been sent to ${email}`
        });
    })
    .catch(error => {
        return res.status(400).json({
            success: false,
            error:console.log(error)
        });
    });
};

exports.contactBlogAuthorForm = (req, res) => {
    const { authorEmail,email, name, message } = req.body;
    // console.log(req.body);

    let maillist = [authorEmail,process.env.EMAIL_TO]

    const emailData = {
        to: maillist,
        from: process.env.EMAIL_TO,
        subject: `Someone messaged you from  - ${process.env.APP_NAME}`,
        text: `Email received from contact from \n Sender name: ${name} \n Sender email: ${email} \n Sender message: ${message}`,
        html: `
            <h4>Message recieved from:</h4>
            <p>Name: ${name}</p>
            <p>Email: ${email}</p>
            <p>Message: ${message}</p>
            <hr />
            <p>This email may contain sensetive information</p>
            <p>https://stikboard.com</p>
        `
    };

    sgMail
    .send(emailData)
    .then(() => {
        return res.json({
            message: `Email has been sent to ${email}`
        });
    })
    .catch(error => {
        return res.status(400).json({
            success: false,
            error:console.log(error)
        });
    });
};

