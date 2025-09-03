import { type NextRequest, NextResponse } from "next/server"
import { FOODS } from "@/lib/lstm-prediction-engine"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const operation = formData.get("operation") as string

    if (!file) {
      return NextResponse.json({ error: "لم يتم رفع أي ملف" }, { status: 400 })
    }

    const text = await file.text()
    let sequences: string[][] = []

    // Parse file based on type
    if (file.name.endsWith(".txt")) {
      sequences = parseTxtFile(text)
    } else if (file.name.endsWith(".csv")) {
      sequences = parseCsvFile(text)
    } else {
      return NextResponse.json({ error: "نوع الملف غير مدعوم. يرجى رفع ملف TXT أو CSV" }, { status: 400 })
    }

    // Validate sequences
    const validSequences = sequences.filter((seq) => seq.length > 0 && seq.every((food) => FOODS.includes(food)))

    if (validSequences.length === 0) {
      return NextResponse.json(
        {
          error: "لا توجد تسلسلات صحيحة في الملف",
          availableFoods: FOODS,
        },
        { status: 400 },
      )
    }

    return NextResponse.json({
      success: true,
      sequences: validSequences,
      totalSequences: sequences.length,
      validSequences: validSequences.length,
      fileName: file.name,
    })
  } catch (error) {
    console.error("Error processing file:", error)
    return NextResponse.json({ error: "حدث خطأ في معالجة الملف" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get("format") || "txt"
    const sequences = searchParams.get("sequences")

    if (!sequences) {
      return NextResponse.json({ error: "لا توجد بيانات للتصدير" }, { status: 400 })
    }

    const parsedSequences = JSON.parse(sequences) as string[][]
    let content = ""
    let contentType = "text/plain"
    const fileName = `food_sequences.${format}`

    if (format === "txt") {
      content = parsedSequences.map((seq) => seq.join(" ")).join("\n")
      contentType = "text/plain"
    } else if (format === "csv") {
      content = parsedSequences.map((seq) => seq.join(",")).join("\n")
      contentType = "text/csv"
    }

    return new NextResponse(content, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    })
  } catch (error) {
    console.error("Error generating download:", error)
    return NextResponse.json({ error: "حدث خطأ في تصدير الملف" }, { status: 500 })
  }
}

function parseTxtFile(text: string): string[][] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => line.split(/\s+/))
}

function parseCsvFile(text: string): string[][] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => line.split(",").map((item) => item.trim()))
}
