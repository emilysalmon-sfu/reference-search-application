import { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Combobox } from '@/components/ui/combobox';
import { AsyncCombobox } from '@/components/ui/async-combobox';
import { Loader2, Check } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface Article {
    id: number;
    author: string;
    title: string;
    type_of_study?: string;
    year_published?: number | string;
    journal_name: string;
    keywords?: string | string[] | null;
    abstract?: string;
    doi?: string;
    country?: string;
    theme?: string;
    sub_theme_1?: string;
}

interface ThemeData {
    theme: string;
    subthemes: string[];
}

interface ApprovalFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    article: Article | null;
    types?: string[];
    themes?: ThemeData[];
}

export default function ApprovalFormModal({
    open,
    onOpenChange,
    article,
    types = [],
    themes = [],
}: ApprovalFormModalProps) {
    // Year picker state
    const [yearDate, setYearDate] = useState<Date | null>(null);
    const maxYearDate = new Date(new Date().getFullYear() + 1, 11, 31);

    const { data, setData, put, processing, errors, clearErrors } = useForm({
        author: '',
        title: '',
        year_published: '',
        journal_name: '',
        keywords: '',
        abstract: '',
        doi: '',
        theme: '',
        sub_theme_1: '',
        country: '',
        type_of_study: '',
    });

    // Get unique theme names for the combobox
    const themeOptions = themes.map((t) => t.theme);

    // Get subthemes for the selected theme
    const getSubthemesForTheme = (themeName: string): string[] => {
        const themeData = themes.find((t) => t.theme === themeName);
        return themeData ? themeData.subthemes : [];
    };

    const [availableSubthemes, setAvailableSubthemes] = useState<string[]>([]);

    // Update available subthemes when theme changes
    useEffect(() => {
        if (data.theme) {
            setAvailableSubthemes(getSubthemesForTheme(data.theme));
        } else {
            // If no theme selected, show all unique subthemes
            const allSubthemes = themes.flatMap((t) => t.subthemes);
            setAvailableSubthemes([...new Set(allSubthemes)]);
        }
    }, [data.theme, themes]);

    // Sync year date with form data
    useEffect(() => {
        setData('year_published', yearDate ? String(yearDate.getFullYear()) : '');
    }, [yearDate]);

    // Populate form when article changes or modal opens
    useEffect(() => {
        if (open && article) {
            // Handle keywords - convert array to comma-separated string if needed
            let keywordsStr = '';
            if (article.keywords) {
                if (Array.isArray(article.keywords)) {
                    keywordsStr = article.keywords.join(', ');
                } else {
                    keywordsStr = article.keywords;
                }
            }

            // Set year date for the picker
            if (article.year_published) {
                setYearDate(new Date(Number(article.year_published), 0, 1));
            } else {
                setYearDate(null);
            }

            setData({
                author: article.author || '',
                title: article.title || '',
                year_published: article.year_published?.toString() || '',
                journal_name: article.journal_name || '',
                keywords: keywordsStr,
                abstract: article.abstract || '',
                doi: article.doi || '',
                theme: article.theme || '',
                sub_theme_1: article.sub_theme_1 || '',
                country: article.country || '',
                type_of_study: article.type_of_study || '',
            });
        }
    }, [open, article]);

    const handleClose = () => {
        clearErrors();
        onOpenChange(false);
    };

    const handleApprove = (e: React.FormEvent) => {
        e.preventDefault();

        if (!article?.id) return;

        put(`/admin/approvals/${article.id}/approve`, {
            preserveScroll: true,
            onSuccess: () => {
                handleClose();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Review Article for Approval</DialogTitle>
                    <DialogDescription>
                        Review and edit the article information below before approving.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleApprove} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Title */}
                        <div className="sm:col-span-2 space-y-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                placeholder="Article title"
                                className={errors.title ? 'border-red-500' : ''}
                            />
                            {errors.title && (
                                <p className="text-sm text-red-500">{errors.title}</p>
                            )}
                        </div>

                        {/* Author */}
                        <div className="space-y-2">
                            <Label htmlFor="author">Author *</Label>
                            <Input
                                id="author"
                                value={data.author}
                                onChange={(e) => setData('author', e.target.value)}
                                placeholder="Author name(s)"
                                className={errors.author ? 'border-red-500' : ''}
                            />
                            {errors.author && (
                                <p className="text-sm text-red-500">{errors.author}</p>
                            )}
                        </div>

                        {/* Year Published */}
                        <div className="space-y-2">
                            <Label htmlFor="year_published">Year Published</Label>
                            <DatePicker
                                id="year_published"
                                selected={yearDate}
                                onChange={(date) => setYearDate(date)}
                                showYearPicker
                                dateFormat="yyyy"
                                minDate={new Date(1800, 0, 1)}
                                maxDate={maxYearDate}
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                placeholderText="Select year"
                                wrapperClassName="w-full"
                            />
                            {errors.year_published && (
                                <p className="text-sm text-red-500">{errors.year_published}</p>
                            )}
                        </div>

                        {/* Journal Name */}
                        <div className="space-y-2">
                            <Label htmlFor="journal_name">Journal Name *</Label>
                            <AsyncCombobox
                                id="journal_name"
                                value={data.journal_name}
                                onChange={(value) => setData('journal_name', value)}
                                fetchOptions={async (query) => {
                                    const response = await fetch(`/articles/journals/search?q=${encodeURIComponent(query)}`);
                                    if (!response.ok) return [];
                                    return response.json();
                                }}
                                placeholder="Type to search journals..."
                                emptyMessage="No journals found. You can type a new one."
                                allowCustom={true}
                                minCharsToSearch={2}
                                debounceMs={300}
                                className={errors.journal_name ? 'border-red-500' : ''}
                            />
                            {errors.journal_name && (
                                <p className="text-sm text-red-500">{errors.journal_name}</p>
                            )}
                        </div>

                        {/* DOI */}
                        <div className="space-y-2">
                            <Label htmlFor="doi">DOI</Label>
                            <Input
                                id="doi"
                                value={data.doi}
                                onChange={(e) => setData('doi', e.target.value)}
                                placeholder="e.g., 10.1000/xyz123"
                                className={errors.doi ? 'border-red-500' : ''}
                            />
                            {errors.doi && (
                                <p className="text-sm text-red-500">{errors.doi}</p>
                            )}
                        </div>

                        {/* Type of Study */}
                        <div className="space-y-2">
                            <Label htmlFor="type_of_study">Type of Study</Label>
                            <Combobox
                                id="type_of_study"
                                options={types}
                                value={data.type_of_study}
                                onChange={(value) => setData('type_of_study', value)}
                                placeholder="Select or type a study type..."
                                emptyMessage="No types found. Type to add a new one."
                                allowCustom={true}
                            />
                        </div>

                        {/* Country */}
                        <div className="space-y-2">
                            <Label htmlFor="country">Country</Label>
                            <Input
                                id="country"
                                value={data.country}
                                onChange={(e) => setData('country', e.target.value)}
                                placeholder="Country of study"
                            />
                        </div>

                        {/* Theme */}
                        <div className="space-y-2">
                            <Label htmlFor="theme">Theme</Label>
                            <Combobox
                                id="theme"
                                options={themeOptions}
                                value={data.theme}
                                onChange={(value) => setData('theme', value)}
                                placeholder="Select or type a theme..."
                                emptyMessage="No themes found. Type to add a new one."
                                allowCustom={true}
                            />
                        </div>

                        {/* Sub Theme */}
                        <div className="space-y-2">
                            <Label htmlFor="sub_theme_1">Sub Theme</Label>
                            <Combobox
                                id="sub_theme_1"
                                options={availableSubthemes}
                                value={data.sub_theme_1}
                                onChange={(value) => setData('sub_theme_1', value)}
                                placeholder="Select or type a sub theme..."
                                emptyMessage="No sub themes found. Type to add a new one."
                                allowCustom={true}
                            />
                        </div>

                        {/* Keywords */}
                        <div className="sm:col-span-2 space-y-2">
                            <Label htmlFor="keywords">Keywords</Label>
                            <Input
                                id="keywords"
                                value={data.keywords}
                                onChange={(e) => setData('keywords', e.target.value)}
                                placeholder="Comma-separated keywords"
                            />
                        </div>

                        {/* Abstract */}
                        <div className="sm:col-span-2 space-y-2">
                            <Label htmlFor="abstract">Abstract</Label>
                            <Textarea
                                id="abstract"
                                value={data.abstract}
                                onChange={(e) => setData('abstract', e.target.value)}
                                placeholder="Article abstract"
                                rows={4}
                            />
                        </div>
                    </div>

                    <DialogFooter className="gap-3 sm:gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing} className="bg-green-600 hover:bg-green-700">
                            {processing ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Check className="mr-2 h-4 w-4" />
                            )}
                            Approve Article
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
