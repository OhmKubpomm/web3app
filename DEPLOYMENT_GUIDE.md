# คู่มือการ Deploy เกมผจญภัยคลิกเกอร์ Web3 ด้วย Supabase

คู่มือนี้จะแนะนำขั้นตอนการ deploy เกมผจญภัยคลิกเกอร์ Web3 บน Vercel พร้อมกับการตั้งค่าฐานข้อมูล Supabase และการเชื่อมต่อกับ Web3

## สารบัญ

1. [ข้อกำหนดเบื้องต้น](#ข้อกำหนดเบื้องต้น)
2. [การตั้งค่า Supabase](#การตั้งค่า-supabase)
3. [การตั้งค่า Environment Variables](#การตั้งค่า-environment-variables)
4. [การ Deploy บน Vercel](#การ-deploy-บน-vercel)
5. [การตั้งค่า Web3 และ NFT](#การตั้งค่า-web3-และ-nft)
6. [การทดสอบหลังการ Deploy](#การทดสอบหลังการ-deploy)
7. [การแก้ไขปัญหาที่พบบ่อย](#การแก้ไขปัญหาที่พบบ่อย)

## ข้อกำหนดเบื้องต้น

ก่อนเริ่มต้นการ deploy คุณจำเป็นต้องมีสิ่งต่อไปนี้:

- บัญชี [Vercel](https://vercel.com)
- บัญชี [GitHub](https://github.com) สำหรับเก็บโค้ดของคุณ
- บัญชี [Supabase](https://supabase.com) สำหรับฐานข้อมูล
- บัญชี [Alchemy](https://www.alchemy.com/) หรือผู้ให้บริการ Web3 API อื่นๆ (ถ้าต้องการใช้ฟีเจอร์ NFT)

## การตั้งค่า Supabase

1. **สร้างโปรเจกต์ใหม่บน Supabase**:
   - ไปที่ [Supabase Dashboard](https://app.supabase.io/)
   - คลิก "New Project"
   - ตั้งชื่อโปรเจกต์ (เช่น "adventure-clicker")
   - ตั้งรหัสผ่านสำหรับฐานข้อมูล (จดไว้เพื่อใช้ในภายหลัง)
   - เลือก Region ที่ใกล้กับผู้ใช้งานของคุณ
   - คลิก "Create new project"

2. **สร้างโครงสร้างฐานข้อมูล**:
   - หลังจากโปรเจกต์ถูกสร้างเสร็จ ไปที่แท็บ "SQL Editor"
   - คลิก "New Query"
   - คัดลอกและวางโค้ด SQL จากไฟล์ `supabase/migrations/20240316000000_initial_schema.sql`
   - คลิก "Run" เพื่อสร้างตารางทั้งหมด

3. **รับ Connection String และ API Keys**:
   - ไปที่ "Settings" > "Database"
   - คัดลอก Connection String จากส่วน "Connection Pooling"
   - ไปที่ "Settings" > "API"
   - คัดลอก "URL" และ "anon public" key

## การตั้งค่า Environment Variables

คุณจำเป็นต้องตั้งค่า Environment Variables ต่อไปนี้ใน Vercel:

### ตัวแปรที่จำเป็น

- `DATABASE_URL`: Connection String ของ Supabase (รูปแบบ: `postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-ID].supabase.co:5432/postgres`)
- `NEXT_PUBLIC_SUPABASE_URL`: URL ของ Supabase (รูปแบบ: `https://[YOUR-PROJECT-ID].supabase.co`)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Anon key ของ Supabase
- `NEXTAUTH_SECRET`: สร้างด้วยคำสั่ง `openssl rand -base64 32` หรือใช้เว็บไซต์สร้าง Secret
- `NEXTAUTH_URL`: URL ของแอปพลิเคชันของคุณ (เช่น https://your-app.vercel.app)

### ตัวแปรสำหรับ Web3 (ถ้าใช้ฟีเจอร์ NFT)

- `NEXT_PUBLIC_ALCHEMY_API_KEY`: API Key จาก Alchemy
- `NEXT_PUBLIC_NFT_CONTRACT_ADDRESS`: ที่อยู่ Contract ของ NFT (ถ้ามี)

## การ Deploy บน Vercel

1. **เตรียมโค้ดของคุณ**:
   - Push โค้ดของคุณไปยัง GitHub repository

2. **สร้างโปรเจกต์ใหม่บน Vercel**:
   - ไปที่ [Vercel Dashboard](https://vercel.com/dashboard)
   - คลิก "Add New" > "Project"
   - เลือก GitHub repository ของคุณ
   - คลิก "Import"

3. **ตั้งค่า Environment Variables**:
   - ในหน้าการตั้งค่าโปรเจกต์ ไปที่ส่วน "Environment Variables"
   - เพิ่มตัวแปรทั้งหมดที่กล่าวถึงในส่วนก่อนหน้านี้

4. **ปรับแต่งการตั้งค่า Build**:
   - ตรวจสอบให้แน่ใจว่า Build Command ถูกตั้งค่าเป็น `prisma generate && next build`
   - ตรวจสอบให้แน่ใจว่า Output Directory ถูกตั้งค่าเป็น `.next`

5. **Deploy**:
   - คลิก "Deploy"
   - รอให้การ build และ deploy เสร็จสิ้น

## การตั้งค่า Web3 และ NFT

### การตั้งค่า Alchemy API

1. สร้างบัญชีที่ [Alchemy](https://www.alchemy.com/)
2. สร้าง App ใหม่สำหรับเครือข่ายที่คุณต้องการใช้ (เช่น Polygon Mumbai Testnet)
3. คัดลอก API Key และเพิ่มเป็น Environment Variable `NEXT_PUBLIC_ALCHEMY_API_KEY` ใน Vercel

### การสร้าง NFT Contract (ถ้าต้องการ)

1. ใช้ [OpenZeppelin Wizard](https://wizard.openzeppelin.com/) เพื่อสร้าง Smart Contract สำหรับ NFT
2. Deploy Contract บนเครือข่ายที่คุณเลือก (เช่น Polygon Mumbai Testnet)
3. คัดลอกที่อยู่ Contract และเพิ่มเป็น Environment Variable `NEXT_PUBLIC_NFT_CONTRACT_ADDRESS` ใน Vercel

## การทดสอบหลังการ Deploy

หลังจาก deploy แล้ว ให้ทดสอบฟีเจอร์ต่อไปนี้:

1. **การเชื่อมต่อกระเป๋าเงิน**: ทดสอบการเชื่อมต่อกระเป๋าเงิน MetaMask
2. **การบันทึกข้อมูล**: ทดสอบว่าข้อมูลเกมถูกบันทึกลงในฐานข้อมูลหรือไม่
3. **การสร้าง NFT**: ทดสอบการสร้าง NFT (ถ้าใช้ฟีเจอร์นี้)
4. **การทำงานของเกม**: ทดสอบฟีเจอร์ต่างๆ ของเกม เช่น การต่อสู้ การอัพเกรด และการทำภารกิจ

## การแก้ไขปัญหาที่พบบ่อย

### ปัญหาการเชื่อมต่อฐานข้อมูล

- ตรวจสอบว่า Connection String ถูกต้อง
- ตรวจสอบว่าฐานข้อมูลอนุญาตการเชื่อมต่อจาก IP ของ Vercel (ไปที่ Supabase > Settings > Database > Connection Pooling และเปิดใช้งาน "Pooler mode" เป็น "Transaction")
- ตรวจสอบว่าได้สร้างตารางทั้งหมดในฐานข้อมูลแล้ว

### ปัญหาการเชื่อมต่อ Web3

- ตรวจสอบว่า API Key ของ Alchemy ถูกต้อง
- ตรวจสอบว่าเครือข่ายที่เลือกใน MetaMask ตรงกับเครือข่ายที่ใช้ใน App
- ตรวจสอบ Console ใน Browser เพื่อดูข้อผิดพลาดที่เกี่ยวข้องกับ Web3

### ปัญหาการสร้าง NFT

- ตรวจสอบว่าที่อยู่ Contract ถูกต้อง
- ตรวจสอบว่ามี ETH/MATIC เพียงพอสำหรับค่า Gas
- ตรวจสอบ Transaction ใน Block Explorer

### ปัญหาการแสดงผล UI

- ตรวจสอบว่าได้ตั้งค

