"use client"

import type React from "react"

interface Area {
  id: string
  name: string
  image?: string
}

interface AreaSelectionProps {
  areas: Area[]
  onAreaSelect: (areaId: string) => void
}

const AreaSelection: React.FC<AreaSelectionProps> = ({ areas, onAreaSelect }) => {
  return (
    <div className="area-selection">
      {areas.map((area) => (
        <div key={area.id} className="area-item" onClick={() => onAreaSelect(area.id)}>
          <img
            src={`/images/areas/${area.image || "default-area.png"}`}
            alt={`Area: ${area.name}`}
            className="area-image"
          />
          <div className="area-name">{area.name}</div>
        </div>
      ))}
    </div>
  )
}

export default AreaSelection

