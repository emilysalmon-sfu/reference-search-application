import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useState, useEffect } from 'react';
import FlashMessages from '@/components/ui/flash-messages';

type Article = {
    author?: string;
    title?: string;
    journal_name?: string;
    keywords?: string;
    abstract?: string;
    year_published?: string;
    doi?: string;
};

type Props = {
    article?: Article;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function CreateArticles({ article }: Props) {
    const { data, setData } = useForm<Article>({
        author: article?.author ?? '',
        title: article?.title ?? '',
        journal_name: article?.journal_name ?? '',
        keywords: article?.keywords ?? '',
        abstract: article?.abstract ?? '',
        year_published: article?.year_published ?? '',
        doi: article?.doi?.toString() ?? '',
    });

    // local Date state for the year picker
    const [yearDate, setYearDate] = useState<Date | null>(
        article?.year_published ? new Date(Number(article.year_published), 0, 1) : null
    );

    // max allowed year = current year + 1
    const maxYearDate = new Date(new Date().getFullYear() + 1, 11, 31);

    // keep form data in sync with the date picker
    useEffect(() => {
        setData('year_published', yearDate ? String(yearDate.getFullYear()) : '');
    }, [yearDate]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Submitting article data:', data);
        router.post('/articles', new FormData(e.currentTarget as HTMLFormElement));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Article" />

            <FlashMessages />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <form
                    onSubmit={handleSubmit}
                    className="mx-auto w-full max-w-4xl rounded-xl border border-sidebar-border/30 bg-white/60 p-6 shadow-lg backdrop-blur-sm dark:bg-gray-800/60"
                >
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Create New Article</h2>
                        <p className="text-sm text-gray-500">Fill the fields below and submite your request</p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="flex flex-col">
                            <label className="mb-1 text-xs font-medium text-gray-600 dark:text-gray-300">Title</label>
                            <Input
                                type="text"
                                name="title"
                                placeholder="Title"
                                onChange={(e) => setData('title', e.target.value)}
                                className="w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-indigo-300 dark:bg-gray-700 dark:border-gray-600"
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="mb-1 text-xs font-medium text-gray-600 dark:text-gray-300">Author</label>
                            <Input
                                type="text"
                                name="author"
                                placeholder="Author"
                                onChange={(e) => setData('author', e.target.value)}

                                className="w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-indigo-300 dark:bg-gray-700 dark:border-gray-600"
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="mb-1 text-xs font-medium text-gray-600 dark:text-gray-300">Year</label>
                            <DatePicker
                                selected={yearDate}
                                onChange={(date) => setYearDate(date)}
                                showYearPicker
                                dateFormat="yyyy"
                                minDate={new Date(1800, 0, 1)}
                                maxDate={maxYearDate}
                                name='year_published'
                                className="w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-indigo-300 dark:bg-gray-700 dark:border-gray-600"
                                placeholderText="Select year"
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="mb-1 text-xs font-medium text-gray-600 dark:text-gray-300">Journal</label>
                            <Input
                                type="text"
                                name="journal_name"
                                placeholder="Journal"
                                onChange={(e) => setData('journal_name', e.target.value)}

                                className="w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-indigo-300 dark:bg-gray-700 dark:border-gray-600"
                            />
                        </div>

                        <div className="sm:col-span-2 lg:col-span-2 flex flex-col">
                            <label className="mb-1 text-xs font-medium text-gray-600 dark:text-gray-300">Keywords</label>
                            <Input
                                type="text"
                                name="keywords"
                                placeholder="e.g. economics, development"
                                onChange={(e) => setData('keywords', e.target.value)}
                                className="w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-indigo-300 dark:bg-gray-700 dark:border-gray-600"
                            />
                        </div>

                        <div className="sm:col-span-2 lg:col-span-3 flex flex-col">
                            <label className="mb-1 text-xs font-medium text-gray-600 dark:text-gray-300">DOI</label>
                            <Input
                                name="doi"
                                placeholder="DOI"
                                onChange={(e) => setData('doi', e.target.value)}
                                className="w-full resize-y rounded-md border px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-indigo-300 dark:bg-gray-700 dark:border-gray-600"
                            />
                        </div>

                        <div className="sm:col-span-2 lg:col-span-3 flex flex-col">
                            <label className="mb-1 text-xs font-medium text-gray-600 dark:text-gray-300">Abstract</label>
                            <textarea
                                name="abstract"
                                placeholder="Short abstract"
                                rows={5}
                                onChange={(e) => setData('abstract', e.target.value)}
                                className="w-full resize-y rounded-md border px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-indigo-300 dark:bg-gray-700 dark:border-gray-600"
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                type="submit"
                                className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                            >
                                Save Article
                            </button>

                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200"
                            >
                                Cancel
                            </button>
                        </div>

                        <div className="text-sm text-gray-500">All fields are optional. Use clear button to reset.</div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}