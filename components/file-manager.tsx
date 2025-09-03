"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Upload, Download, FileText } from "lucide-react"

interface FileManagerProps {
  onSequencesLoaded: (sequences: string[][]) => void
  currentSequences: string[][]
}

export function FileManager({ onSequencesLoaded, currentSequences }: FileManagerProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<any>(null)
  const [error, setError] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError("")
    setUploadResult(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("operation", "read")

      const response = await fetch("/api/file-operations", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        setUploadResult(data)
        onSequencesLoaded(data.sequences)
      } else {
        setError(data.error || "حدث خطأ في رفع الملف")
      }
    } catch (err) {
      setError("حدث خطأ في الاتصال بالخادم")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleDownload = async (format: "txt" | "csv") => {
    if (currentSequences.length === 0) {
      setError("لا توجد بيانات للتصدير")
      return
    }

    try {
      const params = new URLSearchParams({
        format,
        sequences: JSON.stringify(currentSequences),
      })

      const response = await fetch(`/api/file-operations?${params}`)

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `food_sequences.${format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        setError("حدث خطأ في تصدير الملف")
      }
    } catch (err) {
      setError("حدث خطأ في تصدير الملف")
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-right text-lg font-semibold text-blue-600 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          إدارة الملفات
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Upload Section */}
        <div className="space-y-3">
          <h4 className="font-medium text-right text-gray-800">رفع ملف:</h4>
          <div className="flex flex-col gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.csv"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              variant="outline"
              className="w-full flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {isUploading ? "جاري الرفع..." : "اختر ملف TXT أو CSV"}
            </Button>
            <p className="text-xs text-gray-500 text-right">يدعم ملفات TXT (مفصولة بمسافات) و CSV (مفصولة بفواصل)</p>
          </div>
        </div>

        {/* Upload Result */}
        {uploadResult && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="text-right space-y-2">
              <p className="font-medium text-green-800">تم رفع الملف بنجاح!</p>
              <div className="flex flex-wrap gap-2 justify-end">
                <Badge variant="secondary">الملف: {uploadResult.fileName}</Badge>
                <Badge variant="secondary">التسلسلات الصحيحة: {uploadResult.validSequences}</Badge>
                <Badge variant="secondary">المجموع: {uploadResult.totalSequences}</Badge>
              </div>
            </div>
          </div>
        )}

        {/* File Download Section */}
        <div className="space-y-3">
          <h4 className="font-medium text-right text-gray-800">تصدير البيانات:</h4>
          <div className="flex gap-2">
            <Button
              onClick={() => handleDownload("csv")}
              disabled={currentSequences.length === 0}
              variant="outline"
              className="flex-1 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              تصدير CSV
            </Button>
            <Button
              onClick={() => handleDownload("txt")}
              disabled={currentSequences.length === 0}
              variant="outline"
              className="flex-1 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              تصدير TXT
            </Button>
          </div>
          <p className="text-xs text-gray-500 text-right">عدد التسلسلات المحفوظة: {currentSequences.length}</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-right">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
