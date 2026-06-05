const crypto = require('crypto');
const axios = require('axios');
const Payment = require('../models/Payment');
const Reservation = require('../models/Reservation');

// Generate HMAC SHA256 signature for eSewa
const generateSignature = (message, secret) => {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(message);
  return hmac.digest('base64');
};

// @POST /api/payments/esewa/initiate
exports.initiateEsewa = async (req, res) => {
  const { reservationId } = req.body;

  const reservation = await Reservation.findById(reservationId)
    .populate('listing', 'title');

  if (!reservation)
    return res.status(404).json({ success: false, message: 'Reservation not found' });

  if (reservation.renter.toString() !== req.user.id)
    return res.status(403).json({ success: false, message: 'Not authorized' });

  const payment = await Payment.findOne({ reservation: reservationId });
  if (!payment)
    return res.status(404).json({ success: false, message: 'Payment not found' });

  const transactionId = `RENTALHUB-${reservationId}-${Date.now()}`;
  const amount = reservation.totalPrice;
  const taxAmount = 0;
  const totalAmount = amount;

  // Save transaction ID
  payment.transactionId = transactionId;
  await payment.save();

  // Generate signature
  const message = `total_amount=${totalAmount},transaction_uuid=${transactionId},product_code=${process.env.ESEWA_PRODUCT_CODE}`;
  const signature = generateSignature(message, process.env.ESEWA_SECRET_KEY);

  // Return form data for frontend
  res.status(200).json({
    success: true,
    formData: {
      amount,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      transaction_uuid: transactionId,
      product_code: process.env.ESEWA_PRODUCT_CODE,
      product_service_charge: 0,
      product_delivery_charge: 0,
      success_url: `${process.env.FRONTEND_URL}/payment/success`,
      failure_url: `${process.env.FRONTEND_URL}/payment/failure`,
      signed_field_names: 'total_amount,transaction_uuid,product_code',
      signature,
    },
    gatewayUrl: process.env.ESEWA_GATEWAY_URL,
  });
};

// @POST /api/payments/esewa/verify
exports.verifyEsewa = async (req, res) => {
  const { data } = req.body;

  try {
    // Decode base64 response from eSewa
    const decoded = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'));
    const {
      transaction_uuid,
      total_amount,
      status,
      signed_field_names,
      signature: receivedSignature,
    } = decoded;

    // Verify signature
    const message = signed_field_names
      .split(',')
      .map(field => `${field}=${decoded[field]}`)
      .join(',');

    const expectedSignature = generateSignature(message, process.env.ESEWA_SECRET_KEY);

    if (expectedSignature !== receivedSignature)
      return res.status(400).json({ success: false, message: 'Invalid signature' });

    if (status !== 'COMPLETE')
      return res.status(400).json({ success: false, message: 'Payment not completed' });

    // Find payment by transaction ID
    const payment = await Payment.findOne({ transactionId: transaction_uuid });
    if (!payment)
      return res.status(404).json({ success: false, message: 'Payment not found' });

    // Update payment status
    payment.status = 'completed';
    await payment.save();

    // Update reservation status
    await Reservation.findByIdAndUpdate(payment.reservation, {
      status: 'confirmed'
    });

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully!',
      payment,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Verification failed', error: err.message });
  }
};

// @GET /api/payments/my - Get my payments
exports.getMyPayments = async (req, res) => {
  const payments = await Payment.find()
    .populate({
      path: 'reservation',
      match: { renter: req.user.id },
      populate: { path: 'listing', select: 'title location' }
    })
    .sort('-createdAt');

  const filtered = payments.filter(p => p.reservation !== null);
  res.status(200).json({ success: true, payments: filtered });
};