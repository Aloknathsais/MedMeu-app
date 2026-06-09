export const mockCategories = [
  { id: '1', name: 'BP Monitors', icon: '❤️', color: '#FF5252', count: 24 },
  { id: '2', name: 'Diabetic Care', icon: '🩸', color: '#FF6D00', count: 18 },
  { id: '3', name: 'Lab Products', icon: '🔬', color: '#7C4DFF', count: 35 },
  { id: '4', name: 'Ortho Care', icon: '🦴', color: '#00BCD4', count: 12 },
  { id: '5', name: 'Baby Care', icon: '👶', color: '#E91E63', count: 29 },
  { id: '6', name: 'Wellness', icon: '💊', color: '#00897B', count: 41 },
  { id: '7', name: 'First Aid', icon: '🩺', color: '#1565C0', count: 16 },
  { id: '8', name: 'Eye Care', icon: '👁️', color: '#558B2F', count: 8 },
];

export const mockProducts = [
  {
    id: 'p1', name: 'Omron HEM-7120 Blood Pressure Monitor', price: 2499, originalPrice: 3200,
    discount: 22, rating: 4.5, reviews: 1240, image: 'https://via.placeholder.com/300x300/1565C0/fff?text=BP+Monitor',
    category: '1', brand: 'Omron', inStock: true, unit: '1 Unit',
    description: 'Clinically validated upper arm blood pressure monitor with IntelliSense technology for accurate readings.',
    specs: ['IntelliSense Technology', 'Memory: 60 readings', 'Irregular heartbeat detection', 'USB powered'],
  },
  {
    id: 'p2', name: 'Accu-Chek Active Glucometer Kit', price: 1199, originalPrice: 1499,
    discount: 20, rating: 4.6, reviews: 890, image: 'https://via.placeholder.com/300x300/00897B/fff?text=Glucometer',
    category: '2', brand: 'Accu-Chek', inStock: true, unit: '1 Kit',
    description: 'Complete glucometer kit for accurate blood glucose monitoring at home.',
    specs: ['Test strips included: 10', 'Result time: 5 sec', 'Memory: 500 readings', 'No coding required'],
  },
  {
    id: 'p3', name: 'Dr. Morepen Pulse Oximeter', price: 799, originalPrice: 1200,
    discount: 33, rating: 4.3, reviews: 2100, image: 'https://via.placeholder.com/300x300/7C4DFF/fff?text=Oximeter',
    category: '3', brand: 'Dr. Morepen', inStock: true, unit: '1 Unit',
    description: 'Fingertip pulse oximeter with large LED display for SpO2 and pulse rate monitoring.',
    specs: ['SpO2 range: 70-99%', 'Pulse rate: 30-250 bpm', 'Auto power off', 'Battery: 2x AAA'],
  },
  {
    id: 'p4', name: 'Tynor Knee Cap Support', price: 349, originalPrice: 450,
    discount: 22, rating: 4.2, reviews: 560, image: 'https://via.placeholder.com/300x300/00BCD4/fff?text=Knee+Cap',
    category: '4', brand: 'Tynor', inStock: true, unit: '1 Piece',
    description: 'Provides compression and warmth to knee joint for pain relief and support.',
    specs: ['Material: Neoprene', 'Sizes: S, M, L, XL', 'Washable', 'Bilateral use'],
  },
  {
    id: 'p5', name: 'Himalaya Baby Lotion 400ml', price: 185, originalPrice: 220,
    discount: 16, rating: 4.7, reviews: 3200, image: 'https://via.placeholder.com/300x300/E91E63/fff?text=Baby+Lotion',
    category: '5', brand: 'Himalaya', inStock: true, unit: '400ml',
    description: 'Gentle baby lotion with natural oils for soft and moisturized skin.',
    specs: ['No parabens', 'Dermatologically tested', 'SPF protection', 'Tear-free formula'],
  },
  {
    id: 'p6', name: 'Dettol First Aid Kit', price: 599, originalPrice: 799,
    discount: 25, rating: 4.4, reviews: 780, image: 'https://via.placeholder.com/300x300/FF5252/fff?text=First+Aid',
    category: '6', brand: 'Dettol', inStock: false, unit: '1 Kit',
    description: 'Complete first aid kit for home and travel with 50+ essential items.',
    specs: ['50+ items', 'Portable case', 'Includes bandages', 'Antiseptic wipes'],
  },
];

export const mockBanners = [
  { id: '1', title: 'Up to 30% Off', subtitle: 'On BP Monitors & Glucometers', color: '#1565C0', emoji: '❤️‍🩹' },
  { id: '2', title: 'Free Delivery', subtitle: 'On orders above ₹499', color: '#00897B', emoji: '🚚' },
  { id: '3', title: 'Lab at Home', subtitle: 'Book tests, get reports online', color: '#7C4DFF', emoji: '🔬' },
];

export const mockOrders = [
  {
    id: 'ORD001', date: '2024-03-15', status: 'Delivered', total: 2499,
    items: [{ name: 'Omron HEM-7120', qty: 1, price: 2499 }],
  },
  {
    id: 'ORD002', date: '2024-03-20', status: 'In Transit', total: 1998,
    items: [{ name: 'Accu-Chek Kit', qty: 1, price: 1199 }, { name: 'Pulse Oximeter', qty: 1, price: 799 }],
  },
  {
    id: 'ORD003', date: '2024-03-22', status: 'Processing', total: 349,
    items: [{ name: 'Tynor Knee Cap', qty: 1, price: 349 }],
  },
];
