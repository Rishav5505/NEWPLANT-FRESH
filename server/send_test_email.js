const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const nodemailer = require('nodemailer');

async function sendTestEmail(to) {
  const SMTP_HOST = process.env.SMTP_HOST;
  const SMTP_PORT = process.env.SMTP_PORT;
  const SMTP_SECURE_RAW = process.env.SMTP_SECURE;
  const SMTP_USER = process.env.SMTP_USER;
  const SMTP_PASS = process.env.SMTP_PASS;
  const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER;

  const isSecure = String(SMTP_PORT) === '465' || String(SMTP_SECURE_RAW).toLowerCase() === 'true';

  console.log('SMTP environment (raw):', {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_SECURE_RAW,
    SMTP_USER,
    SMTP_PASS_SET: !!SMTP_PASS
  });

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || (isSecure ? 465 : 587),
    secure: isSecure,
    auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined
  });

  const info = await transporter.sendMail({
    from: SMTP_FROM,
    to,
    subject: 'NEWPLANT — Local test email',
    text: 'This is a test email sent from local send_test_email.js'
  });

  console.log('Send result:', info && info.response ? info.response : info);
}

const to = process.argv[2] || 'rishav550555@gmail.com';
sendTestEmail(to).catch(err => {
  console.error('Error sending test email:', err && err.message ? err.message : err);
  process.exit(1);
});
