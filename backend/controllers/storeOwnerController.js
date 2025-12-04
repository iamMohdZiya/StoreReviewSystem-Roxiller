const { Store, Rating, User } = require('../models');

exports.getOwnerDashboard = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const store = await Store.findOne({
      where: { ownerId },
      include: [
        {
          model: Rating,
          include: [
            {
              model: User,
              attributes: ['name', 'email']
            }
          ]
        }
      ]
    });

    if (!store) {
      return res.status(404).json({ message: 'No store found for this account' });
    }

    const ratings = store.Ratings || [];
    const totalScore = ratings.reduce((acc, curr) => acc + curr.score, 0);
    const averageRating = ratings.length > 0 
      ? (totalScore / ratings.length).toFixed(1) 
      : 0;

    const userList = ratings.map(r => ({
      userName: r.User.name,
      email: r.User.email,
      score: r.score,
      date: r.updatedAt
    }));

    res.json({
      storeName: store.name,
      address: store.address,
      averageRating: parseFloat(averageRating),
      totalRatings: ratings.length,
      ratings: userList
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};