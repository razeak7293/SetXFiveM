const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'database.json');

// Error handling for 24/7 stability
process.on('uncaughtException', (err) => {
    console.error('🔥 UNCAUGHT EXCEPTION:', err);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('🔥 UNHANDLED REJECTION:', reason);
});

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from multiple possible locations (for flexible deployment)
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, '..')));
app.use(express.static(process.cwd()));

// GET / - Smart Redirect to index.html with logging
app.get('/', (req, res) => {
    const possiblePaths = [
        path.join(__dirname, 'index.html'),
        path.join(__dirname, '..', 'index.html'),
        path.join(process.cwd(), 'index.html'),
        path.join(process.cwd(), '..', 'index.html')
    ];

    console.log('🔍 Searching for index.html in:', possiblePaths);

    for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
            console.log('✅ Found index.html at:', p);
            return res.sendFile(p);
        }
    }

    console.error('❌ index.html NOT FOUND in any common location');
    res.status(404).send('ไม่พบไฟล์ index.html กรุณาตรวจสอบว่าคุณอัปโหลดไฟล์ทั้งหมด (HTML/CSS/JS) ขึ้น GitHub แล้วหรือไม่');
});
function loadDB() {
    try {
        if (!fs.existsSync(DB_FILE)) {
            const initialData = {
                users: [],
                products: [
                    { id: "1", name: "กล่องสุ่มไอดี ROV", price: 149, stock: 42, type: "กล่องสุ่ม ROV", desc: "สุ่มไอดีเทพๆ พร้อมสกินมากมาย" },
                    { id: "2", name: "🟢 Fake Lag - ตัดเน็ต ( 1วัน )", price: 25, stock: 23, type: "Fake Lag", desc: "โปรแกรมช่วยตัดเน็ตเสี้ยววิ" },
                    { id: "3", name: "โปร HEARTOPIA ( 1วัน )", price: 20, stock: 2, type: "โปร HEARTOPIA", desc: "รวมฟังก์ชั่นโกงแบบจัดเต็ม" },
                    { id: "4", name: "🔴 Internal พี่ฟาย เต็มระบบ", price: 30, stock: 35, type: "โปร FreeFire", desc: "ล็อคเป้าเป๊ะ ไม่แกว่ง" }
                ],
                orders: []
            };
            saveDB(initialData);
            return initialData;
        }
        const data = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('❌ Error loading database:', err);
        return { users: [], products: [], orders: [] }; // Fallback
    }
}

function saveDB(data) {
    try {
        // Ensure the directory exists
        const dir = path.dirname(DB_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (err) {
        console.error('❌ Error saving database:', err);
        throw err; // Re-throw to be caught by route handler
    }
}

// ------ USERS API ------

// Register User
app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    const db = loadDB();

    if (db.users.find(u => u.username === username)) {
        return res.status(400).json({ success: false, message: 'ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว' });
    }

    const newUser = {
        username,
        password,
        balance: 0,
        registerDate: new Date().toLocaleString('th-TH')
    };

    db.users.push(newUser);
    saveDB(db);
    res.json({ success: true, message: 'ลงทะเบียนสำเร็จ!', user: newUser });
});

// Login User
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const db = loadDB();

    const user = db.users.find(u => u.username === username && u.password === password);
    if (!user) {
        return res.status(401).json({ success: false, message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง!' });
    }

    res.json({ success: true, message: 'เข้าสู่ระบบสำเร็จ!', user });
});

// Get All Users (Admin)
app.get('/api/users', (req, res) => {
    const db = loadDB();
    res.json(db.users);
});

// Delete User (Admin)
app.delete('/api/users/:username', (req, res) => {
    const db = loadDB();
    db.users = db.users.filter(u => u.username !== req.params.username);
    saveDB(db);
    res.json({ success: true, message: 'ลบผู้ใช้สำเร็จ' });
});

// Add Balance (Admin)
app.post('/api/users/:username/balance', (req, res) => {
    const { amount } = req.body;
    const db = loadDB();

    const user = db.users.find(u => u.username === req.params.username);
    if (!user) return res.status(404).json({ success: false, message: 'ไม่พบผู้ใช้' });

    user.balance = (user.balance || 0) + Number(amount);
    saveDB(db);

    res.json({ success: true, message: 'เติมเงินสำเร็จ', newBalance: user.balance });
});

// GET /api/users/:username/balance - Return user balance
app.get('/api/users/:username/balance', (req, res) => {
    const db = loadDB();
    const username = req.params.username;

    if (username === "Nitisak22") {
        return res.json({ success: true, balance: 999999 });
    }

    const user = db.users.find(u => u.username === username);
    if (!user) return res.status(404).json({ success: false, message: 'ไม่พบผู้ใช้' });

    res.json({ success: true, balance: user.balance || 0 });
});

// Alias for add-balance to support frontend
app.post('/api/add-balance', (req, res) => {
    const { username, amount } = req.body;
    const db = loadDB();

    const user = db.users.find(u => u.username === username);
    if (!user) return res.status(404).json({ success: false, message: 'ไม่พบผู้ใช้' });

    user.balance = (user.balance || 0) + Number(amount);
    saveDB(db);

    res.json({ success: true, message: 'เติมเงินสำเร็จ', newBalance: user.balance });
});


// ------ PRODUCTS & ORDERS API ------

// Get Products
app.get('/api/products', (req, res) => {
    const db = loadDB();
    res.json(db.products);
});

// Add Product (Admin)
app.post('/api/products', (req, res) => {
    const { name, price, stock, type, desc, downloadLink, imageUrl } = req.body;
    const db = loadDB();

    const newProduct = {
        id: Date.now().toString(),
        name,
        price: Number(price),
        stock: Number(stock),
        type,
        desc,
        downloadLink: downloadLink || "",
        imageUrl: imageUrl || ""
    };

    db.products.push(newProduct);
    saveDB(db);
    res.json({ success: true, message: 'เพิ่มสินค้าใหม่สำเร็จ!', product: newProduct });
});

// Update Product (Admin)
app.put('/api/products/:id', (req, res) => {
    try {
        const { name, price, stock, type, desc, downloadLink, imageUrl } = req.body;
        const db = loadDB();
        const index = db.products.findIndex(p => p.id === req.params.id);

        if (index === -1) return res.status(404).json({ success: false, message: 'ไม่พบสินค้า' });

        db.products[index] = {
            ...db.products[index],
            name: name || db.products[index].name,
            price: price !== undefined ? Number(price) : db.products[index].price,
            stock: stock !== undefined ? Number(stock) : db.products[index].stock,
            type: type || db.products[index].type,
            desc: desc || db.products[index].desc,
            downloadLink: downloadLink !== undefined ? downloadLink : db.products[index].downloadLink,
            imageUrl: imageUrl !== undefined ? imageUrl : db.products[index].imageUrl
        };

        saveDB(db);
        res.json({ success: true, message: 'อัปเดตข้อมูลสินค้าสำเร็จ!', product: db.products[index] });
    } catch (err) {
        console.error('❌ Update product error:', err);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์ขณะบันทึกข้อมูล' });
    }
});

// Update Stock (Admin)
app.post('/api/products/:id/stock', (req, res) => {
    const { amount } = req.body;
    const db = loadDB();
    const product = db.products.find(p => p.id === req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'ไม่พบสินค้า' });

    product.stock = (Number(product.stock) || 0) + Number(amount);
    saveDB(db);
    res.json({ success: true, message: 'อัปเดตสต็อกสำเร็จ', newStock: product.stock });
});

// Delete Product (Admin)
app.delete('/api/products/:id', (req, res) => {
    const db = loadDB();
    db.products = db.products.filter(p => p.id !== req.params.id);
    saveDB(db);
    res.json({ success: true, message: 'ลบสินค้าสำเร็จ' });
});

// Buy Product
app.post('/api/buy', (req, res) => {
    const { username, productId } = req.body;
    const db = loadDB();

    const product = db.products.find(p => p.id === productId);
    if (!product || product.stock <= 0) {
        return res.status(400).json({ success: false, message: 'สินค้าหมดแล้ว!' });
    }

    let user = db.users.find(u => u.username === username);

    // Handle Hardcoded Admin for testing
    if (username === "Nitisak22" && !user) {
        user = { username: "Nitisak22", balance: 999999 };
    }

    if (!user) {
        return res.status(404).json({ success: false, message: 'ไม่พบชื่อผู้ใช้งานในระบบ หรือคุณล็อกอินค้างจากเวอร์ชันเก่า กรุณาล็อกอินใหม่อีกครั้ง' });
    }

    if (user.balance < product.price) {
        return res.status(400).json({ success: false, message: 'ยอดเงินไม่เพียงพอ!' });
    }

    // Process Transaction
    user.balance -= product.price;
    product.stock -= 1;

    const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    const order = {
        orderId,
        username,
        productId,
        itemName: product.name,
        price: product.price,
        downloadLink: product.downloadLink || "",
        date: new Date().toLocaleString('th-TH')
    };

    db.orders.push(order);
    saveDB(db);

    res.json({ success: true, message: 'สั่งซื้อสำเร็จ!', orderId, downloadLink: product.downloadLink, newBalance: user.balance });
});

// Get All Orders (Public Carousel)
app.get('/api/orders/all', (req, res) => {
    const db = loadDB();
    // Return last 20 orders
    const history = db.orders.slice(-20).reverse();
    res.json(history);
});

// Get User History
app.get('/api/orders/:username', (req, res) => {
    const db = loadDB();
    const history = db.orders.filter(o => o.username === req.params.username);
    res.json(history);
});

// Delete Order History
app.delete('/api/orders/:orderId', (req, res) => {
    const db = loadDB();
    db.orders = db.orders.filter(o => o.orderId !== req.params.orderId);
    saveDB(db);
    res.json({ success: true, message: 'ลบประวัติคำสั่งซื้อสำเร็จ' });
});

const { exec } = require('child_process');

// START SERVER
app.listen(PORT, '0.0.0.0', () => {
    const url = `http://localhost:${PORT}`;
    console.log(`=========================================`);
    console.log(`✅ Backend API is running on ${url}`);
    console.log(`=========================================`);

    // Auto-open browser (Disabled for cloud deployment)
    // const startCmd = process.platform === 'win32' ? 'start' : (process.platform === 'darwin' ? 'open' : 'xdg-open');
    // exec(`${startCmd} ${url}`);
});




