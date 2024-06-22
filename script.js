document.addEventListener('DOMContentLoaded', async function() {
    const gallery = document.getElementById('gallery');
    const modifyButton = document.getElementById('modify-button');
    const prompt = document.getElementById('prompt');
    const output = document.getElementById('output');

    try {
        // Carica le foto dal server
        const response = await fetch('/api/images');
        if (!response.ok) {
            throw new Error(`Errore nel caricamento delle immagini: ${response.statusText}`);
        }
        const images = await response.json();

        images.forEach(src => {
            const img = document.createElement('img');
            img.src = `/images/${src}`;
            img.alt = "Foto dell'appartamento";
            gallery.appendChild(img);
        });
    } catch (error) {
        console.error(error);
        alert('Errore nel caricamento delle immagini. Controlla i log per maggiori dettagli.');
    }

    modifyButton.addEventListener('click', async () => {
        const userPrompt = prompt.value;
        const selectedImage = document.querySelector('#gallery img'); // Per esempio, seleziona la prima immagine

        if (userPrompt && selectedImage) {
            try {
                const modifiedImageSrc = await modifyImage(selectedImage.src, userPrompt);
                const modifiedImg = document.createElement('img');
                modifiedImg.src = modifiedImageSrc;
                modifiedImg.alt = "Foto modificata";
                output.appendChild(modifiedImg);
            } catch (error) {
                console.error(error);
                alert('Errore nella modifica della foto. Controlla i log per maggiori dettagli.');
            }
        }
    });

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

        if (!response.ok) {
            throw new Error(`Errore nella chiamata all'API di OpenAI: ${response.statusText}`);
        }

        const result = await response.json();
        return result.data.url;
    }
});
