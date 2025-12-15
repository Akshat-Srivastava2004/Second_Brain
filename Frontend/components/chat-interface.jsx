"use client"

import { useState, useRef, useEffect } from "react"
import { Brain, Upload, Paperclip, Send, X, FileText, Video, Music } from "lucide-react"
export function ChatInterface() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! I'm Second Brain, your intelligent assistant. Upload a video, audio, or PDF, and I'll help you understand, analyze, and extract insights from your content.",
    },
  ])
  const [input, setInput] = useState("")
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef(null)
  const messagesEndRef = useRef(null)

  const BACKEND_CHAT_URL = "https://second-brain-backend-1bb9.onrender.com/api/chat"
  const BACKEND_QUERY_URL = "https://second-brain-backend-1bb9.onrender.com/api/chat/query"

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files)
    const validFiles = files.filter(
      (file) => file.type === "application/pdf" || file.type.startsWith("video/") || file.type.startsWith("audio/"),
    )

    if (validFiles.length === 0) {
      e.target.value = null
      return
    }

    for (const file of validFiles) {
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content: `Uploading: ${file.name}...`,
        },
      ])

      setIsLoading(true)

      try {
        const formData = new FormData()
        formData.append("file", file)

        console.log("[v0] Uploading file to backend:", file.name)

        const response = await fetch(BACKEND_CHAT_URL, {
          method: "POST",
          body: formData,
        })

        console.log("[v0] Backend response status:", response.status)

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`)
        }

        const data = await response.json()
        console.log("[v0] Backend response data:", data)

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.message || `Successfully processed ${file.name}. You can now ask questions about it!`,
          },
        ])

        setUploadedFiles((prev) => [...prev, file])
      } catch (error) {
        console.error("[v0] Upload error:", error)
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Failed to upload ${file.name}: ${error.message}. Please make sure your backend is running on ${BACKEND_CHAT_URL}`,
          },
        ])
      } finally {
        setIsLoading(false)
      }
    }

    e.target.value = null
  }

  const removeFile = (index) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = {
      role: "user",
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const hasFiles = uploadedFiles.length > 0
      const endpoint = hasFiles ? BACKEND_CHAT_URL : BACKEND_QUERY_URL

      console.log(`[v0] Sending message to ${hasFiles ? "/api/chat" : "/api/chat/query"} endpoint`)

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: input,
          ...(hasFiles && { files: uploadedFiles.map((f) => ({ name: f.name, type: f.type })) }),
        }),
      })

      console.log("[v0] Response status:", response.status)

      if (!response.ok) {
        throw new Error(`Request failed: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("[v0] Response data:", data)

     setMessages((prev) => [
  ...prev,
  {
    role: "assistant",
    content: data.answer,     // 👈 THIS IS MAIN FIX
    sources: data.sources     // 👈 sources bhi attach
  },
])
    } catch (error) {
      console.error("[v0] Request error:", error)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Error: ${error.message}. Make sure your backend is running.`,
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const getFileIcon = (file) => {
    if (file.type === "application/pdf") {
      return <FileText className="h-4 w-4" />
    }
    if (file.type.startsWith("video/")) {
      return <Video className="h-4 w-4" />
    }
    if (file.type.startsWith("audio/")) {
      return <Music className="h-4 w-4" />
    }
    return <Paperclip className="h-4 w-4" />
  }

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      {/* Header */}
      <header className="border-b border-purple-100 bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 shadow-lg">
              <Brain className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 text-balance">Second Brain</h1>
              <p className="text-sm text-gray-600">Your AI Knowledge Assistant</p>
            </div>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 rounded-lg border border-purple-200 bg-white px-4 py-2 text-sm font-medium text-purple-700 transition-all hover:bg-purple-50 hover:border-purple-300"
          >
            <Upload className="h-4 w-4" />
            Upload Files
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,video/*,audio/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </header>

      {/* Uploaded Files Bar */}
      {uploadedFiles.length > 0 && (
        <div className="border-b border-purple-100 bg-purple-50/50 backdrop-blur-sm">
          <div className="mx-auto max-w-5xl px-6 py-3">
            <div className="flex flex-wrap gap-2">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 rounded-lg bg-white border border-purple-200 px-3 py-2 shadow-sm"
                >
                  <span className="text-purple-600">{getFileIcon(file)}</span>
                  <span className="max-w-[150px] truncate text-sm font-medium text-gray-700">{file.name}</span>
                  <button
                    onClick={() => removeFile(index)}
                    className="ml-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

 {/* Chat Messages */}
<div className="flex-1 overflow-y-auto">
  <div className="mx-auto max-w-5xl px-6 py-8">
    <div className="space-y-6">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex gap-4 ${
            message.role === "user" ? "justify-end" : "justify-start"
          }`}
        >
          {/* Assistant Avatar */}
          {message.role === "assistant" && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 shadow-md">
              <Brain className="h-6 w-6 text-white" />
            </div>
          )}

          {/* Message Bubble */}
          <div
            className={`max-w-[75%] rounded-2xl px-5 py-3 shadow-md ${
              message.role === "user"
                ? "bg-gradient-to-br from-purple-600 to-indigo-600 text-white"
                : "bg-white text-gray-800 border border-gray-200"
            }`}
          >
            {/* ✅ MAIN MESSAGE (multiline support) */}
            <div
              className="text-sm leading-relaxed whitespace-pre-wrap"
            >
              {message.content}
            </div>

            {/* 📄 SOURCE FROM DOCUMENT (RAG) */}
            {message.role === "assistant" &&
              message.sources &&
              message.sources.length > 0 && (
                <div className="mt-4 rounded-xl bg-gray-50 border border-gray-200 p-3">
                  <div className="mb-1 text-xs font-semibold text-gray-500">
                    📄 Source from document
                  </div>
                  <div className="text-xs text-gray-700 whitespace-pre-wrap">
                    {message.sources[0].text.slice(0, 2000)}...
                  </div>
                </div>
              )}

            {/* Uploaded files (user side) */}
            {message.files && message.files.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {message.files.map((file, fileIndex) => (
                  <div
                    key={fileIndex}
                    className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs ${
                      message.role === "user"
                        ? "bg-white/20 text-white"
                        : "bg-purple-50 text-purple-700"
                    }`}
                  >
                    {getFileIcon(file)}
                    <span className="max-w-[120px] truncate font-medium">
                      {file.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User Avatar */}
          {message.role === "user" && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-md">
              <span className="text-sm font-bold text-white">You</span>
            </div>
          )}
        </div>
      ))}

      {/* Loading animation */}
      {isLoading && (
        <div className="flex gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 shadow-md">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div className="rounded-2xl bg-white border border-gray-200 px-5 py-4 shadow-md">
            <div className="flex gap-1.5">
              <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-purple-600 [animation-delay:-0.3s]" />
              <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-purple-600 [animation-delay:-0.15s]" />
              <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-purple-600" />
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  </div>
</div>


      {/* Input Area */}
      <div className="border-t border-purple-100 bg-white/80 backdrop-blur-sm shadow-lg">
        <div className="mx-auto max-w-5xl px-6 py-5">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="shrink-0 flex h-11 w-11 items-center justify-center rounded-xl text-purple-600 transition-all hover:bg-purple-50"
            >
              <Paperclip className="h-5 w-5" />
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about your files..."
              className="flex-1 rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-500 outline-none transition-all focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-200"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="shrink-0 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
          <p className="mt-3 text-center text-xs text-gray-500">
            Upload PDFs, videos, and audio files to unlock Second Brain's full potential
          </p>
        </div>
      </div>
    </div>
  )
}
