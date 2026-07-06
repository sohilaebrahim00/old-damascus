import type { Metadata } from "next";
import { OrderingOptions } from "@/components/home/OrderingOptions";

export const metadata: Metadata = {
  title: "Order Online",
  description:
    "Order online from Old Damascus Mediterranean Restaurant. Choose between direct pickup/delivery, DoorDash, or Uber Eats.",
  alternates: { canonical: "/order" },
};

export default function OrderPage() {
  return (
    <div className="min-h-screen bg-cream py-10">
      <div className="container-site max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-olive-dark">
            Place Your Order
          </h1>
          <p className="text-olive mt-2 max-w-md mx-auto">
            Choose how you want to order. Order directly from us for the best prices and fresh preparation.
          </p>
        </div>

        <OrderingOptions />
      </div>
    </div>
  );
}
