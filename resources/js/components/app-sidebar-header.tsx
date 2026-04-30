import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { usePage } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { logout } from '@/routes';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { props } = usePage();

    return (
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            <div className="flex items-center gap-4">
                {(props.auth?.user?.name || props.user?.name) && (
                    <span className="text-sm font-medium text-foreground">
                        {props.auth?.user?.name || props.user?.name}
                    </span>
                )}
                <Link
                    href={logout()}
                    method="post"
                    as="button"
                    className="text-sm text-muted-foreground hover:text-foreground cursor-pointer"
                >
                    Logout
                </Link>
            </div>
        </header>
    );
}
