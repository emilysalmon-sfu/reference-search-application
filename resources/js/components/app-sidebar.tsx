import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard, fileUploadIndex, articlesIndex, configIndex, articlesList, usersIndex, approvalsIndex, feedbacksIndex } from '@/routes';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Upload, ListCheck, User, Headset, NotebookPen, Settings, Search, MessageCircleWarning, Mail } from 'lucide-react';
import { useState } from 'react';
import AppLogo from './app-logo';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Icon } from '@/components/icon';

const allMainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Search',
        href: articlesIndex(),
        icon: Search,
    },
    {
        title: 'Upload',
        href: fileUploadIndex(),
        icon: Upload,
    },
    {
        title: 'Articles',
        href: articlesList(),
        icon: NotebookPen,
    },
    {
        title: 'Approvals',
        href: approvalsIndex(),
        icon: ListCheck,
    },
    {
        title: 'Users',
        href: usersIndex(),
        icon: User,
        adminOnly: true,
    },
    {
        title: 'Feedbacks/Reports',
        href: feedbacksIndex(),
        icon: MessageCircleWarning,
    }
];

const allFooterNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
        disabled: true,
    },
    {
        title: 'Settings',
        href: configIndex(),
        icon: Settings,
        blank: false,
        adminOnly: true,
    },
    {
        title: 'Documentation',
        href: '/admin/documentation',
        icon: BookOpen,
        blank: false,
    },
];

// Contact information - update these with your details
const CONTACT_INFO = {
    name: 'Matheus Sanches Quessada',
    email: 'matheusquessada98@gmail.com',
};

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const isAdmin = auth.user?.role === 'admin';
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);

    // Filter items based on user role
    const mainNavItems = allMainNavItems.filter(item => !item.adminOnly || isAdmin);
    const footerNavItems = allFooterNavItems.filter(item => !item.adminOnly || isAdmin);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                
                {/* Contact Button - Aligned with NavFooter */}
                <SidebarGroup className="group-data-[collapsible=icon]:p-0">
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    onClick={() => setIsContactModalOpen(true)}
                                    className="text-neutral-600 hover:text-neutral-800 dark:text-neutral-300 dark:hover:text-neutral-100 cursor-pointer"
                                >
                                    <Icon iconNode={Headset} className="h-5 w-5" />
                                    <span>Contact</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <NavUser />
            </SidebarFooter>

            {/* Contact Modal */}
            <Dialog open={isContactModalOpen} onOpenChange={setIsContactModalOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Contact Information</DialogTitle>
                        <DialogDescription>
                            Feel free to reach out with any questions or feedback.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10">
                                <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Name</p>
                                <p className="font-medium">{CONTACT_INFO.name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10">
                                <Mail className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Email</p>
                                <a 
                                    href={`mailto:${CONTACT_INFO.email}`}
                                    className="font-medium text-primary hover:underline"
                                >
                                    {CONTACT_INFO.email}
                                </a>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </Sidebar>
    );
}
