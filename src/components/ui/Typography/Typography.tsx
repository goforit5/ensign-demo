/**
 * Typography Component - Apple Design System
 * Sprint 31: Universal Audit UX Redesign
 *
 * Implements Apple's type scale using SF Pro Text
 * Variants: largeTitle, title1, title2, title3, headline, callout, body, caption1, caption2
 *
 * Usage:
 * ```tsx
 * <Typography variant="title1" color="primary">
 *   Healthcare Audit Platform
 * </Typography>
 *
 * <Typography variant="body" color="secondary" className="mb-4">
 *   Manage compliance across 40 facilities
 * </Typography>
 *
 * <Typography variant="caption1" color="severity-critical">
 *   69 critical violations
 * </Typography>
 * ```
 */

import React from 'react';
import { BaseStyleBuilder } from '../base/BaseStyleBuilder';

/**
 * Typography Variants (Apple Type Scale)
 */
export type TypographyVariant =
  | 'largeTitle'   // 40px - Hero sections
  | 'title1'       // 32px - Page titles
  | 'title2'       // 28px - Section headers
  | 'title3'       // 24px - Subsection headers
  | 'headline'     // 20px - Card titles
  | 'callout'      // 18px - Emphasized text
  | 'body'         // 16px - Default text
  | 'caption1'     // 14px - Secondary text
  | 'caption2';    // 12px - Tertiary text

/**
 * Text Colors (Semantic + Severity)
 */
export type TypographyColor =
  | 'primary'              // Default text color
  | 'secondary'            // Muted text
  | 'tertiary'             // Very muted text
  | 'severity-critical'    // Red (urgent)
  | 'severity-high'        // Orange (attention)
  | 'severity-medium'      // Yellow (monitor)
  | 'severity-low'         // Blue (routine)
  | 'severity-compliant';  // Green (all clear)

/**
 * Font Weights
 */
export type TypographyWeight = 'regular' | 'medium' | 'semibold' | 'bold';

/**
 * HTML Element Mapping
 */
export type TypographyElement = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';

export interface TypographyProps {
  /**
   * Typography variant (Apple type scale)
   */
  variant?: TypographyVariant;

  /**
   * Text color (semantic or severity)
   */
  color?: TypographyColor;

  /**
   * Font weight override
   */
  weight?: TypographyWeight;

  /**
   * HTML element to render (default: auto-mapped from variant)
   */
  as?: TypographyElement;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Content to render
   */
  children: React.ReactNode;

  /**
   * Test ID for automated testing
   */
  'data-testid'?: string;
}

/**
 * Typography Style Builder
 */
class TypographyStyleBuilder extends BaseStyleBuilder {
  constructor() {
    super('font-sf-pro');
  }

  variant(variant: TypographyVariant = 'body'): this {
    const variants: Record<TypographyVariant, string> = {
      largeTitle: 'text-5xl font-bold leading-tight tracking-tight',
      title1: 'text-4xl font-bold leading-tight tracking-tight',
      title2: 'text-3xl font-semibold leading-tight tracking-tight',
      title3: 'text-2xl font-semibold leading-normal tracking-normal',
      headline: 'text-xl font-semibold leading-normal tracking-normal',
      callout: 'text-lg font-regular leading-normal tracking-normal',
      body: 'text-base font-regular leading-normal tracking-normal',
      caption1: 'text-sm font-regular leading-normal tracking-normal',
      caption2: 'text-xs font-regular leading-normal tracking-wide',
    };
    this.classes.push(variants[variant]);
    return this;
  }

  color(color: TypographyColor = 'primary'): this {
    const colors: Record<TypographyColor, string> = {
      primary: 'text-gray-900',
      secondary: 'text-gray-600',
      tertiary: 'text-gray-400',
      'severity-critical': 'text-severity-critical-600',
      'severity-high': 'text-severity-high-600',
      'severity-medium': 'text-severity-medium-700',
      'severity-low': 'text-severity-low-600',
      'severity-compliant': 'text-severity-compliant-600',
    };
    this.classes.push(colors[color]);
    return this;
  }

  weight(weight?: TypographyWeight): this {
    if (weight) {
      const weights: Record<TypographyWeight, string> = {
        regular: 'font-regular',
        medium: 'font-medium',
        semibold: 'font-semibold',
        bold: 'font-bold',
      };
      this.classes.push(weights[weight]);
    }
    return this;
  }
}

/**
 * Default HTML element mapping for variants
 */
const defaultElementMap: Record<TypographyVariant, TypographyElement> = {
  largeTitle: 'h1',
  title1: 'h1',
  title2: 'h2',
  title3: 'h3',
  headline: 'h4',
  callout: 'p',
  body: 'p',
  caption1: 'span',
  caption2: 'span',
};

/**
 * Typography Component
 */
export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  color = 'primary',
  weight,
  as,
  className,
  children,
  'data-testid': dataTestId,
}) => {
  // Build classes using TypographyStyleBuilder
  const classes = new TypographyStyleBuilder()
    .variant(variant)
    .color(color)
    .weight(weight)
    .custom(className)
    .build();

  // Determine HTML element
  const Component = as || defaultElementMap[variant];

  return (
    <Component className={classes} data-testid={dataTestId}>
      {children}
    </Component>
  );
};

/**
 * Convenience Components (Pre-configured Typography)
 */

export const LargeTitle: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="largeTitle" {...props} />
);

export const Title1: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="title1" {...props} />
);

export const Title2: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="title2" {...props} />
);

export const Title3: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="title3" {...props} />
);

export const Headline: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="headline" {...props} />
);

export const Callout: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="callout" {...props} />
);

export const Body: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="body" {...props} />
);

export const Caption1: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="caption1" {...props} />
);

export const Caption2: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="caption2" {...props} />
);

export default Typography;
