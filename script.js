document.addEventListener('DOMContentLoaded', async function() {
    const gallery = document.getElementById('gallery');
    const modifyButton = document.getElementById('modify-button');
    const prompt = document.getElementById('prompt');
    const output = document.getElementById('output');

    // Carica le foto dal server
    const response = await fetch('/api/images');
    const images = await response.json();

    images.forEach(src => {
        const img = document.createElement('img');
        img.src = `/images/${src}`;
        img.alt = "Foto dell'appartamento";
        gallery.appendChild(img);
    });

    // Aggiungi funzionalità al bottone di modifica
    modifyButton.addEventListener('click', async () => {
        const userPrompt = prompt.value;
        const selectedImage = document.querySelector('#gallery img'); // Per esempio, seleziona la prima immagine

        if (userPrompt && selectedImage) {
            const modifiedImageSrc = await modifyImage(selectedImage.src, userPrompt);
            const modifiedImg = document.createElement('img');
            modifiedImg.src = modifiedImageSrc;
            modifiedImg.alt = "Foto modificata";
            output.appendChild(modifiedImg);
        }
    });

    // Funzione per chiamare l'API di OpenAI
    async function modifyImage(imageSrc, prompt) {
        const apiKey = process.env.OPENAI_API_KEY;
        const response = await fetch('https://api.openai.com/v1/images:edit', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                image: imageSrc,
                prompt: prompt
            })
        });

        const result = await response.json();
        return result.data.url;
    }
});