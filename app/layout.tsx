import MobileNav from '@/components/MobileNav'
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white pb-16">
        {children}
        <MobileNav />
      </body>
    </html>
  );
}