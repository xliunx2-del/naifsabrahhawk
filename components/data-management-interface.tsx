"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2, Save, Database, RefreshCw, Download, Upload } from "lucide-react"

interface SavedSequence {
  id: number
  sequence: string[]
  sequence_text: string
  created_at: string
}

interface DataManagementInterfaceProps {
  currentSequences: string[][]
  onSequencesLoad: (sequences: string[][]) => void
}

export function DataManagementInterface({ currentSequences, onSequencesLoad }: DataManagementInterfaceProps) {
  const [savedSequences, setSavedSequences] = useState<SavedSequence[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    loadSavedSequences()
  }, [])

  const loadSavedSequences = async () => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/data-management")
      const data = await response.json()

      if (data.success) {
        setSavedSequences(data.sequences)
      } else if (data.fallback) {
        // Handle local storage fallback
        const localData = localStorage.getItem("food_sequences")
        if (localData) {
          const parsed = JSON.parse(localData)
          setSavedSequences(parsed)
        }
      } else {
        setError(data.error || "حدث خطأ في جلب البيانات")
      }
    } catch (err) {
      setError("حدث خطأ في الاتصال بالخادم")
    } finally {
      setIsLoading(false)
    }
  }

  const saveCurrentSequences = async () => {
    if (currentSequences.length === 0) {
      setError("لا توجد تسلسلات لحفظها")
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/data-management", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "save_multiple",
          sequences: currentSequences,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(data.message)
        await loadSavedSequences()
      } else if (data.fallback) {
        // Handle local storage fallback
        const existingData = localStorage.getItem("food_sequences") || "[]"
        const existing = JSON.parse(existingData)
        const newSequences = currentSequences.map((seq, index) => ({
          id: Date.now() + index,
          sequence: seq,
          sequence_text: seq.join(" "),
          created_at: new Date().toISOString(),
        }))
        const updated = [...existing, ...newSequences]
        localStorage.setItem("food_sequences", JSON.stringify(updated))
        setSavedSequences(updated)
        setSuccess(`تم حفظ ${currentSequences.length} تسلسل محلياً`)
      } else {
        setError(data.error || "حدث خطأ في الحفظ")
      }
    } catch (err) {
      setError("حدث خطأ في الاتصال بالخادم")
    } finally {
      setIsLoading(false)
    }
  }

  const deleteAllSequences = async () => {
    if (!confirm("هل أنت متأكد من حذف جميع التسلسلات المحفوظة؟")) {
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/data-management", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "delete_all",
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(data.message)
        setSavedSequences([])
      } else if (data.fallback) {
        // Handle local storage fallback
        localStorage.removeItem("food_sequences")
        setSavedSequences([])
        setSuccess("تم حذف جميع البيانات المحلية")
      } else {
        setError(data.error || "حدث خطأ في الحذف")
      }
    } catch (err) {
      setError("حدث خطأ في الاتصال بالخادم")
    } finally {
      setIsLoading(false)
    }
  }

  const loadSequencesToWorkspace = () => {
    const sequences = savedSequences.map((item) => item.sequence)
    onSequencesLoad(sequences)
    setSuccess(`تم تحميل ${sequences.length} تسلسل إلى مساحة العمل`)
  }

  const exportSavedData = () => {
    if (savedSequences.length === 0) {
      setError("لا توجد بيانات للتصدير")
      return
    }

    const dataStr = JSON.stringify(savedSequences, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `saved_sequences_${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-right text-lg font-semibold text-green-600 flex items-center gap-2">
          <Database className="w-5 h-5" />
          إدارة البيانات
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={saveCurrentSequences}
            disabled={isLoading || currentSequences.length === 0}
            className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            حفظ التسلسلات ({currentSequences.length})
          </Button>
          <Button
            onClick={loadSavedSequences}
            disabled={isLoading}
            variant="outline"
            className="flex items-center gap-2 bg-transparent"
          >
            <RefreshCw className="w-4 h-4" />
            تحديث البيانات
          </Button>
          <Button
            onClick={loadSequencesToWorkspace}
            disabled={isLoading || savedSequences.length === 0}
            variant="outline"
            className="flex items-center gap-2 bg-transparent"
          >
            <Upload className="w-4 h-4" />
            تحميل للعمل ({savedSequences.length})
          </Button>
          <Button
            onClick={exportSavedData}
            disabled={isLoading || savedSequences.length === 0}
            variant="outline"
            className="flex items-center gap-2 bg-transparent"
          >
            <Download className="w-4 h-4" />
            تصدير JSON
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-center">
            <p className="text-xs text-blue-600">محفوظة</p>
            <p className="font-bold text-blue-800">{savedSequences.length}</p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 text-center">
            <p className="text-xs text-orange-600">حالية</p>
            <p className="font-bold text-orange-800">{currentSequences.length}</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-2 text-center">
            <p className="text-xs text-purple-600">المجموع</p>
            <p className="font-bold text-purple-800">{savedSequences.length + currentSequences.length}</p>
          </div>
        </div>

        {/* Saved Sequences Display */}
        {savedSequences.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Button
                onClick={deleteAllSequences}
                disabled={isLoading}
                variant="destructive"
                size="sm"
                className="flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                حذف الكل
              </Button>
              <h4 className="font-medium text-gray-800">التسلسلات المحفوظة:</h4>
            </div>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {savedSequences.slice(0, 10).map((item, index) => (
                <div key={item.id} className="bg-gray-50 border rounded-lg p-2">
                  <div className="flex items-center justify-between text-sm">
                    <Badge variant="secondary" className="text-xs">
                      {new Date(item.created_at).toLocaleDateString("ar")}
                    </Badge>
                    <span className="text-gray-700 text-right">{item.sequence_text}</span>
                  </div>
                </div>
              ))}
              {savedSequences.length > 10 && (
                <p className="text-xs text-gray-500 text-center">... و {savedSequences.length - 10} تسلسل آخر</p>
              )}
            </div>
          </div>
        )}

        {/* Status Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-right">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-right">
            <p className="text-green-600 text-sm">{success}</p>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-2">
            <div className="inline-flex items-center gap-2 text-gray-600">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>جاري المعالجة...</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
