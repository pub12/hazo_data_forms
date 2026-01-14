/**
 * Style resolver for the new form_styles.json configuration system
 * Handles token substitution, inheritance resolution, and CSS conversion
 */

import type {
  StylesConfig,
  StyleClassDefinition,
  StyleTokens,
  ResolvedStyle,
} from "./types";

/**
 * Resolve token references in a value
 * e.g., "{colors.primary}" -> "#1e3a5f"
 * e.g., "{spacing.md}" -> "12px"
 */
export function resolve_tokens(
  value: string | undefined,
  tokens: StyleTokens
): string | undefined {
  if (!value || typeof value !== "string") return value;

  return value.replace(/\{(\w+)\.(\w+)\}/g, (match, category, key) => {
    const token_category = tokens[category as keyof StyleTokens];
    if (token_category && typeof token_category === "object" && key in token_category) {
      return token_category[key];
    }
    console.warn(`Unknown token: ${match}`);
    return match;
  });
}

/**
 * Resolve a style class with inheritance chain and token substitution
 * Uses memoization via the cache parameter for performance
 */
export function resolve_style_class(
  class_name: string,
  styles_config: StylesConfig,
  cache: Map<string, ResolvedStyle> = new Map()
): ResolvedStyle {
  // Check cache first
  if (cache.has(class_name)) {
    return cache.get(class_name)!;
  }

  const style_def = styles_config.styles[class_name];
  if (!style_def) {
    console.warn(`Unknown style class: ${class_name}`);
    return {};
  }

  // Resolve parent first if extends is specified
  let base_style: ResolvedStyle = {};
  if (style_def.extends) {
    base_style = resolve_style_class(style_def.extends, styles_config, cache);
  }

  // Merge with current definition
  const merged: ResolvedStyle = { ...base_style };
  const tokens = styles_config.tokens;

  // Apply each property with token resolution
  for (const [key, value] of Object.entries(style_def)) {
    if (key === "extends") continue;

    if (typeof value === "string") {
      (merged as Record<string, unknown>)[key] = resolve_tokens(value, tokens);
    } else {
      (merged as Record<string, unknown>)[key] = value;
    }
  }

  // Cache result
  cache.set(class_name, merged);

  return merged;
}

/**
 * Convert ResolvedStyle to React inline style object
 */
export function to_inline_style(resolved: ResolvedStyle): React.CSSProperties {
  const style: React.CSSProperties = {};

  // Color properties
  if (resolved.color) style.color = resolved.color;
  if (resolved.background_color) style.backgroundColor = resolved.background_color;
  if (resolved.border_color) style.borderColor = resolved.border_color;

  // Border properties
  if (resolved.border_width) style.borderWidth = resolved.border_width;
  if (resolved.border_radius) style.borderRadius = resolved.border_radius;

  // Font properties
  if (resolved.font_family) style.fontFamily = resolved.font_family;
  if (resolved.font_size) style.fontSize = resolved.font_size;
  if (resolved.font_weight) style.fontWeight = resolved.font_weight;
  if (resolved.line_height) style.lineHeight = resolved.line_height;
  if (resolved.letter_spacing) style.letterSpacing = resolved.letter_spacing;

  // Layout properties
  if (resolved.text_align) style.textAlign = resolved.text_align as React.CSSProperties["textAlign"];
  if (resolved.min_width) style.minWidth = resolved.min_width;
  if (resolved.min_height) style.minHeight = resolved.min_height;
  if (resolved.opacity !== undefined) style.opacity = resolved.opacity;

  // Handle padding
  if (resolved.padding) {
    style.padding = resolved.padding;
  } else if (resolved.padding_x || resolved.padding_y) {
    if (resolved.padding_x) {
      style.paddingLeft = resolved.padding_x;
      style.paddingRight = resolved.padding_x;
    }
    if (resolved.padding_y) {
      style.paddingTop = resolved.padding_y;
      style.paddingBottom = resolved.padding_y;
    }
  }

  // Handle margin
  if (resolved.margin) {
    style.margin = resolved.margin;
  }
  if (resolved.margin_left) {
    style.marginLeft = resolved.margin_left;
  }
  if (resolved.margin_top) {
    style.marginTop = resolved.margin_top;
  }

  // Handle indent (typically used as marginLeft)
  if (resolved.indent && !resolved.margin_left) {
    style.marginLeft = resolved.indent;
  }

  return style;
}

/**
 * Get a specific style property value from a resolved style
 */
export function get_style_value<K extends keyof ResolvedStyle>(
  resolved: ResolvedStyle,
  property: K
): ResolvedStyle[K] {
  return resolved[property];
}

/**
 * Create a memoized style resolver for a given styles configuration
 * This is useful when you need to resolve multiple styles with the same config
 */
export function create_style_resolver(styles_config: StylesConfig) {
  const cache = new Map<string, ResolvedStyle>();

  return {
    /**
     * Resolve a style class by name, returns ResolvedStyle
     */
    resolve: (class_name: string): ResolvedStyle =>
      resolve_style_class(class_name, styles_config, cache),

    /**
     * Resolve a style class and convert to React inline style
     */
    to_style: (class_name: string): React.CSSProperties =>
      to_inline_style(resolve_style_class(class_name, styles_config, cache)),

    /**
     * Get a specific property value from a style class
     */
    get_value: <K extends keyof ResolvedStyle>(
      class_name: string,
      property: K
    ): ResolvedStyle[K] => {
      const resolved = resolve_style_class(class_name, styles_config, cache);
      return resolved[property];
    },

    /**
     * Resolve multiple style classes and merge them (later classes override earlier)
     */
    merge: (...class_names: string[]): ResolvedStyle => {
      const merged: ResolvedStyle = {};
      for (const class_name of class_names) {
        const resolved = resolve_style_class(class_name, styles_config, cache);
        Object.assign(merged, resolved);
      }
      return merged;
    },

    /**
     * Resolve multiple style classes and convert to React inline style
     */
    merge_to_style: (...class_names: string[]): React.CSSProperties => {
      const merged: ResolvedStyle = {};
      for (const class_name of class_names) {
        const resolved = resolve_style_class(class_name, styles_config, cache);
        Object.assign(merged, resolved);
      }
      return to_inline_style(merged);
    },

    /**
     * Clear the resolution cache (useful if styles config changes)
     */
    clear_cache: () => cache.clear(),

    /**
     * Check if a style class exists in the configuration
     */
    has_style: (class_name: string): boolean =>
      class_name in styles_config.styles,

    /**
     * Get all available style class names
     */
    get_style_names: (): string[] => Object.keys(styles_config.styles),

    /**
     * Get the raw tokens from the config
     */
    get_tokens: (): StyleTokens => styles_config.tokens,

    /**
     * Resolve a single token value
     */
    resolve_token: (token_path: string): string | undefined => {
      const match = token_path.match(/^\{(\w+)\.(\w+)\}$/);
      if (!match) return token_path;

      const [, category, key] = match;
      const token_category = styles_config.tokens[category as keyof StyleTokens];
      if (token_category && typeof token_category === "object" && key in token_category) {
        return token_category[key];
      }
      return undefined;
    },
  };
}

/**
 * Type for the style resolver returned by create_style_resolver
 */
export type StyleResolver = ReturnType<typeof create_style_resolver>;

/**
 * Helper to merge ResolvedStyle with inline style overrides
 */
export function merge_with_overrides(
  resolved: ResolvedStyle,
  overrides: React.CSSProperties
): React.CSSProperties {
  return {
    ...to_inline_style(resolved),
    ...overrides,
  };
}

/**
 * Get legacy StyleLevelConfig from new StylesConfig
 * For backward compatibility with existing code
 */
export function get_legacy_style_level(
  style_variant: string,
  styles_config: StylesConfig,
  cache?: Map<string, ResolvedStyle>
): { font_size: string; font_weight: string; font_color: string; background_color: string; indent: string } {
  const resolved = resolve_style_class(style_variant, styles_config, cache || new Map());

  return {
    font_size: resolved.font_size || "14px",
    font_weight: resolved.font_weight || "400",
    font_color: resolved.color || "#000000",
    background_color: resolved.background_color || "transparent",
    indent: resolved.indent || resolved.margin_left || "0px",
  };
}
