document.addEventListener('DOMContentLoaded', function() {
    // Navigation toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    // Add Awards to navigation
    const awardsNav = document.createElement('li');
    awardsNav.innerHTML = '<a href="#awards">Awards</a>';
    navMenu.insertBefore(awardsNav, navMenu.children[5]); // Insert before Projects

    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });

    // Smooth scrolling (updated to include new Awards link)
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            target.scrollIntoView({ behavior: 'smooth' });
            if (window.innerWidth <= 768) {
                navMenu.classList.remove('active');
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
    fetch('guitar_pieces.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load guitar pieces');
            }
            return response.json();
        })
        .then(data => {
            const list = document.getElementById('guitar-pieces-list');
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
                list.appendChild(li);
            });
        })
        .catch(error => {
            console.error('Error loading guitar pieces:', error);
            const list = document.getElementById('guitar-pieces-list');
            list.innerHTML = '<li>Unable to load guitar pieces.</li>';
        });

    window.addEventListener('scroll', animateProgressBars);
});
