import { Head, Link, usePage } from '@inertiajs/react';
import AppLogo from '@/components/app-logo';
import Footer from '@/components/footer';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PublicLayoutProps {
    children: ReactNode;
    title?: string;
}

export default function PublicLayout({ children, title }: PublicLayoutProps) {
    const { url } = usePage();
    
    const isActive = (path: string) => {
        if (path === '/') {
            return url === '/' || url.startsWith('/?') || url.startsWith('/articles/search');
        }
        return url.startsWith(path);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
            <Head title={title} />
            <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                <div className="container mx-auto px-4">
                    <nav className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-8">
                            <Link href="/" className="flex items-center space-x-2">
                                <AppLogo />
                            </Link>
                            <Link 
                                href="/introduction" 
                                className={cn(
                                    "transition-colors hover:text-gray-900 dark:hover:text-white",
                                    isActive('/introduction') 
                                        ? "text-lg font-semibold text-gray-900 dark:text-white" 
                                        : "text-gray-600 dark:text-gray-300"
                                )}
                            >
                                Introduction
                            </Link>
                            <Link 
                                href="/" 
                                className={cn(
                                    "transition-colors hover:text-gray-900 dark:hover:text-white",
                                    isActive('/') 
                                        ? "text-lg font-semibold text-gray-900 dark:text-white" 
                                        : "text-gray-600 dark:text-gray-300"
                                )}
                            >
                                Search
                            </Link>
                            <a
                                href="https://balancecolab.com"
                                rel="noopener noreferrer"
                                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                            >
                                Balance Co-Lab
                            </a>
                        </div>
                    </nav>
                </div>
            </header>
            <main className="container mx-auto px-4 py-8 flex-1">
                {children}
            </main>
            <Footer />
        </div>
    );
}