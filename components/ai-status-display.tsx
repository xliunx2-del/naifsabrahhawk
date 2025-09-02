"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"

interface ModelStats {
  accuracy: number
  sequenceLength: number
  recentFoods: string[]
  status: string
}

export function AIStatusDisplay() {
  const [stats, setStats] = useState<ModelStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/predict")
      const data = await response.json()
      setStats(data.modelStats)
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm p-4 mb-4">
        <div className="animate-pulse flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
          <div className="h-4 bg-gray-300 rounded w-32"></div>
        </div>
      </Card>
    )
  }

  if (!stats) return null

  return (
    <Card className="bg-white/95 backdrop-blur-md border border-white/20 p-4 mb-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${
              stats.status === "active" ? "bg-green-500 animate-pulse" : "bg-gray-400"
            }`}
          ></div>
          <span className="text-sm font-medium text-gray-700">صبره سوفت 777826667</span>
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-600">
          <span>دقة النموذج: {stats.accuracy}%</span>
          <span>البيانات: {stats.sequenceLength}</span>
        </div>
      </div>

      {stats.recentFoods.length > 0 && (
        <div className="mt-2 text-xs text-gray-500">آخر الأطعمة: {stats.recentFoods.join(" ← ")}</div>
      )}
    </Card>
  )
}
