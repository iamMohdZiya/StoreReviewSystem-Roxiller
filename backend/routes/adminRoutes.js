const express = require('express');
const router = express.Router();
const { 
  getDashboardStats, 
  createUser, 
  createStore, 
  getAllUsers, 
  getAllStores 
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validateSignup } = require('../middleware/validation'); 

router.use(protect);
router.use(authorize('ADMIN'));

router.get('/dashboard', getDashboardStats);
router.post('/users', validateSignup, createUser);
router.get('/users', getAllUsers);
router.post('/stores', createStore); 
router.get('/stores', getAllStores);

module.exports = router;