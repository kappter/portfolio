// Navigation toggle for mobile
document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
});

// Theme switching logic
const themeSelector = document.querySelector('#theme-selector');
const stylesheet = document.querySelector('#theme-stylesheet');

themeSelector.addEventListener('change', () => {
    const theme = themeSelector.value;
    let cssFile = 'styles.css'; // Default
    let themeMode = 'light'; // Default

    // Map theme selection to CSS file and mode
    switch (theme) {
        case 'natural-light':
            cssFile = 'styles.css';
            themeMode = 'light';
            break;
        case 'natural-dark':
            cssFile = 'styles.css';
            themeMode = 'dark';
            break;
        case 'architectural-light':
            cssFile = 'architectural.css';
            themeMode = 'light';
            break;
        case 'architectural-dark':
            cssFile = 'architectural.css';
            themeMode = 'dark';
            break;
        case 'space-light':
            cssFile = 'space.css';
            themeMode = 'light';
            break;
        case 'space-dark':
            cssFile = 'space.css';
            themeMode = 'dark';
            break;
        case 'medieval-light':
            cssFile = 'medieval.css';
            themeMode = 'light';
            break;
        case 'medieval-dark':
            cssFile = 'medieval.css';
            themeMode = 'dark';
            break;
    }

    // Update stylesheet
    stylesheet.setAttribute('href', cssFile);
    // Update data-theme attribute
    document.documentElement.setAttribute('data-theme', themeMode);
});

// Load guitar pieces from JSON
fetch('guitar_pieces.json')
    .then(response => response.json())
    .then(data => {
        const guitarList = document.querySelector('#guitar-pieces-list');
        data.forEach(piece => {
            const li = document.createElement('li');
            li.classList.add('guitar-piece');
            li.innerHTML = `
                <span>${piece.title}</span>
                <audio controls>
                    <source src="${piece.path}" type="audio/wav">
                    Your browser does not support the audio element.
                </audio>
            `;
            guitarList.appendChild(li);
        });
    })
    .catch(error => console.error('Error loading guitar pieces:', error));
