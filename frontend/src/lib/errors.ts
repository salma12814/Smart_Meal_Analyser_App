import axios from 'axios'

interface ApiErrorBody {
  message?: string
  error?: string
}

export function getErrorMessage(error: unknown, fallback = 'Une erreur est survenue. Réessayez dans un instant.') {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    const message = error.response?.data?.message || error.response?.data?.error
    if (message) return translateBackendMessage(message)
    if (error.code === 'ERR_NETWORK') return 'Impossible de joindre le serveur. Vérifiez que l’API est démarrée.'
  }
  if (error instanceof Error && error.message) return error.message
  return fallback
}

function translateBackendMessage(message: string) {
  const known: Record<string, string> = {
    'Invalid credentials': 'Adresse e-mail ou mot de passe incorrect.',
    'Email already registered': 'Cette adresse e-mail possède déjà un compte.',
    'Name is required': 'Le nom est obligatoire.',
    'Authentication required': 'Votre session a expiré. Connectez-vous à nouveau.',
    'ML service unavailable': 'Le service d’analyse est indisponible pour le moment.',
    'Image is required': 'Ajoutez une image avant de lancer l’analyse.',
    'Only valid JPEG and PNG images are accepted': 'Le fichier doit être une image JPEG ou PNG valide.',
    'Image exceeds configured size limit': 'L’image dépasse la taille maximale de 20 Mo.',
  }
  return known[message] || message
}
