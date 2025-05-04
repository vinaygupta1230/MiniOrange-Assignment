import nodemailer from 'nodemailer';

// Create a transporter object using Gmail's SMTP server
const transporter = nodemailer.createTransport({
    service: 'gmail', // Use Gmail's SMTP service
    port: 587,
    auth: {
        user: process.env.GMAIL, // Your Gmail address
        pass: process.env.PASS   // Your Gmail password (no need for App Password if 2FA is off)
    }
});

export default transporter;
