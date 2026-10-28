import { useState, useCallback, useRef, useEffect } from 'react'

export interface UseClipboardResult {
  copy: (text: string) => Promise<void>
  copied: boolean
  error: string | null
}

/**
 * Custom hook to copy text to clipboard with fallback and auto-reset.
 */
export function useClipboard(timeout = 2000): UseClipboardResult {
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  const copy = useCallback(
    async (text: string): Promise<void> => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }

      setError(null)

      try {
        if (navigator?.clipboard?.writeText) {
          await navigator.clipboard.writeText(text)
          setCopied(true)
        } else {
          // Graceful fallback for non-secure contexts or legacy browsers
          const textArea = document.createElement('textarea')
          textArea.value = text
          textArea.style.position = 'fixed'
          textArea.style.left = '-999999px'
          textArea.style.top = '-999999px'
          document.body.appendChild(textArea)
          textArea.focus()
          textArea.select()

          const successful = document.execCommand('copy')
          document.body.removeChild(textArea)

          if (!successful) {
            throw new Error('Fallback clipboard copy failed')
          }
          setCopied(true)
        }

        timerRef.current = setTimeout(() => {
          setCopied(false)
        }, timeout)
      } catch (err) {
        setCopied(false)
        const message = err instanceof Error ? err.message : 'Failed to copy to clipboard'
        setError(message)
      }
    },
    [timeout]
  )

  return { copy, copied, error }
}

export default useClipboard
