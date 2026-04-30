import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label" // adjust path if needed

type FileInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  helpText?: string
  containerClassName?: string
}

function FileInput({
  id,
  label = "Upload file",
  helpText = "SVG, PNG, JPG or GIF (MAX. 800x400px).",
  className,
  containerClassName,
  ...props
}: FileInputProps) {
  const generatedId = React.useId()
  const inputId = id ?? generatedId
  const helpId = `${inputId}-help`

  return (
    <div className={cn("space-y-1.5", containerClassName)}>
      <Label
        htmlFor={inputId}
        className="block mb-2.5 text-sm font-medium text-heading"
      >
        {label}
      </Label>

      <input
        id={inputId}
        type="file"
        aria-describedby={helpId}
        className={cn(
          "cursor-pointer bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full shadow-xs placeholder:text-body",
          className
        )}
        {...props}
      />

      {helpText ? (
        <p
          id={helpId}
          className="mt-1 text-sm text-gray-500 dark:text-gray-300"
        >
          {helpText}
        </p>
      ) : null}
    </div>
  )
}

export { FileInput }
