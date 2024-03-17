const request = require('supertest');
const app = require('../app'); // Assuming your Express app is named 'app'
const db = require('../db');

beforeAll(async () => {
  try {
    await db.connect(); // Establish database connection before running tests
    console.log('Connected to the database');
  } catch (err) {
    console.error('Error connecting to the database:', err.message);
    process.exit(1); // Exit the process if unable to connect to the database
  }
});

afterAll(async () => {
  await db.end(); // Close database connection after all tests are finished
  console.log('Disconnected from the database');
});

describe('Customer Routes', () => {
  let customerId;

  // Test POST /customers
  describe('POST /customers', () => {
    it('should create a new customer', async () => {
      const res = await request(app)
        .post('/customers')
        .send({ name: 'Test Customer', email: 'test@example.com' });

      expect(res.statusCode).toEqual(201);
      expect(res.body.name).toEqual('Test Customer');
      expect(res.body.email).toEqual('test@example.com');

      // Store the created customer's ID for later use in other tests
      customerId = res.body.id;
    });
  });

  // Test GET /customers/:id
  describe('GET /customers/:id', () => {
    it('should get a single customer by ID', async () => {
      const res = await request(app).get(`/customers/${customerId}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.name).toEqual('Test Customer');
      expect(res.body.email).toEqual('test@example.com');
    });

    it('should return 404 if customer does not exist', async () => {
      const res = await request(app).get('/customers/999999');
      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toEqual('Customer not found');
    });
  });

  // Test PUT /customers/:id
  describe('PUT /customers/:id', () => {
    it('should update a customer by ID', async () => {
      const res = await request(app)
        .put(`/customers/${customerId}`)
        .send({ name: 'Updated Customer', email: 'updated@example.com' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.name).toEqual('Updated Customer');
      expect(res.body.email).toEqual('updated@example.com');
    });

    it('should return 404 if customer does not exist', async () => {
      const res = await request(app)
        .put('/customers/999999')
        .send({ name: 'Updated Customer', email: 'updated@example.com' });

      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toEqual('Customer not found');
    });
  });

  // Test DELETE /customers/:id
  describe('DELETE /customers/:id', () => {
    it('should delete a customer by ID', async () => {
      const res = await request(app).delete(`/customers/${customerId}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toEqual('Customer deleted successfully');
    });

    it('should return 404 if customer does not exist', async () => {
      const res = await request(app).delete('/customers/999999');
      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toEqual('Customer not found');
    });
  });
});

afterAll(async()=>{
    await db.end()
})