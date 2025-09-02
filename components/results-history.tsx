"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, Calendar, TrendingUp, Download, Eye, EyeOff } from "lucide-react"

interface SavedResult {
  id: number
  selectedFood: string
  predictions: Array<{
    food: string
    probability: number
    confidence?: number
  }>
  timestamp: string
  saved_at: string
}

interface ResultsHistoryProps {
  onResultSelect?: (result: SavedResult) => void
}

export function ResultsHistory({ onResultSelect }: ResultsHistoryProps) {
  const [results, setResults] = useState<SavedResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(false)
  const [selectedResults, setSelectedResults] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (isVisible) {
      fetchResults()
    }
  }, [isVisible])

  const fetchResults = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/save-results")
      const data = await response.json()
      setResults(data.results || [])
    } catch (error) {
      console.error("Failed to fetch results:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteResult = async (id: number) => {
    try {
      const response = await fetch("/api/save-results", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })

      if (response.ok) {
        setResults(results.filter((r) => r.id !== id))
        setSelectedResults((prev) => {
          const newSet = new Set(prev)
          newSet.delete(id)
          return newSet
        })
      }
    } catch (error) {
      console.error("Failed to delete result:", error)
    }
  }

  const deleteSelectedResults = async () => {
    if (selectedResults.size === 0) return

    try {
      const response = await fetch("/api/save-results", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedResults) }),
      })

      if (response.ok) {
        setResults(results.filter((r) => !selectedResults.has(r.id)))
        setSelectedResults(new Set())
      }
    } catch (error) {
      console.error("Failed to delete selected results:", error)
    }
  }

  const exportResults = () => {
    const dataStr = JSON.stringify(results, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `food-predictions-${new Date().toISOString().split("T")[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const toggleResultSelection = (id: number) => {
    setSelectedResults((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        variant="outline"
        className="mb-4 bg-white/90 backdrop-blur-sm border-white/20 text-sm sm:text-base px-3 sm:px-4 py-2"
      >
        <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
        عرض السجل المحفوظ
      </Button>
    )
  }

  return (
    <Card className="bg-white/95 backdrop-blur-md border border-white/20 p-3 sm:p-6 mb-4 sm:mb-6 max-w-xs sm:max-w-2xl w-full shadow-2xl mx-4">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-bold text-gray-800">سجل التوقعات المحفوظة</h3>
        <Button onClick={() => setIsVisible(false)} variant="ghost" size="sm">
          <EyeOff className="w-3 h-3 sm:w-4 sm:h-4" />
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-6 sm:py-8">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-6 sm:py-8 text-gray-500 text-sm sm:text-base">لا توجد نتائج محفوظة بعد</div>
      ) : (
        <>
          <div className="flex gap-1 sm:gap-2 mb-3 sm:mb-4 flex-wrap">
            <Button onClick={exportResults} variant="outline" size="sm" className="text-xs bg-transparent px-2 sm:px-3">
              <Download className="w-3 h-3 mr-1" />
              تصدير
            </Button>

            {selectedResults.size > 0 && (
              <Button onClick={deleteSelectedResults} variant="destructive" size="sm" className="text-xs px-2 sm:px-3">
                <Trash2 className="w-3 h-3 mr-1" />
                حذف المحدد ({selectedResults.size})
              </Button>
            )}

            <div className="text-xs text-gray-500 flex items-center px-2">المجموع: {results.length} نتيجة</div>
          </div>

          <div className="space-y-2 sm:space-y-3 max-h-64 sm:max-h-96 overflow-y-auto">
            {results
              .slice()
              .reverse()
              .map((result) => (
                <div
                  key={result.id}
                  className={`p-2 sm:p-4 border rounded-lg transition-all cursor-pointer hover:shadow-md ${
                    selectedResults.has(result.id) ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-gray-50"
                  }`}
                  onClick={() => toggleResultSelection(result.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedResults.has(result.id)}
                        onChange={() => toggleResultSelection(result.id)}
                        className="rounded w-3 h-3 sm:w-4 sm:h-4"
                      />
                      <span className="font-semibold text-blue-600 text-sm sm:text-base">{result.selectedFood}</span>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2">
                      <Calendar className="w-2 h-2 sm:w-3 sm:h-3 text-gray-400" />
                      <span className="text-xs text-gray-500 hidden sm:inline">{formatDate(result.saved_at)}</span>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteResult(result.id)
                        }}
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 p-0.5 sm:p-1"
                      >
                        <Trash2 className="w-2 h-2 sm:w-3 sm:h-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 text-xs">
                    {result.predictions.slice(0, 4).map((pred, index) => (
                      <div key={index} className="flex justify-between items-center p-1 sm:p-2 bg-white rounded border">
                        <span className="text-xs sm:text-sm">{pred.food}</span>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-2 h-2 sm:w-3 sm:h-3 text-green-500" />
                          <span className="font-medium text-xs sm:text-sm">{pred.probability}%</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {onResultSelect && (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        onResultSelect(result)
                      }}
                      variant="outline"
                      size="sm"
                      className="mt-2 text-xs px-2 sm:px-3 py-1"
                    >
                      إعادة تحميل هذه النتيجة
                    </Button>
                  )}
                </div>
              ))}
          </div>
        </>
      )}
    </Card>
  )
}
