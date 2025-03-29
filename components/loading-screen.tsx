"use client";

import { motion } from "framer-motion";
import { Sword, Shield, Sparkles } from "lucide-react";

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-indigo-900 text-white flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <motion.div
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            repeat: Number.POSITIVE_INFINITY,
            duration: 2,
            ease: "linear",
          }}
          className="relative w-24 h-24 mx-auto mb-8"
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <Sword className="h-12 w-12 text-purple-400" />
          </div>
          <div className="absolute top-0 right-0">
            <Shield className="h-8 w-8 text-blue-400" />
          </div>
          <div className="absolute bottom-0 left-0">
            <Sparkles className="h-8 w-8 text-yellow-400" />
          </div>
        </motion.div>

        <h2 className="text-2xl font-bold mb-2">กำลังโหลด...</h2>
        <p className="text-gray-300">กำลังเตรียมการผจญภัยของคุณ</p>
      </motion.div>
    </div>
  );
}
