// Simple test to verify the server structure
const express = require('express');

describe('Badminton Booking API Structure', () => {
  test('Express app can be created', () => {
    const app = express();
    expect(app).toBeDefined();
    expect(typeof app.use).toBe('function');
  });

  test('Required modules exist', () => {
    expect(require('./models/User')).toBeDefined();
    expect(require('./models/Venue')).toBeDefined();
    expect(require('./models/Booking')).toBeDefined();
    expect(require('./models/Payment')).toBeDefined();
    expect(require('./middleware/auth')).toBeDefined();
    expect(require('./routes/auth')).toBeDefined();
  });
}); 