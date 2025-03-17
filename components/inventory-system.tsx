import type React from "react"

interface InventoryItem {
  id: string
  name: string
  description: string
  image?: string // Optional image path
}

interface InventorySystemProps {
  items: InventoryItem[]
}

const InventorySystem: React.FC<InventorySystemProps> = ({ items }) => {
  return (
    <div className="inventory-container">
      <h2>Inventory</h2>
      <div className="inventory-grid">
        {items.map((item) => (
          <div key={item.id} className="inventory-item">
            <img
              src={`/images/inventory/${item.image || "default-inventory-item.png"}`}
              alt={`Inventory item: ${item.name}`}
              className="inventory-item-image"
            />
            <h3>{item.name}</h3>
            <p>{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default InventorySystem

