import { api } from './axios'
import type { MealAnalysis, MealDetails, MealHistoryResponse } from '../types/meal'

export const mealApi = {
  analyze: (image: File) => {
    const body = new FormData()
    body.append('image', image)
    return api.post<MealAnalysis>('/v1/meals/analyze', body).then((response) => response.data)
  },
  history: (offset = 0, limit = 20) => api.get<MealHistoryResponse>('/v1/meals/history', { params: { offset, limit } }).then((response) => response.data),
  details: (mealId: string) => api.get<MealDetails>(`/v1/meals/${encodeURIComponent(mealId)}`).then((response) => response.data),
}
