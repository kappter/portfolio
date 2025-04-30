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

    // Canvas animation for drawing a horizontal line
    const canvas = document.getElementById('line-animation');
    const ctx = canvas.getContext('2d');
    let width = Math.min(window.innerWidth, 960); // Match container max-width
    const height = 30; // Canvas height
    canvas.width = width;
    canvas.height = height;

    // Adjust canvas size on window resize
    window.addEventListener('resize', () => {
        width = Math.min(window.innerWidth, 960);
        canvas.width = width;
        canvas.height = height;
        x = 0; // Reset animation
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    let x = 0;
    const speed = 3; // Pixels per frame
    const baseY = height / 2;
    let lastY = baseY;

    function drawLine() {
        ctx.beginPath();
        ctx.moveTo(x, lastY);

        // Increment x position
        x += speed;
        if (x > width) {
            x = width; // Stop at canvas width
        }

        // Add randomness to y position for hand-drawn effect
        const y = baseY + (Math.random() - 0.5) * 4; // ±2px randomness
        ctx.lineTo(x, y);

        // Randomize line width for felt pen effect
        ctx.lineWidth = 2 + (Math.random() - 0.5) * 0.5; // 1.75–2.25px
        ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim();
        ctx.lineCap = 'round';
        ctx.stroke();

        lastY = y; // Update last y position for smooth continuity

        if (x < width) {
            requestAnimationFrame(drawLine);
        }
    }

    // Start animation
    drawLine();

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

    // Blog posts array (simulating a CSV file client-side)
    const blogPosts = [
        {
            title: "Teaching Technology in the Classroom",
            text: "Reflections on integrating coding and robotics into high school education.",
            image: "",
            link: "https://example.com/blog/teaching-technology"
        },
        {
            title: "The Art of Learning Through Music",
            text: "Exploring how music can enhance learning and creativity in students.",
            image: "",
            link: "https://example.com/blog/music-learning"
        }
    ];

    // Function to display blog posts
    function displayBlogPosts() {
        const blogContainer = document.getElementById('blog-container');
        blogContainer.innerHTML = ''; // Clear existing posts
        blogPosts.forEach(post => {
            const blogCard = document.createElement('div');
            blogCard.className = 'blog-card';
            blogCard.innerHTML = `
                ${post.image ? `<img src="${post.image}" alt="${post.title}" class="blog-image">` : ''}
                <h3>${post.title}</h3>
                <p>${post.text}</p>
                <a href="${post.link}" target="_blank" class="button">Read More</a>
            `;
            blogContainer.appendChild(blogCard);
        });
    }

    // Initial display of blog posts
    displayBlogPosts();

    // Toggle blog form visibility
    const toggleButton = document.getElementById('toggle-blog-form');
    const blogFormContent = document.getElementById('blog-form-content');
    const toggleIcon = toggleButton.querySelector('.toggle-icon');

    toggleButton.addEventListener('click', () => {
        blogFormContent.classList.toggle('active');
        toggleIcon.classList.toggle('active');
    });

    // Expose addBlogPost to global scope for onclick
    window.addBlogPost = function () {
        const title = document.getElementById('blog-title').value.trim();
        const text = document.getElementById('blog-text').value.trim();
        const imageInput = document.getElementById('blog-image');
        const imageFile = imageInput.files[0];

        if (!title || !text) {
            alert('Please fill in the title and content.');
            return;
        }

        // Simulate image upload (GitHub Pages doesn't allow file writing)
        let imagePath = '';
        if (imageFile) {
            const fileName = imageFile.name;
            imagePath = `blog/${fileName}`; // Simulated path
            const reader = new FileReader();
            reader.onload = function (e) {
                imagePath = e.target.result; // Use data URL for display
                addPostToListAndCSV(title, text, imagePath);
            };
            reader.readAsDataURL(imageFile);
        } else {
            addPostToListAndCSV(title, text, imagePath);
        }
    };

    // Function to add post to list and CSV
    function addPostToListAndCSV(title, text, imagePath) {
        // Add to blogPosts array
        const newPost = {
            title: title,
            text: text,
            image: imagePath,
            link: "https://example.com/blog/" + title.toLowerCase().replace(/\s+/g, '-') // Generate a placeholder link
        };
        blogPosts.push(newPost);

        // Update display
        displayBlogPosts();

        // Generate CSV entry
        const csvRow = `"${title.replace(/"/g, '""')}","${text.replace(/"/g, '""')}","${imagePath.replace(/"/g, '""')}","${newPost.link}"\n`;
        appendToCSV(csvRow);

        // Clear the form
        document.getElementById('blog-title').value = '';
        document.getElementById('blog-text').value = '';
        document.getElementById('blog-image').value = '';

        // Optionally collapse the form after submission
        blogFormContent.classList.remove('active');
        toggleIcon.classList.remove('active');
    }

    // Function to append to CSV (simulated for client-side)
    let csvContent = 'title,text,image,link\n'; // CSV header
    blogPosts.forEach(post => {
        csvContent += `"${post.title.replace(/"/g, '""')}","${post.text.replace(/"/g, '""')}","${post.image.replace(/"/g, '""')}","${post.link}"\n`;
    });

    function appendToCSV(row) {
        csvContent += row;
        // Create a downloadable CSV file
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'blogs.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    }
});