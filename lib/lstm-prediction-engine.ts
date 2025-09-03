export const FOODS = ["بيتزا", "سلطه", "كتكوت", "طماط", "بقره", "بيبار", "سمكة", "جزر", "جمبري", "ذرة"]
export const ANIMALS = ["كتكوت", "بقره", "سمكة", "جمبري"]

interface LSTMPrediction {
  animal: string
  confidence: number
}

export class LSTMPredictionEngine {
  private weights: number[][]
  private bias: number[]

  constructor() {
    // Initialize with pre-trained weights (simplified LSTM simulation)
    this.weights = this.initializeWeights()
    this.bias = [0.1, 0.2, 0.15, 0.25] // Bias for each animal
  }

  private initializeWeights(): number[][] {
    // Simplified weight matrix for food -> animal mapping
    const weights: number[][] = []

    // Each row represents an animal, each column represents a food
    weights[0] = [0.1, 0.2, 0.8, 0.3, 0.1, 0.2, 0.1, 0.4, 0.1, 0.5] // كتكوت
    weights[1] = [0.2, 0.3, 0.1, 0.2, 0.9, 0.1, 0.1, 0.3, 0.1, 0.2] // بقره
    weights[2] = [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.9, 0.2, 0.7, 0.1] // سمكة
    weights[3] = [0.1, 0.2, 0.1, 0.2, 0.1, 0.2, 0.3, 0.1, 0.8, 0.1] // جمبري

    return weights
  }

  private foodToIndex(food: string): number {
    return FOODS.indexOf(food)
  }

  private sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x))
  }

  public predict(sequence: string[]): LSTMPrediction[] {
    if (!sequence.length) return []

    // Create food frequency vector
    const foodVector = new Array(FOODS.length).fill(0)
    sequence.forEach((food) => {
      const index = this.foodToIndex(food)
      if (index !== -1) {
        foodVector[index]++
      }
    })

    // Normalize by sequence length
    const normalizedVector = foodVector.map((count) => count / sequence.length)

    // Calculate predictions for each animal
    const predictions: LSTMPrediction[] = []

    for (let animalIndex = 0; animalIndex < ANIMALS.length; animalIndex++) {
      let score = this.bias[animalIndex]

      // Dot product with weights
      for (let foodIndex = 0; foodIndex < FOODS.length; foodIndex++) {
        score += normalizedVector[foodIndex] * this.weights[animalIndex][foodIndex]
      }

      const confidence = this.sigmoid(score)

      if (confidence >= 0.5) {
        predictions.push({
          animal: ANIMALS[animalIndex],
          confidence: Math.round(confidence * 100) / 100,
        })
      }
    }

    // Sort by confidence
    return predictions.sort((a, b) => b.confidence - a.confidence)
  }

  public validateSequence(sequence: string[]): boolean {
    return sequence.every((food) => FOODS.includes(food))
  }

  public getAvailableFoods(): string[] {
    return [...FOODS]
  }

  public getAvailableAnimals(): string[] {
    return [...ANIMALS]
  }
}
