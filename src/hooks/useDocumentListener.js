import { useEffect } from 'react'

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
      window.removeEventListener(name, fn)
    }
  }, deps)
}
