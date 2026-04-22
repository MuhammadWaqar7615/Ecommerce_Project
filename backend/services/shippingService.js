const Setting = require('../models/Setting');

const getShippingRules = async () => {
  const baseFee = await Setting.findOne({ key: 'shipping_base_fee' });
  const perKmRate = await Setting.findOne({ key: 'shipping_per_km_rate' });
  const maxDistance = await Setting.findOne({ key: 'max_distance_for_delivery' });
  
  return {
    baseFee: baseFee ? baseFee.value : 150,
    perKmRate: perKmRate ? perKmRate.value : 10,
    maxDistance: maxDistance ? maxDistance.value : 50,
  };
};

const calculateShippingFee = async (distance) => {
  const rules = await getShippingRules();
  
  if (distance > rules.maxDistance) {
    throw new Error(`Delivery not available beyond ${rules.maxDistance} km`);
  }
  
  return rules.baseFee + (distance * rules.perKmRate);
};

module.exports = { getShippingRules, calculateShippingFee };