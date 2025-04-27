const fs = require('fs');
const path = require('path');

const audioDir = path.join(__dirname, 'audio', 'guitar_pieces');
const outputFile = path.join(__dirname, 'guitar_pieces.json');

// Supported audio file extensions
const audioExtensions = ['.mp3', '.wav'];

fs.readdir(audioDir, (err, files) => {
    if (err) {
        console.error('Error reading audio directory:', err);
        return;
    }

    // Filter for audio files and map to JSON format
    const audioFiles = files
        .filter(file => audioExtensions.includes(path.extname(file).toLowerCase()))
        .map(file => ({
            title: path.basename(file, path.extname(file)),
            file: file
        }));

    // Write to guitar_pieces.json
    fs.writeFile(outputFile, JSON.stringify(audioFiles, null, 2), err => {
        if (err) {
            console.error('Error writing guitar_pieces.json:', err);
            return;
        }
        console.log('guitar_pieces.json has been updated with', audioFiles.length, 'audio files.');
    });
});
