"use client"

import { useEffect, useRef, useState } from "react"

type BroadcasterProps = {
  whipUrl: string
  onStop?: () => void
}

export default function Broadcaster({ whipUrl, onStop }: BroadcasterProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const pcRef = useRef<RTCPeerConnection | null>(null)
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cleanup = () => {
    const pc = pcRef.current
    pcRef.current = null

    if (pc) {
      pc.getSenders().forEach((sender) => sender.track?.stop())
      pc.close()
    }
    if (videoRef.current?.srcObject) {
      ;(videoRef.current.srcObject as MediaStream).getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
  }

  const start = async () => {
    try {
      setError(null)
      setPublishing(true)

      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      if (videoRef.current) videoRef.current.srcObject = stream

      const pc = new RTCPeerConnection()
      pcRef.current = pc

      stream.getTracks().forEach((track) => pc.addTrack(track, stream))

      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      const res = await fetch(whipUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/sdp",
        },
        body: offer.sdp,
      })

      if (!res.ok) {
        throw new Error(`WHIP publish failed: ${res.status}`)
      }

      const answerSdp = await res.text()
      await pc.setRemoteDescription({ type: "answer", sdp: answerSdp })
    } catch (err) {
      const message = err instanceof Error ? err.message : "تعذر بدء البث."
      setError(message)
      setPublishing(false)
      cleanup()
    }
  }

  const stop = async () => {
    setPublishing(false)
    cleanup()
    onStop?.()
  }

  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [])

  return (
    <div className="grid gap-3">
      <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-xl" />
      {error ? <div className="text-sm text-red-600">{error}</div> : null}
      {!publishing ? (
        <button
          type="button"
          onClick={start}
          className="inline-flex h-9 items-center justify-center rounded-lg bg-[var(--color-sidebar-bg)] px-4 text-sm font-medium text-white hover:opacity-90"
        >
          بدء البث من المتصفح
        </button>
      ) : (
        <button
          type="button"
          onClick={stop}
          className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          إيقاف البث
        </button>
      )}
    </div>
  )
}
