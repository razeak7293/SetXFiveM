const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'database.json');

// --- ระบบโหลดข้อมูลแบบป้องกันการหาย (Updated) ---
function loadDB() {
    try {
        if (fs.existsSync(DB_FILE)) {
            const data = fs.readFileSync(DB_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (err) {
        console.error('❌ Error loading DB:', err);
    }
    
    // ถ้าไม่มีไฟล์ หรือไฟล์เสีย ให้ใช้ค่าเริ่มต้น
    return {
        users: [],
        products: [
            { id: "1", name: "กล่องสุ่มไอดี ROV", price: 149, stock: 42, type: "กล่องสุ่ม ROV", desc: "สุ่มไอดีเทพๆ พร้อมสกินมากมาย" }
        ],
        orders: []
    };
}

function saveDB(data) {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 4), 'utf8');
    } catch (err) {
        console.error('❌ Error saving DB:', err);
    }
}

let db = loadDB(); // โหลดข้อมูลเข้าตัวแปรหลักครั้งเดียวตอนเปิดเซิร์ฟเวอร์

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, '..')));

// GET / - หน้าแรก
app.get('/', (req, res) => {
    const p = path.join(__dirname, 'index.html');
    if (fs.existsSync(p)) return res.sendFile(p);
    res.status(404).send('ไม่พบไฟล์ index.html');
});

// ------ USERS API ------

app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    if (db.users.find(u => u.username === username)) {
        return res.status(400).json({ success: false, message: 'ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว' });
    }
    const newUser = { username, password, balance: 0, registerDate: new Date().toLocaleString('th-TH') };
    db.users.push(newUser);
    saveDB(db);
    res.json({ success: true, message: 'ลงทะเบียนสำเร็จ!', user: newUser });
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const user = db.users.find(u => u.username === username && u.password === password);
    if (!user) return res.status(401).json({ success: false, message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง!' });
    res.json({ success: true, user });
});

app.get('/api/users', (req, res) => res.json(db.users));

app.post('/api/add-balance', (req, res) => {
    const { username, amount } = req.body;
    const user = db.users.find(u => u.username === username);
    if (!user) return res.status(404).json({ success: false, message: 'ไม่พบผู้ใช้' });
    user.balance = (user.balance || 0) + Number(amount);
    saveDB(db);
    res.json({ success: true, newBalance: user.balance });
});

// ------ PRODUCTS API ------

app.get('/api/products', (req, res) => res.json(db.products));

app.post('/api/buy', (req, res) => {
    const { username, productId } = req.body;
    const product = db.products.find(p => p.id === productId);
    if (!product || product.stock <= 0) return res.status(400).json({ success: false, message: 'สินค้าหมดแล้ว!' });

    const user = db.users.find(u => u.username === username);
    if (!user) return res.status(404).json({ success: false, message: 'กรุณาล็อกอินใหม่' });

    if (user.balance < product.price) return res.status(400).json({ success: false, message: 'ยอดเงินไม่เพียงพอ!' });

    user.balance -= product.price;
    product.stock -= 1;
    const order = { orderId: 'ORD-'+Date.now(), username, itemName: product.name, price: product.price, date: new Date().toLocaleString('th-TH') };
    db.orders.push(order);
    saveDB(db);
    res.json({ success: true, order });
});

app.get('/api/orders/all', (req, res) => res.json(db.orders.slice(-20).reverse()));

app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server is running on port ${PORT}`);
});
