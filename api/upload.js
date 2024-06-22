const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');
const FormData = require('form-data');
const sharp = require('sharp');
const app = express();
const upload = multer({ dest: 'uploads/' });

app.post('/api/upload', upload.single('image'), async (req, res) => {
    const file = req.file;
    const tempPath = file.path;
    const targetPath = path.join(__dirname, '../images', file.originalname);

    try {
        // Converti l'immagine in PNG, ridimensiona e imposta a 1024x1024 se necessario
        await sharp(tempPath)
            .resize(1024, 1024, {
                fit: sharp.fit.inside,
                withoutEnlargement: true
            })
            .toFormat('png')
            .toFile(targetPath);

        fs.unlinkSync(tempPath); // Rimuovi il file temporaneo

        console.log(`Foto caricata e convertita con successo: ${file.originalname}`);
        res.status(200).json({ message: 'Foto caricate con successo!' });
    } catch (err) {
        console.error(`Errore durante la conversione delle foto: ${err.message}`);
        res.status(500).json({ message: 'Errore durante la conversione delle foto', error: err.message });
    }
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

app.post('/api/variations', async (req, res) => {
    const apiKey = process.env.OPENAI_API_KEY;
    const { imagePath, prompt } = req.body;

    if (!imagePath || !prompt) {
        return res.status(400).json({ message: 'Immagine o prompt mancante.' });
    }

    try {
        const formData = new FormData();
        formData.append('image', fs.createReadStream(path.join(__dirname, '../images', imagePath)));
        formData.append('prompt', prompt);
        formData.append('n', '1');
        formData.append('size', '1024x1024');

        const response = await fetch('https://api.openai.com/v1/images/variations', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`
            },
            body: formData
        });

        const responseText = await response.text();
        console.log(`Risposta API: ${responseText}`);

        // Prova a fare il parsing della risposta come JSON
        try {
            const result = JSON.parse(responseText);

            if (!response.ok) {
                throw new Error(result.error.message);
            }

            res.status(200).json(result);
        } catch (parseError) {
            console.error(`Errore durante il parsing della risposta: ${parseError.message}`);
            res.status(500).json({ message: 'Errore durante il parsing della risposta', error: parseError.message, response: responseText });
        }
    } catch (error) {
        console.error(`Errore durante la creazione delle variazioni: ${error.message}`);
        res.status(500).json({ message: 'Errore durante la creazione delle variazioni', error: error.message });
    }
});

module.exports = app;
