"use client"

import { Card } from "@/components/ui/card"

interface Prediction {
  food: string
  probability: number
}

interface PredictionDisplayProps {
  predictions: Prediction[]
  selectedFood: string | null
}

export function PredictionDisplay({ predictions, selectedFood }: PredictionDisplayProps) {
  if (predictions.length === 0) return null

  return (
    <Card className="bg-white/95 backdrop-blur-md border-2 border-white/20 shadow-2xl p-4 sm:p-6 mb-4 sm:mb-6 max-w-xs sm:max-w-md lg:max-w-lg w-full mx-4">
      <div className="text-center mb-3 sm:mb-4">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">التوقعات للطعام القادم</h3>
        {selectedFood && (
          <p className="text-xs sm:text-sm text-gray-600">
            بناءً على اختيار: <span className="font-semibold text-blue-600">{selectedFood}</span>
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
        {predictions.map((pred, index) => (
          <div
            key={index}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-2 sm:p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-0">
              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {index + 1}
              </div>
              <span className="font-medium text-gray-800 text-sm sm:text-base">{pred.food}</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="w-12 sm:w-16 bg-gray-200 rounded-full h-1.5 sm:h-2 flex-1 sm:flex-none">
                <div
                  className="bg-gradient-to-r from-green-400 to-blue-500 h-1.5 sm:h-2 rounded-full transition-all duration-500"
                  style={{ width: `${pred.probability}%` }}
                />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-gray-700 min-w-[2.5rem] sm:min-w-[3rem]">
                {pred.probability}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
