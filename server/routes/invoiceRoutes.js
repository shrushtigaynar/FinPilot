
const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');

// GET all invoices
router.get('/', async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: invoices.length,
      data: invoices,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// CREATE invoice
router.post('/', async (req, res) => {
  try {
    const { client, amount, dueDate } = req.body;

    if (!client || !amount || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Client, amount and due date are required.',
      });
    }

    const lastInvoice = await Invoice.findOne({
      invoiceNumber: /^INV-\d+$/
    }).sort({ createdAt: -1 });

    const lastNumber = lastInvoice
      ? Number(lastInvoice.invoiceNumber.split('-')[1])
      : 0;

    const invoice = await Invoice.create({
      invoiceNumber: `INV-${String(lastNumber + 1).padStart(3, '0')}`,
      client: client.trim(),
      amount: Number(amount),
      currency: 'USD',
      dueDate: new Date(dueDate),
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully.',
      data: invoice,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }


    await invoice.deleteOne();

    res.json({
      success: true,
      message: 'Invoice deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
