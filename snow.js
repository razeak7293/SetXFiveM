function createSnow() {
    const container = document.createElement('div');
    container.id = 'snow-container';
    document.body.appendChild(container);

    const symbols = ['❄', '❅', '❆', '•', '*'];
    const count = 50;

    for (let i = 0; i < count; i++) {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';

        // Random properties
        const size = Math.random() * 15 + 10 + 'px';
        const left = Math.random() * 100 + '%';
        const duration = Math.random() * 5 + 5 + 's';
        const delay = Math.random() * 5 + 's';
        const opacity = Math.random() * 0.7 + 0.3;
        const symbol = symbols[Math.floor(Math.random() * symbols.length)];

        snowflake.innerText = symbol;
        snowflake.style.fontSize = size;
        snowflake.style.left = left;
        snowflake.style.animationDuration = `${duration}, 3s`;
        snowflake.style.animationDelay = `${delay}, ${delay}`;
        snowflake.style.opacity = opacity;

        container.appendChild(snowflake);
    }
}

// Start snow when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createSnow);
} else {
    createSnow();
}
