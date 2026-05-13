const categories = [
  'All',
  'Tools',
  'Electrical',
  'Plumbing',
  'Painting',
  'Construction',
];

export default function CategoryFilter() {
  return (
    <div className="flex gap-3 flex-wrap">
      {categories.map((cat) => (
        <button
          key={cat}
          className="px-4 py-2 rounded-xl bg-[#232342] hover:bg-orange-500/20 transition-all text-sm border border-white/5"
        >
          {cat}
        </button>
      ))}
    </div>
  );
}