'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Package, ClipboardList, Zap, Wallet, type LucideIcon } from 'lucide-react';

interface NavItem {
    name: string;
    href: string;
    icon: LucideIcon;
}

const navItems: NavItem[] = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Produksi', href: '/production', icon: ClipboardList },
    { name: 'Simulasi', href: '/simulation', icon: Zap },
    { name: 'Stok', href: '/inventory', icon: Package },
    { name: 'Kas', href: '/stats', icon: Wallet },
];

export default function Navbar() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-slate-100 pb-safe">
            <div className="flex justify-around items-center h-[3.75rem] max-w-md mx-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex flex-col items-center justify-center flex-1 h-full relative transition-colors duration-200 ${isActive
                                    ? 'text-sky-500'
                                    : 'text-slate-400 active:text-slate-600'
                                }`}
                        >
                            {isActive && (
                                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-full bg-sky-500" />
                            )}
                            <Icon
                                className={`w-[22px] h-[22px] transition-all duration-200 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.5px]'
                                    }`}
                            />
                            <span className={`text-[10px] mt-0.5 transition-all duration-200 ${isActive ? 'font-bold' : 'font-medium'
                                }`}>
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
