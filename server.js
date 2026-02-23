// ... (ส่วนต้นของไฟล์เหมือนเดิม) ...

// Buy Product (ปรับปรุงใหม่เพื่อกันบัค "ไม่พบผู้ใช้")
app.post('/api/buy', (req, res) => {
    const { username, productId } = req.body;
    
    // โหลดข้อมูลล่าสุดจาก DB ทุกครั้งที่มีการซื้อ (กันบัคข้อมูลในแรมไม่ตรงกับไฟล์)
    db = loadDB(); 

    const product = db.products.find(p => p.id === productId);
    // ค้นหาชื่อแบบไม่สนตัวพิมพ์เล็กใหญ่ เพื่อความเสถียร
    const user = db.users.find(u => u.username.trim().toLowerCase() === username.trim().toLowerCase());

    if (!product) return res.json({ success: false, message: 'ไม่พบสินค้าในระบบ' });
    if (product.stock <= 0) return res.json({ success: false, message: 'สินค้าหมดแล้ว' });
    if (!user) return res.json({ success: false, message: 'ชื่อผู้ใช้หายจากระบบ กรุณาสมัครใหม่หรือล็อกอินใหม่' });
    if (user.balance < product.price) return res.json({ success: false, message: 'ยอดเงินของคุณไม่เพียงพอ' });

    // หักเงินและอัปเดตสต็อก
    user.balance -= product.price;
    product.stock -= 1;
    
    const newOrder = {
        orderId: 'ORD-' + Math.floor(Date.now() / 1000),
        username: user.username, // ใช้ชื่อจริงจาก DB
        itemName: product.name,
        price: product.price,
        date: new Date().toLocaleString('th-TH')
    };
    
    if (!db.orders) db.orders = [];
    db.orders.push(newOrder);
    
    saveDB(db);
    res.json({ success: true, message: 'ซื้อสินค้าสำเร็จ!', newBalance: user.balance });
});

// ... (ส่วนท้ายของไฟล์เหมือนเดิม) ...


