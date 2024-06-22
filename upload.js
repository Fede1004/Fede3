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
            const image = await resizeImage(file, 1024, 1024);
            const formData = new FormData();
            formData.append('image', image, file.name);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Errore nel caricamento delle foto: ${response.statusText}`);
            }

            const result = await response.json();
            console.log(result.message);

            const img = document.createElement('img');
            img.src = URL.createObjectURL(image);
            img.alt = "Foto dell'appartamento";
            gallery.appendChild(img);

            alert('Foto caricate con successo!');
        } catch (error) {
            console.error(error);
            alert('Errore durante il caricamento delle foto. Controlla i log per maggiori dettagli.');
        }
    }
});

function resizeImage(file, maxWidth, maxHeight) {
    return new Promise((resolve, reject) => {
        const img = document.createElement('img');
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        img.onload = () => {
            const width = img.width;
            const height = img.height;

            if (width > height) {
                if (width > maxWidth) {
                    img.height *= maxWidth / width;
                    img.width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    img.width *= maxHeight / height;
                    img.height = maxHeight;
                }
            }

            canvas.width = maxWidth;
            canvas.height = maxHeight;
            ctx.fillStyle = "rgba(0, 0, 0, 0)";
            ctx.fillRect(0, 0, maxWidth, maxHeight);
            ctx.drawImage(img, (maxWidth - img.width) / 2, (maxHeight - img.height) / 2, img.width, img.height);

            canvas.toBlob((blob) => {
                resolve(new File([blob], file.name, {
                    type: file.type,
                    lastModified: Date.now()
                }));
            }, file.type);
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
}
