import { useEffect } from 'react'

interface TableRowData {
  keyword: string
  [key: string]: any
}

interface UseTableRowObserverOptions<T extends TableRowData> {
  /** 表格数据列表 */
  dataList: T[]
  /** 当前页码 */
  pageNo: number
  /** 每页数量 */
  pageSize: number
  /** 观察行的回调函数 */
  observeRow: (element: HTMLElement) => void
  /** 取消观察行的回调函数 */
  unobserveRow: (element: HTMLElement) => void
  /** 表格行选择器，默认为 '.one-ai-table-tbody tr' */
  rowSelector?: string
  /** 延迟时间（ms），确保 Table 已经渲染完成，默认 100ms */
  delay?: number
}

/**
 * 监听表格行的可见性
 * 自动为表格行添加 data-row-key 属性并设置 IntersectionObserver
 */
export function useTableRowObserver<T extends TableRowData>(
  containerRef: React.RefObject<HTMLElement>,
  options: UseTableRowObserverOptions<T>,
) {
  const {
    dataList,
    pageNo,
    pageSize,
    observeRow,
    unobserveRow,
    rowSelector = '.new-keyword-generator .one-access-table-tbody tr',
    delay = 100,
  } = options

  useEffect(() => {
    if (!containerRef.current || !dataList.length) {
      return
    }

    // 延迟执行，确保 Table 已经渲染完成
    const timer = setTimeout(() => {
      const tableContainer = containerRef.current
      if (!tableContainer) {
        return
      }

      // 查找所有表格行
      const rows = tableContainer.querySelectorAll(rowSelector)

      // 获取当前页的数据
      const currentPageData = dataList.slice((pageNo - 1) * pageSize, pageNo * pageSize)

      rows.forEach((row, index) => {
        const rowElement = row as HTMLElement
        // 从当前页数据中获取对应的关键词
        const rowData = currentPageData[index]
        if (rowData && rowData.keyword) {
          // 为每一行添加 data-row-key 属性，使用关键词作为唯一标识
          rowElement.setAttribute('data-row-key', rowData.keyword)
          observeRow(rowElement)
        }
      })
    }, delay)

    return () => {
      clearTimeout(timer)
      // 清理所有观察
      if (containerRef.current) {
        const rows = containerRef.current.querySelectorAll(rowSelector)
        rows.forEach((row) => {
          unobserveRow(row as HTMLElement)
        })
      }
    }
  }, [containerRef, dataList, pageNo, pageSize, observeRow, unobserveRow, rowSelector, delay])
}
