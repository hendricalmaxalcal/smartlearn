const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const sendVerificationEmail = async (email, name, token) => {
  const url = `${process.env.CLIENT_URL}/verify-email/${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Verify your SmartLearn account',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      </head>
      <body style="margin:0;padding:0;background:#f9fafb;font-family:Inter,system-ui,sans-serif;">
        <div style="max-width:520px;margin:40px auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
          
          <!-- Header -->
          <div style="background:#534AB7;padding:32px;text-align:center;">
            <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:500;">SmartLearn</h1>
            <p style="color:#c4c0f0;margin:4px 0 0;font-size:14px;">Your learning platform</p>
          </div>

          <!-- Body -->
          <div style="padding:32px;">
            <h2 style="font-size:20px;font-weight:500;color:#111827;margin:0 0 8px;">
              Hi ${name}! 👋
            </h2>
            <p style="color:#6b7280;font-size:15px;line-height:1.6;margin:0 0 24px;">
              Welcome to SmartLearn! You're one step away from accessing quality academic 
              content for Form 1–6. Please verify your email address to activate your account.
            </p>

            <!-- Button -->
            <div style="text-align:center;margin:32px 0;">
              <a href="${url}"
                style="background:#534AB7;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:500;display:inline-block;">
                Verify my email
              </a>
            </div>

            <p style="color:#9ca3af;font-size:13px;text-align:center;margin:0 0 8px;">
              Or copy and paste this link into your browser:
            </p>
            <p style="color:#534AB7;font-size:12px;text-align:center;word-break:break-all;margin:0 0 24px;">
              ${url}
            </p>

            <div style="border-top:1px solid #f3f4f6;padding-top:20px;">
              <p style="color:#9ca3af;font-size:12px;margin:0;">
                This link expires in <strong>24 hours</strong>. 
                If you did not create a SmartLearn account, you can safely ignore this email.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb;">
            <p style="color:#9ca3af;font-size:12px;margin:0;text-align:center;">
              © 2026 SmartLearn. All rights reserved.
            </p>
          </div>

        </div>
      </body>
      </html>
    `,
  });
};

const sendPasswordResetEmail = async (email, name, token) => {
  const url = `${process.env.CLIENT_URL}/reset-password/${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Reset your SmartLearn password',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;background:#f9fafb;font-family:Inter,system-ui,sans-serif;">
        <div style="max-width:520px;margin:40px auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
          
          <div style="background:#534AB7;padding:32px;text-align:center;">
            <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:500;">SmartLearn</h1>
          </div>

          <div style="padding:32px;">
            <h2 style="font-size:20px;font-weight:500;color:#111827;margin:0 0 8px;">
              Reset your password
            </h2>
            <p style="color:#6b7280;font-size:15px;line-height:1.6;margin:0 0 24px;">
              Hi ${name}, we received a request to reset your SmartLearn password. 
              Click the button below to choose a new password.
            </p>

            <div style="text-align:center;margin:32px 0;">
              <a href="${url}"
                style="background:#534AB7;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:500;display:inline-block;">
                Reset password
              </a>
            </div>

            <div style="border-top:1px solid #f3f4f6;padding-top:20px;">
              <p style="color:#9ca3af;font-size:12px;margin:0;">
                This link expires in <strong>1 hour</strong>. 
                If you did not request a password reset, you can safely ignore this email.
              </p>
            </div>
          </div>

          <div style="background:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb;">
            <p style="color:#9ca3af;font-size:12px;margin:0;text-align:center;">
              © 2026 SmartLearn. All rights reserved.
            </p>
          </div>

        </div>
      </body>
      </html>
    `,
  });
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };