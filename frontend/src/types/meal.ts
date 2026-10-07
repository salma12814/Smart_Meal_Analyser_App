export interface FoodPrediction {
  food: string
  confidence: number
}

export interface HealthScore {
  score: number
  grade: string
  breakdown?: Record<string, number>
}

export interface Recommendation {
  food: string
  reason: string
  score: number
}

export interface NutritionTotals {
  calories?: number
  proteins?: number
  carbs?: number
  fats?: number
  fiber?: number
  sodium?: number
  sugarTotal?: number
}

export interface MealAnalysis {
  mealId: string
  userId: string
  detectedFoods: FoodPrediction[]
  nutritionData: NutritionTotals
  healthScore: HealthScore
  recommendations: Recommendation[]
  timestamp: string
}

export interface MealHistoryItem {
  mealId: string
  timestamp: string
  score: number
  grade: string
  detectedFoods?: FoodPrediction[]
}

export interface MealHistoryResponse {
  meals: MealHistoryItem[]
  total: number
  hasMore: boolean
}

export interface MealDetails extends Omit<MealAnalysis, 'userId'> {
  userId?: string
}

export interface NutritionFood {
  name: string
  caloriesPer100g: number
  proteins: number
  carbs: number
  fats: number
  fiber: number
  sodium: number
  sugarTotal: number
}
