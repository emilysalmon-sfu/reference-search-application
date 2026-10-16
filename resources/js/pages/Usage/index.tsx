import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Input } from '@/components/ui/input';
import WorldMap from '@/components/world-map';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { usageExport, usageIndex } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { endOfQuarter, format, startOfQuarter, startOfYear, subDays, subQuarters } from 'date-fns';
import { Download, ExternalLink } from 'lucide-react';
import type { ReactNode } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

type Row = Record<string, string | number | null>;

interface SummaryEntry {
    key: string;
    metric: string;
    current: number;
    previous: number;
    change: number | null;
}

interface UsageReport {
    from: string;
    to: string;
    previous_from: string;
    previous_to: string;
    summary: SummaryEntry[];
    visits_over_time: { date: string; visits: number }[];
    searches_over_time: { date: string; searches: number }[];
    regions: { region: string; visits: number }[];
    countries: { country_code: string; visits: number }[];
    source_types: { source_type: string; visits: number }[];
    referrers: { host: string; visits: number }[];
    campaigns: { utm_source: string | null; utm_medium: string | null; utm_campaign: string | null; visits: number }[];
    parameters: { parameter: string; label: string; value: string; count: number }[];
    zero_result_searches: { filters: { label: string; value: string }[]; url: string; count: number; last_searched: string }[];
    devices: { device: string; visits: number }[];
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Usage', href: usageIndex().url }];

const ymd = (date: Date) => format(date, 'yyyy-MM-dd');

const countryName = new Intl.DisplayNames(['en'], { type: 'region' });

function presets(): Record<string, { label: string; from: string; to: string }> {
    const today = new Date();
    const lastQuarter = subQuarters(today, 1);

    return {
        last7: { label: 'Last 7 days', from: ymd(subDays(today, 6)), to: ymd(today) },
        last30: { label: 'Last 30 days', from: ymd(subDays(today, 29)), to: ymd(today) },
        thisQuarter: { label: 'This quarter', from: ymd(startOfQuarter(today)), to: ymd(today) },
        lastQuarter: { label: 'Last quarter', from: ymd(startOfQuarter(lastQuarter)), to: ymd(endOfQuarter(lastQuarter)) },
        thisYear: { label: 'This year', from: ymd(startOfYear(today)), to: ymd(today) },
    };
}

const SOURCE_LABELS: Record<string, string> = {
    direct: 'Direct',
    search: 'Search engines',
    social: 'Social media',
    website: 'Other websites',
    campaign: 'Campaigns (UTM links)',
};

const visitsChart = { visits: { label: 'Visits', color: 'var(--chart-1)' } } satisfies ChartConfig;
const searchesChart = { searches: { label: 'Searches', color: 'var(--chart-2)' } } satisfies ChartConfig;

function formatChange(change: number | null) {
    if (change === null) {
        return 'No previous data';
    }

    return `${change > 0 ? '+' : ''}${change}% vs. previous period`;
}

function SummaryTile({ entry }: { entry: SummaryEntry }) {
    return (
        <Card className="gap-2">
            <CardHeader className="pb-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">{entry.metric}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold text-foreground">{entry.current.toLocaleString()}</div>
                <p className="mt-1 text-xs text-muted-foreground">
                    {formatChange(entry.change)} ({entry.previous.toLocaleString()})
                </p>
            </CardContent>
        </Card>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section>
            <h2 className="mb-3 text-xl font-semibold text-foreground">{title}</h2>
            {children}
        </section>
    );
}

function Table({
    title,
    headings,
    rows,
    emptyText = 'No data for this period.',
    highlight,
}: {
    title: string;
    headings: string[];
    rows: ReactNode[][];
    emptyText?: string;
    highlight?: (row: ReactNode[]) => boolean;
}) {
    return (
        <Card className="gap-2">
            <CardHeader className="pb-0">
                <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                {rows.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{emptyText}</p>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b text-left text-muted-foreground">
                                {headings.map((heading, i) => (
                                    <th key={heading} className={`py-1.5 font-medium ${i > 0 ? 'text-right' : ''}`}>
                                        {heading}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, r) => (
                                <tr key={r} className={`border-b last:border-0 ${highlight?.(row) ? 'bg-muted/60 font-semibold' : ''}`}>
                                    {row.map((cell, i) => (
                                        <td key={i} className={`py-1.5 ${i > 0 ? 'pl-3 text-right whitespace-nowrap tabular-nums' : 'break-words'}`}>
                                            {cell ?? '-'}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </CardContent>
        </Card>
    );
}

function DailyBars<K extends string>({ title, data, dataKey, config }: { title: string; data: Row[]; dataKey: K; config: ChartConfig }) {
    return (
        <Card className="gap-2">
            <CardHeader className="pb-0">
                <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer config={config} className="aspect-auto h-64 w-full">
                    <BarChart data={data} margin={{ left: -16 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="date" tickLine={false} axisLine={false} minTickGap={24} tickFormatter={(d: string) => format(new Date(`${d}T00:00`), 'MMM d')} />
                        <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent labelFormatter={(d) => format(new Date(`${d}T00:00`), 'EEE, MMM d, yyyy')} />} />
                        <Bar dataKey={dataKey} fill={`var(--color-${dataKey})`} radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}

function share(part: number, total: number) {
    return total === 0 ? '0%' : `${Math.round((part / total) * 100)}%`;
}

export default function Usage({ report }: { report: UsageReport }) {
    const ranges = presets();
    const activePreset = Object.entries(ranges).find(([, r]) => r.from === report.from && r.to === report.to)?.[0] ?? 'custom';
    const visit = (from: string, to: string) => router.get(usageIndex().url, { from, to }, { preserveScroll: true });

    const totalVisits = report.regions.reduce((sum, r) => sum + r.visits, 0);
    const totalDevices = report.devices.reduce((sum, d) => sum + d.visits, 0);
    const parameterGroups = Object.entries(
        report.parameters.reduce<Record<string, UsageReport['parameters']>>((groups, p) => {
            (groups[p.parameter] ??= []).push(p);
            return groups;
        }, {}),
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Usage" />
            <div className="flex h-full flex-1 flex-col gap-8 p-4">
                <div className="flex flex-wrap items-end gap-3">
                    <div>
                        <label className="mb-1 block text-xs text-muted-foreground">Period</label>
                        <Select value={activePreset} onValueChange={(key) => key !== 'custom' && visit(ranges[key].from, ranges[key].to)}>
                            <SelectTrigger className="w-[160px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(ranges).map(([key, r]) => (
                                    <SelectItem key={key} value={key}>
                                        {r.label}
                                    </SelectItem>
                                ))}
                                <SelectItem value="custom">Custom</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label htmlFor="from" className="mb-1 block text-xs text-muted-foreground">From</label>
                        <Input id="from" type="date" value={report.from} max={report.to} onChange={(e) => e.target.value && visit(e.target.value, report.to)} />
                    </div>
                    <div>
                        <label htmlFor="to" className="mb-1 block text-xs text-muted-foreground">To</label>
                        <Input id="to" type="date" value={report.to} min={report.from} onChange={(e) => e.target.value && visit(report.from, e.target.value)} />
                    </div>
                    <p className="pb-2 text-xs text-muted-foreground">
                        Compared with {report.previous_from} to {report.previous_to}
                    </p>
                    <a
                        href={usageExport.url({ query: { from: report.from, to: report.to } })}
                        className="ml-auto inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent"
                    >
                        <Download className="h-4 w-4" /> Export to Excel
                    </a>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    {report.summary.map((entry) => (
                        <SummaryTile key={entry.key} entry={entry} />
                    ))}
                </div>

                <Section title="Visits over time">
                    <DailyBars title="Visits per day" data={report.visits_over_time} dataKey="visits" config={visitsChart} />
                </Section>

                <Section title="Location">
                    <div className="flex flex-col gap-4">
                        <Card className="gap-2">
                            <CardHeader className="pb-0">
                                <CardTitle className="text-base">Visits by country</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <WorldMap countries={report.countries} />
                            </CardContent>
                        </Card>
                        <div className="grid gap-4 lg:grid-cols-2">
                            <Table
                                title="Visits by region"
                                headings={['Region', 'Visits', 'Share']}
                                rows={report.regions.map((r) => [r.region, r.visits, share(r.visits, totalVisits)])}
                                highlight={(row) => row[0] === 'North America'}
                            />
                            <Table
                                title="Top countries"
                                headings={['Country', 'Visits', 'Share']}
                                rows={report.countries.slice(0, 10).map((c) => [countryName.of(c.country_code) ?? c.country_code, c.visits, share(c.visits, totalVisits)])}
                            />
                        </div>
                    </div>
                </Section>

                <Section title="Sources">
                    <div className="grid gap-4 lg:grid-cols-3">
                        <Table title="Where visits came from" headings={['Source', 'Visits']} rows={report.source_types.map((s) => [SOURCE_LABELS[s.source_type] ?? s.source_type, s.visits])} />
                        <Table title="Top referring websites" headings={['Website', 'Visits']} rows={report.referrers.slice(0, 10).map((r) => [r.host, r.visits])} />
                        <Table
                            title="Campaigns"
                            headings={['Source / medium / campaign', 'Visits']}
                            rows={report.campaigns.map((c) => [[c.utm_source, c.utm_medium, c.utm_campaign].map((part) => part ?? '-').join(' / '), c.visits])}
                            emptyText="No visits from UTM-tagged links in this period."
                        />
                    </div>
                </Section>

                <Section title="Searches">
                    <div className="flex flex-col gap-4">
                        <DailyBars title="Searches per day" data={report.searches_over_time} dataKey="searches" config={searchesChart} />
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {parameterGroups.map(([parameter, values]) => (
                                <Table
                                    key={parameter}
                                    title={`Top ${values[0].label.toLowerCase()}`}
                                    headings={[values[0].label, 'Times used']}
                                    rows={values.slice(0, 10).map((v) => [v.value, v.count])}
                                />
                            ))}
                        </div>
                        <Table
                            title="Searches with no results"
                            headings={['Search', 'Times searched', 'Last searched', '']}
                            rows={report.zero_result_searches.map((z) => [
                                <span className="flex flex-wrap gap-x-4 gap-y-1">
                                    {z.filters.map((f) => (
                                        <span key={f.label}>
                                            <strong className="font-semibold">{f.label}</strong> | {f.value}
                                        </span>
                                    ))}
                                </span>,
                                z.count,
                                z.last_searched,
                                <a
                                    href={z.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="Open this search on the site"
                                    aria-label="Open this search on the site"
                                    className="inline-flex text-muted-foreground hover:text-foreground"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                </a>,
                            ])}
                            emptyText="Every search in this period found results."
                        />
                    </div>
                </Section>

                <Section title="Devices">
                    <div className="grid gap-4 sm:grid-cols-2 lg:max-w-xl">
                        {['desktop', 'mobile'].map((device) => {
                            const visits = report.devices.find((d) => d.device === device)?.visits ?? 0;

                            return (
                                <Card key={device} className="gap-2">
                                    <CardHeader className="pb-0">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">{device === 'desktop' ? 'Desktop' : 'Mobile & tablet'}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold">{share(visits, totalDevices)}</div>
                                        <p className="text-xs text-muted-foreground">{visits.toLocaleString()} visits</p>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </Section>
            </div>
        </AppLayout>
    );
}
