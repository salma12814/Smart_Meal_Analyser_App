import { api } from './axios'
import type { NutritionFood } from '../types/meal'

export const nutritionApi = {
  food: (name: string) => api.get<NutritionFood>(`/v1/nutrition/foods/${encodeURIComponent(name)}`).then((response) => response.data),
}
