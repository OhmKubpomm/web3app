"use client";

import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { motion, AnimatePresence } from "framer-motion";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme, theme } = useTheme();
  const { locale } = useI18n();
  const [isAnimating, setIsAnimating] = useState(false);

  // ใช้ useEffect เพื่อให้แน่ใจว่าโค้ดทำงานเฉพาะบนฝั่ง client
  useEffect(() => {
    setMounted(true);
  }, []);

  // ฟังก์ชันสำหรับสลับธีม
  const toggleTheme = () => {
    if (isAnimating) return;

    try {
      setIsAnimating(true);

      // ตรวจสอบธีมปัจจุบันและสลับไปยังธีมตรงข้าม
      const newTheme = resolvedTheme === "dark" ? "light" : "dark";
      setTheme(newTheme);

      // แสดงข้อความแจ้งเตือนเมื่อเปลี่ยนธีมสำเร็จ
      toast.success(
        locale === "th" ? "เปลี่ยนธีมสำเร็จ" : "Theme changed successfully",
        {
          description:
            locale === "th"
              ? `เปลี่ยนเป็นธีม${newTheme === "dark" ? "มืด" : "สว่าง"}แล้ว`
              : `Changed to ${newTheme === "dark" ? "dark" : "light"} theme`,
          position: "top-right",
        }
      );

      // หลังจากเปลี่ยนธีมเสร็จ ให้รอสักครู่แล้วปิดการอนิเมชัน
      setTimeout(() => {
        setIsAnimating(false);
      }, 1000);
    } catch (error) {
      console.error("Error toggling theme:", error);
      toast.error(
        locale === "th" ? "ไม่สามารถเปลี่ยนธีมได้" : "Failed to change theme",
        {
          description:
            locale === "th"
              ? "เกิดข้อผิดพลาดในการเปลี่ยนธีม กรุณาลองใหม่อีกครั้ง"
              : "An error occurred while changing the theme. Please try again.",
          position: "top-right",
        }
      );
      setIsAnimating(false);
    }
  };

  // ถ้ายังไม่ได้ mount ให้แสดงปุ่มที่ไม่มีการทำงาน
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="opacity-50" disabled>
        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">
          {locale === "th" ? "สลับธีม" : "Toggle theme"}
        </span>
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      disabled={isAnimating}
      className={`relative overflow-hidden group ${
        isAnimating ? "animate-pulse" : ""
      }`}
      aria-label={locale === "th" ? "สลับธีม" : "Toggle theme"}
    >
      {/* เอฟเฟกต์พื้นหลังเมื่อ hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* เอฟเฟกต์เมื่อกำลังเปลี่ยนธีม */}
      {isAnimating && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-purple-500/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        />
      )}

      {/* ไอคอนพระอาทิตย์ (โหมดสว่าง) */}
      <Sun
        className={`h-5 w-5 rotate-0 scale-100 transition-all duration-500 dark:-rotate-90 dark:scale-0 ${
          isAnimating ? "text-yellow-400" : ""
        }`}
      />

      {/* ไอคอนพระจันทร์ (โหมดมืด) */}
      <Moon
        className={`absolute h-5 w-5 rotate-90 scale-0 transition-all duration-500 dark:rotate-0 dark:scale-100 ${
          isAnimating ? "text-blue-400" : ""
        }`}
      />

      <span className="sr-only">
        {locale === "th" ? "สลับธีม" : "Toggle theme"}
      </span>
    </Button>
  );
}
