
const express = require('express');
const router = express.Router();

const Transaction = require('../models/Transaction');
const Invoice = require('../models/Invoice');

const {
  getPayPalAccessToken,
  createPayPalOrder,
  capturePayPalOrder,
} = require('../services/paypalService');

// Test PayPal authentication
router.get('/test-auth', async (req, res) => {
  try {
    const token = await getPayPalAccessToken();

    res.json({
      success: true,
      message: 'PayPal authentication successful!',
      tokenReceived: Boolean(token),
    });
  } catch (error) {
    console.error('PayPal auth error:', error.response?.data || error.message);
    res.status(502).json({
      success: false,
      message: 'PayPal authentication failed',
    });
  }
});

// Create an order for a specific invoice
router.post('/create-order', async (req, res) => {
  try {
    const { invoiceId } = req.body;

    if (!invoiceId) {
      return res.status(400).json({
        success: false,
        message: 'Invoice ID is required',
      });
    }

    const invoice = await Invoice.findById(invoiceId);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
    }

    if (invoice.status === 'paid') {
      return res.status(409).json({
        success: false,
        message: 'This invoice has already been paid',
      });
    }

    // This Sandbox integration currently uses USD.
    if (invoice.currency !== 'USD') {
      return res.status(400).json({
        success: false,
        message: 'PayPal checkout currently supports USD invoices only. Create a new USD invoice.',
      });
    }

    const order = await createPayPalOrder(
      invoice.amount,
      invoice.currency
    );

    // Associate the PayPal order with this invoice.
    invoice.paypalOrderId = order.id;
    await invoice.save();

    res.status(201).json({
      success: true,
      message: 'PayPal order created',
      data: { orderId: order.id },
    });
  } catch (error) {
    console.error('Create order error:', error.response?.data || error.message);
    res.status(502).json({
      success: false,
      message: 'Unable to create PayPal order',
    });
  }
});

// Capture payment and update the associated invoice
router.post('/capture-order', async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId || typeof orderId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'A valid PayPal order ID is required',
      });
    }

    const invoice = await Invoice.findOne({
      paypalOrderId: orderId,
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'No invoice is associated with this PayPal order',
      });
    }

    // Avoid duplicate capture and transaction records.
    const existingTransaction = await Transaction.findOne({
      providerOrderId: orderId,
    });

    if (existingTransaction) {
      if (invoice.status !== 'paid') {
        invoice.status = 'paid';
        invoice.paypalCaptureId = existingTransaction.providerCaptureId;
        await invoice.save();
      }

      return res.status(200).json({
        success: true,
        message: 'Payment already recorded and invoice updated',
        data: { invoice, transaction: existingTransaction },
      });
    }

    if (invoice.status === 'paid') {
      return res.status(409).json({
        success: false,
        message: 'This invoice is already paid',
      });
    }

    const capture = await capturePayPalOrder(orderId);

    if (capture.status !== 'COMPLETED') {
      return res.status(409).json({
        success: false,
        message: 'PayPal payment is not completed',
      });
    }

    const unit = capture.purchase_units?.[0];
    const captureDetails = unit?.payments?.captures?.[0];

    if (!captureDetails || captureDetails.status !== 'COMPLETED') {
      return res.status(409).json({
        success: false,
        message: 'No completed payment capture was returned',
      });
    }

    // Verify that the captured amount and currency match the invoice.
    const capturedAmount = Number(captureDetails.amount.value);

    if (
      captureDetails.amount.currency_code !== invoice.currency ||
      Math.abs(capturedAmount - invoice.amount) > 0.001
    ) {
      return res.status(409).json({
        success: false,
        message: 'Captured payment does not match the invoice amount or currency',
      });
    }

    const transaction = await Transaction.create({
      merchant: invoice.client,
      amount: capturedAmount,
      currency: captureDetails.amount.currency_code,
      type: 'income',
      category: 'Invoice Payment',
      description: `Payment for invoice ${invoice.invoiceNumber}`,
      paymentMethod: 'PayPal',
      status: 'completed',
      paymentProvider: 'PayPal',
      providerOrderId: orderId,
      providerCaptureId: captureDetails.id,
      transactionDate: new Date(),
    });

    invoice.status = 'paid';
    invoice.paypalCaptureId = captureDetails.id;
    await invoice.save();

    res.status(200).json({
      success: true,
      message: 'Payment completed! Invoice marked as paid.',
      data: {
        invoice,
        transaction,
      },
    });
  } catch (error) {
    console.error('Capture order error:', error.response?.data || error.message);

    res.status(502).json({
      success: false,
      message: 'Unable to capture PayPal payment',
    });
  }
});

module.exports = router;
