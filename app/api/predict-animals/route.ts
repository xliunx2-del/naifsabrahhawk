import { type NextRequest, NextResponse } from "next/server"
import { LSTMPredictionEngine } from "@/lib/lstm-prediction-engine"

const lstmEngine = new LSTMPredictionEngine()

export async function POST(request: NextRequest) {
  try {
    const { sequence } = await request.json()

    if (!sequence || !Array.isArray(sequence)) {
      return NextResponse.json({ error: "يجب إرسال تسلسل صحيح من الأطعمة" }, { status: 400 })
    }

    // Validate sequence
    if (!lstmEngine.validateSequence(sequence)) {
      return NextResponse.json(
        {
          error: "تأكد من إدخال أسماء الأطعمة الصحيحة فقط",
          availableFoods: lstmEngine.getAvailableFoods(),
        },
        { status: 400 },
      )
    }

    // Get predictions
    const predictions = lstmEngine.predict(sequence)

    return NextResponse.json({
      success: true,
      sequence,
      predictions,
      availableAnimals: lstmEngine.getAvailableAnimals(),
    })
  } catch (error) {
    console.error("Error in animal prediction:", error)
    return NextResponse.json({ error: "حدث خطأ في التنبؤ بالحيوانات" }, { status: 500 })
  }
}

export async function GET() {
  try {
    return NextResponse.json({
      availableFoods: lstmEngine.getAvailableFoods(),
      availableAnimals: lstmEngine.getAvailableAnimals(),
      info: "LSTM Animal Prediction API - أرسل POST مع تسلسل الأطعمة للحصول على تنبؤات الحيوانات",
    })
  } catch (error) {
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 })
  }
}
