import * as React from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AsyncComboboxProps {
    value: string;
    onChange: (value: string) => void;
    fetchOptions: (query: string) => Promise<string[]>;
    placeholder?: string;
    emptyMessage?: string;
    loadingMessage?: string;
    minCharsToSearch?: number;
    debounceMs?: number;
    allowCustom?: boolean;
    className?: string;
    id?: string;
}

export function AsyncCombobox({
    value,
    onChange,
    fetchOptions,
    placeholder = 'Type to search...',
    emptyMessage = 'No results found.',
    loadingMessage = 'Searching...',
    minCharsToSearch = 2,
    debounceMs = 300,
    allowCustom = true,
    className,
    id,
}: AsyncComboboxProps) {
    const [open, setOpen] = useState(false);
    const [inputValue, setInputValue] = useState(value);
    const [options, setOptions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Sync input value with external value
    useEffect(() => {
        setInputValue(value);
    }, [value]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Cleanup debounce timer on unmount
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    const debouncedSearch = useCallback(
        (searchTerm: string) => {
            // Clear any existing timer
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }

            // Don't search if below minimum characters
            if (searchTerm.length < minCharsToSearch) {
                setOptions([]);
                setIsLoading(false);
                return;
            }

            setIsLoading(true);

            debounceTimerRef.current = setTimeout(async () => {
                try {
                    const results = await fetchOptions(searchTerm);
                    setOptions(results);
                } catch (error) {
                    console.error('Error fetching options:', error);
                    setOptions([]);
                } finally {
                    setIsLoading(false);
                }
            }, debounceMs);
        },
        [fetchOptions, debounceMs, minCharsToSearch]
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        setOpen(true);

        if (allowCustom) {
            onChange(newValue);
        }

        debouncedSearch(newValue);
    };

    const handleSelectOption = (option: string) => {
        setInputValue(option);
        onChange(option);
        setOpen(false);
    };

    const handleInputFocus = () => {
        setOpen(true);
        // Optionally trigger search on focus if there's already a value
        if (inputValue.length >= minCharsToSearch) {
            debouncedSearch(inputValue);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && options.length > 0) {
            e.preventDefault();
            handleSelectOption(options[0]);
        } else if (e.key === 'Escape') {
            setOpen(false);
        }
    };

    const showDropdown = open && (isLoading || inputValue.length >= minCharsToSearch);

    return (
        <div ref={containerRef} className={cn('relative', className)}>
            <div className="relative">
                <Input
                    ref={inputRef}
                    id={id}
                    value={inputValue}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="pr-10"
                />
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => {
                        setOpen(!open);
                        inputRef.current?.focus();
                    }}
                >
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin opacity-50" />
                    ) : (
                        <ChevronsUpDown className="h-4 w-4 opacity-50" />
                    )}
                </Button>
            </div>

            {showDropdown && (
                <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
                    <div className="max-h-60 overflow-auto p-1">
                        {isLoading ? (
                            <div className="flex items-center justify-center px-2 py-3 text-sm text-muted-foreground">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {loadingMessage}
                            </div>
                        ) : options.length === 0 ? (
                            <div className="px-2 py-3 text-sm text-muted-foreground text-center">
                                {allowCustom && inputValue ? (
                                    <span>Press Enter to use "{inputValue}"</span>
                                ) : (
                                    emptyMessage
                                )}
                            </div>
                        ) : (
                            options.map((option) => (
                                <div
                                    key={option}
                                    className={cn(
                                        'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground',
                                        value === option && 'bg-accent text-accent-foreground'
                                    )}
                                    onClick={() => handleSelectOption(option)}
                                >
                                    <Check
                                        className={cn(
                                            'mr-2 h-4 w-4',
                                            value === option ? 'opacity-100' : 'opacity-0'
                                        )}
                                    />
                                    {option}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
