function createSnow() {
    const container = document.createElement('div');
    container.id = 'snow-container';
    document.body.appendChild(container);

    const symbols = ['❄', '❅', '❆', '•'];
    const count = 50;

    for (let i = 0; i < count; i++) {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        
        snowflake.innerText = symbols[Math.floor(Math.random() * symbols.length)];
        snowflake.style.left = Math.random() * 100 + '%';
        snowflake.style.fontSize = Math.random() * 15 + 10 + 'px';
        snowflake.style.opacity = Math.random() * 0.7 + 0.3;
        snowflake.style.animationDuration = (Math.random() * 5 + 5) + 's';
        snowflake.style.animationDelay = Math.random() * 5 + 's';

        container.appendChild(snowflake);
    }
}

window.addEventListener('DOMContentLoaded', createSnow);

