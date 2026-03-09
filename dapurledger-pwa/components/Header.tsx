'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface HeaderProps {
    title: string;
    showBack?: boolean;
}

export default function Header({ title, showBack = false }: HeaderProps) {
    const router = useRouter();

    return (
        <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div className="flex items-center h-14 px-4">
                {showBack && (
                    <button
                        onClick={() => router.back()}
                        className="p-2 mr-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                )}
                <h1 className="text-lg font-bold text-gray-900 truncate">{title}</h1>
            </div>
        </header>
    );
}
