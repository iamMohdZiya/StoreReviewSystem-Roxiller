const express = require('express');
const router = express.Router();
const { getOwnerDashboard } = require('../controllers/storeOwnerController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('STORE_OWNER'));

router.get('/dashboard', getOwnerDashboard);

module.exports = router;