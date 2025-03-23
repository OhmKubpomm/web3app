"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

// ประเภทของ I18n Context
interface I18nContextType {
  locale: string;
  setLocale: (locale: string) => void;
  t: (key: string) => string;
}

// สร้าง Context
const I18nContext = createContext<I18nContextType | null>(null);

// ฟังก์ชันสำหรับใช้งาน Context
export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
};

// ข้อความแปลภาษา
const translations: Record<string, Record<string, string>> = {
  th: {
    "common.success": "สำเร็จ",
    "common.error": "เกิดข้อผิดพลาด",
    "common.loading": "กำลังโหลด...",

    "welcome.title": "ผจญภัยในโลกบล็อกเชน",
    "welcome.connect": "เชื่อมต่อกระเป๋า",
    "welcome.start": "เริ่มผจญภัย",

    "welcome.about.title": "เกี่ยวกับเกม",
    "welcome.about.description1":
      "ยินดีต้อนรับสู่เกมผจญภัยบนบล็อกเชน! เกมนี้ผสมผสานระหว่างเกมคลิกเกอร์แบบดั้งเดิมกับเทคโนโลยี Web3",
    "welcome.about.description2":
      "สะสมไอเทม NFT, อัพเกรดตัวละคร และผจญภัยในดินแดนต่างๆ เพื่อค้นหาสมบัติล้ำค่า",
    "welcome.about.description3":
      "ทุกความสำเร็จของคุณจะถูกบันทึกลงบนบล็อกเชน ทำให้ทรัพย์สินในเกมมีมูลค่าจริง",

    "welcome.features.title": "คุณสมบัติ",
    "welcome.features.combat.title": "ระบบต่อสู้",
    "welcome.features.combat.description":
      "ต่อสู้กับมอนสเตอร์หลากหลายชนิดในพื้นที่ต่างๆ",
    "welcome.features.character.title": "พัฒนาตัวละคร",
    "welcome.features.character.description":
      "อัพเกรดตัวละครและปลดล็อคความสามารถพิเศษ",
    "welcome.features.economy.title": "เศรษฐกิจในเกม",
    "welcome.features.economy.description":
      "ซื้อขายไอเทมและสกุลเงินในเกมที่มีมูลค่าจริง",
    "welcome.features.quest.title": "ภารกิจ",
    "welcome.features.quest.description":
      "ทำภารกิจเพื่อรับรางวัลและค้นพบเนื้อเรื่องใหม่ๆ",
    "welcome.features.web3.title": "เทคโนโลยี Web3",
    "welcome.features.web3.description":
      "ใช้เทคโนโลยีบล็อกเชนเพื่อความเป็นเจ้าของไอเทมอย่างแท้จริง",

    "welcome.nft.title": "ไอเทม NFT",
    "welcome.nft.description":
      "ไอเทม NFT ในเกมเป็นทรัพย์สินดิจิทัลที่คุณเป็นเจ้าของอย่างแท้จริง สามารถซื้อขายในตลาด NFT ได้",
    "welcome.nft.types.title": "ประเภทของ NFT",
    "welcome.nft.types.weapon": "อาวุธ - เพิ่มพลังโจมตี",
    "welcome.nft.types.armor": "เกราะ - เพิ่มความทนทาน",
    "welcome.nft.types.accessory": "อุปกรณ์เสริม - เพิ่มความสามารถพิเศษ",
    "welcome.nft.types.special": "ไอเทมพิเศษ - มีคุณสมบัติเฉพาะ",
    "welcome.nft.market":
      "คุณสามารถซื้อขายไอเทม NFT ในตลาดของเกมหรือแพลตฟอร์ม NFT ภายนอกได้",

    // เพิ่มคำแปลใหม่
    "sound.muted": "ปิดเสียงแล้ว",
    "sound.unmuted": "เปิดเสียงแล้ว",

    "stats.coins": "เหรียญ",
    "stats.damage": "พลังโจมตี",
    "stats.autoDamage": "พลังอัตโนมัติ",

    "nav.home": "หน้าหลัก",
    "nav.leaderboard": "จัดอันดับ",
    "nav.settings": "ตั้งค่า",
    "nav.help": "ช่วยเหลือ",

    "settings.theme": "ธีม",
    "settings.language": "ภาษา",
    "settings.sound": "เสียง",

    "auth.login": "เข้าสู่ระบบ",
    "auth.logout": "ออกจากระบบ",
    "auth.connect": "เชื่อมต่อกระเป๋า",
    "auth.disconnect": "ตัดการเชื่อมต่อ",

    "profile.title": "โปรไฟล์",
    "profile.address": "ที่อยู่กระเป๋า",
    "profile.network": "เครือข่าย",
    "profile.balance": "ยอดคงเหลือ",
    "profile.copy": "คัดลอก",
    "profile.view": "ดูใน Explorer",
    "profile.blockchain": "ข้อมูล Blockchain",
    "profile.game": "ข้อมูลเกม",
  },
  en: {
    "common.success": "Success",
    "common.error": "Error",
    "common.loading": "Loading...",

    "welcome.title": "Adventure in Blockchain World",
    "welcome.connect": "Connect Wallet",
    "welcome.start": "Start Adventure",

    "welcome.about.title": "About the Game",
    "welcome.about.description1":
      "Welcome to the blockchain adventure game! This game combines traditional clicker games with Web3 technology.",
    "welcome.about.description2":
      "Collect NFT items, upgrade characters, and adventure in various lands to find valuable treasures.",
    "welcome.about.description3":
      "All your achievements will be recorded on the blockchain, making in-game assets have real value.",

    "welcome.features.title": "Features",
    "welcome.features.combat.title": "Combat System",
    "welcome.features.combat.description":
      "Fight various monsters in different areas",
    "welcome.features.character.title": "Character Development",
    "welcome.features.character.description":
      "Upgrade characters and unlock special abilities",
    "welcome.features.economy.title": "In-game Economy",
    "welcome.features.economy.description":
      "Buy and sell items and in-game currency with real value",
    "welcome.features.quest.title": "Quests",
    "welcome.features.quest.description":
      "Complete quests for rewards and discover new storylines",
    "welcome.features.web3.title": "Web3 Technology",
    "welcome.features.web3.description":
      "Use blockchain technology for true ownership of items",

    "welcome.nft.title": "NFT Items",
    "welcome.nft.description":
      "NFT items in the game are digital assets that you truly own and can be traded in NFT markets.",
    "welcome.nft.types.title": "Types of NFTs",
    "welcome.nft.types.weapon": "Weapons - Increase attack power",
    "welcome.nft.types.armor": "Armor - Increase durability",
    "welcome.nft.types.accessory": "Accessories - Add special abilities",
    "welcome.nft.types.special": "Special Items - Have unique properties",
    "welcome.nft.market":
      "You can buy and sell NFT items in the game market or external NFT platforms.",

    // Add new translations
    "sound.muted": "Sound muted",
    "sound.unmuted": "Sound unmuted",

    "stats.coins": "Coins",
    "stats.damage": "Damage",
    "stats.autoDamage": "Auto Damage",

    "nav.home": "Home",
    "nav.leaderboard": "Leaderboard",
    "nav.settings": "Settings",
    "nav.help": "Help",

    "settings.theme": "Theme",
    "settings.language": "Language",
    "settings.sound": "Sound",

    "auth.login": "Login",
    "auth.logout": "Logout",
    "auth.connect": "Connect Wallet",
    "auth.disconnect": "Disconnect",

    "profile.title": "Profile",
    "profile.address": "Wallet Address",
    "profile.network": "Network",
    "profile.balance": "Balance",
    "profile.copy": "Copy",
    "profile.view": "View in Explorer",
    "profile.blockchain": "Blockchain Data",
    "profile.game": "Game Data",
  },
  zh: {
    "common.success": "成功",
    "common.error": "错误",
    "common.loading": "加载中...",

    "welcome.title": "区块链世界冒险",
    "welcome.connect": "连接钱包",
    "welcome.start": "开始冒险",

    // Add more Chinese translations as needed
    "sound.muted": "已静音",
    "sound.unmuted": "已取消静音",

    "stats.coins": "金币",
    "stats.damage": "攻击力",
    "stats.autoDamage": "自动攻击",

    "nav.home": "主页",
    "nav.leaderboard": "排行榜",
    "nav.settings": "设置",
    "nav.help": "帮助",

    "settings.theme": "主题",
    "settings.language": "语言",
    "settings.sound": "声音",

    "auth.login": "登录",
    "auth.logout": "登出",
    "auth.connect": "连接钱包",
    "auth.disconnect": "断开连接",
  },
  ja: {
    "common.success": "成功",
    "common.error": "エラー",
    "common.loading": "読み込み中...",

    "welcome.title": "ブロックチェーン世界の冒険",
    "welcome.connect": "ウォレットを接続",
    "welcome.start": "冒険を始める",

    // Add more Japanese translations as needed
    "sound.muted": "ミュート中",
    "sound.unmuted": "ミュート解除",

    "stats.coins": "コイン",
    "stats.damage": "攻撃力",
    "stats.autoDamage": "自動攻撃",

    "nav.home": "ホーム",
    "nav.leaderboard": "ランキング",
    "nav.settings": "設定",
    "nav.help": "ヘルプ",

    "settings.theme": "テーマ",
    "settings.language": "言語",
    "settings.sound": "サウンド",

    "auth.login": "ログイン",
    "auth.logout": "ログアウト",
    "auth.connect": "ウォレットを接続",
    "auth.disconnect": "接続を切る",
  },
};

// Provider Component
export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState("th");

  // ฟังก์ชันเปลี่ยนภาษา
  const setLocale = (newLocale: string) => {
    if (translations[newLocale]) {
      setLocaleState(newLocale);
      localStorage.setItem("locale", newLocale);
    }
  };

  // ฟังก์ชันแปลข้อความ
  const t = (key: string): string => {
    if (!translations[locale]) return key;
    return translations[locale][key] || key;
  };

  // โหลดภาษาจาก localStorage เมื่อเริ่มต้น
  useEffect(() => {
    const savedLocale = localStorage.getItem("locale");
    if (savedLocale && translations[savedLocale]) {
      setLocaleState(savedLocale);
    }
  }, []);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
};
