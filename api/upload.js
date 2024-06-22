const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');
const app = express();
const upload = multer({ dest: 'uploads/' });

app.post('/api/upload', upload.single('image'), (req, res) => {
    const file = req.file;
    const tempPath = file.path;
    const targetPath = path.join(__dirname, '../images', file.originalname);

    fs.rename(tempPath, targetPath, err => {
        if (err) {
            console.error(`Errore durante il caricamento delle foto: ${err.message}`);
            return res.status(500).json({ message: 'Errore durante il caricamento delle foto', error: err.message });
        }
        console.log(`Foto caricata con successo: ${file.originalname}`);
        res.status(200).json({ message: 'Foto caricate con successo!' });
    });
});

app.get('/api/images', (req, res) => {
    fs.readdir(path.join(__dirname, '../images'), (err, files) => {
        if (err) {
            console.error(`Errore durante il recupero delle immagini: ${err.message}`);
            return res.status(500).json({ message: 'Errore durante il recupero delle immagini', error: err.message });
        }
        console.log(`Immagini recuperate con successo: ${files}`);
        res.status(200).json(files);
    });
});

app.post('/api/variations', upload.single('image'), async (req, res) => {
    const apiKey = process.env.OPENAI_API_KEY;
    const file = req.file;

    if (!file) {
        return res.status(400).json({ message: 'Nessun file immagine caricato.' });
    }

    try {
        const response = await fetch('https://api.openai.com/v1/images/variations', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`
            },
            body: new URLSearchParams({
                'image': fs.createReadStream(file.path),
                'n': req.body.n || '1',
                'size': req.body.size || '1024x1024'
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error.message);
        }

        res.status(200).json(result);
    } catch (error) {
        console.error(`Errore durante la creazione delle variazioni: ${error.message}`);
        res.status(500).json({ message: 'Errore durante la creazione delle variazioni', error: error.message });
    }
});

module.exports = app;
