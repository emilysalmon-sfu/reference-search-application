import { useState } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import Pagination from '@/components/ui/pagination';
import DataTable from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ExternalLink, Check, X } from 'lucide-react';
import ApprovalFormModal from '@/components/ApprovalFormModal';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
import FlashMessages from '@/components/ui/flash-messages';
import { useGetTypeColor } from '@/hooks/use-type-styles';

interface Article {
    id: number;
    author: string;
    title: string;
    type_of_study: string;
    year_published: number;
    journal_name: string;
    keywords: string | string[] | null;
    abstract: string;
    doi: string;
    country?: string;
    theme?: string;
    sub_theme_1?: string;
    created_at: string;
}

interface PaginatedArticles<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    path?: string;
}

interface ThemeData {
    theme: string;
    subthemes: string[];
}

interface Props {
    articles?: PaginatedArticles<Article> | null;
    types?: string[];
    themes?: ThemeData[];
}

export default function Approvals({ articles, types = [], themes = [] }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [articleToReject, setArticleToReject] = useState<Article | null>(null);
    const [isRejecting, setIsRejecting] = useState(false);
    const getTypeColor = useGetTypeColor();

    const columnHelper = createColumnHelper<Article>();

    // Guard: if no articles data, show empty state
    if (!articles || !articles.data) {
        return (
            <AppLayout>
                <FlashMessages />
                <div className="space-y-6 px-4 sm:px-6 lg:px-8">
                    <div className="border-b pb-4 mt-6">
                        <h1 className="text-4xl font-bold tracking-tight">Pending Approvals</h1>
                        <p className="text-base text-muted-foreground mt-3">
                            No articles pending approval.
                        </p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    const handlePageChange = (page: number) => {
        router.get(
            window.location.pathname,
            { page: page },
            {
                preserveState: true,
            }
        );
    };

    const handleOpenArticle = (doi: string) => {
        if (doi) {
            window.open(`https://doi.org/${doi}`, '_blank');
        }
    };

    const handleApprove = (article: Article) => {
        setSelectedArticle(article);
        setIsModalOpen(true);
    };

    const handleReject = (article: Article) => {
        setArticleToReject(article);
        setIsRejectModalOpen(true);
    };

    const confirmReject = () => {
        if (!articleToReject) return;

        setIsRejecting(true);
        router.delete(`/admin/approvals/${articleToReject.id}/reject`, {
            preserveScroll: true,
            onSuccess: () => {
                setIsRejectModalOpen(false);
                setArticleToReject(null);
            },
            onFinish: () => {
                setIsRejecting(false);
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
        columnHelper.accessor('title', {
            header: 'Title',
            cell: (info) => {
                const article = info.row.original;
                const title = article?.title || '(No title)';
                return (
                    <p className="font-medium text-foreground" title={title}>
                        {title}
                    </p>
                );
            },
            enableSorting: true,
        }),
        columnHelper.accessor('author', {
            header: 'Author',
            cell: (info) => {
                const author = info.getValue() || '(No author)';
                return (
                    <p className="text-muted-foreground text-sm break-words" title={String(author)}>
                        {author}
                    </p>
                );
            },
            enableSorting: true,
        }),
        columnHelper.accessor('year_published', {
            header: 'Year',
            cell: (info) => {
                const year = info.getValue();
                return <span className="font-medium">{year || '—'}</span>;
            },
            enableSorting: true,
        }),
        columnHelper.accessor('journal_name', {
            header: 'Journal',
            cell: (info) => {
                const journal = info.getValue() || '(No journal)';
                return (
                    <p className="text-muted-foreground text-sm truncate" title={String(journal)}>
                        {journal}
                    </p>
                );
            },
            enableSorting: true,
        }),
        columnHelper.accessor('type_of_study', {
            header: 'Type',
            cell: (info) => {
                const type = info.getValue();
                return (
                    <Badge className={getTypeColor(type)}>
                        {type || '(No type)'}
                    </Badge>
                );
            },
            enableSorting: true,
        }),
        columnHelper.accessor('created_at', {
            header: 'Submitted',
            cell: (info) => {
                const date = info.getValue();
                return <span className="text-sm text-muted-foreground">{formatDate(date)}</span>;
            },
            enableSorting: true,
        }),
        columnHelper.accessor('doi', {
            header: 'Actions',
            cell: (info) => {
                const article = info.row.original;
                return (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleOpenArticle(article?.doi)}
                            disabled={!article?.doi}
                            className={`inline-flex items-center justify-center h-8 w-8 rounded-md text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-900/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${article?.doi ? 'cursor-pointer' : ''}`}
                            title={article?.doi ? 'View article' : 'No DOI available'}
                        >
                            <ExternalLink className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => handleApprove(article)}
                            className="inline-flex items-center justify-center h-8 w-8 rounded-md text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 transition-all duration-200 cursor-pointer"
                            title="Approve article"
                        >
                            <Check className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => handleReject(article)}
                            className="inline-flex items-center justify-center h-8 w-8 rounded-md text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-200 cursor-pointer"
                            title="Reject article"
                        >
                            <X className="h-4 w-4" />
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
                <div className="border-b pb-4 mt-6">
                    <h1 className="text-4xl font-bold tracking-tight">Pending Approvals</h1>
                    <p className="text-base text-muted-foreground mt-3">
                        Total: <span className="font-semibold text-foreground">{articles.total}</span> articles pending approval
                    </p>
                </div>

                {/* Pagination */}
                {articles?.last_page && articles.last_page > 1 && (
                    <div className="flex justify-start items-center pb-4">
                        <Pagination 
                            pagination={articles} 
                            maxButtons={7} 
                            onPageChange={handlePageChange}
                        />
                    </div>
                )}

                {/* Articles Table */}
                <Card className="overflow-hidden bg-card py-0 mb-8">
                    <DataTable
                        columns={columns}
                        data={articles.data}
                        emptyMessage="No articles pending approval."
                    />
                </Card>

                {/* Approval Form Modal */}
                <ApprovalFormModal
                    open={isModalOpen}
                    onOpenChange={setIsModalOpen}
                    article={selectedArticle}
                    types={types}
                    themes={themes}
                />

                {/* Reject Confirmation Modal */}
                <ConfirmDeleteModal
                    open={isRejectModalOpen}
                    onOpenChange={setIsRejectModalOpen}
                    onConfirm={confirmReject}
                    title="Reject Article"
                    description="This action cannot be undone. The article will be permanently removed from the system."
                    itemName={articleToReject?.title}
                    isDeleting={isRejecting}
                />
            </div>
        </AppLayout>
    );
}
