const { Store, Rating, User } = require('../models');
const { Op } = require('sequelize');

// controllers/adminController.js

exports.getAllStores = async (req, res) => {
  try {
    const { sortBy, order, search } = req.query;

    const whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { address: { [Op.like]: `%${search}%` } }
      ];
    }

    const sortField = sortBy || 'name';
    const sortOrder = order && order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const stores = await Store.findAll({
      where: whereClause,
      order: [[sortField, sortOrder]],
      include: [
        {
          model: Rating,
          // attributes: ['score'] // Let's fetch the whole object to be safe
        }
      ]
    });

    const formattedStores = stores.map(store => {
      const ratings = store.Ratings || [];
      
      // Calculate Average
      const totalScore = ratings.reduce((acc, curr) => acc + curr.score, 0);
      const averageRating = ratings.length > 0
        ? (totalScore / ratings.length).toFixed(1)
        : "0.0"; // Return string "0.0" for consistency

      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        rating: averageRating, // This is what the frontend needs
        totalRatings: ratings.length // Let's add this count too
      };
    });

    res.json(formattedStores);
  } catch (error) {
    console.error("Admin Store Fetch Error:", error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.submitRating = async (req, res) => {
  try {
    const { storeId, score } = req.body;
    const userId = req.user.id;

    if (score < 1 || score > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const store = await Store.findByPk(storeId);
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // CHECK: Use 'UserId' and 'StoreId' (PascalCase) to match Sequelize defaults
    const existingRating = await Rating.findOne({
      where: { UserId: userId, StoreId: storeId }
    });

    if (existingRating) {
      existingRating.score = score;
      await existingRating.save();
      return res.json({ message: 'Rating updated successfully', rating: existingRating });
    }

  
    const newRating = await Rating.create({
      UserId: userId,
      StoreId: storeId,
      score
    });

    res.status(201).json({ message: 'Rating submitted successfully', rating: newRating });
  } catch (error) {
    console.error("Rating Error:", error); 
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};