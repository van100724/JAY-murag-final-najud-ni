interface ProductCardProps {
  name: string;
  price: number;
  stock: number;
  category: string;
}

export default function ProductCard({
  name,
  price,
  stock,
  category,
}: ProductCardProps) {
  return (
    <div className="bg-[#232342] rounded-2xl p-5 border border-white/5 hover:border-orange-500/30 transition-all">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">{name}</h3>

        <span className="text-xs bg-orange-500/10 text-orange-400 px-2 py-1 rounded-lg">
          {category}
        </span>
      </div>

      <p className="text-orange-400 text-2xl font-bold mt-4">
        ₱{price}
      </p>

      <p className="text-gray-400 text-sm mt-2">
        Stock: {stock}
      </p>
    </div>
  );
}