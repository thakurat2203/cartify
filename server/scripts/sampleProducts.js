const sampleProducts = [
  {
    name: "MacBook Laptop",
    price: 100000,
    description:
      "Slim laptop for development, design, and everyday productivity.",
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
    stock: 30,
    category: "laptop",
  },
  {
    name: "Wireless Mouse",
    price: 1299,
    description: "Ergonomic wireless mouse with long battery life.",
    image:
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80",
    stock: 50,
    category: "accessories",
  },
  {
    name: "Wireless Headphones",
    price: 5999,
    description: "Noise-cancelling Bluetooth headphones with 30h battery.",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    stock: 35,
    category: "audio",
  },
  {
    name: "4K Webcam",
    price: 8999,
    description: "4K resolution webcam with auto-focus and microphone.",
    image:
      "https://images.unsplash.com/photo-1587668178277-295251f900ce?auto=format&fit=crop&w=800&q=80",
    stock: 20,
    category: "electronics",
  },
  {
    name: "USB-C Cable",
    price: 399,
    description: "Durable 1m USB-C to USB-C cable.",
    image:
      "https://images.unsplash.com/photo-1619953942547-233eab5a70d6?auto=format&fit=crop&w=800&q=80",
    stock: 100,
    category: "cables",
  },
  {
    name: "Monitor Stand",
    price: 2499,
    description: "Adjustable monitor stand with storage drawer.",
    image:
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80",
    stock: 40,
    category: "accessories",
  },
  {
    name: "Laptop Cooling Pad",
    price: 3499,
    description: "Dual-fan cooling pad for laptops up to 17 inches.",
    image:
      "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80",
    stock: 45,
    category: "electronics",
  },
  {
    name: "LED Desk Lamp",
    price: 2299,
    description:
      "LED desk lamp with adjustable brightness and color temperature.",
    image:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
    stock: 60,
    category: "lighting",
  },
  {
    name: "Gaming Mouse Pad",
    price: 599,
    description: "Large mouse pad with stitched edges and non-slip base.",
    image:
      "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80",
    stock: 80,
    category: "accessories",
  },
  {
    name: "HDMI Cable",
    price: 499,
    description: "2m HDMI 2.1 cable for 4K display output.",
    image:
      "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=800&q=80",
    stock: 120,
    category: "cables",
  },
  {
    name: "USB Hub",
    price: 1999,
    description: "Compact USB hub with multiple ports for laptop expansion.",
    image:
      "https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&w=800&q=80",
    stock: 30,
    category: "accessories",
  },
  {
    name: "Phone Stand",
    price: 899,
    description: "Adjustable phone stand for desks and video calls.",
    image:
      "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=800&q=80",
    stock: 70,
    category: "accessories",
  },
  {
    name: "Keyboard Wrist Rest",
    price: 1299,
    description: "Memory foam wrist rest for comfortable typing.",
    image:
      "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=800&q=80",
    stock: 55,
    category: "accessories",
  },
  {
    name: "Cable Organizer",
    price: 799,
    description: "Silicone cable organizer clips for a cleaner desk.",
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80",
    stock: 90,
    category: "accessories",
  },
  {
    name: "Desk Organizer",
    price: 1899,
    description: "Multi-compartment desk organizer for stationery and gadgets.",
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800&q=80",
    stock: 50,
    category: "furniture",
  },
  {
    name: "Screen Protector Pack",
    price: 599,
    description: "Tempered glass screen protector pack for smartphones.",
    image:
      "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=800&q=80",
    stock: 100,
    category: "accessories",
  },
  {
    name: "Wireless Charger",
    price: 1599,
    description: "Fast wireless charging pad with LED indicator.",
    image:
      "https://images.unsplash.com/photo-1615526675159-e248c3021d3f?auto=format&fit=crop&w=800&q=80",
    stock: 45,
    category: "electronics",
  },
  {
    name: "Smart Watch",
    price: 7999,
    description: "Fitness smart watch with notifications and health tracking.",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
    stock: 24,
    category: "wearables",
  },
  {
    name: "Mechanical Keyboard",
    price: 4999,
    description: "Tactile mechanical keyboard with RGB lighting.",
    image:
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
    stock: 4,
    category: "accessories",
  },
  {
    name: "Portable SSD 1TB",
    price: 12999,
    description: "Fast portable SSD with 1TB storage capacity.",
    image:
      "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=800&q=80",
    stock: 7,
    category: "storage",
  },
  {
    name: "Samsung Galaxy Phone",
    price: 74999,
    description:
      "Flagship Android phone with AMOLED display and fast charging.",
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
    stock: 0,
    category: "phone",
  },
  {
    name: "Apple iPhone",
    price: 89999,
    description:
      "Premium smartphone with a bright display and strong camera system.",
    image:
      "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80",
    stock: 0,
    category: "phone",
  },
];

module.exports = sampleProducts;
