import { usePage } from '@inertiajs/react';

export type TypeStyle = {
    bg: string;
    text: string;
};

export type TypeStyles = Record<string, TypeStyle>;

// Default gray style for types without configured styles
const defaultUnknownStyle: TypeStyle = { 
    bg: 'bg-gray-100 dark:bg-gray-900', 
    text: 'text-gray-800 dark:text-gray-200' 
};

/**
 * Hook to get type styles from shared page props
 */
export function useTypeStyles(): TypeStyles {
    const page = usePage();
    const typeStyles = (page.props as any).typeStyles as TypeStyles | undefined;
    
    return typeStyles ?? {};
}

/**
 * Get the combined class string for a type badge
 */
export function getTypeColor(type: string | undefined, typeStyles: TypeStyles): string {
    if (!type) {
        return `${defaultUnknownStyle.bg} ${defaultUnknownStyle.text}`;
    }
    
    const style = typeStyles[type] ?? defaultUnknownStyle;
    return `${style.bg} ${style.text}`;
}

/**
 * Hook that returns a function to get type color
 */
export function useGetTypeColor(): (type: string | undefined) => string {
    const typeStyles = useTypeStyles();
    return (type) => getTypeColor(type, typeStyles);
}
