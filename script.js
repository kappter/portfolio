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
    constdd blogPosts = [
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

    // Function to load GitHub repositories
    function loadGitHubRepos() {
        const skillsContainer = document.getElementById('skills-container');
        skillsContainer.innerHTML = ''; // Clear existing skills

        // Check localStorage for cached data
        const cachedRepos = localStorage.getItem('githubRepos');
        const cacheTimestamp = localStorage.getItem('githubReposTimestamp');
        const cacheDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

        if (cachedRepos && cacheTimestamp && (Date.now() - cacheTimestamp < cacheDuration)) {
            // Use cached data
            const repos = JSON.parse(cachedRepos);
            displayRepos(repos);
            return;
        }

        // Fetch repositories from GitHub API
        fetch('https://api.github.com/users/kappter/repos')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load GitHub repositories');
                }
                return response.json();
            })
            .then(data => {
                if (!Array.isArray(data)) {
                    throw new Error('GitHub API response is not a valid array');
                }
                // Cache the data
                localStorage.setItem('githubRepos', JSON.stringify(data));
                localStorage.setItem('githubReposTimestamp', Date.now());
                displayRepos(data);
            })
            .catch(error => {
                console.error('Error loading GitHub repositories:', error);
                skillsContainer.innerHTML = '<p>Unable to load repositories at this time.</p>';
            });
    }

    // Function to display repositories
    function displayRepos(repos) {
        const skillsContainer = document.getElementById('skills-container');
        skillsContainer.className = 'skills-container project-gallery'; // Reuse project-gallery styling

        repos.forEach(repo => {
            // Skip repositories without a description or language
            if (!repo.description || !repo.language) return;

            const repoCard = document.createElement('div');
            repoCard.className = 'project-card';
            repoCard.innerHTML = `
                <h3>${repo.name}</h3>
                <p>${repo.description || 'No description available.'}</p>
                <p><strong>Language:</strong> ${repo.language}</p>
                <a href="${repo.html_url}" target="_blank" class="project-link">View on GitHub</a>
            `;
            skillsContainer.appendChild(repoCard);
        });
    }

    // Initial load of GitHub repositories
    loadGitHubRepos();
});
