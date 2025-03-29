"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check } from "lucide-react";
import { useI18n } from "@/lib/i18n";

// ภาษาที่รองรับ
const LANGUAGES = [
  {
    code: "th",
    name: "ไทย",
    flag: "🇹🇭",
  },
  {
    code: "en",
    name: "English",
    flag: "🇬🇧",
  },
  {
    code: "zh",
    name: "中文",
    flag: "🇨🇳",
  },
  {
    code: "ja",
    name: "日本語",
    flag: "🇯🇵",
  },
];

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [currentLang, setCurrentLang] = useState("th");

  // ตรวจสอบว่าอยู่ใน client side
  useEffect(() => {
    setMounted(true);
    // ตั้งค่าภาษาปัจจุบัน
    setCurrentLang(locale);
  }, [locale]);

  // ฟังก์ชันเปลี่ยนภาษา
  const handleChangeLanguage = (lang: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("locale", lang);
    }
    setLocale(lang);
    setCurrentLang(lang);
    setIsOpen(false);

    // รีโหลดหน้าเพื่อให้การเปลี่ยนภาษามีผล
    window.location.reload();
  };

  // ถ้ายังไม่ mount ให้แสดง placeholder เพื่อป้องกัน hydration error
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="w-9 px-0">
        <span className="opacity-50">🌐</span>
      </Button>
    );
  }

  // หาภาษาปัจจุบัน
  const currentLanguage =
    LANGUAGES.find((lang) => lang.code === currentLang) || LANGUAGES[0];

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="w-9 px-0"
          aria-label={`เปลี่ยนภาษาเป็น ${
            currentLang === "th" ? "อังกฤษ" : "ไทย"
          }`}
        >
          <span className="text-sm font-medium">{currentLanguage.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-black/90 backdrop-blur-lg border-purple-500/30"
      >
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleChangeLanguage(lang.code)}
            className="flex items-center gap-2 cursor-pointer hover:bg-purple-500/20"
          >
            <span>{lang.flag}</span>
            <span>{lang.name}</span>
            {currentLang === lang.code && (
              <Check className="h-4 w-4 ml-auto text-green-400" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
