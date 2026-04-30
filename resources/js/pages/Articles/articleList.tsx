import { useMemo, useState, useEffect } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import Pagination from '@/components/ui/pagination';
import DataTable from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Search, Pencil, Trash2, Plus } from 'lucide-react';
import ArticleFormModal from '@/components/ArticleFormModal';
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

export default function ArticleList({ articles, types = [], themes = [] }: Props) {
    const [localSearchTerm, setLocalSearchTerm] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [missingYear, setMissingYear] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('edit');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const getTypeColor = useGetTypeColor();

    const columnHelper = createColumnHelper<Article>();

    // Guard: if no articles data, don't render
    if (!articles || !articles.data) {
        return (
            <AppLayout>
                <div className="space-y-6 px-4 sm:px-6 lg:px-8">
                    <div className="border-b pb-4">
                        <h1 className="text-4xl font-bold tracking-tight">Articles</h1>
                        <p className="text-base text-muted-foreground mt-3">Loading...</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    // Initialize search term from URL parameters on mount
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const title = params.get('title');
        const missingYearParam = params.get('missing_year');
        
        if (title) {
            setLocalSearchTerm(title);
            setSearchTerm(title);
        }
        if (missingYearParam === '1') {
            setMissingYear(true);
        }
    }, []);

    const handlePageChange = (page: number) => {
        if (searchTerm || missingYear) {
            // During search/filter, maintain params and add page
            const params: Record<string, any> = {
                page: page,
            };
            if (searchTerm) {
                params.title = searchTerm;
                params.author = searchTerm;
                params.journal = searchTerm;
                params.keywords = searchTerm;
            }
            if (missingYear) {
                params.missing_year = '1';
            }

            router.get(
                '/admin/articles/search',
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
        if (searchTerm || missingYear) {
            // During search/filter, maintain params and add per_page
            const params: Record<string, any> = {
                per_page: newPageSize,
            };
            if (searchTerm) {
                params.title = searchTerm;
                params.author = searchTerm;
                params.journal = searchTerm;
                params.keywords = searchTerm;
            }
            if (missingYear) {
                params.missing_year = '1';
            }

            router.get(
                '/admin/articles/search',
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
    const performSearch = (term: string, filterMissingYear: boolean = missingYear) => {
        setLocalSearchTerm(term);
        setSearchTerm(term);
        setIsSearching(true);

        if (!term.trim() && !filterMissingYear) {
            // Reset to default list if search is empty and no filters
            router.get(
                window.location.pathname,
                {},
                {
                    preserveState: false,
                    onFinish: () => setIsSearching(false),
                }
            );
        } else {
            // Search through all articles using searchArticlesList endpoint
            const params: Record<string, any> = {};
            if (term.trim()) {
                params.title = term;
                params.author = term;
                params.journal = term;
                params.keywords = term;
            }
            if (filterMissingYear) {
                params.missing_year = '1';
            }

            router.get(
                '/admin/articles/search',
                params,
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

    const handleOpenArticle = (doi: string) => {
        if (doi) {
            window.open(`https://doi.org/${doi}`, '_blank');
        }
    };

    const handleEdit = (article: Article) => {
        setSelectedArticle(article);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setSelectedArticle(null);
        setModalMode('create');
        setIsModalOpen(true);
    };

    const handleDelete = (article: Article) => {
        setArticleToDelete(article);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (!articleToDelete) return;

        setIsDeleting(true);
        router.delete(`/admin/articles/${articleToDelete.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setArticleToDelete(null);
            },
            onFinish: () => {
                setIsDeleting(false);
            },
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
                return <span className="font-medium">{year || 'Forthcoming'}</span>;
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
        columnHelper.accessor('doi', {
            header: 'Action',
            cell: (info) => {
                const article = info.row.original;
                return (
                    <div className="flex items-center gap-2 justify-center">
                        <button
                            onClick={() => handleOpenArticle(article?.doi)}
                            disabled={!article?.doi}
                            className={`inline-flex items-center justify-center h-8 w-8 rounded-md text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-900/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${article?.doi ? 'cursor-pointer' : ''}`}
                            title={article?.doi ? 'Check out this article' : 'No DOI available'}
                        >
                            <ExternalLink className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => handleEdit(article)}
                            className="inline-flex items-center justify-center h-8 w-8 rounded-md text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-200 cursor-pointer"
                            title="Edit article"
                        >
                            <Pencil className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => handleDelete(article)}
                            className="inline-flex items-center justify-center h-8 w-8 rounded-md text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-200 cursor-pointer"
                            title="Delete article"
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
                        <h1 className="text-4xl font-bold tracking-tight">Articles</h1>
                        <p className="text-base text-muted-foreground mt-3">
                            Total: <span className="font-semibold text-foreground">{articles.total}</span> articles
                        </p>
                    </div>
                    <Button onClick={handleAddNew} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Article
                    </Button>
                </div>

                {/* Search Section */}
                <Card className="p-6 bg-card">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-foreground mb-3">
                                Search Articles
                            </label>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    placeholder="Type to search... (press Enter)"
                                    value={localSearchTerm}
                                    onChange={(e) => handleSearchInput(e.target.value)}
                                    onKeyDown={handleSearchKeyDown}
                                    className="pl-12 h-10 text-base"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="missing-year"
                                checked={missingYear}
                                onChange={(e) => {
                                    setMissingYear(e.target.checked);
                                    performSearch(localSearchTerm, e.target.checked);
                                }}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <label htmlFor="missing-year" className="text-sm text-muted-foreground cursor-pointer">
                                Show only articles without year
                            </label>
                        </div>
                        {(searchTerm || missingYear) && (
                            <div className="flex items-center justify-between pt-2">
                                <p className="text-sm text-muted-foreground">
                                    Showing <span className="font-semibold text-foreground">{articles?.data?.length || 0}</span> results
                                    {missingYear && <span className="ml-1">(missing year filter active)</span>}
                                </p>
                                <button
                                    onClick={() => {
                                        setLocalSearchTerm('');
                                        setMissingYear(false);
                                        performSearch('', false);
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
                {!(searchTerm || missingYear) && articles?.last_page && articles.last_page > 1 && (
                    <div className="flex justify-between items-center pb-4">
                        <Pagination 
                            pagination={articles} 
                            maxButtons={7} 
                            onPageChange={handlePageChange}
                        />
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-foreground">Show:</label>
                            <select
                                value={articles?.per_page || 15}
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

                {/* Pagination during search/filter */}
                {(searchTerm || missingYear) && articles?.last_page && articles.last_page > 1 && (
                    <div className="flex justify-between items-center pb-4">
                        <Pagination 
                            pagination={articles} 
                            maxButtons={7} 
                            onPageChange={handlePageChange}
                        />
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-foreground">Show:</label>
                            <select
                                value={articles?.per_page || 15}
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

                {/* Articles Table */}
                <Card className="overflow-hidden bg-card py-0 mb-8">
                    <DataTable
                        columns={columns}
                        data={articles.data}
                        isLoading={isSearching}
                        emptyMessage={searchTerm ? 'No articles match your search. Try different keywords.' : 'No articles found.'}
                    />
                </Card>

                {/* Article Form Modal */}
                <ArticleFormModal
                    open={isModalOpen}
                    onOpenChange={setIsModalOpen}
                    article={selectedArticle}
                    mode={modalMode}
                    types={types}
                    themes={themes}
                />

                {/* Delete Confirmation Modal */}
                <ConfirmDeleteModal
                    open={isDeleteModalOpen}
                    onOpenChange={setIsDeleteModalOpen}
                    onConfirm={confirmDelete}
                    title="Delete Article"
                    description="This action cannot be undone. The article will be permanently removed from the database."
                    itemName={articleToDelete?.title}
                    isDeleting={isDeleting}
                />
            </div>
        </AppLayout>
    );
}
