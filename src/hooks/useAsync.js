import { useCallback, useState } from 'react'

export default function useAsync(initialData = null) {
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const run = useCallback(async (asyncFunction) => {
    setLoading(true)
    setError('')
    try {
      const result = await asyncFunction()
      setData(result)
      return result
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi xử lý yêu cầu.'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { data, setData, loading, error, setError, run }
}
