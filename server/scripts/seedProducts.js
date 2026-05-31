const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const Product = require('../src/models/Product');

const seed = async () => {
  try {
    await connectDB();

    const count = await Product.countDocuments();
    if (count > 0) {
      console.log('Products already exist. Skipping seed.');
      await mongoose.disconnect();
      process.exit(0);
    }

    const products = [
      {
        name: 'Wireless Mouse',
        price: 1299,
        description: 'Ergonomic wireless mouse with long battery life.',
        image: '',
        stock: 50,
        category: 'accessories'
      },
      {
        name: 'Mechanical Keyboard',
        price: 4999,
        description: 'Tactile mechanical keyboard with RGB lighting.',
        image: '',
        stock: 25,
        category: 'accessories'
      },
      {
        name: 'USB-C Cable',
        price: 399,
        description: 'Durable 1m USB-C to USB-C cable.',
        image: '',
        stock: 100,
        category: 'cables'
      },
      {
        name: 'Wireless Headphones',
        price: 5999,
        description: 'Noise-cancelling Bluetooth headphones with 30h battery.',
        image: '',
        stock: 35,
        category: 'audio'
      },
      {
        name: '4K Webcam',
        price: 8999,
        description: '4K resolution webcam with auto-focus and microphone.',
        image: '',
        stock: 20,
        category: 'electronics'
      },
      {
        name: 'Monitor Stand',
        price: 2499,
        description: 'Adjustable monitor stand with storage drawer.',
        image: '',
        stock: 40,
        category: 'accessories'
      },
      {
        name: 'Laptop Cooling Pad',
        price: 3499,
        description: 'Dual-fan cooling pad for laptops up to 17 inches.',
        image: '',
        stock: 45,
        category: 'electronics'
      },
      {
        name: 'Desk Lamp',
        price: 2299,
        description: 'LED desk lamp with adjustable color temperature.',
        image: '',
        stock: 60,
        category: 'lighting'
      },
      {
        name: 'Mouse Pad',
        price: 599,
        description: 'Large gaming mouse pad with non-slip base.',
        image: '',
        stock: 80,
        category: 'accessories'
      },
      {
        name: 'HDMI Cable',
        price: 499,
        description: '2m HDMI 2.1 cable for 4K 60Hz support.',
        image: '',
        stock: 120,
        category: 'cables'
      },
      {
        name: 'USB Hub',
        price: 1999,
        description: '7-port USB 3.0 hub with individual switches.',
        image: '',
        stock: 30,
        category: 'accessories'
      },
      {
        name: 'Phone Stand',
        price: 899,
        description: 'Adjustable phone stand for all device sizes.',
        image: '',
        stock: 70,
        category: 'accessories'
      },
      {
        name: 'Portable SSD 1TB',
        price: 12999,
        description: 'Fast portable SSD with 1TB storage capacity.',
        image: '',
        stock: 15,
        category: 'storage'
      },
      {
        name: 'Keyboard Wrist Rest',
        price: 1299,
        description: 'Ergonomic memory foam wrist rest for keyboards.',
        image: '',
        stock: 55,
        category: 'accessories'
      },
      {
        name: 'Cable Organizer',
        price: 799,
        description: 'Silicone cable organizer clips set of 5.',
        image: '',
        stock: 90,
        category: 'accessories'
      },
      {
        name: 'Desk Organizer',
        price: 1899,
        description: 'Multi-compartment desk organizer with drawer.',
        image: '',
        stock: 50,
        category: 'furniture'
      },
      {
        name: 'Screen Protector Pack',
        price: 599,
        description: 'Tempered glass screen protector pack of 3.',
        image: '',
        stock: 100,
        category: 'accessories'
      },
      {
        name: 'Wireless Charger',
        price: 1599,
        description: 'Fast wireless charging pad with LED indicator.',
        image: '',
        stock: 45,
        category: 'electronics'
      }
    ];

    await Product.insertMany(products);
    console.log(`Inserted ${products.length} products.`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
};

seed();
