"use client";

import type React from "react";
import { useState, useEffect } from "react";

interface Character {
  name: string;
  hp: number;
  attack: number;
  defense: number;
  image?: string;
}

interface Enemy {
  name: string;
  hp: number;
  attack: number;
  defense: number;
  image?: string;
}

const BattleSystem: React.FC = () => {
  const [player, setPlayer] = useState<Character>({
    name: "Hero",
    hp: 100,
    attack: 10,
    defense: 5,
    image: "hero.png",
  });

  const [enemy, setEnemy] = useState<Enemy>({
    name: "Goblin",
    hp: 50,
    attack: 5,
    defense: 2,
    image: "goblin.png",
  });

  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [isBattleOver, setIsBattleOver] = useState<boolean>(false);

  useEffect(() => {
    if (player.hp <= 0) {
      setBattleLog((prev) => [...prev, "You have been defeated!"]);
      setIsBattleOver(true);
    } else if (enemy.hp <= 0) {
      setBattleLog((prev) => [...prev, "You have defeated the enemy!"]);
      setIsBattleOver(true);
    }
  }, [player.hp, enemy.hp]);

  const handleAttack = () => {
    if (isBattleOver) return;

    const playerDamage = Math.max(0, player.attack - enemy.defense);
    const enemyDamage = Math.max(0, enemy.attack - player.defense);

    setEnemy((prev) => ({ ...prev, hp: Math.max(0, prev.hp - playerDamage) }));
    setPlayer((prev) => ({ ...prev, hp: Math.max(0, prev.hp - enemyDamage) }));

    setBattleLog((prev) => [
      ...prev,
      `You attacked the ${enemy.name} for ${playerDamage} damage.`,
      `The ${enemy.name} attacked you for ${enemyDamage} damage.`,
    ]);
  };

  return (
    <div className="battle-container">
      <h1>Battle System</h1>

      <div className="battle-area">
        <div className="player-area">
          <h2>{player.name}</h2>
          <img
            src={`/images/characters/battle/${
              player.image || "default-character-battle.png"
            }`}
            alt={`Player character: ${player.name}`}
            className="battle-image"
          />
          <p>HP: {player.hp}</p>
        </div>

        <div className="enemy-area">
          <h2>{enemy.name}</h2>
          <img
            src={`/images/enemies/${enemy.image || "default-enemy.png"}`}
            alt={`Enemy: ${enemy.name}`}
            className="battle-image"
          />
          <p>HP: {enemy.hp}</p>
        </div>
      </div>

      <button onClick={handleAttack} disabled={isBattleOver}>
        Attack
      </button>

      <div className="battle-log">
        <h3>Battle Log:</h3>
        <ul>
          {battleLog.map((log, index) => (
            <li key={index}>{log}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default BattleSystem;
