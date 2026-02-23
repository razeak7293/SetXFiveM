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
        if (fs.existsSync(DB_FILE)) return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    } catch (e) { console.error("Load DB Error:", e); }
    return { users: [], products: [], orders: [] };
}
function saveDB(data) {
    try { fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 4), 'utf8'); } catch (e) { console.error("Save DB Error:", e); }
}

let db = loadDB();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, '..')));

// --- API สำหรับหน้าเว็บ ---
app.get('/api/users', (req, res) => res.json(loadDB().users));
app.get('/api/products', (req, res) => res.json(loadDB().products));

// ดึงประวัติการซื้อทั้งหมด (สำหรับ Carousel) - **จุดที่เคยเสีย**
app.get('/api/orders/all', (req, res) => {
    const data = loadDB();
    res.json(data.orders || []);
});

app.get('/api/orders/:username', (req, res) => {
    const data = loadDB();
    const history = (data.orders || []).filter(o => o.username.toLowerCase() === req.params.username.toLowerCase());
    res.json(history.reverse());
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const user = loadDB().users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
    res.json({ success: !!user, user });
});

app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    db = loadDB();
    if (db.users.find(u => u.username.toLowerCase() === username.toLowerCase())) return res.json({ success: false, message: 'ชื่อนี้มีแล้ว' });
    db.users.push({ username, password, balance: 0, date: new Date().toLocaleString('th-TH') });
    saveDB(db);
    res.json({ success: true });
});

// ระบบซื้อสินค้า
app.post('/api/buy', (req, res) => {
    const { username, productId } = req.body;
    db = loadDB();
    const product = db.products.find(p => p.id === productId);
    const user = db.users.find(u => u.username.toLowerCase() === username.toLowerCase());

    if (!product || product.stock <= 0) return res.json({ success: false, message: 'สินค้าหมด' });
    if (!user) return res.json({ success: false, message: 'ไม่พบผู้ใช้ ล็อกอินใหม่นะ' });
    if (user.balance < product.price) return res.json({ success: false, message: 'เงินไม่พอครับ' });

    user.balance -= product.price;
    product.stock -= 1;
    if (!db.orders) db.orders = [];
    db.orders.push({ orderId: 'ORD-'+Date.now(), username: user.username, itemName: product.name, price: product.price, date: new Date().toLocaleString('th-TH') });
    saveDB(db);
    res.json({ success: true, newBalance: user.balance });
});

// Admin: เติมเงิน
app.post('/api/users/:username/balance', (req, res) => {
    const { amount } = req.body;
    db = loadDB();
    const user = db.users.find(u => u.username === req.params.username);
    if (!user) return res.json({ success: false, message: 'ไม่พบผู้ใช้' });
    user.balance = (user.balance || 0) + Number(amount);
    saveDB(db);
    res.json({ success: true });
});

app.listen(PORT, '0.0.0.0', () => console.log(`Server started on port ${PORT}`));


