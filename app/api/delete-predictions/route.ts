import { NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import { existsSync } from "fs"
import path from "path"

const DATA_DIR = path.join(process.cwd(), "data")
const RESULTS_FILE = path.join(DATA_DIR, "results.json")

export async function DELETE() {
  try {
    // Clear all saved results
    if (existsSync(RESULTS_FILE)) {
      await writeFile(RESULTS_FILE, JSON.stringify([], null, 2))
    }

    return NextResponse.json({
      success: true,
      message: "All predictions deleted successfully",
    })
  } catch (error) {
    console.error("Delete error:", error)
    return NextResponse.json({ error: "Failed to delete predictions" }, { status: 500 })
  }
}
