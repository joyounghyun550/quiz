import BottomNav from "@/widgets/bottom-nav/ui/BottomNav";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-gray-950 pb-20">
      {children}
      <BottomNav />
    </div>
  );
}
