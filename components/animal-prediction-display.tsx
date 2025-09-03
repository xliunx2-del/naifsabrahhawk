"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface AnimalPrediction {
  animal: string
  confidence: number
}

interface AnimalPredictionDisplayProps {
  sequence: string[]
  onPredict: () => void
  isLoading: boolean
}

export function AnimalPredictionDisplay({ sequence, onPredict, isLoading }: AnimalPredictionDisplayProps) {
  const [predictions, setPredictions] = useState<AnimalPrediction[]>([])
  const [error, setError] = useState<string>("")

  const handlePredict = async () => {
    if (sequence.length === 0) {
      setError("يرجى اختيار بعض الأطعمة أولاً")
      return
    }

    setError("")
    onPredict()

    try {
      const response = await fetch("/api/predict-animals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sequence }),
      })

      const data = await response.json()

      if (data.success) {
        setPredictions(data.predictions)
      } else {
        setError(data.error || "حدث خطأ في التنبؤ")
      }
    } catch (err) {
      setError("حدث خطأ في الاتصال بالخادم")
    }
  }

  const getAnimalEmoji = (animal: string) => {
    const emojiMap: { [key: string]: string } = {
      كتكوت: "🐤",
      بقره: "🐄",
      سمكة: "🐟",
      جمبري: "🦐",
    }
    return emojiMap[animal] || "🐾"
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-right text-lg font-semibold text-orange-600">
          تنبؤ الحيوانات بالذكاء الاصطناعي
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-right">
          <p className="text-sm text-gray-600 mb-2">
            التسلسل المختار: {sequence.length > 0 ? sequence.join(" ← ") : "لا يوجد"}
          </p>
          <Button
            onClick={handlePredict}
            disabled={isLoading || sequence.length === 0}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            {isLoading ? "جاري التحليل..." : "تنبؤ الحيوانات"}
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-right">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {predictions.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-right text-gray-800">الحيوانات المتوقعة:</h4>
            <div className="grid gap-2">
              {predictions.map((prediction, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3 border border-green-200"
                >
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {Math.round(prediction.confidence * 100)}%
                  </Badge>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-800">{prediction.animal}</span>
                    <span className="text-xl">{getAnimalEmoji(prediction.animal)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {predictions.length === 0 && sequence.length > 0 && !isLoading && !error && (
          <div className="text-center py-4 text-gray-500">
            <p>لا توجد حيوانات متوقعة لهذا التسلسل</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
