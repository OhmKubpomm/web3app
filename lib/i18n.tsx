"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";

// สร้าง Context สำหรับ i18n
interface I18nContextType {
  locale: string;
  setLocale: (locale: string) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType>({
  locale: "th",
  setLocale: () => {},
  t: (key: string) => key,
});

// คำแปลภาษา
const translations: Record<string, Record<string, string>> = {
  th: {
    // หน้าหลัก
    "home.title": "ผจญภัยในโลกบล็อกเชน",
    "home.subtitle":
      "เกมคลิกเกอร์บนบล็อกเชนที่คุณสามารถสะสม NFT และอัพเกรดตัวละครได้",
    "home.connect": "เชื่อมต่อกระเป๋า",
    "home.play": "เล่นเกม",

    // การต่อสู้
    "battle.title": "การต่อสู้",
    "battle.attack": "โจมตี",
    "battle.multiAttack": "โจมตี x{count}",
    "battle.stats": "สถิติการต่อสู้",
    "battle.monstersDefeated": "มอนสเตอร์ที่กำจัด",
    "battle.coinsEarned": "เหรียญที่ได้รับ",
    "battle.itemsFound": "ไอเทมที่พบ",

    // ตัวละคร
    "character.title": "ตัวละคร",
    "character.upgrade": "อัพเกรด",
    "character.attack": "พลังโจมตี",
    "character.defense": "ความทนทาน",
    "character.hire": "จ้างนักผจญภัย",

    // พื้นที่
    "area.title": "พื้นที่ผจญภัย",
    "area.forest": "ป่า",
    "area.cave": "ถ้ำ",
    "area.desert": "ทะเลทราย",
    "area.volcano": "ภูเขาไฟ",
    "area.current": "ปัจจุบัน",
    "area.locked": "ต้องการเลเวล {level}",

    // ไอเทม
    "item.title": "คลังไอเทม NFT",
    "item.inventory": "คลังไอเทม",
    "item.mint": "สร้าง NFT",
    "item.all": "ทั้งหมด",
    "item.weapon": "อาวุธ",
    "item.armor": "เกราะ",
    "item.accessory": "อุปกรณ์เสริม",
    "item.special": "พิเศษ",
    "item.empty": "ไม่มีไอเทมในคลัง",
    "item.create": "สร้าง NFT",
    "item.creating": "กำลังสร้าง...",

    // ทั่วไป
    "general.loading": "กำลังโหลด...",
    "general.error": "เกิดข้อผิดพลาด",
    "general.success": "สำเร็จ",
    "general.confirm": "ยืนยัน",
    "general.cancel": "ยกเลิก",
    "general.close": "ปิด",
    "general.save": "บันทึก",
    "general.edit": "แก้ไข",
    "general.delete": "ลบ",
    "general.back": "กลับ",
    "general.next": "ถัดไป",
    "general.coins": "เหรียญ",
    "general.level": "ระดับ",
    "general.hp": "HP",
    "general.damage": "พลังโจมตี",
    "general.autoDamage": "โจมตีอัตโนมัติ",
    "general.area": "พื้นที่",
    "general.experience": "ประสบการณ์",
    "general.nextLevel": "เลเวลถัดไป",

    // ระบบ
    "system.error.connect": "กรุณาเชื่อมต่อกระเป๋าเงินก่อน",
    "system.error.level": "เลเวลไม่เพียงพอ",
    "system.error.coins": "เหรียญไม่เพียงพอ",
    "system.success.upgrade": "อัพเกรดสำเร็จ",
    "system.success.area": "เปลี่ยนพื้นที่สำเร็จ",
    "system.success.nft": "สร้าง NFT สำเร็จ",
    "system.success.character": "สร้างตัวละครสำเร็จ",
  },
  en: {
    // Home
    "home.title": "Adventure in Blockchain World",
    "home.subtitle":
      "A blockchain clicker game where you can collect NFTs and upgrade characters",
    "home.connect": "Connect Wallet",
    "home.play": "Play Game",

    // Battle
    "battle.title": "Battle",
    "battle.attack": "Attack",
    "battle.multiAttack": "Attack x{count}",
    "battle.stats": "Battle Stats",
    "battle.monstersDefeated": "Monsters Defeated",
    "battle.coinsEarned": "Coins Earned",
    "battle.itemsFound": "Items Found",

    // Character
    "character.title": "Characters",
    "character.upgrade": "Upgrade",
    "character.attack": "Attack Power",
    "character.defense": "Defense",
    "character.hire": "Hire Adventurer",

    // Area
    "area.title": "Adventure Areas",
    "area.forest": "Forest",
    "area.cave": "Cave",
    "area.desert": "Desert",
    "area.volcano": "Volcano",
    "area.current": "Current",
    "area.locked": "Requires Level {level}",

    // Item
    "item.title": "NFT Item Inventory",
    "item.inventory": "Inventory",
    "item.mint": "Mint NFT",
    "item.all": "All",
    "item.weapon": "Weapon",
    "item.armor": "Armor",
    "item.accessory": "Accessory",
    "item.special": "Special",
    "item.empty": "No items in inventory",
    "item.create": "Create NFT",
    "item.creating": "Creating...",

    // General
    "general.loading": "Loading...",
    "general.error": "Error",
    "general.success": "Success",
    "general.confirm": "Confirm",
    "general.cancel": "Cancel",
    "general.close": "Close",
    "general.save": "Save",
    "general.edit": "Edit",
    "general.delete": "Delete",
    "general.back": "Back",
    "general.next": "Next",
    "general.coins": "Coins",
    "general.level": "Level",
    "general.hp": "HP",
    "general.damage": "Damage",
    "general.autoDamage": "Auto Damage",
    "general.area": "Area",
    "general.experience": "Experience",
    "general.nextLevel": "Next Level",

    // System
    "system.error.connect": "Please connect your wallet first",
    "system.error.level": "Level not high enough",
    "system.error.coins": "Not enough coins",
    "system.success.upgrade": "Upgrade successful",
    "system.success.area": "Area changed successfully",
    "system.success.nft": "NFT created successfully",
    "system.success.character": "Character created successfully",
  },
};

// Provider สำหรับ i18n
export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState("th");
  const [mounted, setMounted] = useState(false);

  // ตรวจสอบว่าอยู่ใน client side
  useEffect(() => {
    setMounted(true);
    // โหลดภาษาจาก localStorage
    const savedLocale = localStorage.getItem("locale") || "th";
    setLocaleState(savedLocale);
  }, []);

  // ฟังก์ชันเปลี่ยนภาษา
  const setLocale = (newLocale: string) => {
    setLocaleState(newLocale);
    if (typeof window !== "undefined") {
      localStorage.setItem("locale", newLocale);
      // เพิ่มการรีโหลดหน้าเพื่อให้การเปลี่ยนภาษามีผลทันที
      window.location.reload();
    }
  };

  // ฟังก์ชันแปลภาษา
  const t = (key: string): string => {
    if (!mounted) return key;

    const localeTranslations = translations[locale] || translations.th;
    return localeTranslations[key] || key;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

// Hook สำหรับใช้งาน i18n
export const useI18n = () => useContext(I18nContext);
