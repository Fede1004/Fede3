const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.json());

// Middleware per controllare se le cartelle esistono e, in caso contrario, crearle
const checkDirectories = (req, res, next) => {
    const dirs = [path.join(__dirname, '../images'), path.join(__dirname, '../images/adapted')];
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`Cartella creata: ${dir}`);
        }
    });
    next();
};

app.use(checkDirectories);

// Rotta per caricare le immagini
app.post('/api/upload', upload.single('image'), (req, res) => {
    const file = req.file;
    const targetPath = path.join(__dirname, '../images', file.originalname);

    fs.rename(file.path, targetPath, err => {
        if (err) {
            console.error(`Errore durante il caricamento delle foto: ${err.message}`);
            return res.status(500).json({ message: 'Errore durante il caricamento delle foto', error: err.message });
        }
        console.log(`Foto caricata con successo: ${file.originalname}`);
        res.status(200).json({ message: 'Foto caricate con successo!' });
    });
});

// Rotta per ottenere le immagini caricate
app.get('/api/images', (req, res) => {
    const imagesDir = path.join(__dirname, '../images');
    fs.readdir(imagesDir, (err, files) => {
        if (err) {
            console.error(`Errore durante il recupero delle immagini dalla directory ${imagesDir}: ${err.message}`);
            return res.status(500).json({ message: 'Errore durante il recupero delle immagini', error: err.message });
        }
        res.status(200).json(files);
    });
});

// Rotta per adattare l'immagine per OpenAI
app.post('/api/adapt', async (req, res) => {
    const { imageName } = req.body;
    const imagePath = path.join(__dirname, '../images', imageName);
    const adaptedImagePath = path.join(__dirname, '../images/adapted', imageName);

    try {
        await sharp(imagePath)
            .resize(1024, 1024, {
                fit: sharp.fit.inside,
                withoutEnlargement: true
            })
            .toFormat('png')
            .ensureAlpha()
            .toFile(adaptedImagePath);

        console.log(`Immagine adattata con successo: ${imageName}`);
        res.status(200).json({ message: 'Immagine adattata con successo!', adaptedImage: `/images/adapted/${imageName}` });
    } catch (err) {
        console.error(`Errore durante l'adattamento dell'immagine: ${err.message}`);
        res.status(500).json({ message: 'Errore durante l'adattamento dell'immagine', error: err.message });
    }
});

module.exports = app;
