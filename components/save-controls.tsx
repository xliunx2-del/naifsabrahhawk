"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Save, Trash2, AlertCircle, CheckCircle } from "lucide-react"

interface SaveControlsProps {
  selectedFood: string | null
  predictions: any[]
  onSave: () => Promise<void>
  onDelete: () => Promise<void>
  isLoading?: boolean
}

export function SaveControls({ selectedFood, predictions, onSave, onDelete, isLoading = false }: SaveControlsProps) {
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle")
  const [deleteStatus, setDeleteStatus] = useState<"idle" | "deleting" | "success" | "error">("idle")

  const handleSave = async () => {
    if (!selectedFood || predictions.length === 0) return

    setSaveStatus("saving")
    try {
      await onSave()
      setSaveStatus("success")
      setTimeout(() => setSaveStatus("idle"), 2000)
    } catch (error) {
      setSaveStatus("error")
      setTimeout(() => setSaveStatus("idle"), 3000)
    }
  }

  const handleDelete = async () => {
    setDeleteStatus("deleting")
    try {
      await onDelete()
      setDeleteStatus("success")
      setTimeout(() => setDeleteStatus("idle"), 2000)
    } catch (error) {
      setDeleteStatus("error")
      setTimeout(() => setDeleteStatus("idle"), 3000)
    }
  }

  const canSave = selectedFood && predictions.length > 0 && !isLoading
  const isProcessing = saveStatus === "saving" || deleteStatus === "deleting" || isLoading

  return (
    <Card className="bg-white/95 backdrop-blur-md border border-white/20 p-3 sm:p-4 mb-4 sm:mb-6 shadow-lg w-full max-w-xs sm:max-w-md mx-4">
      <div className="flex flex-col gap-3 sm:gap-4">
        {/* Status Messages */}
        {saveStatus === "success" && (
          <div className="flex items-center gap-2 text-green-600 text-xs sm:text-sm">
            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
            تم حفظ النتائج بنجاح!
          </div>
        )}

        {saveStatus === "error" && (
          <div className="flex items-center gap-2 text-red-600 text-xs sm:text-sm">
            <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
            فشل في حفظ النتائج. حاول مرة أخرى.
          </div>
        )}

        {deleteStatus === "success" && (
          <div className="flex items-center gap-2 text-green-600 text-xs sm:text-sm">
            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
            تم حذف التوقعات بنجاح!
          </div>
        )}

        {deleteStatus === "error" && (
          <div className="flex items-center gap-2 text-red-600 text-xs sm:text-sm">
            <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
            فشل في حذف التوقعات. حاول مرة أخرى.
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
          <Button
            onClick={handleSave}
            disabled={!canSave || isProcessing}
            className={`
              font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-lg hover:shadow-xl 
              transition-all duration-200 transform hover:scale-105 text-sm sm:text-base
              ${
                saveStatus === "saving"
                  ? "bg-blue-500 hover:bg-blue-600"
                  : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              } text-white w-full sm:w-auto
            `}
          >
            {saveStatus === "saving" ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-2"></div>
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                حفظ النتائج
              </>
            )}
          </Button>

          <Button
            onClick={handleDelete}
            disabled={isProcessing}
            className={`
              font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-lg hover:shadow-xl 
              transition-all duration-200 transform hover:scale-105 text-sm sm:text-base
              ${
                deleteStatus === "deleting"
                  ? "bg-gray-500 hover:bg-gray-600"
                  : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
              } text-white w-full sm:w-auto
            `}
          >
            {deleteStatus === "deleting" ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-2"></div>
                جاري الحذف...
              </>
            ) : (
              <>
                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                حذف التوقعات
              </>
            )}
          </Button>
        </div>

        {/* Help Text */}
        {!canSave && (
          <div className="text-center text-xs sm:text-sm text-gray-500">
            {!selectedFood ? "اختر طعاماً للحصول على توقعات" : "لا توجد توقعات للحفظ"}
          </div>
        )}
      </div>
    </Card>
  )
}
