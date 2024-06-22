const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const app = express();
const upload = multer({ dest: 'uploads/' });

// Middleware per gestire le richieste JSON
app.use(express.json());

// Rotta per caricare le immagini
app.post('/api/upload', upload.single('image'), async (req, res) => {
    const file = req.file;
    const tempPath = file.path;
    const targetPath = path.join(__dirname, '../images', `${file.filename}.png`);

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

        console.log(`Foto caricata e convertita con successo: ${file.filename}.png`);
        res.status(200).json({ message: 'Foto caricate con successo!' });
    } catch (err) {
        console.error(`Errore durante la conversione delle foto: ${err.message}`);
        res.status(500).json({ message: 'Errore durante la conversione delle foto', error: err.message });
    }
});

// Rotta per ottenere le immagini
app.get('/api/images', (req, res) => {
    const imagesDir = path.join(__dirname, '../images');
    fs.readdir(imagesDir, (err, files) => {
        if (err) {
            console.error(`Errore durante il recupero delle immagini dalla directory ${imagesDir}: ${err.message}`);
            return res.status(500).json({ message: 'Errore durante il recupero delle immagini', error: err.message });
        }
        console.log(`Immagini recuperate con successo: ${files}`);
        res.status(200).json(files);
    });
});

module.exports = app;
