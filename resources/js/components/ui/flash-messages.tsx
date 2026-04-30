import { useEffect, useState, useRef } from 'react';
import { usePage, router } from '@inertiajs/react';
import { X } from 'lucide-react';

type Flash = {
  success?: string | null;
  error?: string | null;
};

type InertiaPageProps = {
  flash?: Flash;
  errors?: Record<string, string>;
};

export default function FlashMessages() {
  const { flash, errors } = usePage<InertiaPageProps>().props;

  const [showSuccess, setShowSuccess] = useState<boolean>(!!flash?.success);
  const [showError, setShowError] = useState<boolean>(!!flash?.error);
  const [showValidationErrors, setShowValidationErrors] = useState<boolean>(false);

  // Track Inertia page visits so flash messages re-appear even when the
  // server sends back the exact same message string on consecutive requests.
  const [visitCount, setVisitCount] = useState(0);

  useEffect(() => {
    return router.on('success', () => {
      setVisitCount((c) => c + 1);
    });
  }, []);

  // timers to auto-hide messages
  const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const errorTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const validationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const TIME_OUT = 10000; // 10 seconds

  // auto-open when props change (visitCount ensures re-trigger for identical values)
  useEffect(() => {
    setShowSuccess(!!flash?.success);
  }, [flash?.success, visitCount]);

  useEffect(() => {
    setShowError(!!flash?.error);
  }, [flash?.error, visitCount]);

  // Optional: show a generic validation error banner if any errors exist
  const hasValidationErrors = errors && Object.keys(errors).length > 0;

  useEffect(() => {
    setShowValidationErrors(hasValidationErrors);
  }, [hasValidationErrors]);

  useEffect(() => {
    if (showSuccess) {
      if (successTimer.current) clearTimeout(successTimer.current);
      successTimer.current = setTimeout(() => setShowSuccess(false), TIME_OUT);
    }
    return () => {
      if (successTimer.current) {
        clearTimeout(successTimer.current);
        successTimer.current = null;
      }
    };
  }, [showSuccess]);

  useEffect(() => {
    if (showError) {
      if (errorTimer.current) clearTimeout(errorTimer.current);
      errorTimer.current = setTimeout(() => setShowError(false), TIME_OUT);
    }
    return () => {
      if (errorTimer.current) {
        clearTimeout(errorTimer.current);
        errorTimer.current = null;
      }
    };
  }, [showError]);

  useEffect(() => {
    if (showValidationErrors) {
      if (validationTimer.current) clearTimeout(validationTimer.current);
      validationTimer.current = setTimeout(() => setShowValidationErrors(false), TIME_OUT);
    }
    return () => {
      if (validationTimer.current) {
        clearTimeout(validationTimer.current);
        validationTimer.current = null;
      }
    };
  }, [showValidationErrors]);

  if (!showSuccess && !showError && !showValidationErrors) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 top-4 z-50 flex flex-col items-end gap-2 px-4 sm:px-6 lg:px-8">
      {/* Success */}
      {flash?.success && showSuccess && (
        <div className="flex w-full max-w-xl items-start justify-between rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 shadow-sm dark:border-emerald-700 dark:bg-emerald-900/80 dark:text-emerald-50">
          <div className="pr-3">
            <div className="font-semibold">Success</div>
            <div>{flash.success}</div>
          </div>
          <button
            type="button"
            onClick={() => setShowSuccess(false)}
            className="mt-0.5 inline-flex items-center rounded-full p-1 hover:bg-emerald-100 dark:hover:bg-emerald-800"
            aria-label="Dismiss success message"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Error */}
      {flash?.error && showError && (
        <div className="flex w-full max-w-xl items-start justify-between rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800 shadow-sm dark:border-red-700 dark:bg-red-900/80 dark:text-red-50">
          <div className="pr-3">
            <div className="font-semibold">Error</div>
            <div>{flash.error}</div>
          </div>
          <button
            type="button"
            onClick={() => setShowError(false)}
            className="mt-0.5 inline-flex items-center rounded-full p-1 hover:bg-red-100 dark:hover:bg-red-800"
            aria-label="Dismiss error message"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Validation errors (generic banner) */}
      {showValidationErrors && !flash?.error && (
        <div className="flex w-full max-w-xl items-start justify-between rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 shadow-sm dark:border-amber-700 dark:bg-amber-900/80 dark:text-amber-50">
          <div className="pr-3">
            <div className="font-semibold">There were some problems with your input.</div>
            {/* Show the first error only, or map all if you want */}
            <ul className="mt-1 list-disc pl-4">
              {Object.entries(errors || {}).map(([field, message]) => (
                <li key={field}>{message}</li>
              ))}
            </ul>
          </div>
          <button
            type="button"
            onClick={() => setShowValidationErrors(false)}
            className="mt-0.5 inline-flex items-center rounded-full p-1 hover:bg-amber-100 dark:hover:bg-amber-800"
            aria-label="Dismiss validation errors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
