import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Old Damascus Mediterranean Restaurant. We are located in Richardson, TX. Call, email, or visit us for authentic Mediterranean food.",
  alternates: { canonical: "/contact" },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
