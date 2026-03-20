const orderService = require('../services/orderService');

exports.initData = async (req, res) => {
  try {
    await orderService.removeAllOrders();
    const exampleOrders = [
      {
        orderid: 1,
        products: [
          { product_id: "quanau", product_name: "quan au", size: "XL", price: 10, quantity: 1 },
          { product_id: "somi", product_name: "ao so mi", size: "XL", price: 10.5, quantity: 2 }
        ],
        total_amount: 31,
        delivery_address: "Hanoi"
      },
      {
        orderid: 2,
        products: [
          { product_id: "somi", product_name: "ao so mi tay dai", size: "L", price: 15, quantity: 2 }
        ],
        total_amount: 30,
        delivery_address: "HCM"
      },
      {
        orderid: 3,
        products: [
          { product_id: "giay", product_name: "giay da", size: "42", price: 50, quantity: 1 }
        ],
        total_amount: 50,
        delivery_address: "Da Nang"
      }
    ];
    await orderService.insertManyOrders(exampleOrders);
    res.status(200).json({ success: true, message: 'Data initialized successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.updateAddress = async (req, res) => {
  try {
    const { orderid, address } = req.body;
    const updated = await orderService.editDeliveryAddress(Number(orderid), address);
    if (!updated) return res.status(404).json({ success: false, message: 'Order not found' });
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const { orderid } = req.params;
    const deleted = await orderService.removeOrderById(Number(orderid));
    if (!deleted) return res.status(404).json({ success: false, message: 'Order not found' });
    res.status(200).json({ success: true, message: 'Order deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await orderService.findAllOrders();
    const totalSum = await orderService.calculateTotalAmountSum();
    const somiCount = await orderService.countProductSomi();
    res.render('dashboard', { orders, totalSum, somiCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const totalSum = await orderService.calculateTotalAmountSum();
    const somiCount = await orderService.countProductSomi();
    res.status(200).json({ success: true, totalSum, somiCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
