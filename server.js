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
            const data = fs.readFileSync(DB_FILE, 'utf8');
            return JSON.parse(data);
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

// --- API สำหรับผู้ใช้งาน ---
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

// --- API สำหรับสินค้าและประวัติ ---
app.get('/api/products', (req, res) => {
    db = loadDB();
    res.json(db.products);
});

app.post('/api/buy', (req, res) => {
    const { username, productId } = req.body;
    db = loadDB();
    
    const product = db.products.find(p => p.id === productId);
    const user = db.users.find(u => u.username.toLowerCase() === username.toLowerCase());

    if (!product) return res.json({ success: false, message: 'ไม่พบสินค้า' });
    if (product.stock <= 0) return res.json({ success: false, message: 'สินค้าหมด' });
    if (!user) return res.json({ success: false, message: 'ไม่พบผู้ใช้ในระบบ กรุณาล็อกอินใหม่' });
    if (user.balance < product.price) return res.json({ success: false, message: 'เงินไม่พอ' });

    user.balance -= product.price;
    product.stock -= 1;
    
    if (!db.orders) db.orders = [];
    const order = {
        orderId: 'ORD-' + Date.now(),
        username: user.username,
        itemName: product.name,
        price: product.price,
        date: new Date().toLocaleString('th-TH')
    };
    db.orders.push(order);
    
    saveDB(db);
    res.json({ success: true, newBalance: user.balance });
});

app.get('/api/orders/:username', (req, res) => {
    db = loadDB();
    const history = (db.orders || []).filter(o => o.username.toLowerCase() === req.params.username.toLowerCase());
    res.json(history.reverse());
});

app.listen(PORT, '0.0.0.0', () => console.log(`Server is running on port ${PORT}`));

