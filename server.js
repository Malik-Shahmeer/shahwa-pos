const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const restaurant = {
    name: 'Nomi Classic Fast Food & BBQ',
    address: 'WXQ6+J37, Itehad Town Rd, Sector 9-D, Baldia, Karachi',
    phone: '0341-1869812',
    logo: '🍗',
    taxRate: 16,
    deliveryFee: 100
};

const menu = [
    { id: 1, name: 'Seekh Kebab (6 pcs)', price: 350, cost: 140, category: 'BBQ', image: '🍢' },
    { id: 2, name: 'Chicken Tikka (Full)', price: 450, cost: 180, category: 'BBQ', image: '🍗' },
    { id: 3, name: 'Bihari Boti', price: 500, cost: 200, category: 'BBQ', image: '🥩' },
    { id: 4, name: 'Malai Boti', price: 480, cost: 190, category: 'BBQ', image: '🍖' },
    { id: 5, name: 'Reshmi Kebab', price: 400, cost: 160, category: 'BBQ', image: '🥙' },
    { id: 6, name: 'Zinger Burger', price: 280, cost: 120, category: 'Burgers', image: '🍔' },
    { id: 7, name: 'Tower Burger', price: 350, cost: 150, category: 'Burgers', image: '🍔' },
    { id: 8, name: 'Chicken Burger', price: 250, cost: 100, category: 'Burgers', image: '🍔' },
    { id: 9, name: 'Chicken Roll', price: 200, cost: 80, category: 'Rolls', image: '🌯' },
    { id: 10, name: 'Bihari Roll', price: 250, cost: 100, category: 'Rolls', image: '🌯' },
    { id: 11, name: 'Zinger Roll', price: 220, cost: 90, category: 'Rolls', image: '🌯' },
    { id: 12, name: 'Couple Deal', price: 599, cost: 250, category: 'Deals', image: '💑' },
    { id: 13, name: 'Family BBQ Platter', price: 1499, cost: 600, category: 'Deals', image: '👨‍👩‍👧‍👦' },
    { id: 14, name: 'Student Pack', price: 299, cost: 130, category: 'Deals', image: '🎓' },
    { id: 15, name: 'Fries (Large)', price: 150, cost: 50, category: 'Sides', image: '🍟' },
    { id: 16, name: 'Coleslaw', price: 80, cost: 30, category: 'Sides', image: '🥗' },
    { id: 17, name: 'Cold Drink (500ml)', price: 80, cost: 40, category: 'Drinks', image: '🥤' },
    { id: 18, name: 'Mineral Water', price: 50, cost: 20, category: 'Drinks', image: '💧' },
    { id: 19, name: 'Fresh Juice', price: 150, cost: 60, category: 'Drinks', image: '🧃' },
];

let orders = [];
let orderCounter = 1000;

app.get('/api/menu', (req, res) => res.json(menu));
app.get('/api/info', (req, res) => res.json(restaurant));

app.post('/api/orders', (req, res) => {
    const { items, orderType, customerName, customerPhone, paymentMethod, amountTendered } = req.body;
    let subtotal = 0, totalCost = 0;
    const orderItems = items.map(item => {
        const m = menu.find(x => x.id === item.id);
        if (!m) return null;
        subtotal += m.price * item.quantity;
        totalCost += m.cost * item.quantity;
        return { ...m, quantity: item.quantity, itemTotal: m.price * item.quantity };
    }).filter(Boolean);
    const tax = Math.round(subtotal * (restaurant.taxRate / 100));
    const delivery = orderType === 'delivery' ? restaurant.deliveryFee : 0;
    const total = subtotal + tax + delivery;
    const change = (amountTendered || 0) - total;
    orderCounter++;
    const order = {
        id: orderCounter, orderNumber: `ORD-${orderCounter}`,
        items: orderItems, orderType: orderType || 'walk-in',
        customerName: customerName || 'Walk In Customer',
        customerPhone: customerPhone || '',
        paymentMethod: paymentMethod || 'cash',
        amountTendered: amountTendered || 0, change,
        subtotal, tax, deliveryCharges: delivery, total,
        totalCost, profit: total - totalCost,
        paymentStatus: 'paid', status: 'completed',
        createdAt: new Date().toISOString(),
        restaurantName: restaurant.name,
        restaurantAddress: restaurant.address,
        restaurantPhone: restaurant.phone
    };
    orders.push(order);
    res.json({ success: true, order });
});

app.get('/api/orders', (req, res) => res.json([...orders].reverse()));

app.get('/api/reports/daily', (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const todayOrders = orders.filter(o => o.createdAt.startsWith(today));
    const totalSales = todayOrders.reduce((s, o) => s + o.total, 0);
    const totalCost = todayOrders.reduce((s, o) => s + (o.totalCost || 0), 0);
    const totalProfit = todayOrders.reduce((s, o) => s + (o.profit || 0), 0);
    const cat = {};
    todayOrders.forEach(o => o.items.forEach(i => {
        if (!cat[i.category]) cat[i.category] = { qty: 0, amount: 0 };
        cat[i.category].qty += i.quantity;
        cat[i.category].amount += i.itemTotal;
    }));
    const items = {};
    todayOrders.forEach(o => o.items.forEach(i => {
        if (!items[i.name]) items[i.name] = { qty: 0, amount: 0 };
        items[i.name].qty += i.quantity;
        items[i.name].amount += i.itemTotal;
    }));
    const top = Object.entries(items).map(([n, d]) => ({ name: n, ...d })).sort((a, b) => b.amount - a.amount).slice(0, 5);
    res.json({ summary: { totalSales, totalCost, totalProfit, totalOrders: todayOrders.length, avgOrderValue: todayOrders.length ? Math.round(totalSales / todayOrders.length) : 0 }, categorySales: cat, topItems: top });
});

app.post('/api/payment/initiate', (req, res) => {
    const { amount, method } = req.body;
    res.json({ success: true, payment: { id: 'PAY-' + Date.now(), amount, method } });
});
app.post('/api/payment/verify', (req, res) => res.json({ success: true, verified: true }));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'pos.html')));
app.get('/reports', (req, res) => res.sendFile(path.join(__dirname, 'public', 'reports.html')));

app.listen(PORT, '0.0.0.0', () => {
    console.log('\n╔══════════════════════════════════════════════════╗');
    console.log('║  🍗 SHAHWA POS SOLUTION - KFC STYLE POS         ║');
    console.log('╠══════════════════════════════════════════════════╣');
    console.log(`║  POS:     http://localhost:${PORT}                   ║`);
    console.log(`║  Reports: http://localhost:${PORT}/reports            ║`);
    console.log('║                                                  ║');
    console.log('║  ⚡ Shahwa Industries Solution                   ║');
    console.log('║  📱 0341-1869812                                 ║');
    console.log('╚══════════════════════════════════════════════════╝');
    console.log('\n  🎬 Browser kholo aur demo video banao!\n');
});