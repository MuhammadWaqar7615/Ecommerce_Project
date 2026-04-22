const Setting = require('../models/Setting');

const getCommissionPercentage = async () => {
  const setting = await Setting.findOne({ key: 'commission_percentage' });
  return setting ? setting.value : 5;
};

const calculateVendorEarnings = async (totalAmount) => {
  const commissionPercent = await getCommissionPercentage();
  const adminCommission = (totalAmount * commissionPercent) / 100;
  const vendorEarnings = totalAmount - adminCommission;
  
  return { adminCommission, vendorEarnings, commissionPercent };
};

module.exports = { getCommissionPercentage, calculateVendorEarnings };