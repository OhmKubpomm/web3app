# คำแนะนำในการแก้ไขปัญหา

## ปัญหาการเชื่อมต่อ Web3

### ไม่สามารถเชื่อมต่อกับ Metamask ได้

1. ตรวจสอบว่าได้ติดตั้ง Metamask Extension หรือแอพพลิเคชันแล้ว
2. รีเฟรชหน้าเว็บและลองเชื่อมต่ออีกครั้ง
3. ลองปิดและเปิดเบราว์เซอร์ใหม่
4. หากใช้ WalletConnect แล้วพบปัญหา "WalletConnect Core is already initialized" ให้ลองเปิดหน้าเว็บในหน้าต่างแบบ Private/Incognito

### ข้อความ "Authentication failed" หรือ "Must be authenticated"

1. ตรวจสอบค่า environment variables ใน `.env.local`:
   - `NEXT_PUBLIC_ALCHEMY_API_KEY`
   - `NEXT_PUBLIC_INFURA_API_KEY`
   - `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID`

2. ตรวจสอบว่า API key ยังใช้งานได้และมีการใส่ค่าที่ถูกต้อง
3. ตั้งค่า `NEXT_PUBLIC_SIMULATION_MODE="true"` เพื่อทดสอบฟังก์ชันโดยไม่ต้องเชื่อมต่อกับ blockchain จริง

### ไม่สามารถทำธุรกรรมบน Blockchain ได้

1. ตรวจสอบว่ามี native token (ETH, MATIC ฯลฯ) เพียงพอสำหรับค่า gas
2. ตรวจสอบว่าเชื่อมต่อกับเครือข่ายที่ถูกต้อง (Sepolia, Mumbai ฯลฯ)
3. ตั้งค่า `NEXT_PUBLIC_SIMULATION_MODE="true"` เพื่อทดสอบฟังก์ชันโดยไม่ต้องเชื่อมต่อกับ blockchain จริง

## การตั้งค่า Environment Variables

สำหรับการพัฒนา ให้สร้างไฟล์ `.env.local` ที่มีการตั้งค่าดังนี้:

```
# Environment variables for Web3 connection

# WalletConnect Project ID - สมัครที่ https://cloud.walletconnect.com/
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID="your-wallet-connect-project-id"

# Alchemy API Key - สมัครที่ https://www.alchemy.com/
NEXT_PUBLIC_ALCHEMY_API_KEY="your-alchemy-api-key"

# Infura API Key - สมัครที่ https://infura.io/
NEXT_PUBLIC_INFURA_API_KEY="your-infura-api-key"

# Network to connect to (ethereum, polygon, sepolia, mumbai, etc.)
NEXT_PUBLIC_NETWORK="sepolia"

# Contract addresses
NEXT_PUBLIC_GAME_CONTRACT_ADDRESS="0x922c128342d826ee80a9e987db7d09cfa26d519d"
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS="0xd7751b21a3ec736ebf1cbcd33f654a32c33b3f79"

# Enable simulation mode when true
NEXT_PUBLIC_SIMULATION_MODE="true"

# Use in-memory database or local postgres
DATABASE_URL="file:./db.sqlite"
```

## โหมดจำลอง (Simulation Mode)

เมื่อตั้งค่า `NEXT_PUBLIC_SIMULATION_MODE="true"` ระบบจะจำลองการทำงานของ blockchain โดยไม่มีการเชื่อมต่อกับ blockchain จริง ซึ่งเป็นประโยชน์สำหรับ:

1. การพัฒนาและทดสอบหน้าเว็บ
2. การสาธิตแอพพลิเคชันโดยไม่ต้องเชื่อมต่อกระเป๋าเงิน
3. การทดสอบฟังก์ชันต่างๆ โดยไม่เสียค่า gas

ฟังก์ชันที่มีการจำลองในโหมดนี้:
- การลงทะเบียนผู้เล่น
- การโจมตีมอนสเตอร์
- การสร้าง NFT
- การเปลี่ยนพื้นที่
- การอัพเกรดตัวละคร

## การดีบัก

### การตรวจสอบ API Calls

1. เปิด Developer Console ในเบราว์เซอร์ (F12)
2. ดูที่แท็บ Network เพื่อตรวจสอบการเรียก API และค่าที่ส่งกลับมา
3. ดูที่แท็บ Console เพื่อดูข้อความ log และข้อผิดพลาดต่างๆ

### การตรวจสอบการทำงานของ Smart Contract

1. ตรวจสอบธุรกรรมบน blockchain explorer:
   - Sepolia: https://sepolia.etherscan.io/
   - Mumbai: https://mumbai.polygonscan.com/

2. ตรวจสอบ gas ที่ใช้และค่า input parameters ในการทำธุรกรรม

## การตั้งค่าสำหรับ Production

เมื่อต้องการ deploy ใน production ให้ตั้งค่า:

1. `NEXT_PUBLIC_SIMULATION_MODE="false"` เพื่อใช้งาน blockchain จริง
2. เพิ่ม API keys ที่ถูกต้องทั้งหมด
3. ตรวจสอบที่อยู่ contract ว่าถูกต้องสำหรับเครือข่ายที่ใช้

## การแก้ไขปัญหาในสภาพแวดล้อม Production

### การแก้ปัญหาการเชื่อมต่อกับ Provider

1. **JsonRpcProvider failed to detect network**
   - ตรวจสอบว่า API key ของ Alchemy หรือ Infura ถูกต้องและยังไม่หมดอายุ
   - ตรวจสอบว่าไม่เกิน rate limit ของ API key (อาจต้องอัปเกรดเป็นแผนที่สูงขึ้น)
   - แอปพลิเคชันมีการใช้ fallback provider ซึ่งจะลองเชื่อมต่อกับ provider หลายตัว หากตัวแรกล้มเหลว

2. **การเชื่อมต่อขาดหายบ่อยครั้ง**
   - ตรวจสอบความเสถียรของเครือข่ายอินเทอร์เน็ต
   - พิจารณาใช้ API key แบบ paid tier เพื่อความเสถียรที่สูงขึ้น
   - เพิ่ม RPC endpoints จากผู้ให้บริการหลายรายเพื่อเพิ่มความน่าเชื่อถือ

### การแก้ปัญหาการทำธุรกรรม

1. **Transaction Underpriced**
   - เพิ่ม gas price หรือ maxFeePerGas ในการทำธุรกรรม
   - ใช้ ethers.js estimateGas ก่อนส่งธุรกรรมเพื่อประมาณการณ์ค่า gas ที่เหมาะสม

2. **User Rejected Transaction**
   - แนะนำผู้ใช้ให้ยอมรับธุรกรรมใน wallet
   - ตรวจสอบว่าผู้ใช้มี ETH หรือ token เพียงพอสำหรับค่า gas

3. **Gas Estimation Failed**
   - ตรวจสอบพารามิเตอร์ที่ส่งไปยัง smart contract ว่าถูกต้อง
   - เพิ่ม gas limit ด้วยตนเองโดยใช้ค่าที่สูงพอสมควร

### การแก้ปัญหา Rate Limit

1. **Rate Limit Error (429 Too Many Requests)**
   - ลดความถี่ในการเรียก API โดยไม่จำเป็น
   - ใช้การ cache ข้อมูลที่ได้รับจาก blockchain
   - อัปเกรดแผนการใช้งานของ Alchemy หรือ Infura
   - เพิ่ม fallback providers จากหลายบริการ

### การจัดการกับ Smart Contract Error

1. **Contract Execution Reverted**
   - ตรวจสอบ error message จาก contract
   - ตรวจสอบว่าเรียกใช้ฟังก์ชันถูกต้องและส่งพารามิเตอร์ครบถ้วน
   - ใช้แบบจำลอง (simulation) ของ contract call ก่อนส่งธุรกรรมจริง

2. **Call Exception**
   - ตรวจสอบว่าใช้ ABI ที่ถูกต้องและเป็นเวอร์ชันล่าสุด
   - ตรวจสอบว่าเรียกฟังก์ชันด้วย address ที่ถูกต้อง
   - แสดงข้อความที่เป็นประโยชน์กับผู้ใช้เพื่อแก้ไขปัญหา

### การเพิ่มประสิทธิภาพสำหรับ Production

1. **การลดค่า Gas**
   - ใช้ batch transactions เพื่อรวมหลายการกระทำในธุรกรรมเดียว
   - พิจารณาใช้ Layer 2 solutions เช่น Polygon, Arbitrum, Optimism

2. **การปรับปรุงประสบการณ์ผู้ใช้**
   - เพิ่มการแจ้งเตือนระหว่างรอธุรกรรมเสร็จสิ้น
   - แสดงลิงก์ไปยัง blockchain explorer เพื่อตรวจสอบสถานะธุรกรรม
   - มีระบบแจ้งเตือนเมื่อธุรกรรมสำเร็จหรือล้มเหลว

3. **การจัดการกับ Network Congestion**
   - ปรับ gas price ตามสภาพเครือข่ายแบบ dynamic
   - มีทางเลือกให้ผู้ใช้สามารถเลือกความเร็วของธุรกรรม (slow, normal, fast)
   - จัดลำดับความสำคัญของธุรกรรมเพื่อให้ธุรกรรมสำคัญสำเร็จก่อน

## อ้างอิงเพิ่มเติม

- [Alchemy Dashboard](https://dashboard.alchemy.com/)
- [Infura Dashboard](https://infura.io/dashboard)
- [WalletConnect Cloud](https://cloud.walletconnect.com/)
- [ethers.js Documentation](https://docs.ethers.org/v6/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Ethereum Gas Tracker](https://etherscan.io/gastracker)
- [Polygon Gas Tracker](https://polygonscan.com/gastracker) 