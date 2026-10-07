const DATABASE = 'smeal-meal-images'
const STORE = 'images'

function openImageDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) return reject(new Error('Le stockage local des images est indisponible.'))
    const request = window.indexedDB.open(DATABASE, 1)
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE)
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('Impossible d’ouvrir le stockage des images.'))
  })
}

export async function saveMealImage(mealId: string, image: Blob): Promise<void> {
  const database = await openImageDatabase()
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE, 'readwrite')
    transaction.objectStore(STORE).put(image, mealId)
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error ?? new Error('Impossible d’enregistrer cette image.'))
    transaction.onabort = () => reject(transaction.error ?? new Error('Enregistrement de l’image annulé.'))
  }).finally(() => database.close())
}

export async function getMealImage(mealId: string): Promise<Blob | null> {
  const database = await openImageDatabase()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE, 'readonly')
    const request = transaction.objectStore(STORE).get(mealId) as IDBRequest<Blob | undefined>
    request.onsuccess = () => resolve(request.result ?? null)
    request.onerror = () => reject(request.error ?? new Error('Impossible de lire cette image.'))
    transaction.oncomplete = () => database.close()
    transaction.onerror = () => database.close()
  })
}
