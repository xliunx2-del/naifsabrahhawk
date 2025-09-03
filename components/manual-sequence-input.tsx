"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { X, Plus, RotateCcw, Check } from "lucide-react"
import { FOODS } from "@/lib/lstm-prediction-engine"

interface ManualSequenceInputProps {
  onSequenceChange: (sequence: string[]) => void
  currentSequence: string[]
}

export function ManualSequenceInput({ onSequenceChange, currentSequence }: ManualSequenceInputProps) {
  const [inputValue, setInputValue] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [error, setError] = useState("")

  const handleInputChange = (value: string) => {
    setInputValue(value)
    setError("")

    if (value.trim()) {
      const filtered = FOODS.filter((food) => food.includes(value.trim()) || value.trim().includes(food))
      setSuggestions(filtered.slice(0, 5))
    } else {
      setSuggestions([])
    }
  }

  const addFood = (food: string) => {
    if (!FOODS.includes(food)) {
      setError(`"${food}" ليس من الأطعمة المتاحة`)
      return
    }

    const newSequence = [...currentSequence, food]
    onSequenceChange(newSequence)
    setInputValue("")
    setSuggestions([])
    setError("")
  }

  const removeFood = (index: number) => {
    const newSequence = currentSequence.filter((_, i) => i !== index)
    onSequenceChange(newSequence)
  }

  const clearSequence = () => {
    onSequenceChange([])
    setInputValue("")
    setSuggestions([])
    setError("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      const trimmedValue = inputValue.trim()
      if (trimmedValue) {
        addFood(trimmedValue)
      }
    }
  }

  const addFromTextInput = () => {
    const foods = inputValue
      .trim()
      .split(/\s+/)
      .filter((food) => food.length > 0)

    const invalidFoods = foods.filter((food) => !FOODS.includes(food))
    if (invalidFoods.length > 0) {
      setError(`أطعمة غير صحيحة: ${invalidFoods.join(", ")}`)
      return
    }

    const newSequence = [...currentSequence, ...foods]
    onSequenceChange(newSequence)
    setInputValue("")
    setSuggestions([])
    setError("")
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-right text-lg font-semibold text-purple-600 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          إدخال تسلسل يدوي
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input Section */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <Button
              onClick={addFromTextInput}
              disabled={!inputValue.trim()}
              size="sm"
              className="bg-purple-500 hover:bg-purple-600 text-white"
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Input
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="اكتب اسم الطعام أو عدة أطعمة مفصولة بمسافات..."
              className="text-right flex-1"
              dir="rtl"
            />
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="flex flex-wrap gap-1 justify-end">
              <span className="text-xs text-gray-500 w-full text-right mb-1">اقتراحات:</span>
              {suggestions.map((food, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer hover:bg-purple-50 hover:border-purple-300"
                  onClick={() => addFood(food)}
                >
                  {food}
                </Badge>
              ))}
            </div>
          )}

          {/* Available Foods Grid */}
          <div className="space-y-2">
            <p className="text-xs text-gray-500 text-right">الأطعمة المتاحة:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1">
              {FOODS.map((food, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer hover:bg-purple-100 text-center justify-center py-1"
                  onClick={() => addFood(food)}
                >
                  {food}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Current Sequence Display */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Button
              onClick={clearSequence}
              disabled={currentSequence.length === 0}
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700 bg-transparent"
            >
              <RotateCcw className="w-4 h-4 ml-1" />
              مسح الكل
            </Button>
            <h4 className="font-medium text-gray-800">التسلسل الحالي ({currentSequence.length}):</h4>
          </div>

          {currentSequence.length > 0 ? (
            <div className="flex flex-wrap gap-2 justify-end">
              {currentSequence.map((food, index) => (
                <Badge
                  key={index}
                  variant="default"
                  className="bg-purple-100 text-purple-800 border-purple-300 flex items-center gap-1"
                >
                  <button
                    onClick={() => removeFood(index)}
                    className="hover:bg-purple-200 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <span>{food}</span>
                  <span className="text-xs opacity-70">#{index + 1}</span>
                </Badge>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
              <p>لا يوجد تسلسل محدد</p>
              <p className="text-xs">انقر على الأطعمة أعلاه لإضافتها</p>
            </div>
          )}
        </div>

        {/* Sequence Preview */}
        {currentSequence.length > 0 && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <div className="text-right">
              <p className="text-sm font-medium text-purple-800 mb-1">معاينة التسلسل:</p>
              <p className="text-purple-700">{currentSequence.join(" ← ")}</p>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-right">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-right">
          <p className="text-blue-800 text-sm">
            <Check className="w-4 h-4 inline ml-1" />
            يمكنك إضافة الأطعمة بالنقر عليها أو كتابة أسمائها مفصولة بمسافات
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
