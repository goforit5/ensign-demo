/**
 * BaseStyleBuilder - DRY Style Builder Pattern
 * Sprint 31: Apple-Inspired Universal Audit UX Redesign
 *
 * Provides a fluent API for building Tailwind CSS class strings
 * with conditional logic and variant management.
 *
 * Benefits:
 * - DRY: Reusable style building logic across all components
 * - Type-safe: TypeScript ensures valid method chaining
 * - Composable: Base classes + variant classes + conditional classes
 * - Maintainable: Centralized style logic, easy to update
 *
 * Usage:
 * ```typescript
 * class ButtonStyleBuilder extends BaseStyleBuilder {
 *   constructor() {
 *     super('inline-flex items-center justify-center font-medium transition-all');
 *   }
 *
 *   variant(variant: 'primary' | 'secondary'): this {
 *     const variants = {
 *       primary: 'bg-primary-500 text-white hover:bg-primary-600',
 *       secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
 *     };
 *     this.classes.push(variants[variant || 'primary']);
 *     return this;
 *   }
 * }
 *
 * const buttonClasses = new ButtonStyleBuilder()
 *   .variant('primary')
 *   .size('md')
 *   .disabled(isDisabled)
 *   .build();
 * ```
 */

export abstract class BaseStyleBuilder {
  protected classes: string[] = [];

  /**
   * Initialize with base classes that apply to all variants
   * @param baseClasses - Base Tailwind classes (e.g., "flex items-center")
   */
  protected baseClasses: string;
  constructor(baseClasses: string) {
    this.baseClasses = baseClasses;
    this.classes.push(baseClasses);
  }

  /**
   * Build the final class string
   * @returns Space-separated class string for className prop
   */
  build(): string {
    return this.classes.filter(Boolean).join(' ');
  }

  /**
   * Add classes conditionally
   * @param condition - Whether to add the className
   * @param className - Tailwind classes to add
   * @returns this (for method chaining)
   */
  protected addConditional(condition: boolean, className: string): this {
    if (condition) {
      this.classes.push(className);
    }
    return this;
  }

  /**
   * Add multiple classes at once
   * @param classNames - Array of Tailwind classes
   * @returns this (for method chaining)
   */
  protected addMultiple(...classNames: string[]): this {
    this.classes.push(...classNames.filter(Boolean));
    return this;
  }

  /**
   * Add custom classes (for one-off customization)
   * @param className - Custom Tailwind classes
   * @returns this (for method chaining)
   */
  custom(className?: string): this {
    if (className) {
      this.classes.push(className);
    }
    return this;
  }

  /**
   * Common utility: Add disabled state styles
   * @param disabled - Whether the element is disabled
   * @returns this (for method chaining)
   */
  disabled(disabled: boolean): this {
    return this.addConditional(
      disabled,
      'opacity-50 cursor-not-allowed pointer-events-none'
    );
  }

  /**
   * Common utility: Add loading state styles
   * @param loading - Whether the element is loading
   * @returns this (for method chaining)
   */
  loading(loading: boolean): this {
    return this.addConditional(loading, 'cursor-wait');
  }

  /**
   * Common utility: Add focus ring (Apple-style)
   * @param focusable - Whether the element should show focus ring
   * @returns this (for method chaining)
   */
  focusRing(focusable: boolean = true): this {
    return this.addConditional(
      focusable,
      'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
    );
  }

  /**
   * Common utility: Add full width
   * @param fullWidth - Whether the element should be full width
   * @returns this (for method chaining)
   */
  fullWidth(fullWidth: boolean): this {
    return this.addConditional(fullWidth, 'w-full');
  }
}

/**
 * Utility function to merge class names with deduplication
 * Useful for combining BaseStyleBuilder output with additional classes
 *
 * @param classNames - Class strings to merge
 * @returns Merged, deduplicated class string
 */
export function mergeClasses(...classNames: (string | undefined | null | false)[]): string {
  const validClasses = classNames.filter(Boolean) as string[];
  const allClasses = validClasses.join(' ').split(/\s+/);
  return [...new Set(allClasses)].join(' ');
}

/**
 * Utility function to conditionally add classes
 * Shorter syntax for simple conditional logic
 *
 * @param className - Class to add
 * @param condition - Whether to add the class
 * @returns className if condition is true, empty string otherwise
 */
export function conditionalClass(className: string, condition: boolean): string {
  return condition ? className : '';
}
