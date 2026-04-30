import { useState, useEffect } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import Pagination from '@/components/ui/pagination';
import DataTable from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Eye, CheckCircle, Trash2, XCircle } from 'lucide-react';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
import FlashMessages from '@/components/ui/flash-messages';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface Feedback {
    id: number;
    name: string;
    email: string;
    comment: string;
    isResolved: boolean;
    created_at: string;
}

interface PaginatedFeedbacks<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    path?: string;
}

interface Props {
    feedbacks?: PaginatedFeedbacks<Feedback> | null;
}

const statusColors: Record<string, string> = {
    'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'resolved': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

export default function FeedbackList({ feedbacks }: Props) {
    const [localSearchTerm, setLocalSearchTerm] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [feedbackToDelete, setFeedbackToDelete] = useState<Feedback | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [feedbackToChangeStatus, setFeedbackToChangeStatus] = useState<Feedback | null>(null);
    const [isChangingStatus, setIsChangingStatus] = useState(false);

    // Guard: if no feedbacks data, don't render
    if (!feedbacks || !feedbacks.data) {
        return (
            <AppLayout>
                <div className="space-y-6 px-4 sm:px-6 lg:px-8">
                    <div className="border-b pb-4">
                        <h1 className="text-4xl font-bold tracking-tight">Feedbacks</h1>
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
        const status = params.get('status');
        
        if (search) {
            setLocalSearchTerm(search);
            setSearchTerm(search);
        }
        if (status) {
            setStatusFilter(status);
        }
    }, []);

    const handlePageChange = (page: number) => {
        const params: Record<string, any> = { page };
        if (searchTerm) params.search = searchTerm;
        if (statusFilter) params.status = statusFilter;

        router.get(
            '/admin/feedbacks/search',
            params,
            { preserveState: true }
        );
    };

    const handlePageSizeChange = (newPageSize: number) => {
        const params: Record<string, any> = { per_page: newPageSize };
        if (searchTerm) params.search = searchTerm;
        if (statusFilter) params.status = statusFilter;

        router.get(
            '/admin/feedbacks/search',
            params,
            { preserveState: true }
        );
    };

    const performSearch = (term: string, status?: string) => {
        setLocalSearchTerm(term);
        setSearchTerm(term);
        setIsSearching(true);

        const currentStatus = status !== undefined ? status : statusFilter;

        if (!term.trim() && !currentStatus) {
            // Reset to default list if search is empty and no filters
            router.get(
                '/admin/feedbacks',
                {},
                {
                    preserveState: false,
                    onFinish: () => setIsSearching(false),
                }
            );
        } else {
            const params: Record<string, any> = {};
            if (term.trim()) params.search = term;
            if (currentStatus) params.status = currentStatus;

            router.get(
                '/admin/feedbacks/search',
                params,
                {
                    preserveState: false,
                    onFinish: () => setIsSearching(false),
                }
            );
        }
    };

    const handleStatusFilterChange = (status: string) => {
        setStatusFilter(status);
        performSearch(localSearchTerm, status);
    };

    const handleSearchInput = (value: string) => {
        setLocalSearchTerm(value);
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            performSearch(localSearchTerm);
        }
    };

    const handleViewMore = (feedback: Feedback) => {
        setSelectedFeedback(feedback);
        setIsViewModalOpen(true);
    };

    const handleResolve = (feedback: Feedback) => {
        setFeedbackToChangeStatus(feedback);
        setIsStatusModalOpen(true);
    };

    const handleUnresolve = (feedback: Feedback) => {
        setFeedbackToChangeStatus(feedback);
        setIsStatusModalOpen(true);
    };

    const confirmStatusChange = () => {
        if (!feedbackToChangeStatus) return;

        setIsChangingStatus(true);
        const endpoint = feedbackToChangeStatus.isResolved 
            ? `/admin/feedbacks/${feedbackToChangeStatus.id}/unresolve`
            : `/admin/feedbacks/${feedbackToChangeStatus.id}/resolve`;

        router.patch(endpoint, {}, {
            preserveScroll: true,
            onSuccess: () => {
                setIsStatusModalOpen(false);
                setFeedbackToChangeStatus(null);
            },
            onFinish: () => {
                setIsChangingStatus(false);
            },
        });
    };

    const handleDelete = (feedback: Feedback) => {
        setFeedbackToDelete(feedback);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (!feedbackToDelete) return;

        setIsDeleting(true);
        router.delete(`/admin/feedbacks/${feedbackToDelete.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setFeedbackToDelete(null);
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const truncateMessage = (message: string, maxLength: number = 50) => {
        if (message.length <= maxLength) return message;
        return message.substring(0, maxLength) + '...';
    };

    const columns: ColumnDef<Feedback>[] = [
        {
            accessorKey: 'name',
            header: 'Name',
            cell: ({ row }) => {
                const name = row.original.name || '(No name)';
                return (
                    <p className="font-medium text-foreground" title={name}>
                        {name}
                    </p>
                );
            },
            enableSorting: true,
        },
        {
            accessorKey: 'email',
            header: 'Email',
            cell: ({ row }) => {
                const email = row.original.email || '(No email)';
                return (
                    <p className="text-muted-foreground text-sm" title={email}>
                        {email}
                    </p>
                );
            },
            enableSorting: true,
        },
        {
            accessorKey: 'comment',
            header: 'Message',
            cell: ({ row }) => {
                const comment = row.original.comment || '(No message)';
                return (
                    <p className="text-muted-foreground text-sm" title={comment}>
                        {truncateMessage(comment)}
                    </p>
                );
            },
            enableSorting: false,
        },
        {
            accessorKey: 'isResolved',
            header: 'Status',
            cell: ({ row }) => {
                const isResolved = row.original.isResolved;
                const status = isResolved ? 'resolved' : 'pending';
                return (
                    <Badge className={statusColors[status]}>
                        {isResolved ? 'Resolved' : 'Pending'}
                    </Badge>
                );
            },
            enableSorting: true,
        },
        {
            accessorKey: 'created_at',
            header: 'Date Created',
            cell: ({ row }) => {
                const date = row.original.created_at;
                return (
                    <span className="text-muted-foreground text-sm">
                        {formatDate(date)}
                    </span>
                );
            },
            enableSorting: true,
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const feedback = row.original;
                return (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleViewMore(feedback)}
                            className="inline-flex items-center justify-center h-8 w-8 rounded-md text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-200 cursor-pointer"
                            title="View full message"
                        >
                            <Eye className="h-4 w-4" />
                        </button>
                        {!feedback.isResolved ? (
                            <button
                                onClick={() => handleResolve(feedback)}
                                className="inline-flex items-center justify-center h-8 w-8 rounded-md text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 transition-all duration-200 cursor-pointer"
                                title="Mark as resolved"
                            >
                                <CheckCircle className="h-4 w-4" />
                            </button>
                        ) : (
                            <button
                                onClick={() => handleUnresolve(feedback)}
                                className="inline-flex items-center justify-center h-8 w-8 rounded-md text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-all duration-200 cursor-pointer"
                                title="Mark as pending"
                            >
                                <XCircle className="h-4 w-4" />
                            </button>
                        )}
                        <button
                            onClick={() => handleDelete(feedback)}
                            className="inline-flex items-center justify-center h-8 w-8 rounded-md text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-200 cursor-pointer"
                            title="Delete feedback"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                );
            },
            enableSorting: false,
        },
    ];

    return (
        <AppLayout>
            <FlashMessages />
            <div className="space-y-6 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="border-b pb-4 mt-6">
                    <h1 className="text-4xl font-bold tracking-tight">Feedbacks</h1>
                    <p className="text-base text-muted-foreground mt-3">
                        Total: <span className="font-semibold text-foreground">{feedbacks.total}</span> feedbacks
                    </p>
                </div>

                {/* Search Section */}
                <Card className="p-6 bg-card">
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-semibold text-foreground mb-3">
                                    Search Feedbacks
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by name, email, or message... (press Enter)"
                                        value={localSearchTerm}
                                        onChange={(e) => handleSearchInput(e.target.value)}
                                        onKeyDown={handleSearchKeyDown}
                                        className="pl-12 h-10 text-base"
                                    />
                                </div>
                            </div>
                            <div className="sm:w-48">
                                <label className="block text-sm font-semibold text-foreground mb-3">
                                    Status Filter
                                </label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => handleStatusFilterChange(e.target.value)}
                                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm text-foreground hover:bg-accent/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary h-10"
                                >
                                    <option value="">All Status</option>
                                    <option value="unresolved">Pending</option>
                                    <option value="resolved">Resolved</option>
                                </select>
                            </div>
                        </div>
                        {(searchTerm || statusFilter) && (
                            <div className="flex items-center justify-between pt-2">
                                <p className="text-sm text-muted-foreground">
                                    Showing <span className="font-semibold text-foreground">{feedbacks?.data?.length || 0}</span> results
                                </p>
                                <button
                                    onClick={() => {
                                        setLocalSearchTerm('');
                                        setSearchTerm('');
                                        setStatusFilter('');
                                        router.get('/admin/feedbacks', {}, { preserveState: false });
                                    }}
                                    className="text-sm text-primary hover:text-primary/80 transition-colors"
                                >
                                    Clear filters
                                </button>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Pagination */}
                {feedbacks?.last_page && feedbacks.last_page > 1 && (
                    <div className="flex justify-between items-center pb-4">
                        <Pagination 
                            pagination={feedbacks} 
                            maxButtons={7} 
                            onPageChange={handlePageChange}
                        />
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-foreground">Show:</label>
                            <select
                                value={feedbacks?.per_page || 15}
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

                {/* Feedbacks Table */}
                <Card className="overflow-hidden bg-card py-0 mb-8">
                    <DataTable
                        columns={columns}
                        data={feedbacks.data}
                        isLoading={isSearching}
                        emptyMessage={searchTerm || statusFilter ? 'No feedbacks match your search. Try different keywords.' : 'No feedbacks found.'}
                    />
                </Card>

                {/* View Feedback Modal */}
                <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Feedback Details</DialogTitle>
                            <DialogDescription>
                                Full feedback information
                            </DialogDescription>
                        </DialogHeader>
                        {selectedFeedback && (
                            <div className="space-y-4 mt-4">
                                <div>
                                    <label className="text-sm font-semibold text-foreground">Name</label>
                                    <p className="text-muted-foreground mt-1">{selectedFeedback.name}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-foreground">Email</label>
                                    <p className="text-muted-foreground mt-1">{selectedFeedback.email}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-foreground">Status</label>
                                    <div className="mt-1">
                                        <Badge className={statusColors[selectedFeedback.isResolved ? 'resolved' : 'pending']}>
                                            {selectedFeedback.isResolved ? 'Resolved' : 'Pending'}
                                        </Badge>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-foreground">Date Created</label>
                                    <p className="text-muted-foreground mt-1">{formatDate(selectedFeedback.created_at)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-foreground">Message</label>
                                    <div className="mt-1 p-4 bg-muted rounded-md">
                                        <p className="text-foreground whitespace-pre-wrap">{selectedFeedback.comment}</p>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 pt-4">
                                    {!selectedFeedback.isResolved ? (
                                        <Button
                                            onClick={() => {
                                                setIsViewModalOpen(false);
                                                handleResolve(selectedFeedback);
                                            }}
                                            className="bg-green-600 hover:bg-green-700"
                                        >
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Mark as Resolved
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={() => {
                                                setIsViewModalOpen(false);
                                                handleUnresolve(selectedFeedback);
                                            }}
                                            variant="outline"
                                        >
                                            <XCircle className="h-4 w-4 mr-2" />
                                            Mark as Pending
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Modal */}
                <ConfirmDeleteModal
                    open={isDeleteModalOpen}
                    onOpenChange={setIsDeleteModalOpen}
                    onConfirm={confirmDelete}
                    title="Delete Feedback"
                    description="This action cannot be undone. The feedback will be permanently removed from the database."
                    itemName={feedbackToDelete?.name ? `Feedback from ${feedbackToDelete.name}` : undefined}
                    isDeleting={isDeleting}
                />

                {/* Status Change Confirmation Modal */}
                <Dialog open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>
                                {feedbackToChangeStatus?.isResolved ? 'Mark as Pending?' : 'Mark as Resolved?'}
                            </DialogTitle>
                            <DialogDescription>
                                {feedbackToChangeStatus?.isResolved 
                                    ? 'This will mark the feedback as pending and it will appear in the unresolved feedbacks count.'
                                    : 'This will mark the feedback as resolved and remove it from the unresolved feedbacks count.'}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex justify-end gap-2 pt-4">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsStatusModalOpen(false);
                                    setFeedbackToChangeStatus(null);
                                }}
                                disabled={isChangingStatus}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={confirmStatusChange}
                                disabled={isChangingStatus}
                                className={feedbackToChangeStatus?.isResolved 
                                    ? 'bg-yellow-600 hover:bg-yellow-700' 
                                    : 'bg-green-600 hover:bg-green-700'}
                            >
                                {isChangingStatus ? 'Processing...' : 'Confirm'}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
