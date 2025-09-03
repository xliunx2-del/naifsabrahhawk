import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { action, sequences, sequence } = await request.json()

    // Check if Supabase is available
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return handleLocalStorage(action, sequences, sequence)
    }

    const supabase = createClient()

    switch (action) {
      case "save_sequence":
        if (!sequence || !Array.isArray(sequence)) {
          return NextResponse.json({ error: "تسلسل غير صحيح" }, { status: 400 })
        }

        const { error: insertError } = await supabase.from("food_sequences").insert({
          sequence: sequence,
          sequence_text: sequence.join(" "),
          created_at: new Date().toISOString(),
        })

        if (insertError) {
          console.error("Supabase insert error:", insertError)
          return NextResponse.json({ error: "حدث خطأ في حفظ التسلسل" }, { status: 500 })
        }

        return NextResponse.json({ success: true, message: "تم حفظ التسلسل بنجاح" })

      case "save_multiple":
        if (!sequences || !Array.isArray(sequences)) {
          return NextResponse.json({ error: "تسلسلات غير صحيحة" }, { status: 400 })
        }

        const sequenceData = sequences.map((seq) => ({
          sequence: seq,
          sequence_text: seq.join(" "),
          created_at: new Date().toISOString(),
        }))

        const { error: batchError } = await supabase.from("food_sequences").insert(sequenceData)

        if (batchError) {
          console.error("Supabase batch insert error:", batchError)
          return NextResponse.json({ error: "حدث خطأ في حفظ التسلسلات" }, { status: 500 })
        }

        return NextResponse.json({
          success: true,
          message: `تم حفظ ${sequences.length} تسلسل بنجاح`,
        })

      case "get_all":
        const { data, error: fetchError } = await supabase
          .from("food_sequences")
          .select("*")
          .order("created_at", { ascending: false })

        if (fetchError) {
          console.error("Supabase fetch error:", fetchError)
          return NextResponse.json({ error: "حدث خطأ في جلب البيانات" }, { status: 500 })
        }

        return NextResponse.json({
          success: true,
          sequences: data || [],
        })

      case "delete_all":
        const { error: deleteError } = await supabase.from("food_sequences").delete().neq("id", 0)

        if (deleteError) {
          console.error("Supabase delete error:", deleteError)
          return NextResponse.json({ error: "حدث خطأ في حذف البيانات" }, { status: 500 })
        }

        return NextResponse.json({ success: true, message: "تم حذف جميع البيانات بنجاح" })

      default:
        return NextResponse.json({ error: "عملية غير مدعومة" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error in data management:", error)
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 })
  }
}

function handleLocalStorage(action: string, sequences?: string[][], sequence?: string[]) {
  // Fallback for when Supabase is not available
  return NextResponse.json({
    success: false,
    error: "قاعدة البيانات غير متاحة، يرجى استخدام التخزين المحلي",
    fallback: true,
  })
}

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        error: "قاعدة البيانات غير متاحة",
        fallback: true,
      })
    }

    const supabase = createClient()
    const { data, error } = await supabase.from("food_sequences").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Supabase fetch error:", error)
      return NextResponse.json({ error: "حدث خطأ في جلب البيانات" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      sequences: data || [],
      count: data?.length || 0,
    })
  } catch (error) {
    console.error("Error fetching sequences:", error)
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 })
  }
}
