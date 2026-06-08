/**
 * Customer Layout Component
 * Wrapper for all customer pages
 */
export const metadata = {
  title: "My Dashboard - Car Management System",
  description: "Customer portal",
};

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
