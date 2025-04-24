"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, CheckCircle, Lock, Award } from "lucide-react";
// Import these icons for the component
import { Sword, Package, Map, Coins, Zap, Share2 } from "lucide-react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  progress: number;
  target: number;
  completed: boolean;
  reward: string;
  category: "combat" | "collection" | "exploration" | "social";
}

interface GameData {
  monstersDefeated?: number;
  inventory?: Array<unknown>;
  coins?: number;
  damage?: number;
  [key: string]: unknown;
}

export default function Achievements({ gameData }: { gameData: GameData }) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Generate achievements based on game data
  useEffect(() => {
    if (!gameData) return;

    const generatedAchievements: Achievement[] = [
      {
        id: "monster-slayer-1",
        title: "Monster Slayer I",
        description: "Defeat 10 monsters",
        icon: <Sword className="h-5 w-5 text-red-400" />,
        progress: Math.min(gameData.monstersDefeated || 0, 10),
        target: 10,
        completed: (gameData.monstersDefeated || 0) >= 10,
        reward: "50 ADVT",
        category: "combat",
      },
      {
        id: "monster-slayer-2",
        title: "Monster Slayer II",
        description: "Defeat 100 monsters",
        icon: <Sword className="h-5 w-5 text-red-400" />,
        progress: Math.min(gameData.monstersDefeated || 0, 100),
        target: 100,
        completed: (gameData.monstersDefeated || 0) >= 100,
        reward: "200 ADVT",
        category: "combat",
      },
      {
        id: "collector-1",
        title: "Collector I",
        description: "Collect 5 items",
        icon: <Package className="h-5 w-5 text-purple-400" />,
        progress: Math.min(gameData.inventory?.length || 0, 5),
        target: 5,
        completed: (gameData.inventory?.length || 0) >= 5,
        reward: "Rare Chest",
        category: "collection",
      },
      {
        id: "collector-2",
        title: "Collector II",
        description: "Collect 20 items",
        icon: <Package className="h-5 w-5 text-purple-400" />,
        progress: Math.min(gameData.inventory?.length || 0, 20),
        target: 20,
        completed: (gameData.inventory?.length || 0) >= 20,
        reward: "Epic Chest",
        category: "collection",
      },
      {
        id: "explorer-1",
        title: "Explorer I",
        description: "Discover all areas",
        icon: <Map className="h-5 w-5 text-green-400" />,
        progress: 1, // Mock value
        target: 3,
        completed: false,
        reward: "100 ADVT",
        category: "exploration",
      },
      {
        id: "rich-1",
        title: "Getting Rich",
        description: "Collect 1000 coins",
        icon: <Coins className="h-5 w-5 text-yellow-400" />,
        progress: Math.min(gameData.coins || 0, 1000),
        target: 1000,
        completed: (gameData.coins || 0) >= 1000,
        reward: "Legendary Item",
        category: "collection",
      },
      {
        id: "power-1",
        title: "Power Up",
        description: "Reach 50 attack power",
        icon: <Zap className="h-5 w-5 text-blue-400" />,
        progress: Math.min(gameData.damage || 0, 50),
        target: 50,
        completed: (gameData.damage || 0) >= 50,
        reward: "Skill Point",
        category: "combat",
      },
      {
        id: "social-1",
        title: "Social Butterfly",
        description: "Share your progress on social media",
        icon: <Share2 className="h-5 w-5 text-pink-400" />,
        progress: 0,
        target: 1,
        completed: false,
        reward: "Unique Title",
        category: "social",
      },
    ];

    setAchievements(generatedAchievements);
  }, [gameData]);

  // Filter achievements by category
  const filteredAchievements = activeCategory
    ? achievements.filter((a) => a.category === activeCategory)
    : achievements;

  // Calculate completion stats
  const completedCount = achievements.filter((a) => a.completed).length;
  const totalCount = achievements.length;
  const completionPercentage =
    totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <Card className="border-purple-500/30 bg-black/40 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-400" />
          <span>Achievements</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="bg-black/30 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Overall Progress</h3>
              <Badge
                variant="outline"
                className="bg-black/30 text-gray-300 border-gray-700"
              >
                {completedCount}/{totalCount}
              </Badge>
            </div>
            <Progress value={completionPercentage} className="h-2 mb-2" />
            <div className="flex justify-between text-xs text-gray-400">
              <span>{completionPercentage.toFixed(0)}% Complete</span>
              {completedCount > 0 && (
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-400" />
                  {completedCount}{" "}
                  {completedCount === 1 ? "Achievement" : "Achievements"}{" "}
                  Unlocked
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
                activeCategory === null
                  ? "bg-purple-600 text-white"
                  : "bg-black/30 text-gray-300 hover:bg-black/50"
              }`}
              onClick={() => setActiveCategory(null)}
            >
              All
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
                activeCategory === "combat"
                  ? "bg-red-600 text-white"
                  : "bg-black/30 text-gray-300 hover:bg-black/50"
              }`}
              onClick={() => setActiveCategory("combat")}
            >
              Combat
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
                activeCategory === "collection"
                  ? "bg-purple-600 text-white"
                  : "bg-black/30 text-gray-300 hover:bg-black/50"
              }`}
              onClick={() => setActiveCategory("collection")}
            >
              Collection
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
                activeCategory === "exploration"
                  ? "bg-green-600 text-white"
                  : "bg-black/30 text-gray-300 hover:bg-black/50"
              }`}
              onClick={() => setActiveCategory("exploration")}
            >
              Exploration
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
                activeCategory === "social"
                  ? "bg-pink-600 text-white"
                  : "bg-black/30 text-gray-300 hover:bg-black/50"
              }`}
              onClick={() => setActiveCategory("social")}
            >
              Social
            </motion.button>
          </div>

          <div className="space-y-3">
            {filteredAchievements.map((achievement) => (
              <motion.div
                key={achievement.id}
                whileHover={{ scale: 1.02 }}
                className={`bg-black/30 p-4 rounded-lg border ${
                  achievement.completed
                    ? "border-yellow-500/50"
                    : "border-gray-700/30"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full ${
                        achievement.completed
                          ? "bg-yellow-500/20"
                          : "bg-gray-700/20"
                      } flex items-center justify-center`}
                    >
                      {achievement.icon}
                    </div>
                    <div>
                      <h4 className="font-medium flex items-center gap-2">
                        {achievement.title}
                        {achievement.completed && (
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        )}
                      </h4>
                      <p className="text-xs text-gray-400">
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`${
                      achievement.completed
                        ? "bg-green-500/20 text-green-300 border-green-500"
                        : "bg-gray-700/20 text-gray-300 border-gray-700"
                    }`}
                  >
                    {achievement.completed
                      ? "Completed"
                      : `${achievement.progress}/${achievement.target}`}
                  </Badge>
                </div>

                {!achievement.completed && (
                  <Progress
                    value={(achievement.progress / achievement.target) * 100}
                    className="h-1 mb-2"
                  />
                )}

                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Reward:</span>
                  <div className="flex items-center gap-1">
                    <Award className="h-3 w-3 text-yellow-400" />
                    <span
                      className={
                        achievement.completed
                          ? "text-yellow-300"
                          : "text-gray-400"
                      }
                    >
                      {achievement.reward}
                    </span>
                    {!achievement.completed && (
                      <Lock className="h-3 w-3 text-gray-500 ml-1" />
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
