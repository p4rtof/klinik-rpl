export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nanti diubah ya */}
      <main>{children}</main>
    </div>
  );
}
