import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import FlashMessages from '@/components/ui/flash-messages';
import { Badge } from '@/components/ui/badge';

type TypeStyle = {
    bg: string;
    text: string;
};

type Config = {
    worksheet_name?: string;
    column_map?: Record<string, string>;
    type_styles?: Record<string, TypeStyle>;
};

type Props = {
    config: Config;
    existingTypes: string[];
    defaultTypeStyles: Record<string, TypeStyle>;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Config',
        href: '/config',
    },
];

// Predefined color options for easy selection
const colorOptions = [
    { name: 'Green', bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-800 dark:text-green-200' },
    { name: 'Blue', bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-800 dark:text-blue-200' },
    { name: 'Yellow', bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-800 dark:text-yellow-200' },
    { name: 'Orange', bg: 'bg-orange-100 dark:bg-orange-900', text: 'text-orange-800 dark:text-orange-200' },
    { name: 'Purple', bg: 'bg-purple-100 dark:bg-purple-900', text: 'text-purple-800 dark:text-purple-200' },
    { name: 'Red', bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-800 dark:text-red-200' },
    { name: 'Teal', bg: 'bg-teal-100 dark:bg-teal-900', text: 'text-teal-800 dark:text-teal-200' },
    { name: 'Pink', bg: 'bg-pink-100 dark:bg-pink-900', text: 'text-pink-800 dark:text-pink-200' },
    { name: 'Indigo', bg: 'bg-indigo-100 dark:bg-indigo-900', text: 'text-indigo-800 dark:text-indigo-200' },
    { name: 'Cyan', bg: 'bg-cyan-100 dark:bg-cyan-900', text: 'text-cyan-800 dark:text-cyan-200' },
    { name: 'Gray', bg: 'bg-gray-100 dark:bg-gray-900', text: 'text-gray-800 dark:text-gray-200' },
];

const columnFields = [
    { key: 'author', label: 'Author' },
    { key: 'title', label: 'Title' },
    { key: 'journal_name', label: 'Journal Name' },
    { key: 'keywords', label: 'Keywords' },
    { key: 'abstract', label: 'Abstract' },
    { key: 'year_published', label: 'Year Published' },
    { key: 'doi', label: 'DOI' },
    { key: 'sub_theme_1', label: 'Sub Theme 1' },
    { key: 'theme', label: 'Theme' },
    { key: 'country', label: 'Country' },
    { key: 'type_of_study', label: 'Type' },
];

export default function Config({ config, existingTypes = [], defaultTypeStyles = {} }: Props) {
    const { data, setData, put, processing } = useForm<Config>({
        worksheet_name: config?.worksheet_name ?? '',
        column_map: config?.column_map ?? {},
        type_styles: config?.type_styles ?? defaultTypeStyles,
    });

    const [worksheetEnabled, setWorksheetEnabled] = useState(false); // unchecked by default
    const [columnEnabled, setColumnEnabled] = useState<Record<string, boolean>>(() => {
        const enabled: Record<string, boolean> = {};
        columnFields.forEach(field => {
            enabled[field.key] = false; // unchecked by default
        });
        return enabled;
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Config Data Update: " + data)
        put('config/update', {
        });
    };

    const getTypeStyle = (type: string): TypeStyle => {
        return data.type_styles?.[type] ?? { bg: 'bg-gray-100 dark:bg-gray-900', text: 'text-gray-800 dark:text-gray-200' };
    };

    const updateTypeStyle = (type: string, style: TypeStyle) => {
        setData('type_styles', {
            ...data.type_styles,
            [type]: style,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Config" />

            <FlashMessages />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <form
                    onSubmit={handleSubmit}
                    className="mx-auto w-full max-w-4xl rounded-xl border border-sidebar-border/30 bg-white/60 p-6 shadow-lg backdrop-blur-sm dark:bg-gray-800/60"
                >
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Import Configuration</h2>
                        <p className="text-sm text-gray-500">Configure worksheet name and column mappings</p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="flex flex-col">
                            <label className="mb-1 text-xs font-medium text-gray-600 dark:text-gray-300">Worksheet Name</label>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="text"
                                    value={data.worksheet_name ?? ''}
                                    onChange={(e) => setData('worksheet_name', e.target.value)}
                                    disabled={!worksheetEnabled}
                                    placeholder="Worksheet name"
                                    className="w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-indigo-300 dark:bg-gray-700 dark:border-gray-600"
                                />
                                <input
                                    type="checkbox"
                                    checked={worksheetEnabled}
                                    onChange={(e) => {
                                        setWorksheetEnabled(e.target.checked);
                                    }}
                                    className="rounded"
                                />
                            </div>
                        </div>
                    </div>

                    <hr className="my-4 border-gray-300 dark:border-gray-600" />

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {columnFields.map((field) => (
                            <div key={field.key} className="flex flex-col">
                                <label className="mb-1 text-xs font-medium text-gray-600 dark:text-gray-300">{field.label}</label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="text"
                                        value={data.column_map?.[field.key] ?? ''}
                                        onChange={(e) => setData('column_map', {
                                            ...data.column_map,
                                            [field.key]: e.target.value,
                                        })}
                                        disabled={!columnEnabled[field.key]}
                                        placeholder={`Column for ${field.label.toLowerCase()}`}
                                        className="w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-indigo-300 dark:bg-gray-700 dark:border-gray-600"
                                    />
                                    <input
                                        type="checkbox"
                                        checked={columnEnabled[field.key]}
                                        onChange={(e) => {
                                            const newEnabled = { ...columnEnabled, [field.key]: e.target.checked };
                                            setColumnEnabled(newEnabled);
                                        }}
                                        className="rounded"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <hr className="my-6 border-gray-300 dark:border-gray-600" />

                    {/* Type of Study Styles Section */}
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Type of Study Badge Styles</h3>
                        <p className="text-sm text-gray-500 mb-4">Configure the colors for each type of study badge. Types are automatically detected from articles.</p>

                        {/* Type styles list */}
                        <div className="space-y-3">
                            {existingTypes.map((type) => {
                                const style = getTypeStyle(type);

                                return (
                                    <div key={type} className="flex items-center gap-4 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                        <div className="flex-1 min-w-0">
                                            <span className="font-medium text-sm text-gray-800 dark:text-gray-200">{type}</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Badge className={`${style.bg} ${style.text}`}>
                                                Preview
                                            </Badge>

                                            <select
                                                value={colorOptions.findIndex(c => c.bg === style.bg)}
                                                onChange={(e) => {
                                                    const color = colorOptions[parseInt(e.target.value)];
                                                    if (color) {
                                                        updateTypeStyle(type, { bg: color.bg, text: color.text });
                                                    }
                                                }}
                                                className="text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1"
                                            >
                                                {colorOptions.map((color, idx) => (
                                                    <option key={color.name} value={idx}>
                                                        {color.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                );
                            })}

                            {existingTypes.length === 0 && (
                                <p className="text-sm text-gray-500 italic">No types found. Import articles with type_of_study values to configure their colors.</p>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                type="submit"
                                disabled={processing}
                                className="cursor-pointer inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                            >
                                {processing ? 'Saving...' : 'Save Configuration'}
                            </button>

                            <button
                                type="button"
                                onClick={() => '/dashboard'}
                                className="cursor-pointer inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200"
                            >
                                Cancel
                            </button>
                        </div>

                        <div className="text-sm text-gray-500">Checkboxes enable/disable editing for each field.</div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}