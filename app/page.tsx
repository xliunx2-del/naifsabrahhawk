"use client"

import { useState } from "react"
import { FoodWheel } from "@/components/food-wheel"
import { PredictionDisplay } from "@/components/prediction-display"
import { AIStatusDisplay } from "@/components/ai-status-display"
import { SaveControls } from "@/components/save-controls"
import { ResultsHistory } from "@/components/results-history"
import { AnimalPredictionDisplay } from "@/components/animal-prediction-display"
import { FileManager } from "@/components/file-manager"
import { ManualSequenceInput } from "@/components/manual-sequence-input"
import { DataManagementInterface } from "@/components/data-management-interface"

export default function FoodPredictionApp() {
  const [selectedFood, setSelectedFood] = useState<string | null>(null)
  const [predictions, setPredictions] = useState<any[]>([])
  const [highlightedFoods, setHighlightedFoods] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [modelMetadata, setModelMetadata] = useState<any>(null)

  const [currentSequence, setCurrentSequence] = useState<string[]>([])
  const [savedSequences, setSavedSequences] = useState<string[][]>([])
  const [isAnimalPredicting, setIsAnimalPredicting] = useState(false)
  const [animalPredictions, setAnimalPredictions] = useState<string[]>([])

  const vegetables = ["جزر", "طماط", "بيبار", "ذرة"]

  const checkVegetableCompletion = (sequence: string[]) => {
    const uniqueVegetables = new Set(sequence.filter((food) => vegetables.includes(food)))
    return uniqueVegetables.size === 4
  }

  const triggerAnimalPrediction = async (sequence: string[]) => {
    try {
      const response = await fetch("/api/predict-animals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sequence }),
      })

      const data = await response.json()
      if (data.predictions && data.predictions.length > 0) {
        const predictedAnimals = data.predictions.map((p: any) => p.animal)
        handleAnimalPredict(predictedAnimals)
      }
    } catch (error) {
      console.error("Auto animal prediction error:", error)
    }
  }

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

  const handleSequenceClick = (foodName: string) => {
    const newSequence = [...currentSequence, foodName]
    setCurrentSequence(newSequence)

    if (checkVegetableCompletion(newSequence)) {
      triggerAnimalPrediction(newSequence)
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

  const handleSequenceChange = (sequence: string[]) => {
    setCurrentSequence(sequence)

    if (checkVegetableCompletion(sequence)) {
      triggerAnimalPrediction(sequence)
    }
  }

  const handleSequencesLoaded = (sequences: string[][]) => {
    setSavedSequences(sequences)
  }

  const handleAnimalPredict = async (predictedAnimals: string[]) => {
    setIsAnimalPredicting(true)
    setAnimalPredictions(predictedAnimals)

    setTimeout(() => {
      setIsAnimalPredicting(false)
      setAnimalPredictions([])
      setCurrentSequence([])
    }, 4000)
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
            animalPredictions={animalPredictions}
            onSequenceClick={handleSequenceClick}
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

        <div className="w-full max-w-6xl mt-8 sm:mt-12 space-y-6 bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/20">
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">ميزات الذكاء الاصطناعي المتقدمة</h2>
            <p className="text-white/80 text-sm sm:text-base">تنبؤ الحيوانات وإدارة البيانات المتقدمة</p>
          </div>

          {/* LSTM Features Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Left Column */}
            <div className="space-y-4 sm:space-y-6">
              {/* Manual Sequence Input */}
              <ManualSequenceInput onSequenceChange={handleSequenceChange} currentSequence={currentSequence} />

              {/* Animal Prediction Display */}
              <AnimalPredictionDisplay
                sequence={currentSequence}
                onPredict={handleAnimalPredict}
                isLoading={isAnimalPredicting}
              />
            </div>

            {/* Right Column */}
            <div className="space-y-4 sm:space-y-6">
              {/* File Manager */}
              <FileManager onSequencesLoaded={handleSequencesLoaded} currentSequences={savedSequences} />

              {/* Data Management Interface */}
              <DataManagementInterface currentSequences={savedSequences} onSequencesLoad={handleSequencesLoaded} />
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-500/20 border border-blue-300/30 rounded-lg p-4 text-center">
            <p className="text-white text-sm sm:text-base">
              انقر على صور الأطعمة في العجلة لإضافتها للتسلسل، أو استخدم الأدوات أعلاه لإنشاء تسلسلات والتنبؤ بالحيوانات
            </p>
          </div>
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/95 backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-2xl border border-white/20 max-w-xs sm:max-w-sm w-full">
              <div className="flex flex-col items-center gap-3 sm:gap-4">
                <div className="relative">
                  <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-blue-200"></div>
                  <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-blue-600 border-t-transparent absolute top-0"></div>
                </div>
                <p className="text-center font-medium text-gray-700 text-sm sm:text-base">جاري التحليل...</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
