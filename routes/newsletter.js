const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

let transporter;
async function initMailer() {
  if (process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.EMAIL_USER || 'shubhamkhushwaha300@gmail.com', pass: process.env.EMAIL_PASS } });
  } else {
    const testAcc = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({ host: "smtp.ethereal.email", port: 587, auth: { user: testAcc.user, pass: testAcc.pass } });
  }
}
initMailer();

router.post('/', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) return res.status(400).json({ error: 'Valid email is required' });
    
    if (transporter) {
      const info = await transporter.sendMail({
        from: '"LUXE Shop Newsletter" <hello@luxeshop.local>',
        to: email,
        subject: `🎉 Welcome to LUXE Shop!`,
        html: `<h3>Thank you for subscribing, <b>${email}</b>!</h3><p>You will now receive exclusive deals and updates on our new arrivals.</p><br><p>- Team LUXE Shop</p>`
      });
      if (!process.env.EMAIL_PASS) {
        console.log('\n=======================================');
        console.log('✉️ NEWSLETTER EMAIL SENT TO: ' + email);
        console.log('👁️ PREVIEW LINK: ' + nodemailer.getTestMessageUrl(info));
        console.log('=======================================\n');
      }
    }
    res.json({ message: 'Subscribed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
