interface ShopItem {
  id: number
  name: string
  description: string
  price: number
  image?: string // Optional image path
}

const shopItems: ShopItem[] = [
  {
    id: 1,
    name: "Basic Character",
    description: "A standard character to start your adventure.",
    price: 100,
    image: "basic-character.png",
  },
  {
    id: 2,
    name: "Advanced Character",
    description: "A character with enhanced abilities.",
    price: 250,
    image: "advanced-character.png",
  },
  {
    id: 3,
    name: "Premium Character",
    description: "The ultimate character with unique skills.",
    price: 500,
    image: "premium-character.png",
  },
]

const ShopSystem = () => {
  return (
    <div className="shop-container">
      <h2>Character Shop</h2>
      <div className="shop-items">
        {shopItems.map((item) => (
          <div className="shop-item" key={item.id}>
            <img
              src={`/images/shop/${item.image || "default-item.png"}`}
              alt={`Shop item: ${item.name}`}
              className="shop-item-image"
            />
            <h3>{item.name}</h3>
            <p>{item.description}</p>
            <p>Price: ${item.price}</p>
            <button>Purchase</button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ShopSystem

