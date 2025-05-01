document.addEventListener('DOMContentLoaded', function () {
    // Theme switching logic
    const themeSelector = document.getElementById('theme-selector');
    const html = document.documentElement;

    themeSelector.addEventListener('change', function () {
        const theme = themeSelector.value;
        html.setAttribute('data-theme', theme.includes('dark') ? 'dark' : 'light');

        let stylesheet;
        if (theme.includes('natural')) {
            stylesheet = 'styles.css';
        } else if (theme.includes('architectural')) {
            stylesheet = 'architectural.css';
        } else if (theme.includes('space')) {
            stylesheet = 'space.css';
        } else if (theme.includes('medieval')) {
            stylesheet = 'medieval.css';
        }

        document.getElementById('theme-stylesheet').setAttribute('href', stylesheet);
    });

    // Mobile menu toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });

    // Canvas animation for drawing a horizontal line on all canvases
    const canvases = document.querySelectorAll('.line-animation');
    canvases.forEach(canvas => {
        const ctx = canvas.getContext('2d');
        let width = Math.min(window.innerWidth, 960); // Match container max-width
        const height = 30; // Canvas height
        canvas.width = width;
        canvas.height = height;

        // Random direction: true for left-to-right, false for right-to-left
        const leftToRight = Math.random() > 0.5;
        let x = leftToRight ? 0 : width;
        // Random speed between 1 and 4 pixels per frame
        const speed = leftToRight ? (1 + Math.random() * 3) : -(1 + Math.random() * 3);
        const baseY = height / 2;
        let lastY = baseY;

        // Adjust canvas size on window resize
        window.addEventListener('resize', () => {
            width = Math.min(window.innerWidth, 960);
            canvas.width = width;
            canvas.height = height;
            x = leftToRight ? 0 : width; // Reset animation based on direction
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            lastY = baseY;
        });

        function drawLine() {
            ctx.beginPath();
            ctx.moveTo(x, lastY);

            // Update x position based on direction
            x += speed;
            if (leftToRight) {
                if (x > width) x = width; // Stop at canvas width
            } else {
                if (x < 0) x = 0; // Stop at canvas start
            }

            // Add smaller randomness to y position for smoother hand-drawn effect
            const y = lastY + (Math.random() - 0.5) * 1; // ±0.5px randomness for smoother transitions
            ctx.lineTo(x, y);

            // Subtle line width variation for felt pen effect
            ctx.lineWidth = 2 + (Math.random() - 0.5) * 0.2; // 1.9–2.1px
            ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim();
            ctx.lineCap = 'round';
            ctx.stroke();

            lastY = y; // Update last y position for smooth continuity

            // Continue animation until the line reaches the end
            if (leftToRight ? (x < width) : (x > 0)) {
                requestAnimationFrame(drawLine);
            }
        }

        // Start animation
        drawLine();
    });

    // Function to load guitar pieces
    function loadGuitarPieces() {
        const guitarList = document.getElementById('guitar-pieces-list');
        guitarList.innerHTML = ''; // Clear existing list

        fetch('guitar_pieces.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load guitar_pieces.json');
                }
                return response.json();
            })
            .then(data => {
                if (!

Array.isArray(data)) {
                    throw new Error('guitar_pieces.json is not a valid array');
                }
                data.forEach(piece => {
                    if (!piece.title || !piece.file) {
                        console.warn('Invalid guitar piece entry:', piece);
                        return;
                    }
                    const li = document.createElement('li');
                    li.className = 'guitar-piece';
                    const audioType = piece.file.toLowerCase().endsWith('.mp3') ? 'audio/mpeg' : 'audio/wav';
                    li.innerHTML = `
                        <span>${piece.title}</span>
                        <audio controls>
                            <source src="audio/guitar_pieces/${piece.file}" type="${audioType}">
                            Your browser does not support the audio element.
                        </audio>
                    `;
                    guitarList.appendChild(li);
                });
            })
            .catch(error => {
                console.error('Error loading guitar pieces:', error);
                guitarList.innerHTML = '<li>Unable to load guitar pieces at this time.</li>';
            });
    }

    // Initial load of guitar pieces
    loadGuitarPieces();
});