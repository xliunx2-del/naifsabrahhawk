import { type NextRequest, NextResponse } from "next/server"
import { predictionEngine } from "@/lib/ai-prediction-engine"
import { readFile, writeFile, mkdir } from "fs/promises"
import { existsSync } from "fs"
import path from "path"

const DATA_DIR = path.join(process.cwd(), "data")
const SEQUENCE_FILE = path.join(DATA_DIR, "food-sequences.json")

export async function POST(request: NextRequest) {
  try {
    const { sequence, feedback } = await request.json()

    if (!sequence || !Array.isArray(sequence)) {
      return NextResponse.json({ error: "Valid sequence array is required" }, { status: 400 })
    }

    // Ensure data directory exists
    if (!existsSync(DATA_DIR)) {
      await mkdir(DATA_DIR, { recursive: true })
    }

    // Learn from the provided sequence
    const foodSequence = {
      foods: sequence,
      timestamp: new Date().toISOString(),
    }

    predictionEngine.learnFromSequence(foodSequence)

    // Save the sequence for future reference
    let sequences = []
    try {
      if (existsSync(SEQUENCE_FILE)) {
        const fileContent = await readFile(SEQUENCE_FILE, "utf-8")
        sequences = JSON.parse(fileContent)
      }
    } catch (error) {
      console.log("Creating new sequence file")
    }

    sequences.push({
      ...foodSequence,
      id: Date.now(),
      feedback: feedback || null,
      learned: true,
    })

    // Keep only last 100 sequences
    if (sequences.length > 100) {
      sequences = sequences.slice(-100)
    }

    await writeFile(SEQUENCE_FILE, JSON.stringify(sequences, null, 2))

    const newAccuracy = predictionEngine.getModelAccuracy()

    return NextResponse.json({
      success: true,
      message: "Model updated successfully",
      newAccuracy: Math.round(newAccuracy * 100),
      sequenceLength: sequence.length,
    })
  } catch (error) {
    console.error("Learning error:", error)
    return NextResponse.json(
      {
        error: "Learning failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
