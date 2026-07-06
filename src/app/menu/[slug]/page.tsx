import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ImageGallery } from "@/components/menu/ImageGallery";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle,
  Leaf,
  Flame,
  ExternalLink,
} from "lucide-react";
import { getMenuItemBySlug } from "@/services/menu.service";
import { formatPrice } from "@/lib/utils";
import { AddToCartSection } from "@/components/menu/AddToCartSection";
import { restaurant } from "@/config/restaurant";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await getMenuItemBySlug(slug);
  if (!item) return { title: "Item Not Found" };
  return {
    title: item.name,
    description: item.description,
    openGraph: {
      title: `${item.name} | Old Damascus Menu`,
      description: item.description,
      images: item.image ? [{ url: item.image }] : [],
    },
  };
}

export default async function MenuItemPage({ params }: Props) {
  const { slug } = await params;
  const item = await getMenuItemBySlug(slug);

  if (!item) notFound();

  return (
    <div className="min-h-screen bg-cream py-8">
      <div className="container-site max-w-4xl">
        {/* Back */}
        <Link
          href="/menu"
          className="inline-flex items-center gap-2 text-sm font-semibold text-olive-dark hover:text-brand-dark transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Menu
        </Link>

        <div className="card overflow-hidden">
          {/* Image Gallery */}
          <ImageGallery 
            primaryImage={item.primaryImage || item.image}
            images={item.images || []}
            alt={item.name}
            categoryName={item.categoryName}
          />

          <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Info */}
            <div>
              <h1 className="font-heading text-3xl sm:text-4xl font-bold text-olive-dark mb-2">
                {item.name}
              </h1>
              
              <p className="text-2xl font-bold text-brand-dark mb-4">
                {formatPrice(item.price)}
              </p>

              <p className="text-olive leading-relaxed mb-6">
                {item.description}
              </p>

              {/* Dietary */}
              <div className="flex flex-wrap gap-2 mb-6">
                {item.halal && (
                  <span className="badge badge-green px-3 py-1 text-sm">
                    <CheckCircle className="w-3.5 h-3.5" /> Halal
                  </span>
                )}
                {item.vegetarian && (
                  <span className="badge badge-green px-3 py-1 text-sm">
                    <Leaf className="w-3.5 h-3.5" /> Vegetarian
                  </span>
                )}
                {item.vegan && (
                  <span className="badge badge-green px-3 py-1 text-sm">
                    <Leaf className="w-3.5 h-3.5" /> Vegan
                  </span>
                )}
                {item.spicy && (
                  <span className="badge badge-red px-3 py-1 text-sm">
                    <Flame className="w-3.5 h-3.5" /> Spicy
                  </span>
                )}
                {!item.available && (
                  <span className="badge bg-red-100 text-red-700 px-3 py-1 text-sm">
                    Currently Unavailable
                  </span>
                )}
              </div>

              {/* Alternative ordering */}
              <div className="p-4 bg-cream rounded-xl border border-border">
                <p className="text-xs font-semibold text-olive mb-3 uppercase tracking-wide">
                  Also available on
                </p>
                <div className="flex gap-3">
                  <a
                    href={restaurant.doordashUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline btn-sm"
                  >
                    DoorDash <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href={restaurant.uberEatsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline btn-sm"
                  >
                    Uber Eats <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Add to Cart */}
            <AddToCartSection item={item} />
          </div>
        </div>
      </div>
    </div>
  );
}
