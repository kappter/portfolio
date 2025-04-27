const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = express();

// Serve static files
app.use(express.static('.'));

// Handle file uploads
const upload = multer({ dest: 'blog/' });
app.use(express.json());

// Endpoint to handle blog post submission
app.post('/add-blog', upload.single('image'), (req, res) => {
    const { title, text } = req.body;
    const imagePath = req.file ? `blog/${req.file.filename}` : '';
    const csvRow = `"${title.replace(/"/g, '""')}","${text.replace(/"/g, '""')}","${imagePath.replace(/"/g, '""')}","https://example.com/blog/${title.toLowerCase().replace(/\s+/g, '-')}"\n`;

    // Append to blogs.csv
    fs.appendFile('blogs.csv', csvRow, err => {
        if (err) {
            console.error('Error writing to CSV:', err);
            return res.status(500).send('Error saving blog post');
        }
        res.status(200).send('Blog post saved');
    });
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
