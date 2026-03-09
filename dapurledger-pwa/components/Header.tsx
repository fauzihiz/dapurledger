'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface HeaderProps {
    title: string;
    showBack?: boolean;
    action?: React.ReactNode;
}

export default function Header({ title, showBack = false, action }: HeaderProps) {
    const router = useRouter();

    return (
        <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-xl border-b border-slate-50">
            <div className="flex items-center justify-between h-14 px-4 max-w-md mx-auto">
                <div className="flex items-center gap-2 min-w-0">
                    {showBack && (
                        <button
                            onClick={() => router.back()}
                            className="p-2 -ml-2 text-slate-500 hover:bg-slate-50 rounded-xl transition-colors active:scale-90"
                            aria-label="Go back"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    )}
                    <h1 className="text-[17px] font-bold text-slate-900 truncate">{title}</h1>
                </div>
                {action && <div className="shrink-0">{action}</div>}
            </div>
        </header>
    );
}
