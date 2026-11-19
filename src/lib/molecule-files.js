import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

export const MAX_IMAGE_SIZE = 12 * 1024 * 1024;
export const MAX_PDF_SIZE = 25 * 1024 * 1024;
export const MAX_TOTAL_UPLOAD_SIZE = 40 * 1024 * 1024;
export const MAX_FILE_COUNT = 10;

const moleculeFileDirectory = path.join(process.cwd(), "data", "molecule-files");

const allowedTypes = {
  "image/jpeg": { extension: ".jpg", kind: "IMAGEN" },
  "image/png": { extension: ".png", kind: "IMAGEN" },
  "image/webp": { extension: ".webp", kind: "IMAGEN" },
  "application/pdf": { extension: ".pdf", kind: "PDF" },
};

export class UploadValidationError extends Error {}

export function getMoleculeFileDirectory() {
  return moleculeFileDirectory;
}

export function getMoleculeFilePath(storedName) {
  return path.join(moleculeFileDirectory, path.basename(storedName));
}

export function inspectUpload(file) {
  const type = allowedTypes[file.type];
  if (!type) {
    return { error: "Solo se permiten imágenes JPG, PNG o WEBP y documentos PDF." };
  }

  const extension = path.extname(file.name).toLowerCase();
  const compatibleExtension =
    extension === type.extension ||
    (type.kind === "IMAGEN" && extension === ".jpeg");
  if (!compatibleExtension) {
    return { error: `La extensión del archivo no corresponde a ${file.type}.` };
  }

  const maxSize = type.kind === "PDF" ? MAX_PDF_SIZE : MAX_IMAGE_SIZE;
  if (file.size === 0 || file.size > maxSize) {
    return {
      error: type.kind === "PDF"
        ? "Cada PDF debe pesar menos de 25 MB."
        : "Cada imagen debe pesar menos de 12 MB.",
    };
  }

  return { kind: type.kind, mimeType: file.type };
}

export function matchesFileSignature(buffer, mimeType) {
  if (mimeType === "image/jpeg") {
    return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }
  if (mimeType === "image/png") {
    return buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  }
  if (mimeType === "image/webp") {
    return buffer.length >= 12 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP";
  }
  if (mimeType === "application/pdf") {
    return buffer.length >= 5 && buffer.toString("ascii", 0, 5) === "%PDF-";
  }
  return false;
}

export async function persistMoleculeFiles(files, moleculeId) {
  const directory = getMoleculeFileDirectory();
  await mkdir(directory, { recursive: true });

  const saved = [];
  try {
    for (const file of files) {
      const details = inspectUpload(file);
      if (details.error) throw new UploadValidationError(details.error);
      const contents = Buffer.from(await file.arrayBuffer());
      if (!matchesFileSignature(contents, details.mimeType)) {
        throw new UploadValidationError(`El contenido de "${file.name}" no coincide con su tipo de archivo.`);
      }

      const originalExtension = path.extname(file.name).toLowerCase();
      const extension = originalExtension === ".jpeg" ? ".jpg" : originalExtension;
      const storedName = `${randomUUID()}${extension}`;
      await writeFile(getMoleculeFilePath(storedName), contents, { flag: "wx" });
      saved.push({
        nombre: file.name,
        nombreAlmacenado: storedName,
        tipo: details.kind,
        mimeType: details.mimeType,
        tamano: contents.length,
        moleculaId: moleculeId,
      });
    }
    return saved;
  } catch (error) {
    await Promise.all(
      saved.map(async (file) => {
        try {
          await unlink(getMoleculeFilePath(file.nombreAlmacenado));
        } catch (cleanupError) {
          console.error(`No se pudo limpiar el archivo ${file.nombreAlmacenado}:`, cleanupError);
        }
      }),
    );
    throw error;
  }
}

export async function removeStoredMoleculeFile(storedName) {
  await unlink(getMoleculeFilePath(storedName));
}
