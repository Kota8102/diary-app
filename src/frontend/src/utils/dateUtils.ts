import dayjs from 'dayjs'

/**
 * 今日の日付を取得する
 * @returns YYYY-MM-DD形式の日付文字列
 */

export const getToday = (): string => {
  // 現在の日付を取得
  const today = new Date()
  // 年を取得
  const year = today.getFullYear()
  // 月を取得(0から始まるため+1し、2桁になるよう0埋め)
  const month = `0${today.getMonth() + 1}`.slice(-2)
  // 日を取得(2桁になるよう0埋め)
  const day = `0${today.getDate()}`.slice(-2)
  // YYYY-MM-DD形式の文字列を返す
  return `${year}-${month}-${day}`
}

/**
 * 前日の日付を取得する
 * @param date - YYYY-MM-DD形式の日付文字列
 * @returns YYYY-MM-DD形式の日付文字列
 */
export const getPreviousDate = (date: string): string => {
  return dayjs(date).subtract(1, 'day').format('YYYY-MM-DD')
}

/**
 * 翌日の日付を取得する
 * @param date - YYYY-MM-DD形式の日付文字列
 * @returns YYYY-MM-DD形式の日付文字列
 */
export const getNextDate = (date: string): string => {
  return dayjs(date).add(1, 'day').format('YYYY-MM-DD')
}
