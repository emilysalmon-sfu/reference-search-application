import * as React from "react"
import { cn } from "@/lib/utils"

type UploadDropzoneProps = React.HTMLAttributes<HTMLDivElement> & {
  instructions?: string
  accept?: string
  // multiple?: boolean
  onFilesSelected?: (files: FileList) => void
  isUploading?: boolean,
  clearTrigger?: number
}

function UploadDropzone({
  className,
  instructions,
  accept,
  onFilesSelected,
  isUploading = false,
  clearTrigger,
  ...props
}: UploadDropzoneProps) {
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const id = React.useId()
  const instructionsId = `${id}-instructions`
  const [isDragging, setIsDragging] = React.useState(false)
  const [fileName, setFileName] = React.useState<string | null>(null)

  // Clear file when upload is successful
 React.useEffect(() => {
    if (clearTrigger === undefined) return;

    setFileName(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }

    const dt = new DataTransfer();
    onFilesSelected?.(dt.files);
  }, [clearTrigger, onFilesSelected]);

  const handleBrowseClick = () => {
    inputRef.current?.click()
  }

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return

    const firstFile = files[0]
    setFileName(firstFile.name)

    onFilesSelected?.(files)
  }

  const handleDrop: React.DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragging(false)
    handleFiles(event.dataTransfer.files)
  }

  const handleDragOver: React.DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave: React.DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault()
    event.stopPropagation()

    const related = event.relatedTarget as Node | null
    if (related && event.currentTarget.contains(related)) {
      return
    }

    setIsDragging(false)
  }

  const clearFile = () => {
    setFileName(null)

    // reset the <input type="file"> value
    if (inputRef.current) {
      inputRef.current.value = ""
    }

    // optional: notify parent that files were cleared (empty FileList)
    const dt = new DataTransfer()
    onFilesSelected?.(dt.files)
  }

  return (
    <div
      className={cn("flex items-center justify-center w-full", className)}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      {...props}
    >
      {/* <div className="flex flex-col items-center justify-center w-full h-64 bg-neutral-secondary-medium border border-dashed border-default-strong rounded-base cursor-pointer"> */}
      <div
        className={cn(
          "flex flex-col items-center justify-center w-full h-64 bg-neutral-secondary-medium border border-dashed border-default-strong rounded-base transition-colors",
          isDragging && "border-brand bg-neutral-secondary-medium/70"
        )}
      >
        <div className="flex flex-col items-center justify-center text-body pt-5 pb-6">
          <svg
            className="w-8 h-8 mb-4"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 5v9m-5 0H5a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-2M8 9l4-5 4 5m1 8h.01"
            />
          </svg>

          <p className="mb-2 text-sm flex items-center gap-2">
            {isDragging && "Drop the file here"}

            {!isDragging && fileName && (
              <>
                <span className="truncate max-w-xs">
                  Selected file: {fileName}
                </span>
                <button
                  type="button"
                  onClick={clearFile}
                  disabled={isUploading}
                  aria-label="Remove file"
                  className="cursor-pointer inline-flex h-5 w-5 items-center justify-center rounded-full border border-default-strong text-xs leading-none bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ×
                </button>
              </>
            )}

            {!isDragging && !fileName && !isDragging &&
              "Click the button below or drag and drop a file"}
          </p>

          {instructions ? (
            <p
              id={instructionsId}
              className="text-xs mb-4"
            >
              {instructions}
            </p>
          ) : null}

          <button
            type="button"
            onClick={handleBrowseClick}
            disabled={isUploading}
            className="inline-flex items-center text-white bg-black hover:bg-brand-strong box-border border border-transparent 
            focus:ring-4 focus:ring-brand-medium shadow-xs font-medium leading-5 rounded-base text-sm px-3 py-2 focus:outline-none cursor-pointer rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              className="w-4 h-4 me-1.5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="2"
                d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
              />
            </svg>
            Browse file
          </button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        id={id}
        ref={inputRef}
        type="file"
        className="hidden"
        accept={accept}
        onChange={(e) => handleFiles(e.target.files)} />
    </div>
  )
}

export { UploadDropzone }
