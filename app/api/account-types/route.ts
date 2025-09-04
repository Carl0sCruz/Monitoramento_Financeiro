import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: accountTypes, error } = await supabase
      .from("tipos_conta")
      .select("*")
      .order("nome", { ascending: true })

    if (error) {
      console.error("Error fetching account types:", error)
      return NextResponse.json({ error: "Failed to fetch account types" }, { status: 500 })
    }

    return NextResponse.json({ accountTypes })
  } catch (error) {
    console.error("Error in GET /api/account-types:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
