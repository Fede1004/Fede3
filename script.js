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
            img.addEventListener('click', () => selectImage(src));
            gallery.appendChild(img);
        });
    } catch (error) {
        console.error('Errore durante il caricamento delle immagini:', error);
        alert('Errore nel caricamento delle immagini. Controlla i log per maggiori dettagli.');
    }

    modifyButton.addEventListener('click', async () => {
        const userPrompt = prompt.value;
        const selectedImage = document.querySelector('#gallery img.selected'); // Seleziona l'immagine con la classe "selected"

        if (userPrompt && selectedImage) {
            try {
                const adaptedImage = await adaptImage(selectedImage.src);
                const modifiedImageSrc = await createImageVariation(adaptedImage, userPrompt);
                const modifiedImg = document.createElement('img');
                modifiedImg.src = modifiedImageSrc;
                modifiedImg.alt = "Foto modificata";
                output.appendChild(modifiedImg);
            } catch (error) {
                console.error('Errore durante la modifica della foto:', error);
                alert('Errore nella modifica della foto. Controlla i log per maggiori dettagli.');
            }
        } else {
            alert('Seleziona un\'immagine e inserisci un prompt.');
        }
    });

    async function selectImage(src) {
        const images = document.querySelectorAll('#gallery img');
        images.forEach(img => img.classList.remove('selected'));
        const selectedImg = document.querySelector(`#gallery img[src='${src}']`);
        selectedImg.classList.add('selected');
    }

    async function adaptImage(imageSrc) {
        const imageName = imageSrc.split('/').pop();
        const response = await fetch('/api/adapt', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ imageName })
        });

        if (!response.ok) {
            throw new Error(`Errore nell'adattamento dell'immagine: ${response.statusText}`);
        }

        const result = await response.json();
        return result.adaptedImage;
    }

    async function createImageVariation(imageSrc, prompt) {
        const apiKey = process.env.OPENAI_API_KEY;
        const formData = new FormData();
        formData.append('image', imageSrc);
        formData.append('prompt', prompt);
        formData.append('n', '1');
        formData.append('size', '1024x1024');

        const response = await fetch('/api/variations', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`
            },
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Errore nella creazione della variazione: ${errorData.error}`);
        }

        const result = await response.json();
        return result.data[0].url;
    }
});
