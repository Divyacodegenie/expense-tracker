const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  amount:      { type: Number, required: true },
  category:    { type: String, required: true, 
                 enum: ['Food','Transport','Shopping','Bills','Health','Entertainment','Other'] },
  description: { type: String, default: '' },
  date:        { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);
