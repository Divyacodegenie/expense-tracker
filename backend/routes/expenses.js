const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');

// GET all expenses with optional filters
router.get('/', async (req, res) => {
  try {
    const { category, startDate, endDate, sortBy } = req.query;

    // Build filter object dynamically
    let filter = {};

    if (category) {
      filter.category = category;
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate)   filter.date.$lte = new Date(endDate);
    }

    // Sort: newest first by default
    const sort = sortBy === 'amount' ? { amount: -1 } : { date: -1 };

    const expenses = await Expense.find(filter).sort(sort);

    // Calculate total
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    res.json({ count: expenses.length, total, expenses });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET spending summary by category
router.get('/summary', async (req, res) => {
  try {
    const summary = await Expense.aggregate([
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new expense
router.post('/', async (req, res) => {
  try {
    const expense = new Expense(req.body);
    const saved = await expense.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE expense by id
router.delete('/:id', async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update expense
router.put('/:id', async (req, res) => {
  try {
    const updated = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;