module.exports = {
  USER_ROLES: {
    CUSTOMER: 'customer',
    VENDOR: 'vendor',
    ADMIN: 'admin',
  },
  
  ORDER_STATUS: {
    PENDING: 'Pending',
    PROCESSING: 'Processing',
    SHIPPED: 'Shipped',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled',
    REFUNDED: 'Refunded',
  },
  
  PAYMENT_STATUS: {
    PENDING: 'Pending',
    PAID: 'Paid',
    REFUNDED: 'Refunded',
    FAILED: 'Failed',
  },
  
  DISPUTE_STATUS: {
    OPEN: 'Open',
    VENDOR_RESPONDED: 'Vendor Responded',
    ADMIN_REVIEWING: 'Admin Reviewing',
    RESOLVED: 'Resolved',
    REJECTED: 'Rejected',
  },
  
  DISPUTE_REASONS: {
    WRONG_ITEM: 'Wrong Item',
    NOT_DELIVERED: 'Not Delivered',
    DAMAGED: 'Damaged',
    OTHER: 'Other',
  },
  
  PRODUCT_CATEGORIES: [
    'Food',
    'Crafts',
    'Sandals',
    'Home Decor',
    'Other',
  ],
  
  ORDER_STATUS_SEQUENCE: {
    'Pending': 1,
    'Processing': 2,
    'Shipped': 3,
    'Delivered': 4,
  },
};