import { ALPHA2_BY_ATLAS_ID } from '@/lib/country-codes';
import { geoPath, geoProjection } from 'd3-geo';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import { useMemo, useState } from 'react';
import { feature } from 'topojson-client';
import type { GeometryCollection, Topology } from 'topojson-specification';
import world from 'world-atlas/countries-110m.json';

const WIDTH = 960;

// Miller: the familiar upright wall map, with less polar stretch than Mercator. Not in d3-geo, but it is one line.
const miller = () => geoProjection((x, y) => [x, 1.25 * Math.log(Math.tan(Math.PI / 4 + 0.4 * y))]);

// Fewer -> more visits. Separate steps for dark mode, where "more" reads as brighter, not darker.
const STEPS = [
    'fill-[#c3e2d4] dark:fill-[#24423a]',
    'fill-[#93c8b1] dark:fill-[#2f5e51]',
    'fill-[#5fa68c] dark:fill-[#3f7d6b]',
    'fill-[#3b7d68] dark:fill-[#5aa38c]',
    'fill-[#24564a] dark:fill-[#8fd0b8]',
];
const NO_VISITS = 'fill-[#eceef1] dark:fill-[#2a2f36]';

type Country = { code: string; name: string; d: string };

const countryName = new Intl.DisplayNames(['en'], { type: 'region' });

// Country outlines never change: project them once per page load. The height follows the map's shape.
function useCountries(): { countries: Country[]; height: number } {
    return useMemo(() => {
        const topology = world as unknown as Topology<{ countries: GeometryCollection<{ name: string }> }>;
        const shapes = (feature(topology, topology.objects.countries) as FeatureCollection<Geometry, { name: string }>).features
            .map((f: Feature<Geometry, { name: string }>) => ({ f, code: ALPHA2_BY_ATLAS_ID[String(f.id ?? f.properties.name)] }))
            .filter(({ code }) => code && code !== 'AQ');
        const all: FeatureCollection = { type: 'FeatureCollection', features: shapes.map(({ f }) => f) };
        const path = geoPath(miller().fitWidth(WIDTH, all));

        return {
            countries: shapes.map(({ f, code }) => ({ code, name: countryName.of(code) ?? f.properties.name, d: path(f) ?? '' })),
            height: Math.ceil(path.bounds(all)[1][1]),
        };
    }, []);
}

/**
 * Visits per country on a world map: one green, darker for more visits on a log scale
 * (a few countries dominate, so a linear scale would leave the rest looking empty).
 */
export default function WorldMap({ countries }: { countries: { country_code: string; visits: number }[] }) {
    const { countries: shapes, height } = useCountries();
    const [hovered, setHovered] = useState<{ country: Country; x: number; y: number } | null>(null);

    const visits = new Map(countries.map((c) => [c.country_code, c.visits]));
    const total = countries.reduce((sum, c) => sum + c.visits, 0);
    const max = Math.max(1, ...countries.map((c) => c.visits));
    const step = (v: number) => (max === 1 ? STEPS.length - 1 : Math.min(STEPS.length - 1, Math.floor((Math.log(v) / Math.log(max)) * STEPS.length)));
    const hoveredVisits = hovered ? (visits.get(hovered.country.code) ?? 0) : 0;

    return (
        <div className="relative">
            <svg viewBox={`0 0 ${WIDTH} ${height}`} role="img" aria-label="Visits by country" className="h-auto w-full" onMouseLeave={() => setHovered(null)}>
                {shapes.map((country) => {
                    const v = visits.get(country.code) ?? 0;

                    return (
                        <path
                            key={country.code}
                            d={country.d}
                            data-country={country.code}
                            data-visits={v}
                            className={`${v > 0 ? STEPS[step(v)] : NO_VISITS} stroke-background stroke-[0.5] transition-opacity hover:opacity-80`}
                            onMouseMove={(e) => {
                                const box = e.currentTarget.ownerSVGElement!.getBoundingClientRect();
                                setHovered({ country, x: e.clientX - box.left, y: e.clientY - box.top });
                            }}
                        />
                    );
                })}
            </svg>

            {hovered && (
                <div
                    role="tooltip"
                    className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+10px)] rounded-md border bg-popover px-2.5 py-1.5 text-xs whitespace-nowrap text-popover-foreground shadow-md"
                    style={{ left: hovered.x, top: hovered.y }}
                >
                    <div className="font-medium">{hovered.country.name}</div>
                    <div className="text-muted-foreground">
                        {hoveredVisits === 0
                            ? 'No visits'
                            : `${hoveredVisits.toLocaleString()} visit${hoveredVisits === 1 ? '' : 's'} (${Math.round((hoveredVisits / total) * 100)}%)`}
                    </div>
                </div>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                    <svg width="14" height="10" aria-hidden="true">
                        <rect width="14" height="10" rx="2" className={NO_VISITS} />
                    </svg>
                    No visits
                </div>
                <div className="flex items-center gap-1.5">
                    <span>1</span>
                    <svg width={STEPS.length * 18} height="10" aria-hidden="true">
                        {STEPS.map((s, i) => (
                            <rect key={s} x={i * 18} width="16" height="10" rx="2" className={s} />
                        ))}
                    </svg>
                    <span>
                        {max.toLocaleString()} visit{max === 1 ? '' : 's'}
                    </span>
                </div>
            </div>
        </div>
    );
}
