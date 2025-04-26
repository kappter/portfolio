document.addEventListener('DOMContentLoaded', function() {
    // Navigation toggle for mobile
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });

    // Smooth scrolling for anchor links
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
                if (window.innerWidth <= 768) {
                    navMenu.classList.remove('active');
                }
            }
        });
    });

    // Animate progress bars on scroll
    const progressBars = document.querySelectorAll('.progress');
    const skillsSection = document.querySelector('#skills');

    function animateProgressBars() {
        const sectionPos = skillsSection.getBoundingClientRect().top;
        const screenPos = window.innerHeight;

        if (sectionPos < screenPos) {
            progressBars.forEach(bar => {
                const width = bar.style.width;
                bar.style.width = '0%';
                setTimeout(() => {
                    bar.style.width = width;
                }, 100);
            });
            window.removeEventListener('scroll', animateProgressBars);
        }
    }

    if (skillsSection) {
        window.addEventListener('scroll', animateProgressBars);
    }

    // Fetch and populate guitar pieces
    const guitarList = document.getElementById('guitar-pieces-list');
    if (guitarList) {
        fetch('guitar_pieces.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load guitar pieces');
                }
                return response.json();
            })
            .then(data => {
                data.forEach(piece => {
                    const li = document.createElement('li');
                    li.className = 'guitar-piece';
                    li.innerHTML = `
                        <span>${piece.title}</span>
                        <audio controls>
                            <source src="${piece.path}" type="${piece.path.endsWith('.mp3') ? 'audio/mpeg' : 'audio/wav'}">
                            Your browser does not support the audio element.
                        </audio>
                    `;
                    guitarList.appendChild(li);
                });
            })
            .catch(error => {
                console.error('Error loading guitar pieces:', error);
                guitarList.innerHTML = '<li>Unable to load guitar pieces.</li>';
            });
    }

    // Theme and style selector
    const themeSelector = document.getElementById('theme-selector');
    const html = document.documentElement;
    const stylesheet = document.getElementById('theme-stylesheet');

    // Map theme values to CSS files and data-theme attributes
    const themeConfig = {
        'natural-light': { css: 'styles.css', dataTheme: 'light' },
        'natural-dark': { css: 'styles.css', dataTheme: 'dark' },
        'architectural-light': { css: 'architectural.css', dataTheme: 'light' },
        'architectural-dark': { css: 'architectural.css', dataTheme: 'dark' },
        'space-light': { css: 'space.css', dataTheme: 'light' },
        'space-dark': { css: 'space.css', dataTheme: 'dark' },
        'medieval-light': { css: 'medieval.css', dataTheme: 'light' },
        'medieval-dark': { css: 'medieval.css', dataTheme: 'dark' }
    };

    // Apply saved theme on load
    const savedTheme = localStorage.getItem('theme') || 'natural-light';
    if (themeSelector) {
        themeSelector.value = savedTheme;
        const config = themeConfig[savedTheme] || themeConfig['natural-light'];
        stylesheet.href = config.css;
        html.setAttribute('data-theme', config.dataTheme);
    }

    // Handle theme selection
    if (themeSelector) {
        themeSelector.addEventListener('change', () => {
            const selectedTheme = themeSelector.value;
            const config = themeConfig[selectedTheme] || themeConfig['natural-light'];
            stylesheet.href = config.css;
            html.setAttribute('data-theme', config.dataTheme);
            localStorage.setItem('theme', selectedTheme);
        });
    }
});
