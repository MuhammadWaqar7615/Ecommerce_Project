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

module.exports = { sendWelcomeEmail, sendOrderConfirmation, sendVendorApprovalEmail };