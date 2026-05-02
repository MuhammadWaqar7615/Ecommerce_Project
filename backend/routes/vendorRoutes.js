const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
  createShop,
  getShop,
  updateShop,
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  hideProduct,
  showProduct,
  deleteProduct,
  getCategoriesForVendor,
  getOrders,
  updateOrderStatus,
  getRevenueAnalytics,
} = require('../controllers/vendorController');

router.use(protect);
router.use(authorize('vendor'));

router.post('/shop', createShop);
router.get('/shop', getShop);
router.put('/shop', updateShop);
router.get('/products', getProducts);
router.post('/products', addProduct);
router.put('/products/:id', updateProduct);
router.get('/products/:id', getProductById);
router.put('/products/:id/hide', hideProduct);
router.put('/products/:id/show', showProduct);
router.delete('/products/:id', deleteProduct);
router.get('/categories', getCategoriesForVendor);  // ← USE THE CONTROLLER FUNCTION
router.get('/orders', getOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.get('/revenue', getRevenueAnalytics);

router.post('/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: { imageUrl }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;