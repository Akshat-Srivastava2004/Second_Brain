import { NextResponse } from "next/server"

export async function POST(request) {
  try {
    const formData = await request.formData()

    const message = formData.get("message")
    const files = formData.getAll("files") // array of File objects

    // Backend ko bhejna (Node / Express)
    const response = await fetch("http://localhost:5000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        files: files.map(f => ({
          name: f.name,
          type: f.type,
          size: f.size,
        })),
      }),
    })

    const data = await response.json()
    console.log("the daya is ",data)

    return NextResponse.json({
      content: data.response || "Response received successfully",
    })

  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    )
  }
}
