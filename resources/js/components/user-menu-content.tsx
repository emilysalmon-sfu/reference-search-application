import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { logout } from '@/routes';
import { edit } from '@/routes/profile';
import { Link, router } from '@inertiajs/react';
import { LogOut, Settings } from 'lucide-react';

export function UserMenuContent() {
    const cleanup = useMobileNavigation();

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    return (
        <>
            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link
                        className="block w-full"
                        href={edit()}
                        as="button"
                        prefetch
                        onClick={cleanup}
                    >
                        <Settings className="mr-2" />
                        Settings
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link
                    className="block w-full"
                    href={logout()}
                    as="button"
                    onClick={handleLogout}
                    data-test="logout-button"
                >
                    <LogOut className="mr-2" />
                    Log out
                </Link>
            </DropdownMenuItem>
        </>
    );
}
