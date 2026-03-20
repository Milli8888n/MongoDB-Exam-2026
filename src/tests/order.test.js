const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app');
const Order = require('../models/orderModel');
const orderService = require('../services/orderService');

const testDBUri = 'mongodb://127.0.0.1:27017/eShop_Test';

beforeAll(async () => {
    // Only connect if not already connected
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(testDBUri);
    }
});

afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
});

beforeEach(async () => {
    await Order.deleteMany({});
});

describe('Order Service Tests', () => {
    const exampleOrders = [
        {
            orderid: 1,
            products: [{ product_id: "quanau", product_name: "quan au", price: 10, quantity: 1 }],
            total_amount: 10,
            delivery_address: "Hanoi"
        },
        {
            orderid: 2,
            products: [{ product_id: "somi", product_name: "ao so mi", price: 10.5, quantity: 2 }],
            total_amount: 21,
            delivery_address: "HCM"
        }
    ];

    test('insertManyOrders should insert data', async () => {
        const result = await orderService.insertManyOrders(exampleOrders);
        expect(result.length).toBe(2);
        expect(result[0].orderid).toBe(1);
    });

    test('editDeliveryAddress should update address', async () => {
        await Order.create(exampleOrders[0]);
        const updated = await orderService.editDeliveryAddress(1, "Da Nang");
        expect(updated.delivery_address).toBe("Da Nang");
    });

    test('removeOrderById should delete order', async () => {
        await Order.create(exampleOrders[0]);
        await orderService.removeOrderById(1);
        const count = await Order.countDocuments();
        expect(count).toBe(0);
    });

    test('findAllOrders should return all', async () => {
        await Order.insertMany(exampleOrders);
        const result = await orderService.findAllOrders();
        expect(result.length).toBe(2);
    });

    test('calculateTotalAmountSum should return sum', async () => {
        await Order.insertMany(exampleOrders);
        const sum = await orderService.calculateTotalAmountSum();
        expect(sum).toBe(31);
    });

    test('countProductSomi should count somi instances', async () => {
        await Order.insertMany(exampleOrders);
        const count = await orderService.countProductSomi();
        expect(count).toBe(1); // One order has somi
    });
});

describe('Order API Integration Tests', () => {
    test('POST /api/orders/init should create data', async () => {
        const res = await request(app).post('/api/orders/init');
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        const count = await Order.countDocuments();
        expect(count).toBe(2);
    });

    test('PUT /api/orders/update-address should update', async () => {
        await Order.create({ orderid: 1, products: [], total_amount: 0, delivery_address: "Hanoi" });
        const res = await request(app)
            .put('/api/orders/update-address')
            .send({ orderid: 1, address: "Da Nang" });
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        const updated = await Order.findOne({ orderid: 1 });
        expect(updated.delivery_address).toBe("Da Nang");
    });

    test('DELETE /api/orders/:orderid should remove', async () => {
        await Order.create({ orderid: 1, products: [], total_amount: 0, delivery_address: "Hanoi" });
        const res = await request(app).delete('/api/orders/1');
        expect(res.status).toBe(200);
        const count = await Order.countDocuments();
        expect(count).toBe(0);
    });

    test('GET /api/orders/view-orders should render view', async () => {
        await Order.create({ orderid: 1, products: [{ product_id: "test", product_name: "test", price: 10, quantity: 1 }], total_amount: 10, delivery_address: "Hanoi" });
        const res = await request(app).get('/api/orders/view-orders');
        expect(res.status).toBe(200);
        expect(res.text).toContain('test');
    });

    test('GET /api/orders/stats should return analytics', async () => {
        await Order.create({ orderid: 1, products: [{ product_id: "somi", product_name: "test", price: 10, quantity: 1 }], total_amount: 10, delivery_address: "Hanoi" });
        const res = await request(app).get('/api/orders/stats');
        expect(res.status).toBe(200);
        expect(res.body.totalSum).toBe(10);
        expect(res.body.somiCount).toBe(1);
    });
});

describe('Error Handling Tests', () => {
    test('Controller error handling (initData failure)', async () => {
        jest.spyOn(Order, 'insertMany').mockImplementationOnce(() => { throw new Error('DB Error'); });
        const res = await request(app).post('/api/orders/init');
        expect(res.status).toBe(500);
        expect(res.body.success).toBe(false);
    });

    test('Controller error handling (updateAddress failure)', async () => {
        jest.spyOn(Order, 'findOneAndUpdate').mockImplementationOnce(() => { throw new Error('DB Error'); });
        const res = await request(app).put('/api/orders/update-address').send({ orderid: 1, address: 'X' });
        expect(res.status).toBe(500);
    });

    test('Controller error handling (deleteOrder failure)', async () => {
        jest.spyOn(Order, 'findOneAndDelete').mockImplementationOnce(() => { throw new Error('DB Error'); });
        const res = await request(app).delete('/api/orders/1');
        expect(res.status).toBe(500);
    });

    test('Controller error handling (getAllOrders failure)', async () => {
        jest.spyOn(Order, 'find').mockImplementationOnce(() => { throw new Error('DB Error'); });
        const res = await request(app).get('/api/orders/view-orders');
        expect(res.status).toBe(500);
    });

    test('Controller error handling (getStats failure)', async () => {
        jest.spyOn(Order, 'aggregate').mockImplementationOnce(() => { throw new Error('DB Error'); });
        const res = await request(app).get('/api/orders/stats');
        expect(res.status).toBe(500);
    });

    test('Controller 404 handling (update nonexistent order)', async () => {
        const res = await request(app)
            .put('/api/orders/update-address')
            .send({ orderid: 999, address: 'Da Nang' });
        expect(res.status).toBe(404);
    });

    test('Controller 404 handling (delete nonexistent order)', async () => {
        const res = await request(app).delete('/api/orders/999');
        expect(res.status).toBe(404);
    });
});
