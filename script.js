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

    // Canvas animation for drawing a horizontal line for each section
    const canvasElements = document.querySelectorAll('.line-animation');
    const canvases = Array.from(canvasElements).map((canvas, index) => {
        const ctx = canvas.getContext('2d');
        let width = Math.min(window.innerWidth, 960); // Match container max-width
        const height = 30; // Canvas height
        canvas.width = width;
        canvas.height = height;

        // Determine direction based on index: odd indices (0, 2, 4, ...) go left-to-right, even go right-to-left
        const leftToRight = index % 2 === 0;
        const x = leftToRight ? 0 : width; // Start position based on direction
        const lastY = height / 2;

        return { canvas, ctx, width, height, x, lastY, leftToRight };
    });

    // Adjust canvas sizes on window resize
    window.addEventListener('resize', () => {
        canvases.forEach(item => {
            const { canvas, ctx, leftToRight } = item;
            item.width = Math.min(window.innerWidth, 960);
            canvas.width = item.width;
            canvas.height = item.height;
            item.x = leftToRight ? 0 : item.width; // Reset x based on direction
            item.lastY = item.height / 2;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        });
    });

    // Animation settings
    const baseSpeed = 1; // Base speed (slower than original 3 pixels per frame)
    const speedVariation = 0.5; // Random speed variation (±0.5 pixels)
    let frameCounter = 0; // To control the frequency of y-variations

    function drawLine(item) {
        const { canvas, ctx, width, height, leftToRight } = item;
        ctx.beginPath();
        ctx.moveTo(item.x, item.lastY);

        // Update x position based on direction
        const speed = baseSpeed + (Math.random() - 0.5) * speedVariation; // Random speed between 0.5 and 1.5
        if (leftToRight) {
            item.x += speed;
            if (item.x > width) {
                item.x = width; // Stop at canvas right edge
            }
        } else {
            item.x -= speed;
            if (item.x < 0) {
                item.x = 0; // Stop at canvas left edge
            }
        }

        // Add subtle, less frequent randomness to y position for hand-drawn effect
        frameCounter++;
        let y = item.lastY;
        if (frameCounter % 10 === 0) { // Change y every 10 frames for less frequent variations
            y = (height / 2) + (Math.random() - 0.5) * 2; // Subtle randomness ±1px
        }
        ctx.lineTo(item.x, y);

        // Randomize line width for felt pen effect
        ctx.lineWidth = 2 + (Math.random() - 0.5) * 0.5; // 1.75–2.25px
        ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim();
        ctx.lineCap = 'round';
        ctx.stroke();

        item.lastY = y; // Update last y position for smooth continuity

        // Continue animation until the line reaches the end
        if (leftToRight ? item.x < width : item.x > 0) {
            requestAnimationFrame(() => drawLine(item));
        }
    }

    // Start animation for each canvas
    canvases.forEach(item => {
        drawLine(item);
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
                if (!Array.isArray(data)) {
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