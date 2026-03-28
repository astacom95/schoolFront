"use client"

import { useEffect, useRef } from "react"

type FlvPlayerProps = {
  url: string
  className?: string
  controls?: boolean
}

export default function FlvPlayer({ url, className, controls = true }: FlvPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    let destroyed = false
    let flvPlayer: any = null

    const run = async () => {
      if (!videoRef.current) return
      const flvModule = await import("flv.js")
      if (destroyed || !videoRef.current) return
      if (!flvModule.default.isSupported()) return

      flvPlayer = flvModule.default.createPlayer({
        type: "flv",
        url,
      })

      flvPlayer.attachMediaElement(videoRef.current)
      flvPlayer.load()
      await Promise.resolve(flvPlayer.play()).catch(() => undefined)
    }

    void run()

    return () => {
      destroyed = true
      if (flvPlayer) {
        flvPlayer.unload()
        flvPlayer.detachMediaElement()
        flvPlayer.destroy()
      }
    }
  }, [url])

  return <video ref={videoRef} className={className} controls={controls} playsInline />
}
