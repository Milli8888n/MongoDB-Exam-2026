require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('../models/orderModel');
const connectDB = require('../config/db');

const seedData = [
  {
    orderid: 1,
    products: [
      {
        product_id: "quanau",
        product_name: "quan au",
        size: "XL",
        price: 10,
        quantity: 1
      },
      {
        product_id: "somi",
        product_name: "ao so mi",
        size: "XL",
        price: 10.5,
        quantity: 2
      }
    ],
    total_amount: 31,
    delivery_address: "Hanoi"
  },
  {
    orderid: 2,
    products: [
      {
        product_id: "somi",
        product_name: "ao so mi tay dai",
        size: "L",
        price: 15,
        quantity: 2
      }
    ],
    total_amount: 30,
    delivery_address: "HCM"
  },
  {
    orderid: 3,
    products: [
      {
        product_id: "giay",
        product_name: "giay da",
        size: "42",
        price: 50,
        quantity: 1
      }
    ],
    total_amount: 50,
    delivery_address: "Da Nang"
  }
];

const importData = async () => {
  try {
    await connectDB();
    await Order.deleteMany({});
    await Order.insertMany(seedData);
    console.log('--- Database Seeded Successfully! ---');
    process.exit();
  } catch (error) {
    console.error('Error with seeding:', error.message);
    process.exit(1);
  }
};

importData();
