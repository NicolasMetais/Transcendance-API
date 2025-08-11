import nodemailer from 'nodemailer';
const gmailPass = process.env.MAIL_MDP;
if (!gmailPass) {
    throw new Error('MAIL_MDP is not set in environment variables');
}
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: "metaisnico112@gmail.com",
        pass: gmailPass,
    },
});
export async function sendEmail(to, subject, text) {
    const msg = {
        to,
        from: 'metaisnico112@gmail.com',
        subject,
        text,
    };
    try {
        await transporter.sendMail(msg);
    }
    catch (err) {
        console.error("Mail error :", err);
    }
}
