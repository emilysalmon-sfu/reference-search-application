import AppLayout from '@/layouts/app-layout';
import { dashboard, dashboardStats } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface DashboardProps {
    pendingApprovalsCount: number;
    unresolvedFeedbacksCount: number;
    lastImportedFileDate: string | null;
    articlesCreated: number;
    articlesWithoutYear: number;
    totalArticlesCount: number;
}

interface FilteredStats {
    downloadsCount: number;
    userArticlesCount: number;
    adminArticlesCount: number;
}

const periodOptions = [
    { value: '24h', label: 'Last 24 hours' },
    { value: '48h', label: 'Last 48 hours' },
    { value: 'week', label: 'Last week' },
    { value: 'month', label: 'Last month' },
    { value: '3months', label: 'Last 3 months' },
    { value: '6months', label: 'Last 6 months' },
    { value: 'year', label: 'Last year' },
    { value: 'all', label: 'All time' },
];

function StatCard({ title, value, loading = false }: { title: string; value: number | string; loading?: boolean }) {
    return (
        <Card className="flex flex-col justify-between">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center py-6">
                {loading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                ) : (
                    <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                        {value}
                    </span>
                )}
            </CardContent>
        </Card>
    );
}

function StatCardWithNoData({ title, noDataMessage }: { title: string; noDataMessage: string }) {
    return (
        <Card className="flex flex-col justify-between">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center py-6">
                <span className="text-base text-gray-500 dark:text-gray-400">
                    {noDataMessage}
                </span>
            </CardContent>
        </Card>
    );
}

export default function Dashboard({ 
    pendingApprovalsCount,
    unresolvedFeedbacksCount,
    lastImportedFileDate, 
    articlesCreated,
    articlesWithoutYear,
    totalArticlesCount 
}: DashboardProps) {
    const [period, setPeriod] = useState('all');
    const [filteredStats, setFilteredStats] = useState<FilteredStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const response = await fetch(dashboardStats.url({ query: { period } }));
                const data = await response.json();
                setFilteredStats(data);
            } catch (error) {
                console.error('Failed to fetch filtered stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [period]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {/* Static Stats Section */}
                <div>
                    <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-200">
                        Overview
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard 
                            title="Pending Approvals" 
                            value={pendingApprovalsCount ?? 0} 
                        />
                        {lastImportedFileDate ? (
                            <StatCard 
                                title="Last Import Date" 
                                value={lastImportedFileDate} 
                            />
                        ) : (
                            <StatCardWithNoData 
                                title="Last Import Date" 
                                noDataMessage="No imports yet" 
                            />
                        )}
                        <StatCard 
                            title="Articles Created (Last Import)" 
                            value={articlesCreated ?? 0} 
                        />
                        <StatCard 
                            title="Articles Without Year" 
                            value={articlesWithoutYear ?? 0} 
                        />
                        <StatCard 
                            title="Unresolved Feedbacks/Reports" 
                            value={unresolvedFeedbacksCount ?? 0} 
                        />
                        <StatCard 
                            title="Total Articles" 
                            value={totalArticlesCount ?? 0} 
                        />
                    </div>
                </div>

                {/* Time-Filtered Stats Section */}
                <div>
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                            Statistics
                        </h2>
                        <Select value={period} onValueChange={setPeriod}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select period" />
                            </SelectTrigger>
                            <SelectContent>
                                {periodOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <StatCard 
                            title="Downloads" 
                            value={filteredStats?.downloadsCount ?? 0} 
                            loading={loading}
                        />
                        <StatCard 
                            title="Articles Added by Users" 
                            value={filteredStats?.userArticlesCount ?? 0} 
                            loading={loading}
                        />
                        <StatCard 
                            title="Articles Added by Admin" 
                            value={filteredStats?.adminArticlesCount ?? 0} 
                            loading={loading}
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
