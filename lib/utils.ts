import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ฟังก์ชันย่อที่อยู่กระเป๋า
export function formatAddress(address: string): string {
  if (!address) return ""
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// ฟังก์ชันสุ่มตัวเลข
export function randomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// ฟังก์ชันสุ่มสี
export function randomColor(): string {
  const colors = ["red", "blue", "green", "yellow", "purple", "pink", "orange"]
  return colors[Math.floor(Math.random() * colors.length)]
}

// ฟังก์ชันหน่วงเวลา
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ฟังก์ชันจัดการข้อผิดพลาด
export function handleError(error: unknown): string {
  if (error instanceof Error) return error.message
  return String(error)
}

// ฟังก์ชันตรวจสอบว่าเป็น URL หรือไม่
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

