const express = require('express');
const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());

app.post('/api/variations', async (req, res) => {
    const { imagePath, prompt } = req.body;
    const apiKey = process.env.OPENAI_API_KEY;
    const formData = new FormData();
    
    formData.append('image', fs.createReadStream(path.join(__dirname, '../images/adapted', imagePath)));
    formData.append('prompt', prompt);
    formData.append('n', '1');
    formData.append('size', '1024x1024');

    try {
        const response = await fetch('https://api.openai.com/v1/images/variations', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`
            },
            body: formData
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
