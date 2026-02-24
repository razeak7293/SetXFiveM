const canvas = document.getElementById('matrix-canvas');
const ctx = canvas.getContext('2d');

let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

// Characters to drop
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$+-*/=%&<>!?#@' + 'กขคฆงจฉชซฌญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรลวศษสหฬอฮ';
const charArr = chars.split('');

const fontSize = 16;
const columns = Math.floor(width / fontSize);

// One drop per column
const drops = [];
for (let i = 0; i < columns; i++) {
    drops[i] = Math.random() * -100; // Start at different heights
}

function draw() {
    // Semi-transparent black to create trailing effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#0F0'; // Matrix green
    ctx.font = fontSize + 'px monospace';

    for (let i = 0; i < drops.length; i++) {
        // Pick a random character
        const text = charArr[Math.floor(Math.random() * charArr.length)];

        // Randomly make some characters brighter for highlights
        if (Math.random() > 0.95) {
            ctx.fillStyle = '#fff';
        } else {
            ctx.fillStyle = '#008000'; // Darker green for trail
            if (i % 2 === 0) ctx.fillStyle = '#0F0'; // Mixed shades
        }

        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        // Sending drop to the top after it crosses the screen
        if (drops[i] * fontSize > height && Math.random() > 0.975) {
            drops[i] = 0;
        }

        // Incrementing Y coordinate
        drops[i]++;
    }
}

let animationId;
function animate() {
    draw();
    animationId = requestAnimationFrame(animate);
}

animate();

// Resize handler
window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;

    // Recalculate columns
    const newColumns = Math.floor(width / fontSize);
    if (newColumns > drops.length) {
        for (let i = drops.length; i < newColumns; i++) {
            drops[i] = 0;
        }
    }
});
