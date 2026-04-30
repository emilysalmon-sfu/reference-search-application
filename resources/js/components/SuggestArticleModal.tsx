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
import { AsyncCombobox } from '@/components/ui/async-combobox';
import { Loader2, Send } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

/**
 * Normalizes a DOI input by removing common prefixes.
 * Handles inputs like:
 * - "https://doi.org/10.1000/xyz123" -> "10.1000/xyz123"
 * - "http://doi.org/10.1000/xyz123" -> "10.1000/xyz123"
 * - "doi.org/10.1000/xyz123" -> "10.1000/xyz123"
 * - "https://dx.doi.org/10.1000/xyz123" -> "10.1000/xyz123"
 * - "10.1000/xyz123" -> "10.1000/xyz123"
 */
function normalizeDoi(doi: string): string {
    if (!doi) return '';
    
    let normalized = doi.trim();
    
    // Remove common DOI URL prefixes
    const prefixes = [
        'https://doi.org/',
        'http://doi.org/',
        'https://dx.doi.org/',
        'http://dx.doi.org/',
        'doi.org/',
        'dx.doi.org/',
    ];
    
    for (const prefix of prefixes) {
        if (normalized.toLowerCase().startsWith(prefix.toLowerCase())) {
            normalized = normalized.substring(prefix.length);
            break;
        }
    }
    
    return normalized;
}

interface SuggestArticleModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function SuggestArticleModal({
    open,
    onOpenChange,
}: SuggestArticleModalProps) {
    // Year picker state
    const [yearDate, setYearDate] = useState<Date | null>(null);
    const maxYearDate = new Date(new Date().getFullYear() + 1, 11, 31);

    const { data, setData, post, processing, errors, reset, clearErrors, transform } = useForm({
        author: '',
        title: '',
        year_published: '',
        journal_name: '',
        keywords: '',
        abstract: '',
        doi: '',
    });

    // Sync year date with form data
    useEffect(() => {
        setData('year_published', yearDate ? String(yearDate.getFullYear()) : '');
    }, [yearDate]);

    // Clear form when modal opens
    useEffect(() => {
        if (open) {
            setData({
                author: '',
                title: '',
                year_published: '',
                journal_name: '',
                keywords: '',
                abstract: '',
                doi: '',
            });
            setYearDate(null);
            clearErrors();
        }
    }, [open]);

    const handleClose = () => {
        clearErrors();
        onOpenChange(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Use transform to normalize the DOI before submitting (remove URL prefixes if present)
        transform((data) => ({
            ...data,
            doi: normalizeDoi(data.doi),
        }));

        post('/articles', {
            preserveScroll: true,
            onSuccess: () => {
                handleClose();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Suggest an Article</DialogTitle>
                    <DialogDescription>
                        Fill in the article details below. Your submission will be reviewed before being added to the database.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Title */}
                    <div className="space-y-2">
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
                        <Label htmlFor="author">Author(s) *</Label>
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Year Published */}
                        <div className="space-y-2">
                            <Label htmlFor="year_published">Year Published *</Label>
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

                    {/* Keywords */}
                    <div className="space-y-2">
                        <Label htmlFor="keywords">Keywords</Label>
                        <Input
                            id="keywords"
                            value={data.keywords}
                            onChange={(e) => setData('keywords', e.target.value)}
                            placeholder="Comma-separated keywords"
                            className={errors.keywords ? 'border-red-500' : ''}
                        />
                        {errors.keywords && (
                            <p className="text-sm text-red-500">{errors.keywords}</p>
                        )}
                    </div>

                    {/* Abstract */}
                    <div className="space-y-2">
                        <Label htmlFor="abstract">Abstract</Label>
                        <Textarea
                            id="abstract"
                            value={data.abstract}
                            onChange={(e) => setData('abstract', e.target.value)}
                            placeholder="Article abstract"
                            rows={4}
                            className={errors.abstract ? 'border-red-500' : ''}
                        />
                        {errors.abstract && (
                            <p className="text-sm text-red-500">{errors.abstract}</p>
                        )}
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
                        <Button type="submit" disabled={processing}>
                            {processing ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="mr-2 h-4 w-4" />
                            )}
                            Submit for Review
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
