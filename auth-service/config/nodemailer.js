import nodemailer from 'nodemailer';


const transporter = nodemailer.createTransport({
    service: 'gmail',
    port: 587,
    auth: {
        user: process.env.GMAIL,
        pass: process.env.PASS
    }
});

export default transporter;
