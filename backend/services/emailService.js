const { sendEmail } = require('../config/nodemailer');

const sendWelcomeEmail = async (email, name) => {
  const html = `
    <h1>Welcome to Crafts & Delights!</h1>
    <p>Dear ${name},</p>
    <p>Thank you for registering with Crafts & Delights. We're excited to have you on board!</p>
    <p>Start exploring local crafts and delicious treats from Khanewal.</p>
    <a href="${process.env.CLIENT_URL}">Start Shopping</a>
  `;
  
  await sendEmail(email, 'Welcome to Crafts & Delights', html);
};

const sendVerificationEmail = async (email, verificationToken) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
  
  const html = `
    <h1>Verify Your Email Address</h1>
    <p>Thank you for registering with Crafts & Delights!</p>
    <p>Please click the link below to verify your email address:</p>
    <p><a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a></p>
    <p>This link expires in 24 hours.</p>
    <p>If you didn't register for this account, please ignore this email.</p>
    <hr>
    <p>Or copy and paste this link: ${verificationUrl}</p>
  `;
  
  await sendEmail(email, 'Verify Your Email - Crafts & Delights', html);
};

const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  const html = `
    <h1>Reset Your Password</h1>
    <p>We received a request to reset your password. Click the link below to set a new password:</p>
    <p><a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p>
    <p>This link expires in 1 hour.</p>
    <p>If you didn't request a password reset, please ignore this email.</p>
    <hr>
    <p>Or copy and paste this link: ${resetUrl}</p>
  `;
  
  await sendEmail(email, 'Reset Your Password - Crafts & Delights', html);
};

const sendOrderConfirmation = async (email, orderNumber) => {
  const html = `
    <h1>Order Confirmation</h1>
    <p>Your order #${orderNumber} has been placed successfully.</p>
    <p>You can track your order status in your dashboard.</p>
    <a href="${process.env.CLIENT_URL}/customer/orders">View Order</a>
  `;
  
  await sendEmail(email, `Order Confirmation #${orderNumber}`, html);
};

const sendVendorApprovalEmail = async (email, shopName) => {
  const html = `
    <h1>Vendor Account Approved!</h1>
    <p>Congratulations! Your shop "${shopName}" has been approved.</p>
    <p>You can now start adding products to your store.</p>
    <a href="${process.env.CLIENT_URL}/vendor/dashboard">Go to Dashboard</a>
  `;
  
  await sendEmail(email, 'Vendor Account Approved', html);
};

module.exports = { 
  sendWelcomeEmail, 
  sendVerificationEmail, 
  sendPasswordResetEmail,
  sendOrderConfirmation, 
  sendVendorApprovalEmail 
};