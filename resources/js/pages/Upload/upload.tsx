import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { UploadDropzone } from '@/components/upload-dropzone';
import { useState } from 'react';
import { fileUpload } from "@/actions/App/Http/Controllers/FileController";
import FlashMessages from '@/components/ui/flash-messages';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Upload',
        href: dashboard().url,
    },
];

export default function Upload() {
    const allowedExtensions = '.csv,.xls,.xlsx';
    const { data, setData, post, processing, errors, reset } = useForm<{ file: File | null }>({
        file: null,
    });
    const [clearFileTrigger, setClearFileTrigger] = useState(0);

    const handleFileChange = (files: FileList) => {
        const [selectedFile] = Array.from(files ?? []);
        console.log('Selected file:', selectedFile);

        if (!selectedFile) {
            setData('file', null);
            return;
        }

        setData('file', selectedFile);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Submitting file:', data.file);
        post(fileUpload.url(), {
            forceFormData: true,

            onSuccess: (response: object) => {
                console.log(response);
            },

            onError: (errors: object) => {
                console.log(errors);
            },
            onFinish: () => {
                console.log('Upload finished');
                setClearFileTrigger((prev) => prev + 1);
                reset()
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Upload" />
            <FlashMessages />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className='mx-auto mt-10 w-4xl rounded-md p-10 shadow-md'>
                    <form onSubmit={handleSubmit}>
                        <UploadDropzone
                            onFilesSelected={handleFileChange}
                            instructions={`Supported file extensions: ${allowedExtensions}. \nMax file size: 25MB.`}
                            accept={allowedExtensions}
                            isUploading={processing}
                            clearTrigger={clearFileTrigger}
                        />
                        {errors.file && (
                            <p className="mt-2 text-sm text-red-600">{errors.file}</p>
                        )}
                        <button
                            type="submit"
                            disabled={processing || !data.file}
                            className="mt-4 inline-flex items-center px-4 py-2 bg-primary border border-transparent rounded-md font-semibold text-xs text-primary-foreground uppercase tracking-widest disabled:opacity-25 transition ease-in-out duration-150 enabled:cursor-pointer hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
                        >
                            {processing ? 'Uploading...' : 'Upload File'}
                        </button>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
