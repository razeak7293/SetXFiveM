const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'database.json');

// --- Load/Save Database ---
function loadDB() {
    try {
        if (fs.existsSync(DB_FILE)) {
            return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
        }
    } catch (e) { console.error("Load DB Error:", e); }
    return { users: [], products: [], orders: [] };
}

function saveDB(data) {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 4), 'utf8');
    } catch (e) { console.error("Save DB Error:", e); }
}

let db = loadDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, '..')));

// GET /api/users
app.get('/api/users', (req, res) => res.json(db.users));

// Register
app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    if (db.users.find(u => u.username === username)) return res.json({ success: false, message: 'ชื่อนี้มีแล้ว' });
    db.users.push({ username, password, balance: 0 });
    saveDB(db);
    res.json({ success: true });
});

// Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const user = db.users.find(u => u.username === username && u.password === password);
    res.json({ success: !!user, user });
});

// Get Products
app.get('/api/products', (req, res) => res.json(db.products));

// Buy Product (แก้ไขให้ประวัติไม่หายและซื้อได้จริง)
app.post('/api/buy', (req, res) => {
    const { username, productId } = req.body;
    const product = db.products.find(p => p.id === productId);
    const user = db.users.find(u => u.username === username);

    if (!product || product.stock <= 0) return res.json({ success: false, message: 'สินค้าหมด' });
    if (!user) return res.json({ success: false, message: 'ไม่พบผู้ใช้' });
    if (user.balance < product.price) return res.json({ success: false, message: 'เงินไม่พอ' });

    user.balance -= product.price;
    product.stock -= 1;
    
    const newOrder = {
        orderId: 'ORD-' + Date.now(),
        username,
        itemName: product.name,
        price: product.price,
        date: new Date().toLocaleString('th-TH')
    };
    
    if (!db.orders) db.orders = [];
    db.orders.push(newOrder);
    saveDB(db);
    res.json({ success: true, newBalance: user.balance });
});

// Get History (เชื่อมประวัติการซื้อ)
app.get('/api/orders/:username', (req, res) => {
    const history = (db.orders || []).filter(o => o.username === req.params.username);
    res.json(history.reverse());
});

app.listen(PORT, '0.0.0.0', () => console.log(`Run on ${PORT}`));

