const Order = require('../models/orderModel');

exports.insertManyOrders = async (ordersData) => {
  return await Order.insertMany(ordersData);
};

exports.editDeliveryAddress = async (orderid, newAddress) => {
  return await Order.findOneAndUpdate(
    { orderid },
    { delivery_address: newAddress },
    { new: true }
  );
};

exports.removeOrderById = async (orderid) => {
  return await Order.findOneAndDelete({ orderid });
};

exports.findAllOrders = async () => {
  return await Order.find();
};

exports.calculateTotalAmountSum = async () => {
  const result = await Order.aggregate([
    {
      $group: {
        _id: null,
        totalSum: { $sum: "$total_amount" }
      }
    }
  ]);
  return result.length > 0 ? result[0].totalSum : 0;
};

exports.countProductSomi = async () => {
  const result = await Order.aggregate([
    { $unwind: "$products" },
    { $match: { "products.product_id": "somi" } },
    {
      $group: {
        _id: null,
        totalCount: { $sum: "$products.quantity" }
      }
    }
  ]);
  return result.length > 0 ? result[0].totalCount : 0;
};

exports.removeAllOrders = async () => {
  return await Order.deleteMany({});
};

