// clsxとtailwind-mergeを使用してクラス名を結合するユーティリティ関数
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * 複数のクラス名を結合するヘルパー関数
 * @param inputs - 結合したいクラス名の配列
 * @returns 結合された最適化されたクラス名文字列
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
