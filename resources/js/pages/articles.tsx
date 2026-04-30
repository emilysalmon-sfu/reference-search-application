import { ArticleCard } from '@/components/article-card';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import PublicLayout from '@/layouts/public-layout';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage, router, useForm } from '@inertiajs/react';
import type { Article as ArticleType } from '@/components/article-card';
import { Download, Loader2, Lightbulb, Plus } from "lucide-react"; // add Loader2 for spinner
import { fileExport } from "@/actions/App/Http/Controllers/FileController";
import { useState, useEffect } from 'react';
import Pagination from '@/components/ui/pagination';
import SuggestArticleModal from '@/components/SuggestArticleModal';
import FlashMessages from '@/components/ui/flash-messages';
import ReportButton from '@/components/report-button';
import frameworkImage from '@/assets/framework-image.png';

type PaginatedArticles = {
    data: ArticleType[];
    // meta?: any;
    // links?: any;
};

type TypeOfStudy = string; // server returns string[] for types

type ThemeItem = {
    theme: string;
    subthemes: string[];
};

type Filters = {
    author?: string;
    title?: string;
    type_of_study?: string;
    country?: string;
    journal?: string;
    keywords?: string;
    abstract?: string;
    year_from?: string;
    year_to?: string;
    type?: string;
    theme?: string;
    subtheme?: string;
};

type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    // ...other pagination props you get from Laravel
};

type Props = {
    articles?: Paginated<ArticleType>;
    filters?: Filters;
    totalArticleCount?: number; // changed from number[] to number
    types: TypeOfStudy[];
    themes: ThemeItem[];
};

// type ArticlesProps = {
//     articles: {
//         data: Article[];
//         // plus meta, links etc. if you want to type them
//     };
// };

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Articles({ articles, filters, totalArticleCount, types, themes }: Props) {
    const [isExecuting, setIsExecuting] = useState(false);
    const [hasResults, setHasResults] = useState(articles?.data?.length > 0);
    const [hasSearched, setHasSearched] = useState(false);
    const [isSearching, setIsSearching] = useState(false); // new state for search loading
    const [subthemeOptions, setSubthemeOptions] = useState<string[]>([]);
    const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);

    console.log("Props types:", types);
    console.log("Props themes:", themes);


    const { data, setData, get } = useForm<Filters>({
        author: filters?.author ?? '',
        title: filters?.title ?? '',
        type_of_study: filters?.type_of_study ?? '',
        country: filters?.country ?? '',
        journal: filters?.journal ?? '',
        keywords: filters?.keywords ?? '',
        abstract: filters?.abstract ?? '',
        year_from: filters?.year_from?.toString() ?? '',
        year_to: filters?.year_to?.toString() ?? '',
        theme: filters?.theme ?? '',
        subtheme: (filters as any)?.subtheme ?? '',
    });

    // keep subtheme options in sync when initial props have a theme selected
    useEffect(() => {
        if (!themes || !themes.length) return;
        const match = themes.find((t) => t.theme === data.theme);
        setSubthemeOptions(match?.subthemes ?? []);
    }, [data.theme, themes]);

    console.log("Articles:", articles);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Data:", data);
        setHasSearched(true);
        setIsSearching(true); // start loading

        get('/articles/search', {
            preserveState: true,
            replace: true,
            onSuccess: (page) => {
                const returned = (page.props as any)?.articles;
                const returnedCount = returned?.data?.length ?? 0;
                setHasResults(returnedCount > 0);
                setIsSearching(false); // stop loading
            },
            onError: () => {
                setIsSearching(false); // stop loading on error
            },
        });
    };

    const handleReset = () => {
        setData({
            author: '',
            title: '',
            country: '',
            type_of_study: '',
            journal: '',
            keywords: '',
            abstract: '',
            year_from: '',
            year_to: '',
            theme: '',
            subtheme: '',
        });
        setHasSearched(false);
        setHasResults(false);
        setIsSearching(false); // reset loading

        router.get('/', {}, {
            preserveState: false,
            replace: true,
        });
    };

    const handleDownload = (e: React.FormEvent) => {
        e.preventDefault();

        if (!articles?.data?.length && !totalArticleCount) return;

        try {
            setIsExecuting(true);

            // Build query string from current filters
            const params = new URLSearchParams();

            console.log('Current filter data:', data);
            console.log('Current filter data:', params);

            Object.entries(data).forEach(([key, value]) => {
                if (value) {
                    params.append(key, String(value));
                } else {
                    params.append(key, '');
                }
            });

            const url = fileExport.url() + '?' + params.toString();
            console.log('Download URL:', url);
            window.location.href = url;

        } catch (error) {
            console.error('Error preparing download:', error);
        } finally {
            setIsExecuting(false);
            console.log('Download process initiated.');
        }
    };

    const { auth } = usePage<SharedData>().props;

    const content = (
        <div className="flex h-full flex-1 flex-col gap-4 p-4">
            <FlashMessages />

            {/* Suggestion Card & Framework Description */}
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <p className="text-base leading-relaxed text-muted-foreground md:max-w-4xl">
                    To help people navigate this growing and sometimes overwhelming body of Indigenous Management and Organizational Studies research, this website uses a research framework developed in{' '}
                    <a
                        href="https://doi.org/10.5465/annals.2021.0132"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
                    >
                        Salmon, Chavez, &amp; Murphy (2023)
                    </a>
                    . The framework groups research into broad topic areas, shown in the outer circle, and more specific subthemes, shown in the smaller circles. By organizing the literature in this way, the framework helps users not only find relevant research more easily, but also better understand how different pieces of work are connected, and how they approach Indigenous management in different ways.
                </p>
                <div className="shrink-0">
                    <div className="rounded-xl border border-sidebar-border/50 bg-gradient-to-r from-primary/5 to-primary/10 p-4 shadow-sm backdrop-blur">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Lightbulb className="h-4 w-4 text-primary" />
                                <span>Have a suggestion?</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsSuggestModalOpen(true)}
                                className="cursor-pointer inline-flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                Suggest Article
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <form
                onSubmit={handleSubmit}
                className="rounded-xl border border-sidebar-border/50 bg-background/40 p-6 shadow-sm backdrop-blur"
            >
                <div className="grid gap-4 md:grid-cols-4">
                    <div className="space-y-1">
                        <label className="text-foreground block text-xs font-medium">
                            Author
                        </label>
                        <input
                            type="text"
                            value={data.author ?? ''}
                            onChange={(e) => setData('author', e.target.value)}
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                            placeholder="e.g. Hill"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-foreground block text-xs font-medium">
                            Title
                        </label>
                        <input
                            type="text"
                            value={data.title ?? ''}
                            onChange={(e) => setData('title', e.target.value)}
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                            placeholder="Words in the title"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-foreground block text-xs font-medium">
                            Journal
                        </label>
                        <input
                            type="text"
                            value={data.journal ?? ''}
                            onChange={(e) => setData('journal', e.target.value)}
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                            placeholder="Journal name"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-foreground block text-xs font-medium">
                            Keywords
                        </label>
                        <input
                            type="text"
                            value={data.keywords ?? ''}
                            onChange={(e) => setData('keywords', e.target.value)}
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                            placeholder="Search keywords"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-foreground block text-xs font-medium">
                            Country
                        </label>
                        <input
                            type="text"
                            value={data.country ?? ''}
                            onChange={(e) => setData('country', e.target.value)}
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                            placeholder="Country of study"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-foreground block text-xs font-medium">
                            Type of Study
                        </label>
                        <select
                            value={data.type_of_study ?? ''}
                            onChange={(e) => setData('type_of_study', e.target.value)}
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                        >
                            <option value="">All Types</option>
                            {types.map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-foreground block text-xs font-medium">
                            Theme
                        </label>
                        <select
                            value={data.theme ?? ''}
                            onChange={(e) => {
                                setData('theme', e.target.value);
                                setData('subtheme', ''); // Reset subtheme when theme changes
                            }}
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                        >
                            <option value="">All Themes</option>
                            {themes.map((theme) => (
                                <option key={theme.theme} value={theme.theme}>
                                    {theme.theme}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-foreground block text-xs font-medium">
                            Subtheme
                        </label>
                        <select
                            value={data.subtheme ?? ''}
                            onChange={(e) => setData('subtheme', e.target.value)}
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                            disabled={!data.theme}
                        >
                            <option value="">All Subthemes</option>
                            {subthemeOptions.map((subtheme) => (
                                <option key={subtheme} value={subtheme}>
                                    {subtheme}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-foreground block text-xs font-medium">
                            Year From
                        </label>
                        <input
                            type="number"
                            inputMode="numeric"
                            min={1800}
                            max={2100}
                            value={data.year_from ?? ''}
                            onChange={(e) => setData('year_from', e.target.value)}
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                            placeholder="From"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-foreground block text-xs font-medium">
                            Year To
                        </label>
                        <input
                            type="number"
                            inputMode="numeric"
                            min={1800}
                            max={2100}
                            value={data.year_to ?? ''}
                            onChange={(e) => setData('year_to', e.target.value)}
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                            placeholder="To"
                        />
                    </div>

                    <div className="space-y-1 md:col-span-2">
                        <label className="text-foreground block text-xs font-medium">
                            Abstract
                        </label>
                        <input
                            type="text"
                            value={data.abstract ?? ''}
                            onChange={(e) => setData('abstract', e.target.value)}
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                            placeholder="Search in abstract"
                        />
                    </div>
                </div>

                <div className="mt-4 flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={handleReset}
                        className="cursor-pointer rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted/60"
                        disabled={isSearching} // disable during search
                    >
                        Clear
                    </button>
                    <button
                        type="submit"
                        className="cursor-pointer rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                        disabled={isSearching} // disable during search
                    >
                        Apply filters
                    </button>
                </div>
            </form>
            {hasResults &&
                <div>
                    <form onSubmit={handleDownload}>
                        <button
                            disabled={isExecuting}
                            type="submit"
                            aria-label="Download result sheet"
                            className="cursor-pointer inline-flex items-center gap-2 rounded-md bg-[#217346] px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-[#195734] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9ad3b3] transition-colors"
                        >
                            <Download className="h-4 w-4" />
                            Download Result Sheet
                        </button>
                    </form>
                </div>
            }
            <div>
                {hasSearched && !isSearching && articles && articles?.data?.length > 0 &&
                    <p>Total articles found: {totalArticleCount}</p>
                }
                <Pagination
                    pagination={articles}
                    query={data}
                    maxButtons={4}
                    className='mt-4' />
            </div>

            {/* Articles list/grid — 1 column on small, 2 columns on md+ */}
            {isSearching ? (
                <div className="mt-5 flex justify-center items-center">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-500 dark:text-gray-400" />
                    <span className="ml-2 text-gray-500 dark:text-gray-400">Loading results...</span>
                </div>
            ) : articles && articles?.data?.length > 0 ? (
                <div className="mt-5 mx-auto w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                    {articles.data.map((article) => (
                        <ArticleCard key={article?.id} article={article} />
                    ))}
                </div>
            ) : hasSearched ? (
                <div className="mt-5 text-center text-gray-500 dark:text-gray-400">
                    No articles found with that search criteria.
                </div>
            ) : null}

            {/* Framework Image */}
            <div className="flex justify-center">
                <img
                    src={frameworkImage}
                    alt="Research Framework Illustration"
                    className="max-w-md h-auto rounded-lg shadow-md"
                />
            </div>

            {/* Framework Table */}
            <div className="mb-8 overflow-x-auto">
                <table className="w-full border-collapse border border-border">
                    <thead>
                        <tr className="bg-muted">
                            <th className="border border-border bg-[#41665B] p-4 text-left font-semibold text-white">
                                Indigenous Ways of Being
                            </th>
                            <th className="border border-border bg-[#CA7447] p-4 text-left font-semibold text-white">
                                Indigenous Organizing
                            </th>
                            <th className="border border-border bg-[#DECD9F] p-4 text-left font-semibold text-gray-900">
                                Indigenous Relating
                            </th>
                            <th className="border border-border bg-[#B4B4C8] p-4 text-left font-semibold text-gray-900">
                                Academic Implications
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="border border-border bg-[#5D8A7E] p-4 align-top text-sm text-white">
                                <span className="mb-2 block font-semibold text-white">Indigenous knowledges</span>
                                research highlights place-based, holistic, and evolving knowledge systems that support sustainability, risk management, and adaptation, while grappling with challenges of translation, appropriation, and ethical use within dominant Western scientific and institutional frameworks.
                            </td>
                            <td className="border border-border bg-[#D9937A] p-4 align-top text-sm text-white">
                                <span className="mb-2 block font-semibold text-white">Indigenous entrepreneurship</span>
                                studies emphasize enterprise forms that integrate community values, social and environmental purpose, and diverse measures of success, while navigating structural constraints rooted in colonial legacies, policy environments, and market systems.
                            </td>
                            <td className="border border-border bg-[#E8DBBE] p-4 align-top text-sm text-gray-900">
                                <span className="mb-2 block font-semibold text-gray-900">State Interactions</span>
                                analyzes how colonial histories, public policies, and state institutions shape Indigenous experiences, governance capacity, and development outcomes, while also documenting Indigenous resistance, adaptation, and self-determined strategies.
                            </td>
                            <td className="border border-border bg-[#CBCBD8] p-4 align-top text-sm text-gray-900">
                                <span className="mb-2 block font-semibold text-gray-900">Academic Implications</span>
                                This literature reflects implications for teaching, research, and academic institutions. It (a) documents approaches to education that engage Indigenous worldviews, (b) examines research practices and methodologies, and (c) highlights how institutional structures shape the conditions for ethical, community-engaged Indigenous scholarship.
                            </td>
                        </tr>
                        <tr>
                            <td className="border border-border bg-[#5D8A7E] p-4 align-top text-sm text-white">
                                <span className="mb-2 block font-semibold text-white">Cultural values &amp; identity</span>
                                research explores how Indigenous cultural values and identities shape sensemaking, behavior, and social organization, while also examining tensions arising from comparison with non-Indigenous cultures and the commodification, misrepresentation, or remediation of Indigenous identities in market contexts.
                            </td>
                            <td className="border border-border bg-[#D9937A] p-4 align-top text-sm text-white">
                                <span className="mb-2 block font-semibold text-white">Indigenous leadership</span>
                                conceptualizes leadership practices and motivations as relational, holistic, and culturally grounded, highlighting practices that sustain community wellbeing, steward values across generations, and contend with the pressures of operating within bicultural and often discriminatory contexts.
                            </td>
                            <td className="border border-border bg-[#E8DBBE] p-4 align-top text-sm text-gray-900">
                                <span className="mb-2 block font-semibold text-gray-900">Firm interactions</span>
                                investigates the varied relationships between Indigenous communities and businesses, ranging from extractive and conflictual engagements to partnership and co-management arrangements, with attention to impacts on Indigenous governance, culture, and wellbeing.
                            </td>
                            <td className="border border-border bg-[#CBCBD8] p-4 align-top text-sm text-gray-900" rowSpan={2}>
                                {/* Empty cell to span the remaining rows in this column */}
                            </td>
                        </tr>
                        <tr>
                            <td className="border border-border bg-[#5D8A7E] p-4 align-top text-sm text-white">
                                <span className="mb-2 block font-semibold text-white">Indigenous governance</span>
                                literature examines Indigenous governance systems as resilient, value-driven, and multicriteria decision-making arrangements that integrate cultural, social, economic, and ecological considerations, particularly in relation to natural resource management and economic organization.
                            </td>
                            <td className="border border-border bg-[#D9937A] p-4 align-top text-sm text-white">
                                <span className="mb-2 block font-semibold text-white">Indigenous management</span>
                                research explores distinct managerial practices and organizational logics that reflect Indigenous worldviews, including collective decision-making, strategic planning, and the integration of cultural values into everyday organizational life.
                            </td>
                            <td className="border border-border bg-[#E8DBBE] p-4 align-top text-sm text-gray-900">
                                <span className="mb-2 block font-semibold text-gray-900">Indigenous economic development</span>
                                literature examines pathways through which Indigenous Nations pursue self-determined, culturally grounded, and sustainable economic futures, emphasizing sovereignty, community wellbeing, and long-term value creation over narrowly defined growth or profit-based outcomes.
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>


            {/* Suggest Article Modal */}
            <SuggestArticleModal
                open={isSuggestModalOpen}
                onOpenChange={setIsSuggestModalOpen}
            />

            {/* Report Button - Fixed Bottom Right */}
            <div className="fixed bottom-6 right-6 z-50">
                <ReportButton />
            </div>
        </div>
    );

    return (
        <>
            <Head title="Article Search" />
            {auth.user ? (
                <AppLayout breadcrumbs={breadcrumbs}>{content}</AppLayout>
            ) : (
                <PublicLayout title="Article Search">{content}</PublicLayout>
            )}
        </>
    );

};
