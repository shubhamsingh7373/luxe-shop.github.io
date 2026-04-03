const nodemailer = require('nodemailer');
(async () => {
    try {
        console.log('Generating ethereal account...');
        const testAcc = await nodemailer.createTestAccount();
        const transporter = nodemailer.createTransport({ host: "smtp.ethereal.email", port: 587, auth: { user: testAcc.user, pass: testAcc.pass } });
        console.log('Sending message...');
        const info = await transporter.sendMail({
            from: '"LUXE Shop" <a@b.c>',
            to: 'test@example.com',
            subject: 'Test',
            text: 'Test mail'
        });
        console.log('👁️ PREVIEW LINK: ' + nodemailer.getTestMessageUrl(info));
    } catch(e) {
        console.error('Error', e);
    }
})();
