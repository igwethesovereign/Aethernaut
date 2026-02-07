'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/treasury', label: 'Treasury' },
  { href: '/agents', label: 'Agents' },
  { href: '/markets', label: 'Markets' },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0F]/90 backdrop-blur-md border-b border-[#D4AF37]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <span className="text-2xl">👑</span>
            <span className="text-[#D4AF37] font-bold text-xl">Aethernaut</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'bg-[#D4AF37]/20 text-[#D4AF37]'
                    : 'text-gray-400 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Wallet */}
          <WalletMultiButton className="!bg-[#D4AF37] !text-[#0A0A0F] !font-semibold !rounded-lg !px-4 !py-2" />
        </div>
      </div>
    </header>
  );
}
