import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { selectedFood, predictions, timestamp, metadata } = await request.json()

    const supabase = await createClient()

    // Add new result to database
    const newResult = {
      selected_food: selectedFood,
      predictions: predictions,
      accuracy: metadata?.modelAccuracy ? metadata.modelAccuracy / 100 : null,
      created_at: timestamp || new Date().toISOString(),
    }

    const { data, error } = await supabase.from("prediction_results").insert(newResult).select().single()

    if (error) {
      console.error("Database insert error:", error)
      return NextResponse.json({ error: "Failed to save results" }, { status: 500 })
    }

    // Get total count
    const { count } = await supabase.from("prediction_results").select("*", { count: "exact", head: true })

    return NextResponse.json({
      success: true,
      message: "Results saved successfully",
      resultId: data.id,
      totalResults: count || 0,
    })
  } catch (error) {
    console.error("Save error:", error)
    return NextResponse.json({ error: "Failed to save results" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: results, error } = await supabase
      .from("prediction_results")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100)

    if (error) {
      console.error("Database read error:", error)
      return NextResponse.json({ error: "Failed to read results" }, { status: 500 })
    }

    // Add statistics
    const uniqueFoods = [...new Set(results?.map((r: any) => r.selected_food) || [])]
    const stats = {
      totalResults: results?.length || 0,
      uniqueFoods: uniqueFoods.length,
      dateRange:
        results && results.length > 0
          ? {
              oldest: results[results.length - 1]?.created_at,
              newest: results[0]?.created_at,
            }
          : null,
    }

    return NextResponse.json({ results: results || [], stats })
  } catch (error) {
    console.error("Read error:", error)
    return NextResponse.json({ error: "Failed to read results" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { id, ids } = body

    const supabase = await createClient()

    if (id) {
      // Delete single result
      const { error } = await supabase.from("prediction_results").delete().eq("id", id)

      if (error) {
        console.error("Delete error:", error)
        return NextResponse.json({ error: "Failed to delete result" }, { status: 500 })
      }
    } else if (ids && Array.isArray(ids)) {
      // Delete multiple results
      const { error } = await supabase.from("prediction_results").delete().in("id", ids)

      if (error) {
        console.error("Bulk delete error:", error)
        return NextResponse.json({ error: "Failed to delete results" }, { status: 500 })
      }
    } else {
      // Delete all results
      const { error } = await supabase
        .from("prediction_results")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000") // Delete all records

      if (error) {
        console.error("Delete all error:", error)
        return NextResponse.json({ error: "Failed to delete all results" }, { status: 500 })
      }
    }

    // Get remaining count
    const { count } = await supabase.from("prediction_results").select("*", { count: "exact", head: true })

    return NextResponse.json({
      success: true,
      message: "Results deleted successfully",
      remainingResults: count || 0,
    })
  } catch (error) {
    console.error("Delete error:", error)
    return NextResponse.json({ error: "Failed to delete results" }, { status: 500 })
  }
}
