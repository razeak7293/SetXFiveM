import re
import json

with open("shop.html", "r", encoding="utf-8") as f:
    html = f.read()

# Replace products-grid content
new_grid = '''        <div class="products-grid" id="products-grid">
            <!-- Products will be generated here by JavaScript -->
        </div>'''
html = re.sub(r'<div class="products-grid">.*?</div>\n    </main>', new_grid + '\n    </main>', html, flags=re.DOTALL)

# Insert product array after user-display
products_js = '''        document.getElementById('user-display').textContent = `ผู้ใช้งาน: ${activeUser}`;

        const defaultProducts = [
            { id: 1, name: 'กล่องสุ่มไอดี ROV ระดับเทพ สกินแน่น & อนิเมะ 🔥', price: 149, imgText: 'กล่องสุ่ม ROV', desc: 'สุ่มไอดีเทพๆ พร้อมสกินมากมาย ไม่เกลือแน่นอน!', stock: 100 },
            { id: 2, name: '🟢 Fake Lag - ตัดเน็ต วาร์ปไปยัง ( 1วัน ) !', price: 25, imgText: 'Fake Lag', desc: 'โปรแกรมช่วยตัดเน็ตเสี้ยววิเพื่อวาร์ปข้ามจุดเสี่ยง ปลอดภัย ไม่โดนแบน', stock: 100 },
            { id: 3, name: 'โปร HEARTOPIA ( 1วัน )', price: 20, imgText: 'โปร HEARTOPIA', desc: 'รวมฟังก์ชั่นโกงแบบจัดเต็ม โจมตีอัตโนมัติ มองทะลุ สำหรับชาว HEARTOPIA', stock: 100 },
            { id: 4, name: '🔴 Internal พี่ฟาย ฟังก์ชั่นเต็มระบบ ( 1วัน ) !?', price: 30, imgText: 'โปร FreeFire', desc: 'พี่ฟายตัวตึงสุดในย่านนี้ ล็อคเป้าเป๊ะ ไม่แกว่ง รู้วิ่งทางไหน ลุยเลย!', stock: 100 }
        ];

        let products = JSON.parse(localStorage.getItem('shopProducts'));
        if (!products || products.length === 0) {
            products = defaultProducts;
            localStorage.setItem('shopProducts', JSON.stringify(products));
        }

        function renderProducts() {
            const grid = document.getElementById('products-grid');
            if (!grid) return;
            grid.innerHTML = '';
            products.forEach(p => {
                const isAdmin = activeUser === "Admin";
                let adminStockBadge = isAdmin ? `<div style="position:absolute; top:10px; right:10px; background:#ff9900; color:#111; padding:4px 8px; border-radius:4px; font-size:12px; font-weight:bold; cursor:pointer; z-index:10; box-shadow:0 2px 4px rgba(0,0,0,0.5);" onclick="addStock(${p.id}, event)">+ เพิ่มสต็อก</div>` : '';

                grid.innerHTML += `
                <div class="product-card" style="position:relative;">
                    ${adminStockBadge}
                    <div class="product-image"
                        onclick="showDetail(${p.id}, '${p.name}', ${p.price}, '${p.imgText}', '${p.desc}')"
                        style="cursor: pointer;">
                        <div class="img-placeholder">${p.imgText}</div>
                    </div>
                    <div class="product-info">
                        <div class="stock">สต็อกสินค้า / เหลือ <span id="stock-${p.id}">${p.stock}</span> ชิ้น</div>
                        <h3 class="product-name"
                            onclick="showDetail(${p.id}, '${p.name}', ${p.price}, '${p.imgText}', '${p.desc}')"
                            style="cursor: pointer;">${p.name}</h3>
                        <div class="price-row">
                            <div class="price">
                                <span class="label">ราคา</span>
                                <span class="amount">${p.price} บาท</span>
                            </div>
                            <button class="buy-btn" onclick="buyItem(${p.id}, '${p.name}', ${p.price})">
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                    <path
                                        d="M16 6V4a4 4 0 0 0-8 0v2H3v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6h-5zM10 4a2 2 0 0 1 4 0v2h-4V4zm9 16H5V8h3v2h2V8h4v2h2V8h3v12z" />
                                </svg>
                                ซื้อเลย
                            </button>
                        </div>
                    </div>
                </div>
                `;
            });
        }
        renderProducts();

        window.addStock = function(id, e) {
            e.stopPropagation();
            const p = products.find(x => x.id === id);
            if (!p) return;
            const amountStr = prompt(`ต้องการเพิ่มสต็อกให้ "${p.name}" จำนวนเท่าไหร่?`);
            if (amountStr) {
                const amount = parseInt(amountStr);
                if (!isNaN(amount) && amount > 0) {
                    p.stock += amount;
                    localStorage.setItem('shopProducts', JSON.stringify(products));
                    renderProducts();
                    customAlert(`เพิ่มสต็อกสำเร็จ! ตอนนี้มี ${p.stock} ชิ้น`, 'สำเร็จ');
                } else {
                    alert('ใส่จำนวนไม่ถูกต้อง');
                }
            }
        };'''
html = html.replace("        document.getElementById('user-display').textContent = `ผู้ใช้งาน: ${activeUser}`;", products_js)

# Replace showDetail
old_showDetail = '''        function showDetail(id, title, price, imgText, desc) {
            let stockElem = document.getElementById(`stock-${id}`);
            let currentStock = parseInt(stockElem.textContent);

            document.getElementById('detail-img').textContent = imgText;
            document.getElementById('detail-name').textContent = title;
            document.getElementById('detail-desc').textContent = desc;
            document.getElementById('detail-stock').textContent = currentStock;
            document.getElementById('detail-price').textContent = price;

            document.getElementById('detail-buy-btn').onclick = function () {
                detailModal.style.display = 'none';
                buyItem(id, title, price);
            };

            detailModal.style.display = 'flex';
        }'''
new_showDetail = '''        function showDetail(id, title, price, imgText, desc) {
            let p = products.find(x => x.id === id);
            if (!p) return;
            let currentStock = p.stock;

            document.getElementById('detail-img').textContent = imgText;
            document.getElementById('detail-name').textContent = title;
            document.getElementById('detail-desc').textContent = desc;
            document.getElementById('detail-stock').textContent = currentStock;
            document.getElementById('detail-price').textContent = price;

            document.getElementById('detail-buy-btn').onclick = function () {
                detailModal.style.display = 'none';
                buyItem(id, title, price);
            };

            detailModal.style.display = 'flex';
        }'''
html = html.replace(old_showDetail, new_showDetail)

# Replace the buy logic
buy_logic_regex = r"        // Buy Logic.*?function deleteHistoryItem\(orderId\) \{.*?\n        \}"
new_buy_logic = '''        // Buy Logic
        let currentItemToBuy = null;
        let isFirstConfirm = false;

        function buyItem(id, name, price) {
            let p = products.find(x => x.id === id);
            if (!p) return;
            let currentStock = p.stock;

            if (currentStock <= 0) {
                customAlert('ไม่สามารถทำรายการได้ สินค้านี้หมดสต็อกแล้ว!', 'สินค้าหมด');
                return;
            }

            currentItemToBuy = { id, name, price, currentStock: currentStock, productRef: p };
            isFirstConfirm = false;
            
            const btn = document.getElementById('confirm-buy-btn');
            btn.textContent = 'ยืนยันสั่งซื้อ';
            btn.style.backgroundColor = ''; // reset to default CSS
            
            document.getElementById('confirm-text').innerHTML = `คุณต้องการซื้อ <strong>"${name}"</strong> แบบหักยอดเงินจำนวน <span style="color:#ff9900; font-weight: bold; font-size:18px;">${price} ฿</span> ใช่หรือไม่?`;
            confirmModal.style.display = 'flex';
        }

        function closeConfirmModal() {
            confirmModal.style.display = 'none';
            currentItemToBuy = null;
            isFirstConfirm = false;
        }

        document.getElementById('confirm-buy-btn').addEventListener('click', () => {
            if (!currentItemToBuy) return;

            if (!isFirstConfirm) {
                isFirstConfirm = true;
                const btn = document.getElementById('confirm-buy-btn');
                btn.textContent = 'แน่ใจ ยืนยันซื้อเลย!';
                btn.style.backgroundColor = '#ff4d4f';
                document.getElementById('confirm-text').innerHTML = `ยืนยันครั้งที่ 2: หักเงิน <span style="color:#ff9900; font-weight: bold; font-size:18px;">${currentItemToBuy.price} ฿</span> ซื้อ <strong>"${currentItemToBuy.name}"</strong> แน่ใจหรือไม่?`;
                return;
            }

            // ตรวจสอบยอดเงิน
            if (activeUser !== "Admin" && userBalance < currentItemToBuy.price) {
                closeConfirmModal();
                customAlert(`ยอดเงินของคุณไม่เพียงพอ! (คุณมี ${userBalance} S / ต้องใช้ ${currentItemToBuy.price} บาท)`, 'ทำรายการไม่สำเร็จ');
                return;
            }

            // ตัดยอดเงิน
            if (activeUser !== "Admin") {
                const userIndex = usersArray.findIndex(u => u.username === activeUser);
                if (userIndex !== -1) {
                    usersArray[userIndex].balance -= currentItemToBuy.price;
                    localStorage.setItem('allRegisteredUsers', JSON.stringify(usersArray));
                    updateBalanceDisplay();
                }
            }

            // หักสต็อก
            currentItemToBuy.productRef.stock -= 1;
            localStorage.setItem('shopProducts', JSON.stringify(products));
            renderProducts();

            // บันทึกประวัติการซื้อใน localStorage ผูกกับชื่อผู้ใช้
            const historyKey = `purchases_${activeUser}`;
            let purchaseHistory = JSON.parse(localStorage.getItem(historyKey)) || [];

            const dateStr = new Date().toLocaleString('th-TH');
            const uid = Date.now().toString();

            const newPurchase = {
                uid: uid,
                itemName: currentItemToBuy.name,
                price: currentItemToBuy.price,
                date: dateStr,
                message: `คุณได้สั่งซื้อสินค้าชิ้นนี้แล้ว`
            };

            purchaseHistory.push(newPurchase);
            localStorage.setItem(historyKey, JSON.stringify(purchaseHistory));

            closeConfirmModal();
            customAlert(`ทำรายการสำเร็จ! สามารถดูประวัติได้ตรงปุ่มมุมขวาบน`, 'สั่งซื้อสำเร็จ');
        });

        // Render History
        function renderHistory() {
            const historyList = document.getElementById('history-list');
            const historyKey = `purchases_${activeUser}`;
            const historyData = JSON.parse(localStorage.getItem(historyKey)) || [];

            if (historyData.length === 0) {
                historyList.innerHTML = '<div class="empty-history">ยังไม่มีประวัติการสั่งซื้อ</div>';
                return;
            }

            historyList.innerHTML = '';
            // เรียงจากใหม่ไปเก่า
            historyData.reverse().forEach(item => {
                const historyCard = document.createElement('div');
                historyCard.className = 'history-item';
                historyCard.innerHTML = `
                    <div class="h-details" style="flex:1; padding-right:15px;">
                        <div class="h-name">${item.itemName}</div>
                        <div class="h-meta" style="color:#b8b8b8; font-size:13px; margin-top:4px;">${item.message || `ซื้อเมื่อ: ${item.date}`} | เวลา: ${item.date}</div>
                    </div>
                    <div style="display:flex; flex-direction:column; align-items:flex-end; gap:6px;">
                        <div class="h-price">${item.price} บาท</div>
                        <button onclick="deleteHistoryItem('${item.uid || item.orderId}')" style="background-color:transparent; color:#ff4d4f; border:1px solid #ff4d4f; border-radius:4px; padding:2px 8px; font-size:11px; cursor:pointer;" onmouseover="this.style.backgroundColor='#ff4d4f'; this.style.color='#fff'" onmouseout="this.style.backgroundColor='transparent'; this.style.color='#ff4d4f'">ลบประวัติ</button>
                    </div>
                `;
                historyList.appendChild(historyCard);
            });
        }

        function deleteHistoryItem(idToRemove) {
            if (confirm(`คุณต้องการลบประวัตินี้ ใช่หรือไม่?`)) {
                const historyKey = `purchases_${activeUser}`;
                let historyData = JSON.parse(localStorage.getItem(historyKey)) || [];
                historyData = historyData.filter(item => (item.uid || item.orderId) !== idToRemove);
                localStorage.setItem(historyKey, JSON.stringify(historyData));
                renderHistory(); // Refresh the list
            }
        }'''
html = re.sub(buy_logic_regex, new_buy_logic.replace("\\", "\\\\"), html, flags=re.DOTALL)

with open("shop.html", "w", encoding="utf-8") as f:
    f.write(html)
