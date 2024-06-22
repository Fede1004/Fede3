document.getElementById('login-button').addEventListener('click', () => {
    const password = document.getElementById('password').value;
    if (password === 'YOUR_PASSWORD') {
        document.getElementById('auth').style.display = 'none';
        document.getElementById('upload').style.display = 'block';
    } else {
        alert('Password errata');
    }
});

document.getElementById('upload-button').addEventListener('click', async () => {
    const files = document.getElementById('file-input').files;
    const gallery = document.getElementById('gallery');

    for (let file of files) {
        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Errore nel caricamento delle foto: ${errorData.error}`);
            }

            const result = await response.json();
            console.log(result.message);

            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            img.alt = "Foto dell'appartamento";
            gallery.appendChild(img);

            alert('Foto caricate con successo!');
        } catch (error) {
            console.error(error);
            alert(`Errore durante il caricamento delle foto. Controlla i log per maggiori dettagli. Errore: ${error.message}`);
        }
    }
});
