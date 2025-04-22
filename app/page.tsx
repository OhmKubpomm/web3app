import WalletStatus from "@/components/wallet-status";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
      <h1 className="text-4xl font-bold mb-8">Adventure Clicker</h1>
      <p className="text-xl mb-8">เชื่อมต่อกระเป๋าเงินของคุณเพื่อเริ่มการผจญภัย</p>
      
      <WalletStatus />
    </div>
  );
}
