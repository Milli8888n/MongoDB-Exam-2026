const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  product_id: { type: String, required: true },
  product_name: { type: String, required: true },
  size: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema({
  orderid: { type: Number, required: true, unique: true },
  products: [productSchema],
  total_amount: { type: Number, required: true },
  delivery_address: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema, 'OrderCollection');
