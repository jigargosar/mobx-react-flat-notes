import { useEffect, useState } from 'react'

export function useDocumentListener(name, fn, deps = []) {
  useEffect(() => {
    document.addEventListener(name, fn)

    return () => {
      document.removeEventListener(name, fn)
    }
  }, deps)
}

export function useWindowListener(name, fn, deps = []) {
  useEffect(() => {
    window.addEventListener(name, fn)

    return () => {
      debugger
      window.removeEventListener(name, fn)
    }
  }, deps)
}

export function useWindowSize() {
  const [size, setSize] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }))
  useWindowListener('resize', () => {
    setSize({ width: window.innerWidth, height: window.innerHeight })
  })
  return size
}
