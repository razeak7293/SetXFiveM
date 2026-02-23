const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'database.json');

// --- ระบบฐานข้อมูล ---
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

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, '..')));

// --- USERS API (สมัคร/ล็อกอิน) ---
app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    db = loadDB();
    if (db.users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
        return res.json({ success: false, message: 'ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว' });
    }
    db.users.push({ username, password, balance: 0, date: new Date().toLocaleString('th-TH') });
    saveDB(db);
    res.json({ success: true });
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db = loadDB();
    const user = db.users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
    res.json({ success: !!user, user });
});

app.get('/api/users', (req, res) => {
    db = loadDB();
    res.json(db.users);
});

// --- ADMIN API (เติมเงิน/ลบยูเซอร์) ---
app.post('/api/users/:username/balance', (req, res) => {
    const { amount } = req.body;
    db = loadDB();
    const user = db.users.find(u => u.username === req.params.username);
    if (!user) return res.json({ success: false, message: 'ไม่พบผู้ใช้' });
    user.balance = (user.balance || 0) + Number(amount);
    saveDB(db);
    res.json({ success: true, newBalance: user.balance });
});

// เพิ่มเติมสำหรับหน้า Admin บางรุ่นที่ใช้ path นี้
app.post('/api/add-balance', (req, res) => {
    const { username, amount } = req.body;
    db = loadDB();
    const user = db.users.find(u => u.username === username);
    if (!user) return res.json({ success: false, message: 'ไม่พบผู้ใช้' });
    user.balance = (user.balance || 0) + Number(amount);
    saveDB(db);
    res.json({ success: true, newBalance: user.balance });
});

app.delete('/api/users/:username', (req, res) => {
    db = loadDB();
    db.users = db.users.filter(u => u.username !== req.params.username);
    saveDB(db);
    res.json({ success: true });
});

// --- PRODUCTS API (จัดการสินค้า) ---
app.get('/api/products', (req, res) => {
    db = loadDB();
    res.json(db.products);
});

app.post('/api/products', (req, res) => {
    const { name, price, stock } = req.body;
    db = loadDB();
    const newProd = { id: Date.now().toString(), name, price: Number(price), stock: Number(stock) };
    db.products.push(newProd);
    saveDB(db);
    res.json({ success: true, product: newProd });
});

app.post('/api/products/:id/stock', (req, res) => {
    const { amount } = req.body;
    db = loadDB();
    const product = db.products.find(p => p.id === req.params.id);
    if (product) {
        product.stock = (product.stock || 0) + Number(amount);
        saveDB(db);
        return res.json({ success: true, newStock: product.stock });
    }
    res.json({ success: false, message: 'ไม่พบสินค้า' });
});

app.delete('/api/products/:id', (req, res) => {
    db = loadDB();
    db.products = db.products.filter(p => p.id !== req.params.id);
    saveDB(db);
    res.json({ success: true });
});

// --- BUY API (ซื้อสินค้าและประวัติ) ---
app.post('/api/buy', (req, res) => {
    const { username, productId } = req.body;
    db = loadDB();
    const product = db.products.find(p => p.id === productId);
    const user = db.users.find(u => u.username.toLowerCase() === username.toLowerCase());

    if (!product || product.stock <= 0) return res.json({ success: false, message: 'สินค้าหมด' });
    if (!user) return res.json({ success: false, message: 'ไม่พบผู้ใช้' });
    if (user.balance < product.price) return res.json({ success: false, message: 'เงินไม่พอ' });

    user.balance -= product.price;
    product.stock -= 1;
    if (!db.orders) db.orders = [];
    db.orders.push({ orderId: 'ORD-'+Date.now(), username: user.username, itemName: product.name, price: product.price, date: new Date().toLocaleString('th-TH') });
    saveDB(db);
    res.json({ success: true, newBalance: user.balance });
});

app.get('/api/orders/:username', (req, res) => {
    db = loadDB();
    const history = (db.orders || []).filter(o => o.username.toLowerCase() === req.params.username.toLowerCase());
    res.json(history.reverse());
});

app.listen(PORT, '0.0.0.0', () => console.log(`Server started on port ${PORT}`));
