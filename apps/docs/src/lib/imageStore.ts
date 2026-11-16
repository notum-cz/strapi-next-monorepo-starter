/**
 * Screenshots attached to a GherkinChecklist note live here, in IndexedDB
 * — not in the same localStorage entry as the checklist's pass/fail state
 * and text (see gherkin.ts's ChecklistState). localStorage is capped at a
 * few MB shared across the whole docs site; a couple of full-resolution
 * screenshots would blow through that and silently break saving for
 * every other checklist too. ChecklistState only ever keeps the id
 * saveImage() returns — this module is the only place that resolves an
 * id back to actual image bytes.
 */

const DB_NAME = "gherkin-checklist-images"
const DB_VERSION = 1
const STORE_NAME = "images"

// Screenshots are for a human skimming a note, not pixel-perfect
// evidence — capping dimensions and re-encoding as JPEG keeps a handful
// of them from eating IndexedDB's quota or bloating an exported report.
const MAX_DIMENSION = 1600
const JPEG_QUALITY = 0.82

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME)
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function resizeAndCompress(file: Blob): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const img = new Image()

    img.onload = () => {
      const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height))
      const width = Math.round(img.width * scale)
      const height = Math.round(img.height * scale)

      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        URL.revokeObjectURL(objectUrl)
        reject(new Error("2d canvas context unavailable"))
        return
      }

      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(objectUrl)
          if (blob) resolve(blob)
          else reject(new Error("canvas.toBlob returned null"))
        },
        "image/jpeg",
        JPEG_QUALITY
      )
    }
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error("image failed to decode"))
    }
    img.src = objectUrl
  })
}

export async function saveImage(file: Blob): Promise<string> {
  const resized = await resizeAndCompress(file)
  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`

  const db = await openDb()
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite")
      tx.objectStore(STORE_NAME).put(resized, id)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  } finally {
    db.close()
  }

  return id
}

export async function getImageBlob(id: string): Promise<Blob | undefined> {
  const db = await openDb()
  try {
    return await new Promise<Blob | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly")
      const request = tx.objectStore(STORE_NAME).get(id)
      request.onsuccess = () => resolve(request.result as Blob | undefined)
      request.onerror = () => reject(request.error)
    })
  } finally {
    db.close()
  }
}

export async function getImageDataUrl(id: string): Promise<string | undefined> {
  const blob = await getImageBlob(id)
  if (!blob) return undefined

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

export async function deleteImage(id: string): Promise<void> {
  const db = await openDb()
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite")
      tx.objectStore(STORE_NAME).delete(id)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  } finally {
    db.close()
  }
}
