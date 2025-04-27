window.addBlogPost = function () {
    const title = document.getElementById('blog-title').value.trim();
    const text = document.getElementById('blog-text').value.trim();
    const imageInput = document.getElementById('blog-image');
    const imageFile = imageInput.files[0];

    if (!title || !text) {
        alert('Please fill in the title and content.');
        return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('text', text);
    if (imageFile) {
        formData.append('image', imageFile);
    }

    fetch('/add-blog', {
        method: 'POST',
        body: formData
    })
    .then(response => response.text())
    .then(result => {
        console.log(result);
        // Add to blogPosts array and update display
        const newPost = {
            title: title,
            text: text,
            image: imageFile ? `blog/${imageFile.name}` : '',
            link: `https://example.com/blog/${title.toLowerCase().replace(/\s+/g, '-')}`
        };
        blogPosts.push(newPost);
        displayBlogPosts();

        // Clear the form
        document.getElementById('blog-title').value = '';
        document.getElementById('blog-text').value = '';
        document.getElementById('blog-image').value = '';
    })
    .catch(error => console.error('Error submitting blog post:', error));
};
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

    // Load guitar pieces
    fetch('guitar_pieces.json')
        .then(response => response.json())
        .then(data => {
            const guitarList = document.getElementById('guitar-pieces-list');
            data.forEach(piece => {
                const li = document.createElement('li');
                li.className = 'guitar-piece';
                li.innerHTML = `
                    <span>${piece.title}</span>
                    <audio controls>
                        <source src="audio/guitar_pieces/${piece.file}" type="audio/mpeg">
                        Your browser does not support the audio element.
                    </audio>
                `;
                guitarList.appendChild(li);
            });
        })
        .catch(error => console.error('Error loading guitar pieces:', error));

    // Blog posts array (simulating a CSV file client-side)
    const blogPosts = [
        {
            title: "Teaching Technology in the Classroom",
            text: "Reflections on integrating coding and robotics into high school education.",
            image: "", // No image for initial posts
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
            // In a real setup, this would upload to blog/ folder
            const fileName = imageFile.name;
            imagePath = `blog/${fileName}`; // Simulated path
            // For now, we'll use a data URL to display the image client-side
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
