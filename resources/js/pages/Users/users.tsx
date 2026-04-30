import { useState, useEffect } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import Pagination from '@/components/ui/pagination';
import DataTable from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Pencil, Trash2, Plus, KeyRound } from 'lucide-react';
import UserFormModal from '@/components/UserFormModal';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
import FlashMessages from '@/components/ui/flash-messages';

interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'approver';
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
}

interface PaginatedUsers<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    path?: string;
}

interface Props {
    users?: PaginatedUsers<User> | null;
}

export default function Users({ users }: Props) {
    const [localSearchTerm, setLocalSearchTerm] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('edit');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [resettingPasswordUserId, setResettingPasswordUserId] = useState<number | null>(null);

    const columnHelper = createColumnHelper<User>();

    // Guard: if no users data, don't render
    if (!users || !users.data) {
        return (
            <AppLayout>
                <div className="space-y-6 px-4 sm:px-6 lg:px-8">
                    <div className="border-b pb-4">
                        <h1 className="text-4xl font-bold tracking-tight">Users</h1>
                        <p className="text-base text-muted-foreground mt-3">Loading...</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    // Initialize search term from URL parameters on mount
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const search = params.get('search');
        
        if (search) {
            setLocalSearchTerm(search);
            setSearchTerm(search);
        }
    }, []);

    const handlePageChange = (page: number) => {
        if (searchTerm) {
            // During search, maintain search params and add page
            const params: Record<string, any> = {
                search: searchTerm,
                page: page,
            };

            router.get(
                '/admin/users/search',
                params,
                {
                    preserveState: false,
                }
            );
        } else {
            // During normal browsing, just change page
            router.get(
                window.location.pathname,
                { page: page },
                {
                    preserveState: true,
                }
            );
        }
    };

    const handlePageSizeChange = (newPageSize: number) => {
        if (searchTerm) {
            // During search, maintain search params and add per_page
            const params: Record<string, any> = {
                search: searchTerm,
                per_page: newPageSize,
            };

            router.get(
                '/admin/users/search',
                params,
                {
                    preserveState: false,
                }
            );
        } else {
            // During normal browsing, just change per_page
            router.get(
                window.location.pathname,
                { per_page: newPageSize },
                {
                    preserveState: true,
                }
            );
        }
    };

    // Perform server-side search through the entire dataset
    const performSearch = (term: string) => {
        setLocalSearchTerm(term);
        setSearchTerm(term);
        setIsSearching(true);

        if (!term.trim()) {
            // Reset to default list if search is empty
            router.get(
                window.location.pathname,
                {},
                {
                    preserveState: false,
                    onFinish: () => setIsSearching(false),
                }
            );
        } else {
            // Search through all users using search endpoint
            router.get(
                '/admin/users/search',
                { search: term },
                {
                    preserveState: false,
                    onFinish: () => setIsSearching(false),
                }
            );
        }
    };

    const handleSearchInput = (value: string) => {
        setLocalSearchTerm(value);
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            performSearch(localSearchTerm);
        }
    };

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setSelectedUser(null);
        setModalMode('create');
        setIsModalOpen(true);
    };

    const handleDelete = (user: User) => {
        setUserToDelete(user);
        setIsDeleteModalOpen(true);
    };

    const handleResetPassword = (user: User) => {
        setResettingPasswordUserId(user.id);
        router.post(`/admin/users/${user.id}/reset-password`, {}, {
            preserveScroll: true,
            onFinish: () => {
                setResettingPasswordUserId(null);
            },
        });
    };

    const confirmDelete = () => {
        if (!userToDelete) return;

        setIsDeleting(true);
        router.delete(`/admin/users/${userToDelete.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setUserToDelete(null);
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const columns = [
        columnHelper.accessor('name', {
            header: 'Name',
            cell: (info) => {
                const name = info.getValue() || '(No name)';
                return (
                    <p className="font-medium text-foreground" title={name}>
                        {name}
                    </p>
                );
            },
            enableSorting: true,
        }),
        columnHelper.accessor('email', {
            header: 'Email',
            cell: (info) => {
                const email = info.getValue() || '(No email)';
                return (
                    <p className="text-muted-foreground text-sm" title={String(email)}>
                        {email}
                    </p>
                );
            },
            enableSorting: true,
        }),
        columnHelper.accessor('role', {
            header: 'Role',
            cell: (info) => {
                const role = info.getValue();
                const isAdmin = role === 'admin';
                return (
                    <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                            isAdmin
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                        }`}
                    >
                        {role}
                    </span>
                );
            },
            enableSorting: true,
        }),
        columnHelper.accessor('created_at', {
            header: 'Created',
            cell: (info) => {
                const date = info.getValue();
                return <span className="text-sm text-muted-foreground">{formatDate(date)}</span>;
            },
            enableSorting: true,
        }),
        columnHelper.display({
            id: 'actions',
            header: 'Actions',
            cell: (info) => {
                const user = info.row.original;
                const isResetting = resettingPasswordUserId === user.id;
                return (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleResetPassword(user)}
                            disabled={isResetting}
                            className="inline-flex items-center justify-center h-8 w-8 rounded-md text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Send password reset link"
                        >
                            <KeyRound className={`h-4 w-4 ${isResetting ? 'animate-pulse' : ''}`} />
                        </button>
                        <button
                            onClick={() => handleEdit(user)}
                            className="inline-flex items-center justify-center h-8 w-8 rounded-md text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-200 cursor-pointer"
                            title="Edit user"
                        >
                            <Pencil className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => handleDelete(user)}
                            className="inline-flex items-center justify-center h-8 w-8 rounded-md text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-200 cursor-pointer"
                            title="Delete user"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                );
            },
            enableSorting: false,
        }),
    ];

    return (
        <AppLayout>
            <FlashMessages />
            <div className="space-y-6 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="border-b pb-4 mt-6 flex justify-between items-start">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight">Users</h1>
                        <p className="text-base text-muted-foreground mt-3">
                            Total: <span className="font-semibold text-foreground">{users.total}</span> users
                        </p>
                    </div>
                    <Button onClick={handleAddNew} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add User
                    </Button>
                </div>

                {/* Search Section */}
                <Card className="p-6 bg-card">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-foreground mb-3">
                                Search Users
                            </label>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name or email... (press Enter)"
                                    value={localSearchTerm}
                                    onChange={(e) => handleSearchInput(e.target.value)}
                                    onKeyDown={handleSearchKeyDown}
                                    className="pl-12 h-10 text-base"
                                />
                            </div>
                        </div>
                        {searchTerm && (
                            <div className="flex items-center justify-between pt-2">
                                <p className="text-sm text-muted-foreground">
                                    Showing <span className="font-semibold text-foreground">{users?.data?.length || 0}</span> results
                                </p>
                                <button
                                    onClick={() => {
                                        setLocalSearchTerm('');
                                        performSearch('');
                                    }}
                                    className="text-sm text-primary hover:text-primary/80 transition-colors"
                                >
                                    Clear search
                                </button>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Pagination */}
                {!searchTerm && users?.last_page && users.last_page > 1 && (
                    <div className="flex justify-between items-center pb-4">
                        <Pagination 
                            pagination={users} 
                            maxButtons={7} 
                            onPageChange={handlePageChange}
                        />
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-foreground">Show:</label>
                            <select
                                value={users?.per_page || 15}
                                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                                className="px-3 py-1 rounded-md border border-input bg-background text-sm text-foreground hover:bg-accent/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value={10}>10</option>
                                <option value={15}>15</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* Pagination during search */}
                {searchTerm && users?.last_page && users.last_page > 1 && (
                    <div className="flex justify-between items-center pb-4">
                        <Pagination 
                            pagination={users} 
                            maxButtons={7} 
                            onPageChange={handlePageChange}
                        />
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-foreground">Show:</label>
                            <select
                                value={users?.per_page || 15}
                                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                                className="px-3 py-1 rounded-md border border-input bg-background text-sm text-foreground hover:bg-accent/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value={10}>10</option>
                                <option value={15}>15</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* Users Table */}
                <Card className="overflow-hidden bg-card py-0 mb-8">
                    <DataTable
                        columns={columns}
                        data={users.data}
                        isLoading={isSearching}
                        emptyMessage={searchTerm ? 'No users match your search. Try different keywords.' : 'No users found.'}
                    />
                </Card>

                {searchTerm && users?.data?.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-base text-muted-foreground">
                            No users match your search. Try different keywords.
                        </p>
                    </div>
                )}

                {/* User Form Modal */}
                <UserFormModal
                    open={isModalOpen}
                    onOpenChange={setIsModalOpen}
                    user={selectedUser}
                    mode={modalMode}
                />

                {/* Delete Confirmation Modal */}
                <ConfirmDeleteModal
                    open={isDeleteModalOpen}
                    onOpenChange={setIsDeleteModalOpen}
                    onConfirm={confirmDelete}
                    title="Delete User"
                    description="This action cannot be undone. The user will be permanently removed from the system."
                    itemName={userToDelete?.name}
                    isDeleting={isDeleting}
                />
            </div>
        </AppLayout>
    );
}
