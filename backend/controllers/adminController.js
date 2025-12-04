const { User, Store, Rating } = require('../models');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalStores = await Store.count();
    const totalRatings = await Rating.count();

    res.json({
      totalUsers,
      totalStores,
      totalRatings
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      address,
      role: role || 'NORMAL_USER'
    });

    res.status(201).json({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createStore = async (req, res) => {
  try {
    const { name, email, address, ownerId } = req.body;

    const store = await Store.create({
      name,
      email,
      address,
      ownerId
    });

    res.status(201).json(store);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const { sortBy, order, role, search } = req.query;

    const whereClause = {};
    if (role) whereClause.role = role;
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { address: { [Op.like]: `%${search}%` } }
      ];
    }

    const sortField = sortBy || 'createdAt';
    const sortOrder = order && order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const users = await User.findAll({
      where: whereClause,
      order: [[sortField, sortOrder]],
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Store,
          as: 'managedStore',
          attributes: ['id', 'name'],
          include: [
            {
              model: Rating,
              attributes: ['score']
            }
          ]
        }
      ]
    });

    const formattedUsers = users.map(user => {
      let averageRating = null;
      if (user.role === 'STORE_OWNER' && user.managedStore && user.managedStore.Ratings) {
        const ratings = user.managedStore.Ratings;
        if (ratings.length > 0) {
          const sum = ratings.reduce((acc, curr) => acc + curr.score, 0);
          averageRating = (sum / ratings.length).toFixed(1);
        }
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
        storeRating: averageRating
      };
    });

    res.json(formattedUsers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

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
          attributes: ['score']
        }
      ]
    });

    const formattedStores = stores.map(store => {
      const ratings = store.Ratings || [];
      const averageRating = ratings.length > 0
        ? (ratings.reduce((acc, curr) => acc + curr.score, 0) / ratings.length).toFixed(1)
        : 0;

      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        rating: parseFloat(averageRating)
      };
    });

    res.json(formattedStores);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};