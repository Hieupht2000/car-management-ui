/**
 * Admin Layout Component
 * Wrapper for all admin pages
 */
export const metadata = {
  title: "Admin Dashboard - Car Management System",
  description: "Administrator control panel",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
