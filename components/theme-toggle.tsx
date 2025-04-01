"use client";

import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { toast } from "sonner";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  // ใช้ useEffect เพื่อให้แน่ใจว่าโค้ดทำงานเฉพาะบนฝั่ง client
  useEffect(() => {
    setMounted(true);
  }, []);

  // ฟังก์ชันสำหรับสลับธีม
  const toggleTheme = () => {
    try {
      // ตรวจสอบธีมปัจจุบันและสลับไปยังธีมตรงข้าม
      const newTheme = resolvedTheme === "dark" ? "light" : "dark";
      setTheme(newTheme);

      // เพิ่ม log เพื่อตรวจสอบการเปลี่ยนธีม
      console.log(`Theme changed to: ${newTheme}`);
    } catch (error) {
      console.error("Error toggling theme:", error);
      toast.error("ไม่สามารถเปลี่ยนธีมได้", {
        description: "เกิดข้อผิดพลาดในการเปลี่ยนธีม กรุณาลองใหม่อีกครั้ง",
      });
    }
  };

  // ถ้ายังไม่ได้ mount ให้แสดงปุ่มที่ไม่มีการทำงาน
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="opacity-50" disabled>
        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme}>
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
