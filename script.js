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

    // Canvas animation for drawing a looping horizontal line with fading tail
    const canvases = document.querySelectorAll('.line-animation');
    canvases.forEach(canvas => {
        const ctx = canvas.getContext('2d');
        let width = Math.min(window.innerWidth, 960); // Match container max-width
        const height = 20; // Canvas height (adjusted to match CSS)
        canvas.width = width;
        canvas.height = height;

        // Random direction: true for left-to-right, false for right-to-left
        const leftToRight = Math.random() > 0.5;
        let x = leftToRight ? 0 : width;
        // Random speed between 1 and 4 pixels per frame
        const speed = leftToRight ? (1 + Math.random() * 3) : -(1 + Math.random() * 3);
        const baseY = height / 2;
        let lastY = baseY;
        let pathPoints = []; // Store points for fading tail

        // Adjust canvas size on window resize
        window.addEventListener('resize', () => {
            width = Math.min(window.innerWidth, 960);
            canvas.width = width;
            canvas.height = height;
            x = leftToRight ? 0 : width; // Reset animation based on direction
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            lastY = baseY;
            pathPoints = []; // Clear path points
        });

        function drawLine() {
            // Clear canvas with slight opacity to create fading effect
            ctx.fillStyle = 'rgba(245, 243, 231, 0.1)'; // Match --bg-color light theme (f5f3e7)
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Add current point to path
            pathPoints.push({ x, y: lastY });

            // Calculate fade distance (quarter of canvas width)
            const fadeDistance = width / 4;
            const fadeStartX = leftToRight ? x - fadeDistance : x + fadeDistance;

            // Draw the path with fading tail
            ctx.beginPath();
            pathPoints.forEach((point, index) => {
                const distance = leftToRight ? x - point.x : point.x - x;
                let opacity = 1;
                if (distance > 0 && distance <= fadeDistance) {
                    opacity = 1 - (distance / fadeDistance); // Linear fade
                } else if (distance > fadeDistance) {
                    opacity = 0; // Fully transparent beyond fade distance
                }

                ctx.strokeStyle = `rgba(${getRGBValues(getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim())}, ${opacity})`;
                ctx.lineWidth = 2 + (Math.random() - 0.5) * 0.2; // 1.9–2.1px
                ctx.lineCap = 'round';

                if (index === 0) {
                    ctx.moveTo(point.x, point.y);
                } else {
                    ctx.lineTo(point.x, point.y);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(point.x, point.y);
                }
            });

            // Update x position based on direction
            x += speed;
            let reachedEnd = false;
            if (leftToRight) {
                if (x >= width) {
                    x = 0; // Reset to start
                    reachedEnd = true;
                }
            } else {
                if (x <= 0) {
                    x = width; // Reset to end
                    reachedEnd = true;
                }
            }

            // Add smaller randomness to y position for smoother hand-drawn effect
            const y = lastY + (Math.random() - 0.5) * 1; // ±0.5px randomness
            ctx.lineTo(x, y);

            // Draw the latest segment
            ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim();
            ctx.lineWidth = 2 + (Math.random() - 0.5) * 0.2;
            ctx.lineCap = 'round';
            ctx.stroke();

            lastY = y; // Update last y position

            // Clean up old points beyond fade distance
            pathPoints = pathPoints.filter(point => {
                const distance = leftToRight ? x - point.x : point.x - x;
                return distance <= fadeDistance;
            });

            // Reset path points on loop
            if (reachedEnd) {
                pathPoints = [];
                lastY = baseY; // Reset y to base for new path
            }

            // Continue animation
            requestAnimationFrame(drawLine);
        }

        // Helper function to parse CSS color to RGB
        function getRGBValues(color) {
            if (color.startsWith('#')) {
                const r = parseInt(color.slice(1, 3), 16);
                const g = parseInt(color.slice(3, 5), 16);
                const b = parseInt(color.slice(5, 7), 16);
                return `${r}, ${g}, ${b}`;
            }
            return '107, 125, 75'; // Fallback to --accent-color (olive green)
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