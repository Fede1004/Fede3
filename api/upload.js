const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const upload = multer({ dest: 'uploads/' });

app.post('/api/upload', upload.single('image'), (req, res) => {
    const file = req.file;
    const tempPath = file.path;
    const targetPath = path.join(__dirname, '../images', file.originalname);

    fs.rename(tempPath, targetPath, err => {
        if (err) {
            console.error(`Errore durante il caricamento delle foto: ${err}`);
            return res.status(500).json({ message: 'Errore durante il caricamento delle foto' });
        }
        console.log(`Foto caricata con successo: ${file.originalname}`);
        res.status(200).json({ message: 'Foto caricate con successo!' });
    });
});

app.get('/api/images', (req, res) => {
    fs.readdir(path.join(__dirname, '../images'), (err, files) => {
        if (err) {
            console.error(`Errore durante il recupero delle immagini: ${err}`);
            return res.status(500).json({ message: 'Errore durante il recupero delle immagini' });
        }
        console.log(`Immagini recuperate con successo: ${files}`);
        res.status(200).json(files);
    });
});

module.exports = app;
