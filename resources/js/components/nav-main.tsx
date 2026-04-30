import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { resolveUrl } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();
    
    const isActiveItem = (itemHref: string | { url: string }) => {
        const itemUrl = resolveUrl(itemHref);
        const currentUrl = page.url.split('?')[0]; // Remove query params
        
        // Exact match for root path
        if (itemUrl === '/') {
            return currentUrl === '/';
        }
        
        // For other paths, use startsWith but ensure it's a proper path match
        return currentUrl === itemUrl || currentUrl.startsWith(itemUrl + '/');
    };
    
    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                            asChild={!item.disabled}
                            isActive={!item.disabled && isActiveItem(item.href)}
                            tooltip={{ children: item.title }}
                            disabled={item.disabled}
                        >
                            {item.disabled ? (
                                <div className="flex items-center">
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                </div>
                            ) : (
                                <Link href={item.href} prefetch>
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                </Link>
                            )}
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
