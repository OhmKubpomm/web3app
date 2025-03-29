"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // ตรวจสอบว่าอยู่ใน client side
  useEffect(() => {
    setMounted(true);
  }, []);

  // ถ้ายังไม่ mount ให้แสดง placeholder เพื่อป้องกัน hydration error
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="w-9 px-0">
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  // ฟังก์ชันเปลี่ยนธีม
  const toggleTheme = () => {
    // เปลี่ยนธีมและบันทึกลง localStorage
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);

    // เพิ่ม/ลบ class 'dark' จาก document.documentElement
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="w-9 px-0"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
