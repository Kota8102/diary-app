import dayjs from 'dayjs'

/**
 * 週の開始日と終了日を計算する
 * @param date YYYY-MM-DD形式の日付文字列
 * @returns 週の開始日、終了日、表示用ラベル
 */
export const getWeekRange = (date: string) => {
  const currentDate = dayjs(date)
  const dayOfWeek = currentDate.day() // 0: 日曜日, 1: 月曜日, ...
  const startDate = currentDate.subtract(dayOfWeek, 'day')
  const endDate = startDate.add(6, 'day')

  return {
    startDate: startDate.format('YYYY-MM-DD'),
    endDate: endDate.format('YYYY-MM-DD'),
    weekLabel: `${startDate.format('MMM.D')}~${endDate.format('D')}`,
  }
}

/**
 * 前の週の日付を取得する
 * @param date YYYY-MM-DD形式の日付文字列
 * @returns YYYY-MM-DD形式の日付文字列
 */
export const getPreviousWeek = (date: string) => {
  return dayjs(date).subtract(7, 'day').format('YYYY-MM-DD')
}

/**
 * 次の週の日付を取得する
 * @param date YYYY-MM-DD形式の日付文字列
 * @returns YYYY-MM-DD形式の日付文字列
 */
export const getNextWeek = (date: string) => {
  return dayjs(date).add(7, 'day').format('YYYY-MM-DD')
}
