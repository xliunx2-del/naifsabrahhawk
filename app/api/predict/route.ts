import { type NextRequest, NextResponse } from "next/server"
import { predictionEngine } from "@/lib/ai-prediction-engine"
import { createClient } from "@/lib/supabase/server"
import path from "path"

const DATA_DIR = path.join(process.cwd(), "data")
const SEQUENCE_FILE = path.join(DATA_DIR, "food-sequences.json")

async function getRecentSequence(): Promise<string[]> {
  try {
    const supabase = await createClient()

    const { data: sequences, error } = await supabase
      .from("food_sequences")
      .select("sequence_data")
      .order("created_at", { ascending: false })
      .limit(10)

    if (error) {
      console.error("Error reading sequences:", error)
      return []
    }

    // Extract foods from sequences and get last 10
    const allFoods = sequences?.flatMap((seq: any) => seq.sequence_data?.foods || []) || []
    return allFoods.slice(-10)
  } catch (error) {
    console.error("Error reading sequence:", error)
    return []
  }
}

async function saveToSequence(food: string): Promise<void> {
  try {
    const supabase = await createClient()

    const now = new Date()

    // Get recent sequence within 30 minutes
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000)
    const { data: recentSequences } = await supabase
      .from("food_sequences")
      .select("*")
      .gte("created_at", thirtyMinutesAgo.toISOString())
      .order("created_at", { ascending: false })
      .limit(1)

    if (recentSequences && recentSequences.length > 0) {
      // Update existing sequence
      const currentSequence = recentSequences[0]
      const updatedFoods = [...(currentSequence.sequence_data?.foods || []), food]

      await supabase
        .from("food_sequences")
        .update({
          sequence_data: {
            ...currentSequence.sequence_data,
            foods: updatedFoods,
            lastUpdated: now.toISOString(),
          },
        })
        .eq("id", currentSequence.id)
    } else {
      // Create new sequence
      await supabase.from("food_sequences").insert({
        sequence_data: {
          foods: [food],
          timestamp: now.toISOString(),
          lastUpdated: now.toISOString(),
        },
      })
    }
  } catch (error) {
    console.error("Error saving sequence:", error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { food } = await request.json()

    if (!food) {
      return NextResponse.json({ error: "Food parameter is required" }, { status: 400 })
    }

    // Get recent sequence for context-aware predictions
    const recentSequence = await getRecentSequence()

    // Generate AI predictions
    const predictions = await predictionEngine.predict(food, recentSequence)

    // Save this selection to sequence for future learning
    await saveToSequence(food)

    // Get model performance metrics
    const modelAccuracy = predictionEngine.getModelAccuracy()

    return NextResponse.json({
      selectedFood: food,
      predictions,
      metadata: {
        modelAccuracy: Math.round(modelAccuracy * 100),
        sequenceLength: recentSequence.length,
        timestamp: new Date().toISOString(),
        contextUsed: recentSequence.length > 0,
      },
    })
  } catch (error) {
    console.error("Prediction error:", error)
    return NextResponse.json(
      {
        error: "Prediction failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    const recentSequence = await getRecentSequence()
    const modelAccuracy = predictionEngine.getModelAccuracy()

    return NextResponse.json({
      modelStats: {
        accuracy: Math.round(modelAccuracy * 100),
        sequenceLength: recentSequence.length,
        recentFoods: recentSequence.slice(-5),
        status: "active",
      },
    })
  } catch (error) {
    console.error("Stats error:", error)
    return NextResponse.json({ error: "Failed to get stats" }, { status: 500 })
  }
}
