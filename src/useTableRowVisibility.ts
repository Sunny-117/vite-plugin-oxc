import { useCallback, useEffect, useRef } from 'react'

interface ViewedCountInfo {
  viewedCount: number // 累计查看的行数
  incrementCount: number // 相比上次增加的行数
  pageNo: number // 当前页码
}

interface UseTableRowVisibilityOptions {
  pageNo: number
  enabled?: boolean
  onReport?: (info: ViewedCountInfo) => void // 上报回调函数
}

/**
 * 使用 IntersectionObserver 监听表格行的可见性
 * 统计实际进入视口的行数并通过回调上报
 */
export function useTableRowVisibility(options: UseTableRowVisibilityOptions) {
  const {
    pageNo,
    enabled = true,
    onReport,
  } = options

  // 存储已经展现过的行的关键词
  const viewedRowsRef = useRef<Set<string>>(new Set())
  // 存储 IntersectionObserver 实例
  const observerRef = useRef<IntersectionObserver | null>(null)
  // 存储上次上报的时间戳，用于防抖
  const lastReportTimeRef = useRef<number>(0)
  // 存储定时器
  const reportTimerRef = useRef<NodeJS.Timeout | null>(null)
  // 存储上次上报的数量，用于计算增量
  const lastReportedCountRef = useRef<number>(0)

  // 上报函数（带防抖）
  const reportViewedCount = useCallback(() => {
    const viewedCount = viewedRowsRef.current.size
    if (viewedCount > 0 && onReport) {
      // 计算增量：当前数量 - 上次上报的数量
      const incrementCount = viewedCount - lastReportedCountRef.current

      // 调用外部传入的上报函数
      onReport({
        viewedCount,
        incrementCount,
        pageNo,
      })

      // 更新上次上报的数量
      lastReportedCountRef.current = viewedCount
      lastReportTimeRef.current = Date.now()
    }
  }, [pageNo, onReport])

  // 延迟上报（500ms 后上报，避免频繁上报）
  const scheduleReport = useCallback(() => {
    if (reportTimerRef.current) {
      clearTimeout(reportTimerRef.current)
    }
    reportTimerRef.current = setTimeout(() => {
      reportViewedCount()
    }, 500)
  }, [reportViewedCount])

  // 初始化 IntersectionObserver
  useEffect(() => {
    if (!enabled) {
      return
    }

    // 创建 observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        let hasNewView = false
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const rowKey = entry.target.getAttribute('data-row-key')
            if (rowKey && !viewedRowsRef.current.has(rowKey)) {
              viewedRowsRef.current.add(rowKey)
              hasNewView = true
            }
          }
        })

        // 如果有新的行进入视口，触发延迟上报
        if (hasNewView) {
          scheduleReport()
        }
      },
      {
        root: null, // 使用视口作为根元素
        rootMargin: '0px',
        threshold: 0.5, // 当行的 50% 可见时触发
      },
    )

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
      if (reportTimerRef.current) {
        clearTimeout(reportTimerRef.current)
      }
    }
  }, [enabled, scheduleReport])

  // 页面变化时清空已查看的记录并上报
  useEffect(() => {
    if (viewedRowsRef.current.size > 0) {
      reportViewedCount()
      viewedRowsRef.current.clear()
      // 重置上次上报的数量
      lastReportedCountRef.current = 0
    }
  }, [pageNo, reportViewedCount])

  // 观察表格行
  const observeRow = useCallback((element: HTMLElement | null) => {
    if (!element || !observerRef.current) {
      return
    }
    observerRef.current.observe(element)
  }, [])

  // 取消观察表格行
  const unobserveRow = useCallback((element: HTMLElement | null) => {
    if (!element || !observerRef.current) {
      return
    }
    observerRef.current.unobserve(element)
  }, [])

  return {
    observeRow,
    unobserveRow,
    viewedCount: viewedRowsRef.current.size,
  }
}
