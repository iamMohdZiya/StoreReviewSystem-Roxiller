const express = require('express');
const router = express.Router();
const { getAllStores, submitRating } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('NORMAL_USER'));

router.get('/stores', getAllStores);
router.post('/rating', submitRating);

module.exports = router;