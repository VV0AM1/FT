import * as React from "react"

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "ghost" | "outline", size?: "default" | "sm" }>(
    ({ className, variant = "default", size = "default", ...props }, ref) => {
        const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        const variants = {
            default: "bg-[var(--color-primary)] text-white hover:bg-emerald-600 shadow",
            ghost: "hover:bg-gray-100 hover:text-gray-900",
            outline: "border border-gray-200 bg-white text-gray-900 hover:bg-gray-100 hover:text-gray-900"
        }
        const sizes = {
            default: "h-9 px-4 py-2",
            sm: "h-8 rounded-md px-3 text-xs"
        }
        return (
            <button
                className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
