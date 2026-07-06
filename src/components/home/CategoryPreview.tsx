import Link from "next/link";
import { 
  ChevronRight, 
  Star, 
  Utensils, 
  Flame, 
  ChefHat, 
  Users, 
  Smile, 
  Cake, 
  CupSoda, 
  Coffee, 
  Award, 
  Salad, 
  Sandwich 
} from "lucide-react";

const CATEGORIES = [
  { slug: "featured", name: "Featured", icon: Star },
  { slug: "appetizers", name: "Appetizers", icon: Utensils },
  { slug: "salads", name: "Salads", icon: Salad },
  { slug: "main-dishes", name: "Main Dishes", icon: ChefHat },
  { slug: "grilled-dishes", name: "Grilled Dishes", icon: Flame },
  { slug: "specialties", name: "Specialties", icon: Award },
  { slug: "family-platters", name: "Family Platters", icon: Users },
  { slug: "sandwiches", name: "Sandwiches", icon: Sandwich },
  { slug: "kids-menu", name: "Kids Menu", icon: Smile },
  { slug: "desserts", name: "Desserts", icon: Cake },
  { slug: "smoothies", name: "Smoothies", icon: CupSoda },
  { slug: "drinks", name: "Drinks", icon: Coffee },
];

export function CategoryPreview() {
  return (
    <section
      className="section-pad bg-cream"
      aria-labelledby="categories-heading"
    >
      <div className="container-site">
        <div className="text-center mb-12">
          <span className="text-brand-dark text-sm font-semibold uppercase tracking-widest">
            Browse by Category
          </span>
          <h2 id="categories-heading" className="section-title mt-2">
            Explore Our Menu
          </h2>
          <p className="section-subtitle max-w-xl mx-auto">
            From grilled meats to traditional sweets — there&apos;s something for
            everyone.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.slug}
                href={`/menu?category=${cat.slug}`}
                className="card p-4 flex flex-col items-center gap-2 text-center group
                           hover:border-brand-dark hover:ring-1 hover:ring-brand-dark/20 transition-all"
              >
                <div className="p-2 bg-white rounded-full group-hover:scale-110 transition-transform duration-200">
                  <Icon className="w-6 h-6 text-brand-olive" />
                </div>
                <span className="text-sm font-semibold text-olive-dark group-hover:text-brand-dark transition-colors">
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <Link href="/menu" className="btn-outline">
            Browse Full Menu
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
