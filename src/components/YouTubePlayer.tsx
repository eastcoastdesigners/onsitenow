import { useEffect, useRef, useState, useCallback } from 'react'
import { ExternalLink, PlayCircle, Loader } from 'lucide-react'

interface YouTubePlayerProps {
  videoId: string
  searchQuery: string
  taskTitle: string
  onPlay?: () => void
  onPause?: () => void
  onEnded?: (durationSeconds: number) => void
}

// YouTube IFrame API sends postMessage events with this shape
interface YTMessage {
  event?: string
  info?: number | Record<string, unknown>
}

export default function YouTubePlayer({
  videoId,
  searchQuery,
  taskTitle,
  onPlay,
  onPause,
  onEnded,
}: YouTubePlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [loadError, setLoadError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const watchStartRef = useRef<number | null>(null)
  const totalWatchedRef = useRef(0)

  const handleMessage = useCallback((event: MessageEvent) => {
    if (event.origin !== 'https://www.youtube.com') return
    try {
      const data: YTMessage = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
      if (data.event !== 'onStateChange') return

      const state = data.info as number
      if (state === 1) {
        // Playing
        watchStartRef.current = Date.now()
        setIsPlaying(true)
        onPlay?.()
      } else if (state === 2 || state === 0) {
        // Paused (2) or Ended (0)
        if (watchStartRef.current) {
          const elapsed = Math.round((Date.now() - watchStartRef.current) / 1000)
          totalWatchedRef.current += elapsed
          watchStartRef.current = null
        }
        setIsPlaying(false)
        if (state === 0) {
          onEnded?.(totalWatchedRef.current)
          totalWatchedRef.current = 0
        } else {
          onPause?.()
        }
      }
    } catch {
      // Non-YT message, ignore
    }
  }, [onPlay, onPause, onEnded])

  useEffect(() => {
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [handleMessage])

  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`
  const embedUrl = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}&rel=0&modestbranding=1`

  if (loadError) {
    return (
      <div className="rounded-2xl overflow-hidden border border-gray-200 bg-gray-50">
        <div className="aspect-video flex flex-col items-center justify-center gap-3 text-gray-400 p-6">
          <PlayCircle size={48} className="opacity-30" />
          <p className="text-sm font-medium text-center">Video unavailable in-app</p>
          <p className="text-xs text-center text-gray-400">"{taskTitle}"</p>
          <a
            href={searchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors"
          >
            <ExternalLink size={14} />
            Search on YouTube
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 bg-black">
      <div className="relative aspect-video">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <Loader size={28} className="text-white animate-spin opacity-50" />
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={embedUrl}
          title={taskTitle}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
          onLoad={() => setIsLoading(false)}
          onError={() => { setLoadError(true); setIsLoading(false) }}
        />
      </div>

      <div className="flex items-center justify-between px-3 py-2 bg-gray-900">
        {isPlaying ? (
          <span className="flex items-center gap-1.5 text-xs text-yellow-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            Timer paused while watching
          </span>
        ) : (
          <span className="text-xs text-gray-400">How-to tutorial</span>
        )}
        <a
          href={searchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
        >
          <ExternalLink size={11} />
          YouTube
        </a>
      </div>
    </div>
  )
}
