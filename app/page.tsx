"use client"

import { useState } from "react"
import { FoodWheel } from "@/components/food-wheel"
import { PredictionDisplay } from "@/components/prediction-display"
import { AIStatusDisplay } from "@/components/ai-status-display"
import { SaveControls } from "@/components/save-controls"
import { ResultsHistory } from "@/components/results-history"

export default function FoodPredictionApp() {
  const [selectedFood, setSelectedFood] = useState<string | null>(null)
  const [predictions, setPredictions] = useState<any[]>([])
  const [highlightedFoods, setHighlightedFoods] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [modelMetadata, setModelMetadata] = useState<any>(null)

  const handleFoodClick = async (foodName: string) => {
    setSelectedFood(foodName)
    setIsLoading(true)

    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ food: foodName }),
      })

      const data = await response.json()
      setPredictions(data.predictions || [])
      setHighlightedFoods(data.predictions?.map((p: any) => p.food) || [])
      setModelMetadata(data.metadata)
    } catch (error) {
      console.error("Prediction error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveResults = async () => {
    if (!selectedFood || predictions.length === 0) return

    const response = await fetch("/api/save-results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        selectedFood,
        predictions,
        timestamp: new Date().toISOString(),
        metadata: modelMetadata,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to save results")
    }
  }

  const handleDeletePredictions = async () => {
    const response = await fetch("/api/delete-predictions", { method: "DELETE" })

    if (response.ok) {
      setPredictions([])
      setHighlightedFoods([])
      setSelectedFood(null)
    } else {
      throw new Error("Failed to delete predictions")
    }
  }

  const handleResultSelect = (result: any) => {
    setSelectedFood(result.selectedFood)
    setPredictions(result.predictions)
    setHighlightedFoods(result.predictions.map((p: any) => p.food))
    setModelMetadata(result.metadata)
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Video */}
      <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-0">
        <source src="/فيديو.mp4" type="video/mp4" />
      </video>

      {/* Background Image Overlay */}
      <div
        className="absolute inset-0 z-10 bg-cover bg-center bg-no-repeat opacity-40"
        style={{ backgroundImage: "url(/خلفية_الموقع.png)" }}
      />

      {/* Main Content */}
      <div className="relative z-20 flex flex-col items-center justify-start sm:justify-center min-h-screen p-2 sm:p-4 pt-4 sm:pt-8">
        {/* AI status display */}
        <div className="w-full max-w-xs sm:max-w-md">
          <AIStatusDisplay />
        </div>

        {/* Food Wheel - main interactive element */}
        <div className="mb-4 sm:mb-8 flex-shrink-0">
          <FoodWheel
            onFoodClick={handleFoodClick}
            highlightedFoods={highlightedFoods}
            selectedFood={selectedFood}
            isLoading={isLoading}
          />
        </div>

        {/* Predictions Display */}
        <PredictionDisplay predictions={predictions} selectedFood={selectedFood} />

        {/* Model metadata - responsive text */}
        {modelMetadata && (
          <div className="text-center text-white/80 text-xs sm:text-sm mb-3 sm:mb-4 px-4">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
              <span>دقة النموذج: {modelMetadata.modelAccuracy}%</span>
              <span className="hidden sm:inline">|</span>
              <span>البيانات المستخدمة: {modelMetadata.sequenceLength} عنصر</span>
              {modelMetadata.contextUsed && (
                <>
                  <span className="hidden sm:inline">|</span>
                  <span>تم استخدام السياق</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Save Controls */}
        <SaveControls
          selectedFood={selectedFood}
          predictions={predictions}
          onSave={handleSaveResults}
          onDelete={handleDeletePredictions}
          isLoading={isLoading}
        />

        {/* Results History */}
        <ResultsHistory onResultSelect={handleResultSelect} />

        {/* Loading Indicator */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/95 backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-2xl border border-white/20 max-w-xs sm:max-w-sm w-full">
              <div className="flex flex-col items-center gap-3 sm:gap-4">
                <div className="relative">
                  <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-blue-200"></div>
                  <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-blue-600 border-t-transparent absolute top-0"></div>
                </div>
                <p className="text-center font-medium text-gray-700 text-sm sm:text-base">
                  جاري التحليل بالذكاء الاصطناعي...
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
