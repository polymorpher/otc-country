import { useState, useEffect } from 'react'
import { useBlock } from 'wagmi'

const useBlockTimestamp = (): number | undefined => {
  const { data } = useBlock()

  const [timestamp, setTimestamp] = useState<number>()

  useEffect(() => {
    if (!data) {
      return
    }

    setTimestamp(Number(data.timestamp))

    const timer = setInterval(() => { setTimestamp((prev) => (prev !== undefined ? prev + 1 : undefined)) }, 1000)

    return () => { clearInterval(timer) }
  }, [data])

  return timestamp
}

export default useBlockTimestamp
