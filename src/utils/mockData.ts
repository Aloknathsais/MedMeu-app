export const mockCategories = [
  { id: '1', name: 'BP Monitors', icon: '❤️', color: '#FF5252', count: 24 },
  { id: '2', name: 'Diabetic Care', icon: '🩸', color: '#FF6D00', count: 18 },
  { id: '3', name: 'Lab Products', icon: '🔬', color: '#7C4DFF', count: 35 },
  { id: '4', name: 'Ortho Care', icon: '🦴', color: '#00BCD4', count: 12 },
  { id: '5', name: 'Baby Care', icon: '👶', color: '#E91E63', count: 29 },
  { id: '6', name: 'Wellness', icon: '💊', color: '#00897B', count: 41 },
  { id: '7', name: 'First Aid', icon: '🩺', color: '#2171a8', count: 16 },
  { id: '8', name: 'Eye Care', icon: '👁️', color: '#558B2F', count: 8 },
];

export const mockProducts = [
  {
    id: 'p1', name: 'Omron HEM-7120 Blood Pressure Monitor', price: 2499, originalPrice: 3200,
    discount: 22, rating: 4.5, reviews: 1240,
    image: 'https://images.unsplash.com/photo-1581595219315-a187dd40c322?w=400&h=400&fit=crop&q=80',
    category: '1', brand: 'Omron', inStock: true, unit: '1 Unit',
    description: 'Clinically validated upper arm blood pressure monitor with IntelliSense technology for accurate readings.',
    specs: ['IntelliSense Technology', 'Memory: 60 readings', 'Irregular heartbeat detection', 'USB powered'],
  },
  {
    id: 'p2', name: 'Accu-Chek Active Glucometer Kit', price: 1199, originalPrice: 1499,
    discount: 20, rating: 4.6, reviews: 890,
    image: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400&h=400&fit=crop&q=80',
    category: '2', brand: 'Accu-Chek', inStock: true, unit: '1 Kit',
    description: 'Complete glucometer kit for accurate blood glucose monitoring at home.',
    specs: ['Test strips included: 10', 'Result time: 5 sec', 'Memory: 500 readings', 'No coding required'],
  },
  {
    id: 'p3', name: 'Dr. Morepen Pulse Oximeter', price: 799, originalPrice: 1200,
    discount: 33, rating: 4.3, reviews: 2100,
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=400&fit=crop&q=80',
    category: '3', brand: 'Dr. Morepen', inStock: true, unit: '1 Unit',
    description: 'Fingertip pulse oximeter with large LED display for SpO2 and pulse rate monitoring.',
    specs: ['SpO2 range: 70-99%', 'Pulse rate: 30-250 bpm', 'Auto power off', 'Battery: 2x AAA'],
  },
  {
    id: 'p4', name: 'Tynor Knee Cap Support', price: 349, originalPrice: 450,
    discount: 22, rating: 4.2, reviews: 560,
    image: 'https://images.unsplash.com/photo-1559757175102-43ec3f0db44f?w=400&h=400&fit=crop&q=80',
    category: '4', brand: 'Tynor', inStock: true, unit: '1 Piece',
    description: 'Provides compression and warmth to knee joint for pain relief and support.',
    specs: ['Material: Neoprene', 'Sizes: S, M, L, XL', 'Washable', 'Bilateral use'],
  },
  {
    id: 'p5', name: 'Himalaya Baby Lotion 400ml', price: 185, originalPrice: 220,
    discount: 16, rating: 4.7, reviews: 3200,
    image: 'https://images.unsplash.com/photo-1556228720-da4e95ee06ac?w=400&h=400&fit=crop&q=80',
    category: '5', brand: 'Himalaya', inStock: true, unit: '400ml',
    description: 'Gentle baby lotion with natural oils for soft and moisturized skin.',
    specs: ['No parabens', 'Dermatologically tested', 'SPF protection', 'Tear-free formula'],
  },
  {
    id: 'p6', name: 'Dettol First Aid Kit', price: 599, originalPrice: 799,
    discount: 25, rating: 4.4, reviews: 780,
    image: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=400&h=400&fit=crop&q=80',
    category: '6', brand: 'Dettol', inStock: false, unit: '1 Kit',
    description: 'Complete first aid kit for home and travel with 50+ essential items.',
    specs: ['50+ items', 'Portable case', 'Includes bandages', 'Antiseptic wipes'],
  },
  {
    id: 'p7', name: 'Vicks Vaporizer Steam Inhaler', price: 449, originalPrice: 599,
    discount: 25, rating: 4.1, reviews: 412,
    image: 'https://images.unsplash.com/photo-1631815588090-d4bfec5b7e7e?w=400&h=400&fit=crop&q=80',
    category: '7', brand: 'Vicks', inStock: true, unit: '1 Unit',
    description: 'Effective steam inhaler for cold and congestion relief at home.',
    specs: ['BPA free', 'Easy to clean', 'Compact design', 'Safety auto-shutoff'],
  },
  {
    id: 'p8', name: 'Eyemist Eye Drops 10ml', price: 99, originalPrice: 130,
    discount: 24, rating: 4.0, reviews: 215,
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop&q=80',
    category: '8', brand: 'Eyemist', inStock: true, unit: '10ml',
    description: 'Soothing eye drops for dryness and irritation relief.',
    specs: ['Preservative free', 'Suitable for contact lens users', 'Sterile formula'],
  },
];

export const mockBanners = [
  {
    id: '1',
    title: 'Flat 30% Off',
    subtitle: 'On all BP Monitors & Glucometers',
    cta: 'Shop Now',
    badge: 'LIMITED TIME',
    bg: 'linear-gradient(120deg, #2171a8 0%, #194f78 100%)',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=300&h=300&fit=crop&q=80',
  },
  {
    id: '2',
    title: 'Free Home Delivery',
    subtitle: 'On every order above ₹499, no minimums',
    cta: 'Order Now',
    badge: 'ALWAYS ON',
    bg: 'linear-gradient(120deg, #f4621d 0%, #c94d12 100%)',
    image: 'https://images.unsplash.com/photo-1577401239170-897942555fb3?w=300&h=300&fit=crop&q=80',
  },
  {
    id: '3',
    title: 'Lab Tests at Home',
    subtitle: 'Book a sample pickup, get reports online',
    cta: 'Book Test',
    badge: 'NEW',
    bg: 'linear-gradient(120deg, #00897B 0%, #00695C 100%)',
    image: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=300&h=300&fit=crop&q=80',
  },
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

export const mockTestimonials = [
  {
    name: 'Poojarani Das',
    time: '2 years ago',
    text: 'MEDMEU has great products and fast shipping. I always find what I need at MEDMEU. Their service is top-notch and i am very happy with my purchase! Thanks to team MEDMEU.',
  },
  {
    name: 'Monalisa Pati',
    time: '2 years ago',
    text: 'I appreciate the wide selection of lab equipment at MEDMEU. It is very convenient for all medical students and Lab owners that, they can find all necessary equipment from one location. And the beauty is you can find all branded products in a affordable price.',
  },
  {
    name: 'Pradiptaa Senapati',
    time: '2 years ago',
    text: 'From baby monitors to thermometers, they have everything I need to keep my little one safe and healthy. I found a wide rage of baby care products with best quality and affordable price. Highly Recommended for MEDMEU!',
  },
  {
    name: 'Kalpasmita Tiwari',
    time: '2 years ago',
    text: 'I recently purchased the Blood Pressure Monitor from MEDMEU for my elderly mother. The large, easy-to-read display and simple operation make it perfect for seniors. Plus, the accuracy of the readings gives us confidence in monitoring her blood pressure at home. Thank you, MEDMEU, for providing such a high-quality product that promotes independence and peace of mind.',
  },
  {
    name: 'Sibasankar Tewari',
    time: '2 years ago',
    text: "I'm happy to say that the blood glucose meter I purchased from MEDMEU exceeds my expectations. It's easy to use, provides fast and accurate results. Thank you, MEDMEU, for offering such a fantastic product.",
  },
  {
    name: 'Prince Pratyush',
    time: '2 years ago',
    text: "I recently found MEDMEU while searching for healthcare equipment online, and I'm so glad I did. Not only did they have exactly what I needed, but the ordering process was quick and easy. Plus, my order arrived earlier than expected. Great experience overall.",
  },
  {
    name: 'Sudhir Pradhan',
    time: '2 years ago',
    text: "As a caregiver for my elderly parents, I rely on MEDMEU for various home healthcare products. Their range of mobility aids, hygiene essentials, and monitoring devices has been invaluable to me. I wouldn't hesitate to recommend them to others in similar situations. No 1 healthcare ecommerce portal of odisha.",
  },
  {
    name: 'Ganesh Nahak',
    time: '2 years ago',
    text: "I've shopped with MEDMEU recently, and I am very satisfied. The products are top-notch, and the customer service is exceptional. Highly Recommended!",
  },
];

export const mockTrustBadges = [
  { icon: '🚚', title: 'Fastest Delivery', subtitle: 'We Deliver Within 24 Hour' },
  { icon: '🎧', title: 'Online Support 24/7', subtitle: 'Support online 24 hours a day' },
  { icon: '↩️', title: 'Money Return', subtitle: 'Back guarantee under 7 days' },
  { icon: '🏷️', title: 'Price Starting', subtitle: 'Starting on All Products at ₹120' },
];