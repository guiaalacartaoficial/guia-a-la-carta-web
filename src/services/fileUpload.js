/**
 * Helper para compresión de imágenes y subida robusta a Supabase Storage
 */

/**
 * Comprime una imagen en el cliente usando HTML5 Canvas
 * Reduce drásticamente el peso de fotos tomadas con teléfonos móviles (de ~8-15MB a <500KB)
 */
export async function compressImageFile(file, maxWidth = 1400, maxHeight = 1400, quality = 0.85) {
  if (!file) return null;

  // Si no es un archivo de imagen reconocido, devolver el original intacto
  const isImage = file.type?.startsWith('image/') || /\.(jpg|jpeg|png|webp|heic|heif)$/i.test(file.name);
  if (!isImage) {
    return file;
  }

  return new Promise((resolve) => {
    try {
      const reader = new FileReader();
      reader.onerror = () => resolve(file); // Si falla la lectura, devolver archivo original
      reader.onload = (event) => {
        const img = new Image();
        img.onerror = () => resolve(file); // Si el navegador no puede renderizar la imagen, devolver original
        img.onload = () => {
          try {
            let width = img.width;
            let height = img.height;

            // Redimensionar manteniendo proporción si excede los límites
            if (width > maxWidth || height > maxHeight) {
              if (width > height) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
              } else {
                width = Math.round((width * maxHeight) / height);
                height = maxHeight;
              }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  resolve(file);
                  return;
                }
                // Conservar nombre base sanitizado y forzar extensión jpg/jpeg
                const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || 'foto';
                const compressedFile = new File([blob], `${baseName}.jpg`, {
                  type: 'image/jpeg',
                  lastModified: Date.now()
                });
                resolve(compressedFile);
              },
              'image/jpeg',
              quality
            );
          } catch (canvasErr) {
            console.warn('Fallo en compresión de canvas, usando original:', canvasErr);
            resolve(file);
          }
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.warn('Error al intentar comprimir imagen:', err);
      resolve(file);
    }
  });
}

/**
 * Valida el tamaño máximo de un archivo (por defecto 15MB)
 */
export function validateFileSize(file, maxMb = 15, label = 'El archivo') {
  if (!file) return;
  const maxBytes = maxMb * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error(`${label} ("${file.name}") pesa ${(file.size / (1024 * 1024)).toFixed(1)}MB y supera el límite de ${maxMb}MB. Por favor sube un archivo más liviano.`);
  }
}

/**
 * Sube un archivo o lista de archivos a Supabase Storage con compresión automática y sanitización
 */
export async function uploadToStorage(supabase, fileOrFiles, bucket, path, label = 'archivo', onProgress = null) {
  if (!fileOrFiles) return null;

  const uploadSingle = async (rawFile) => {
    if (!rawFile) return null;

    // 1. Si es imagen, comprimir antes de subir
    let fileToUpload = rawFile;
    if (rawFile.type?.startsWith('image/') || /\.(jpg|jpeg|png|webp|heic|heif)$/i.test(rawFile.name)) {
      if (onProgress) onProgress(`Optimizando imagen (${rawFile.name})...`);
      fileToUpload = await compressImageFile(rawFile);
    }

    // 2. Validar tamaño post-optimización
    validateFileSize(fileToUpload, 15, label);

    // 3. Sanitizar extensión y nombre único
    const originalExt = (fileToUpload.name.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanExt = originalExt || 'bin';
    const uniqueName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${cleanExt}`;
    const fullPath = `${path}/${uniqueName}`;

    if (onProgress) onProgress(`Subiendo ${label}...`);

    const contentType = fileToUpload.type || 'application/octet-stream';
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fullPath, fileToUpload, {
        contentType,
        upsert: false
      });

    if (uploadError) {
      console.error(`Error Supabase Storage [${fullPath}]:`, uploadError);
      throw new Error(`Error al subir ${label}: ${uploadError.message || 'Problema de conexión con el servidor de archivos'}`);
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(fullPath);
    return data.publicUrl;
  };

  if (Array.isArray(fileOrFiles)) {
    if (fileOrFiles.length === 0) return null;
    const urls = [];
    for (let i = 0; i < fileOrFiles.length; i++) {
      const f = fileOrFiles[i];
      if (onProgress) onProgress(`Subiendo ${label} (${i + 1}/${fileOrFiles.length})...`);
      const url = await uploadSingle(f);
      if (url) urls.push(url);
    }
    return urls.join(', ');
  }

  return await uploadSingle(fileOrFiles);
}
