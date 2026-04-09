const { body } = require('express-validator');

const eventValidationRules = [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('date').notEmpty().withMessage('Date is required').isISO8601().withMessage('Date must be a valid ISO date'),
  body('status').optional().isIn(['upcoming', 'completed', 'cancelled']).withMessage('Invalid status'),
  body('category').optional().isString(),
];

module.exports = { eventValidationRules };
