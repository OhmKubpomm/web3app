import type React from "react"

interface Character {
  id: number
  name: string
  image: string
}

interface CharacterDisplayProps {
  character: Character
}

const CharacterDisplay: React.FC<CharacterDisplayProps> = ({ character }) => {
  return (
    <div>
      <img
        src={`/images/characters/${character.image || "default-character.png"}`}
        alt={`Character: ${character.name}`}
        style={{ width: "300px", height: "300px", objectFit: "cover" }}
      />
      <h2>{character.name}</h2>
    </div>
  )
}

export default CharacterDisplay

