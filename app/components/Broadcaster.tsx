"use client"

import { useEffect, useRef, useState } from "react"

type BroadcasterProps = {
  whipUrl: string
  onStop?: () => void
}

export default function Broadcaster({ whipUrl, onStop }: BroadcasterProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const pcRef = useRef<RTCPeerConnection | null>(null)
  const attemptedAutoStartRef = useRef<string | null>(null)
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const tuneOpusSdp = (sdp: string): string => {
    const lines = sdp.split("\r\n")
    const opusRtpMap = lines.find((line) => /^a=rtpmap:(\d+)\s+opus\/48000\/2$/i.test(line))
    if (!opusRtpMap) return sdp

    const payloadType = opusRtpMap.match(/^a=rtpmap:(\d+)/i)?.[1]
    if (!payloadType) return sdp

    const fmtpPrefix = `a=fmtp:${payloadType} `
    const fmtpIndex = lines.findIndex((line) => line.startsWith(fmtpPrefix))
    const desiredParams: Record<string, string> = {
      minptime: "10",
      ptime: "20",
      maxaveragebitrate: "64000",
      useinbandfec: "1",
      usedtx: "0",
      stereo: "0",
    }

    if (fmtpIndex >= 0) {
      const existing = lines[fmtpIndex].slice(fmtpPrefix.length).trim()
      const merged = existing.split(";").reduce<Record<string, string>>((acc, item) => {
        const [rawKey, rawValue] = item.split("=")
        const key = rawKey?.trim()
        const value = rawValue?.trim()
        if (key && value) acc[key] = value
        return acc
      }, {})
      Object.assign(merged, desiredParams)
      const mergedLine = Object.entries(merged)
        .map(([key, value]) => `${key}=${value}`)
        .join(";")
      lines[fmtpIndex] = `${fmtpPrefix}${mergedLine}`
    } else {
      const insertAfter = lines.findIndex((line) => line.startsWith(`a=rtpmap:${payloadType} `))
      const fmtpLine = `${fmtpPrefix}${Object.entries(desiredParams)
        .map(([key, value]) => `${key}=${value}`)
        .join(";")}`
      if (insertAfter >= 0) {
        lines.splice(insertAfter + 1, 0, fmtpLine)
      } else {
        lines.push(fmtpLine)
      }
    }

    return lines.join("\r\n")
  }

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

      const audioConstraints: MediaTrackConstraints & Record<string, unknown> = {
        echoCancellation: { ideal: true },
        noiseSuppression: { ideal: false },
        autoGainControl: { ideal: false },
        channelCount: { ideal: 1 },
        sampleRate: { ideal: 48000 },
        sampleSize: { ideal: 16 },
        latency: { ideal: 0.01 },
      }

      // Chromium-only legacy constraints. Non-chromium browsers simply ignore these keys.
      if (typeof navigator !== "undefined" && /Chrome|Chromium|Edg\//.test(navigator.userAgent)) {
        audioConstraints.googEchoCancellation = true
        audioConstraints.googNoiseSuppression = false
        audioConstraints.googAutoGainControl = false
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: audioConstraints,
      })
      if (videoRef.current) videoRef.current.srcObject = stream

      const pc = new RTCPeerConnection()
      pcRef.current = pc

      stream.getTracks().forEach((track) => {
        if (track.kind === "audio") {
          track.contentHint = "speech"
          if (process.env.NODE_ENV !== "production") {
            console.info("[WHIP][audio settings]", track.getSettings())
          }
        }
        pc.addTrack(track, stream)
      })

      const audioSender = pc.getSenders().find((sender) => sender.track?.kind === "audio")
      if (audioSender) {
        const params = audioSender.getParameters()
        params.encodings = params.encodings?.length ? params.encodings : [{}]
        params.encodings[0].maxBitrate = 64000
        await audioSender.setParameters(params)
      }

      const offer = await pc.createOffer()
      offer.sdp = offer.sdp ? tuneOpusSdp(offer.sdp) : offer.sdp
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
    if (!whipUrl) return
    if (attemptedAutoStartRef.current === whipUrl) return

    attemptedAutoStartRef.current = whipUrl
    void start()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [whipUrl])

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
