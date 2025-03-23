"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Languages, Check } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { motion } from "framer-motion";

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
  const { locale, setLocale, t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);

  // ฟังก์ชันเปลี่ยนภาษา
  const handleChangeLanguage = (lang: string) => {
    setLocale(lang);
    setIsOpen(false);
  };

  // หาภาษาปัจจุบัน
  const currentLanguage =
    LANGUAGES.find((lang) => lang.code === locale) || LANGUAGES[0];

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-1 border-purple-500/30 bg-black/40"
        >
          <motion.span
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.2 }}
            className="mr-1"
          >
            {currentLanguage.flag}
          </motion.span>
          <span className="hidden md:inline">{currentLanguage.name}</span>
          <Languages className="h-4 w-4 text-purple-400" />
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
            {locale === lang.code && (
              <Check className="h-4 w-4 ml-auto text-green-400" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
