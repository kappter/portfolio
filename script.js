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
        // Random speed between 0.5 and 2 pixels per frame (slower)
        const speed = leftToRight ? (0.5 + Math.random() * 1.5) : -(0.5 + Math.random() * 1.5);
        const baseY = height / 2;
        let lastY = baseY;
        let pathPoints = []; // Store points for fading tail
        let frameCount = 0; // For controlling y-position updates
        const yUpdateInterval = 5; // Update y every 5 frames for smoother transitions

        // Adjust canvas size on window resize
        window.addEventListener('resize', () => {
            width = Math.min(window.innerWidth, 960);
            canvas.width = width;
            canvas.height = height;
            x = leftToRight ? 0 : width; // Reset animation based on direction
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear on resize to reset
            lastY = baseY;
            pathPoints = []; // Clear path points
        });

        function drawLine() {
            // Calculate fade distance: min of 600px and width/3
            const fadeDistance = Math.min(600, width / 3);

            // Clear only the area behind the tail to prevent trails during animation
            const clearStart = leftToRight ? Math.max(0, x - fadeDistance - 10) : Math.min(width, x + fadeDistance + 10);
            const clearWidth = fadeDistance + 20; // Slightly larger to ensure full clear
            ctx.clearRect(clearStart, 0, clearWidth, height);

            // Add current point to path
            pathPoints.push({ x, y: lastY });

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

            // Update y position less frequently and with less randomness for smoother effect
            frameCount++;
            let y = lastY;
            if (frameCount % yUpdateInterval === 0) {
                y = lastY + (Math.random() - 0.5) * 0.3; // Reduced randomness to ±0.3px
            }
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

            // Clear entire canvas and reset path when looping to prevent flash
            if (reachedEnd) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
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
        if (!guitarList) {
            console.error('Guitar pieces list element not found (#guitar-pieces-list)');
            return;
        }
        guitarList.innerHTML = ''; // Clear existing list

        fetch('https://raw.githubusercontent.com/kappter/portfolio/main/guitar_pieces.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load guitar_pieces.json: ${response.status} ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Guitar pieces data:', data);
                if (!Array.isArray(data)) {
                    throw new Error('guitar_pieces.json is not a valid array');
                }
                if (data.length === 0) {
                    guitarList.innerHTML = '<li>No guitar pieces available.</li>';
                    return;
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
                            <source src="https://raw.githubusercontent.com/kappter/portfolio/main/audio/guitar_pieces/${piece.file}" type="${audioType}">
                            Your browser does not support the audio element.
                        </audio>
                    `;
                    guitarList.appendChild(li);
                });
            })
            .catch(error => {
                console.error('Error loading guitar pieces:', error.message);
                guitarList.innerHTML = '<li>Unable to load guitar pieces at this time. Please try again later.</li>';
            });
    }

    // Initial load of guitar pieces
    loadGuitarPieces();

    // Art Carousel Logic
    const artCarouselImage = document.getElementById('carousel-image');
    const artCarouselCaption = document.getElementById('carousel-caption');
    const artPrevButton = document.querySelector('.art-carousel .carousel-prev');
    const artNextButton = document.querySelector('.art-carousel .carousel-next');
    const artCarouselContainer = document.querySelector('.art-carousel');
    let artImages = [];
    let artCurrentIndex = 0;
    let artAutoAdvanceInterval = null;
    const AUTO_ADVANCE_INTERVAL = 5000; // 5 seconds

    // Photography Carousel Logic
    const photographyCarouselImage = document.getElementById('photography-carousel-image');
    const photographyCarouselCaption = document.getElementById('photography-carousel-caption');
    const photographyPrevButton = document.querySelector('.photography-carousel .carousel-prev');
    const photographyNextButton = document.querySelector('.photography-carousel .carousel-next');
    const photographyCarouselContainer = document.querySelector('.photography-carousel');
    let photographyImages = [];
    let photographyCurrentIndex = 0;
    let photographyAutoAdvanceInterval = null;

    // Function to format filename into a caption
    function formatCaption(filename) {
        // Remove extension and replace underscores/hyphens with spaces
        const name = filename.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
        // Capitalize first letter of each word
        return name.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    }

    // Function to change image with fade effect (generic for both carousels)
    function changeImage(carouselImage, carouselCaption, images, currentIndex, setIndex) {
        if (!carouselImage || !carouselCaption) {
            console.error('Carousel elements not found');
            return;
        }
        if (images.length === 0) {
            console.warn('No images available for carousel');
            return;
        }
        if (currentIndex < 0) currentIndex = images.length - 1;
        if (currentIndex >= images.length) currentIndex = 0;
        setIndex(currentIndex);

        carouselImage.classList.add('fade-out');
        setTimeout(() => {
            carouselImage.src = images[currentIndex].url;
            carouselImage.alt = formatCaption(images[currentIndex].file);
            carouselCaption.textContent = formatCaption(images[currentIndex].file);
            carouselImage.classList.remove('fade-out');
        }, 500); // Match CSS transition duration
    }

    // Function to start auto-advance (generic)
    function startAutoAdvance(interval, changeFunction) {
        interval = stopAutoAdvance(interval);
        interval = setInterval(changeFunction, AUTO_ADVANCE_INTERVAL);
        return interval;
    }

    // Function to stop auto-advance (generic)
    function stopAutoAdvance(interval) {
        if (interval) {
            clearInterval(interval);
            interval = null;
        }
        return interval;
    }

    // Load art images from art_images.json
    fetch('https://raw.githubusercontent.com/kappter/portfolio/main/art_images.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load art_images.json: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Art images data:', data);
            if (!Array.isArray(data)) {
                throw new Error('art_images.json is not a valid array');
            }
            artImages = data.filter(item => item.file && /\.(jpg|jpeg|png|gif)$/i.test(item.file)).map(item => ({
                file: item.file,
                url: `https://raw.githubusercontent.com/kappter/portfolio/main/art/${item.file}`
            }));
            if (artImages.length === 0) {
                artCarouselCaption.textContent = 'No images found in art folder.';
                console.warn('No valid images found in art_images.json');
                return;
            }
            console.log(`Loaded ${artImages.length} art images`);
            // Initialize art carousel
            changeImage(artCarouselImage, artCarouselCaption, artImages, artCurrentIndex, index => artCurrentIndex = index);
            artAutoAdvanceInterval = startAutoAdvance(artAutoAdvanceInterval, () => {
                changeImage(artCarouselImage, artCarouselCaption, artImages, artCurrentIndex + 1, index => artCurrentIndex = index);
            });
        })
        .catch(error => {
            console.error('Error loading art images:', error.message);
            artCarouselCaption.textContent = 'Unable to load art images at this time. Please try again later.';
        });

    // Load photography images from photography_images.json
    fetch('https://raw.githubusercontent.com/kappter/portfolio/main/photography_images.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load photography_images.json: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Photography images data:', data);
            if (!Array.isArray(data)) {
                throw new Error('photography_images.json is not a valid array');
            }
            photographyImages = data.filter(item => item.file && /\.(jpg|jpeg|png|gif)$/i.test(item.file)).map(item => ({
                file: item.file,
                url: `https://raw.githubusercontent.com/kappter/portfolio/main/photography/${item.file}`
            }));
            if (photographyImages.length === 0) {
                photographyCarouselCaption.textContent = 'No images found in photography folder.';
                console.warn('No valid images found in photography_images.json');
                return;
            }
            console.log(`Loaded ${photographyImages.length} photography images`);
            // Initialize photography carousel
            changeImage(photographyCarouselImage, photographyCarouselCaption, photographyImages, photographyCurrentIndex, index => photographyCurrentIndex = index);
            photographyAutoAdvanceInterval = startAutoAdvance(photographyAutoAdvanceInterval, () => {
                changeImage(photographyCarouselImage, photographyCarouselCaption, photographyImages, photographyCurrentIndex + 1, index => photographyCurrentIndex = index);
            });
        })
        .catch(error => {
            console.error('Error loading photography images:', error.message);
            photographyCarouselCaption.textContent = 'Unable to load photography images at this time. Please try again later.';
        });

    // Event listeners for art carousel buttons
    if (artPrevButton && artNextButton) {
        artPrevButton.addEventListener('click', () => {
            artAutoAdvanceInterval = stopAutoAdvance(artAutoAdvanceInterval);
            changeImage(artCarouselImage, artCarouselCaption, artImages, artCurrentIndex - 1, index => artCurrentIndex = index);
            artAutoAdvanceInterval = startAutoAdvance(artAutoAdvanceInterval, () => {
                changeImage(artCarouselImage, artCarouselCaption, artImages, artCurrentIndex + 1, index => artCurrentIndex = index);
            });
        });

        artNextButton.addEventListener('click', () => {
            artAutoAdvanceInterval = stopAutoAdvance(artAutoAdvanceInterval);
            changeImage(artCarouselImage, artCarouselCaption, artImages, artCurrentIndex + 1, index => artCurrentIndex = index);
            artAutoAdvanceInterval = startAutoAdvance(artAutoAdvanceInterval, () => {
                changeImage(artCarouselImage, artCarouselCaption, artImages, artCurrentIndex + 1, index => artCurrentIndex = index);
            });
        });

        // Pause art carousel auto-advance on hover
        artCarouselContainer.addEventListener('mouseenter', () => {
            artAutoAdvanceInterval = stopAutoAdvance(artAutoAdvanceInterval);
        });
        artCarouselContainer.addEventListener('mouseleave', () => {
            artAutoAdvanceInterval = startAutoAdvance(artAutoAdvanceInterval, () => {
                changeImage(artCarouselImage, artCarouselCaption, artImages, artCurrentIndex + 1, index => artCurrentIndex = index);
            });
        });
    } else {
        console.error('Art carousel buttons not found');
    }

    // Event listeners for photography carousel buttons
    if (photographyPrevButton && photographyNextButton) {
        photographyPrevButton.addEventListener('click', () => {
            photographyAutoAdvanceInterval = stopAutoAdvance(photographyAutoAdvanceInterval);
            changeImage(photographyCarouselImage, photographyCarouselCaption, photographyImages, photographyCurrentIndex - 1, index => photographyCurrentIndex = index);
            photographyAutoAdvanceInterval = startAutoAdvance(photographyAutoAdvanceInterval, () => {
                changeImage(photographyCarouselImage, photographyCarouselCaption, photographyImages, photographyCurrentIndex + 1, index => photographyCurrentIndex = index);
            });
        });

        photographyNextButton.addEventListener('click', () => {
            photographyAutoAdvanceInterval = stopAutoAdvance(photographyAutoAdvanceInterval);
            changeImage(photographyCarouselImage, photographyCarouselCaption, photographyImages, photographyCurrentIndex + 1, index => photographyCurrentIndex = index);
            photographyAutoAdvanceInterval = startAutoAdvance(photographyAutoAdvanceInterval, () => {
                changeImage(photographyCarouselImage, photographyCarouselCaption, photographyImages, photographyCurrentIndex + 1, index => photographyCurrentIndex = index);
            });
        });

        // Pause photography carousel auto-advance on hover
        photographyCarouselContainer.addEventListener('mouseenter', () => {
            photographyAutoAdvanceInterval = stopAutoAdvance(photographyAutoAdvanceInterval);
        });
        photographyCarouselContainer.addEventListener('mouseleave', () => {
            photographyAutoAdvanceInterval = startAutoAdvance(photographyAutoAdvanceInterval, () => {
                changeImage(photographyCarouselImage, photographyCarouselCaption, photographyImages, photographyCurrentIndex + 1, index => photographyCurrentIndex = index);
            });
        });
    } else {
        console.error('Photography carousel buttons not found');
    }

    // Keyboard navigation for both carousels
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            artAutoAdvanceInterval = stopAutoAdvance(artAutoAdvanceInterval);
            changeImage(artCarouselImage, artCarouselCaption, artImages, artCurrentIndex - 1, index => artCurrentIndex = index);
            artAutoAdvanceInterval = startAutoAdvance(artAutoAdvanceInterval, () => {
                changeImage(artCarouselImage, artCarouselCaption, artImages, artCurrentIndex + 1, index => artCurrentIndex = index);
            });

            photographyAutoAdvanceInterval = stopAutoAdvance(photographyAutoAdvanceInterval);
            changeImage(photographyCarouselImage, photographyCarouselCaption, photographyImages, photographyCurrentIndex - 1, index => photographyCurrentIndex = index);
            photographyAutoAdvanceInterval = startAutoAdvance(photographyAutoAdvanceInterval, () => {
                changeImage(photographyCarouselImage, photographyCarouselCaption, photographyImages, photographyCurrentIndex + 1, index => photographyCurrentIndex = index);
            });
        } else if (e.key === 'ArrowRight') {
            artAutoAdvanceInterval = stopAutoAdvance(artAutoAdvanceInterval);
            changeImage(artCarouselImage, artCarouselCaption, artImages, artCurrentIndex + 1, index => artCurrentIndex = index);
            artAutoAdvanceInterval = startAutoAdvance(artAutoAdvanceInterval, () => {
                changeImage(artCarouselImage, artCarouselCaption, artImages, artCurrentIndex + 1, index => artCurrentIndex = index);
            });

            photographyAutoAdvanceInterval = stopAutoAdvance(photographyAutoAdvanceInterval);
            changeImage(photographyCarouselImage, photographyCarouselCaption, photographyImages, photographyCurrentIndex + 1, index => photographyCurrentIndex = index);
            photographyAutoAdvanceInterval = startAutoAdvance(photographyAutoAdvanceInterval, () => {
                changeImage(photographyCarouselImage, photographyCarouselCaption, photographyImages, photographyCurrentIndex + 1, index => photographyCurrentIndex = index);
            });
        }
    });
});