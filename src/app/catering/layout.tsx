import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Catering",
  description: "Bring the flavors of Damascus to your next event. Authentic Mediterranean catering for weddings, corporate events, and family gatherings in Richardson, TX.",
  alternates: { canonical: "/catering" },
};

export default function CateringLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
