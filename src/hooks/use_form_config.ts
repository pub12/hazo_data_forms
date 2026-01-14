"use client";

import { useState, useEffect, useMemo } from "react";
import type {
  FormConfig,
  PartialFormConfig,
  HierarchicalStyleConfig,
  StyleVariant,
  StylesConfig,
  FieldTypesConfig,
} from "../lib/types";
import {
  DEFAULT_FORM_CONFIG,
  DEFAULT_STYLES_CONFIG,
  DEFAULT_FIELD_TYPES_CONFIG,
} from "../lib/types";
import { parse_number, deep_merge } from "../lib/utils";

/**
 * Load and merge form configuration from INI file, JSON configs, and overrides
 */
export function useFormConfig(
  config_path?: string,
  config_override?: PartialFormConfig
): FormConfig {
  const [loaded_config, set_loaded_config] = useState<PartialFormConfig>({});
  const [styles_config, set_styles_config] = useState<StylesConfig | null>(null);
  const [field_types_config, set_field_types_config] = useState<FieldTypesConfig | null>(null);
  const [is_loading, set_is_loading] = useState(true);

  useEffect(() => {
    async function load_configs() {
      // Load INI config first to get paths
      let ini_config: PartialFormConfig = {};

      if (config_path) {
        try {
          // Try to load config using hazo_config if available
          if (typeof window === "undefined") {
            // Server-side: try to use hazo_config directly
            try {
              // @ts-ignore - hazo_config is a peer dependency
              const { HazoConfig } = await import("hazo_config");
              const config = new HazoConfig({ filePath: config_path });
              ini_config = parse_ini_config(config);
              set_loaded_config(ini_config);
            } catch {
              console.warn(
                "hazo_config not available, using default configuration"
              );
            }
          } else {
            // Client-side: fetch the INI file
            try {
              const response = await fetch(config_path);
              if (response.ok) {
                const text = await response.text();
                ini_config = parse_ini_text(text);
                set_loaded_config(ini_config);
              }
            } catch {
              console.warn(
                `Failed to load config from ${config_path}, using defaults`
              );
            }
          }
        } catch (error) {
          console.warn("Config loading error:", error);
        }
      }

      // Determine paths for JSON configs
      const styles_path = ini_config.styles_path ||
        config_override?.styles_path ||
        DEFAULT_FORM_CONFIG.styles_path ||
        "/config/form_styles.json";

      const field_types_path = ini_config.field_types_path ||
        config_override?.field_types_path ||
        DEFAULT_FORM_CONFIG.field_types_path ||
        "/config/form_field_types.json";

      // Load styles JSON (client-side only)
      if (typeof window !== "undefined") {
        try {
          const styles_response = await fetch(styles_path);
          if (styles_response.ok) {
            const styles = await styles_response.json();
            set_styles_config(styles as StylesConfig);
          } else {
            console.warn(`Failed to load styles from ${styles_path}, using defaults`);
          }
        } catch {
          console.warn(`Failed to load form_styles.json from ${styles_path}, using defaults`);
        }

        // Load field types JSON
        try {
          const field_types_response = await fetch(field_types_path);
          if (field_types_response.ok) {
            const field_types = await field_types_response.json();
            set_field_types_config(field_types as FieldTypesConfig);
          } else {
            console.warn(`Failed to load field types from ${field_types_path}, using defaults`);
          }
        } catch {
          console.warn(`Failed to load form_field_types.json from ${field_types_path}, using defaults`);
        }
      }

      set_is_loading(false);
    }

    load_configs();
  }, [config_path, config_override?.styles_path, config_override?.field_types_path]);

  // Merge configs: defaults < loaded < override
  const merged_config = useMemo(() => {
    let config: FormConfig = { ...DEFAULT_FORM_CONFIG };

    // Merge INI config
    if (Object.keys(loaded_config).length > 0) {
      config = deep_merge(
        config as unknown as Record<string, unknown>,
        loaded_config as Record<string, unknown>
      ) as unknown as FormConfig;
    }

    // Merge overrides
    if (config_override && Object.keys(config_override).length > 0) {
      config = deep_merge(
        config as unknown as Record<string, unknown>,
        config_override as Record<string, unknown>
      ) as unknown as FormConfig;
    }

    // Merge styles config (prefer loaded JSON, fallback to default)
    if (styles_config) {
      config.styles_config = merge_styles_config(DEFAULT_STYLES_CONFIG, styles_config);
    } else {
      config.styles_config = DEFAULT_STYLES_CONFIG;
    }

    // If override has styles_config, merge it too
    if (config_override?.styles_config) {
      config.styles_config = merge_styles_config(
        config.styles_config,
        config_override.styles_config
      );
    }

    // Merge field types config (prefer loaded JSON, fallback to default)
    if (field_types_config) {
      config.field_types_config = merge_field_types_config(
        DEFAULT_FIELD_TYPES_CONFIG,
        field_types_config
      );
    } else {
      config.field_types_config = DEFAULT_FIELD_TYPES_CONFIG;
    }

    // If override has field_types_config, merge it too
    if (config_override?.field_types_config) {
      config.field_types_config = merge_field_types_config(
        config.field_types_config,
        config_override.field_types_config
      );
    }

    return config;
  }, [loaded_config, config_override, styles_config, field_types_config]);

  return merged_config;
}

/**
 * Merge two StylesConfig objects
 */
function merge_styles_config(
  base: StylesConfig,
  override: StylesConfig
): StylesConfig {
  return {
    meta: { ...base.meta, ...override.meta },
    tokens: {
      colors: { ...base.tokens.colors, ...override.tokens?.colors },
      fonts: { ...base.tokens.fonts, ...override.tokens?.fonts },
      spacing: { ...base.tokens.spacing, ...override.tokens?.spacing },
    },
    styles: { ...base.styles, ...override.styles },
  };
}

/**
 * Merge two FieldTypesConfig objects
 */
function merge_field_types_config(
  base: FieldTypesConfig,
  override: FieldTypesConfig
): FieldTypesConfig {
  return {
    meta: { ...base.meta, ...override.meta },
    field_types: { ...base.field_types, ...override.field_types },
  };
}

/**
 * Parse INI config from HazoConfig instance
 */
function parse_ini_config(config: {
  get: (section: string, key: string) => string | undefined;
}): PartialFormConfig {
  const result: PartialFormConfig = {};

  // Paths
  result.styles_path = config.get("paths", "styles_path");
  result.field_types_path = config.get("paths", "field_types_path");

  // Doc link
  result.doc_link_icon_size = config.get("doc_link", "doc_link_icon_size");
  const doc_link_icon_style = config.get("doc_link", "doc_link_icon_style");
  if (doc_link_icon_style === "solid" || doc_link_icon_style === "outline") {
    result.doc_link_icon_style = doc_link_icon_style;
  }
  result.doc_link_column_width = config.get("doc_link", "doc_link_column_width");

  // PDF Panel
  result.pdf_panel_width = config.get("pdf_panel", "pdf_panel_width");
  result.pdf_panel_min_width = config.get("pdf_panel", "pdf_panel_min_width");
  result.pdf_panel_max_width = config.get("pdf_panel", "pdf_panel_max_width");

  // Formatting
  result.default_currency_symbol = config.get("formatting", "default_currency_symbol");
  result.date_format = config.get("formatting", "date_format");
  result.percentage_suffix = config.get("formatting", "percentage_suffix");

  const decimal_places = config.get("formatting", "default_decimal_places");
  if (decimal_places) {
    result.default_decimal_places = parse_number(decimal_places, 2);
  }

  // Feature flags
  const enable_pdf_panel = config.get("features", "enable_pdf_panel");
  if (enable_pdf_panel) {
    result.enable_pdf_panel = enable_pdf_panel === "true";
  }

  const collapsible_sections = config.get("features", "collapsible_sections");
  if (collapsible_sections) {
    result.collapsible_sections = collapsible_sections === "true";
  }

  const validate_on_blur = config.get("features", "validate_on_blur");
  if (validate_on_blur) {
    result.validate_on_blur = validate_on_blur === "true";
  }

  const validate_on_change = config.get("features", "validate_on_change");
  if (validate_on_change) {
    result.validate_on_change = validate_on_change === "true";
  }

  // File manager settings
  const fm_display_mode = config.get("file_manager", "display_mode");
  const fm_icon_size = config.get("file_manager", "icon_size");
  const fm_icon_color = config.get("file_manager", "icon_color");
  const fm_icon_color_hover = config.get("file_manager", "icon_color_hover");
  const fm_icon_color_with_files = config.get("file_manager", "icon_color_with_files");
  const fm_badge_background = config.get("file_manager", "badge_background");
  const fm_badge_text_color = config.get("file_manager", "badge_text_color");
  const fm_dialog_width = config.get("file_manager", "dialog_width");
  const fm_dialog_max_height = config.get("file_manager", "dialog_max_height");
  const fm_button_column_width = config.get("file_manager", "button_column_width");

  if (fm_display_mode || fm_icon_size || fm_icon_color || fm_icon_color_hover ||
      fm_icon_color_with_files || fm_badge_background || fm_badge_text_color ||
      fm_dialog_width || fm_dialog_max_height || fm_button_column_width) {
    result.file_manager = {
      ...DEFAULT_FORM_CONFIG.file_manager,
      ...(fm_display_mode === "sidebar" || fm_display_mode === "dialog" ? { display_mode: fm_display_mode } : {}),
      ...(fm_icon_size ? { icon_size: fm_icon_size } : {}),
      ...(fm_icon_color ? { icon_color: fm_icon_color } : {}),
      ...(fm_icon_color_hover ? { icon_color_hover: fm_icon_color_hover } : {}),
      ...(fm_icon_color_with_files ? { icon_color_with_files: fm_icon_color_with_files } : {}),
      ...(fm_badge_background ? { badge_background: fm_badge_background } : {}),
      ...(fm_badge_text_color ? { badge_text_color: fm_badge_text_color } : {}),
      ...(fm_dialog_width ? { dialog_width: fm_dialog_width } : {}),
      ...(fm_dialog_max_height ? { dialog_max_height: fm_dialog_max_height } : {}),
      ...(fm_button_column_width ? { button_column_width: fm_button_column_width } : {}),
    };
  }

  // Legacy support: Colors (deprecated - for backward compatibility)
  result.label_color = config.get("colors", "label_color");
  result.label_color_required = config.get("colors", "label_color_required");
  result.field_border_color = config.get("colors", "field_border_color");
  result.field_border_color_focus = config.get("colors", "field_border_color_focus");
  result.field_background_color = config.get("colors", "field_background_color");
  result.field_background_color_disabled = config.get("colors", "field_background_color_disabled");
  result.section_header_color = config.get("colors", "section_header_color");
  result.section_header_background = config.get("colors", "section_header_background");
  result.sub_section_header_color = config.get("colors", "sub_section_header_color");
  result.error_color = config.get("colors", "error_color");
  result.doc_link_icon_color = config.get("colors", "doc_link_icon_color");
  result.doc_link_hover_color = config.get("colors", "doc_link_hover_color");
  result.view_mode_background = config.get("colors", "view_mode_background");
  result.view_mode_border = config.get("colors", "view_mode_border");

  // Legacy support: Fonts (deprecated)
  result.label_font_family = config.get("fonts", "label_font_family");
  result.label_font_size = config.get("fonts", "label_font_size");
  result.label_font_weight = config.get("fonts", "label_font_weight");
  result.field_font_family = config.get("fonts", "field_font_family");
  result.field_font_size = config.get("fonts", "field_font_size");
  result.section_header_font_size = config.get("fonts", "section_header_font_size");
  result.sub_section_header_font_size = config.get("fonts", "sub_section_header_font_size");

  // Legacy support: Spacing (deprecated)
  result.section_spacing = config.get("spacing", "section_spacing");
  result.sub_section_spacing = config.get("spacing", "sub_section_spacing");
  result.field_spacing = config.get("spacing", "field_spacing");
  result.field_gap_horizontal = config.get("spacing", "field_gap_horizontal");
  result.field_gap_vertical = config.get("spacing", "field_gap_vertical");
  result.label_field_gap = config.get("spacing", "label_field_gap");

  // Legacy support: Item code styling (deprecated)
  result.item_code_border_color = config.get("item_code", "item_code_border_color");
  result.item_code_background = config.get("item_code", "item_code_background");
  result.item_code_font_size = config.get("item_code", "item_code_font_size");

  // Legacy support: Worksheet styling (deprecated)
  result.worksheet_indent = config.get("worksheet", "worksheet_indent");
  result.worksheet_label_font_weight = config.get("worksheet", "worksheet_label_font_weight");

  // Legacy support: Highlight row styling (deprecated)
  result.highlight_row_background = config.get("highlight_row", "highlight_row_background");

  // Legacy support: Badge styling (deprecated)
  result.badge_background = config.get("badge", "badge_background");
  result.badge_text_color = config.get("badge", "badge_text_color");

  // Legacy support: Hierarchical styles (deprecated)
  const style_variants: StyleVariant[] = [
    "header_h1", "header_h2", "header_h3", "header_h4", "header_h5", "header_h6",
    "total_h1", "total_h2", "total_h3", "total_h4", "total_h5", "total_h6",
  ];

  const parsed_styles: Partial<HierarchicalStyleConfig> = {};
  let has_any_style = false;

  for (const variant of style_variants) {
    const font_size = config.get(variant, "font_size");
    const font_weight = config.get(variant, "font_weight");
    const font_color = config.get(variant, "font_color");
    const background_color = config.get(variant, "background_color");
    const indent = config.get(variant, "indent");

    if (font_size || font_weight || font_color || background_color || indent) {
      has_any_style = true;
      parsed_styles[variant] = {
        font_size: font_size || DEFAULT_FORM_CONFIG.styles[variant].font_size,
        font_weight: font_weight || DEFAULT_FORM_CONFIG.styles[variant].font_weight,
        font_color: font_color || DEFAULT_FORM_CONFIG.styles[variant].font_color,
        background_color: background_color || DEFAULT_FORM_CONFIG.styles[variant].background_color,
        indent: indent || DEFAULT_FORM_CONFIG.styles[variant].indent,
      };
    }
  }

  if (has_any_style) {
    result.styles = {
      ...DEFAULT_FORM_CONFIG.styles,
      ...parsed_styles,
    } as HierarchicalStyleConfig;
  }

  // Remove undefined values
  return Object.fromEntries(
    Object.entries(result).filter(([, v]) => v !== undefined)
  ) as PartialFormConfig;
}

/**
 * Parse INI text content
 */
function parse_ini_text(text: string): PartialFormConfig {
  const result: Record<string, Record<string, string>> = {};
  let current_section = "";

  const lines = text.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();

    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith(";") || trimmed.startsWith("#")) {
      continue;
    }

    // Section header
    const section_match = trimmed.match(/^\[([^\]]+)\]$/);
    if (section_match) {
      current_section = section_match[1];
      if (!result[current_section]) {
        result[current_section] = {};
      }
      continue;
    }

    // Key-value pair
    const kv_match = trimmed.match(/^([^=]+)=(.*)$/);
    if (kv_match && current_section) {
      const key = kv_match[1].trim();
      const value = kv_match[2].trim();
      result[current_section][key] = value;
    }
  }

  // Convert to FormConfig structure
  const config: PartialFormConfig = {};

  // Paths (new)
  if (result.paths) {
    config.styles_path = result.paths.styles_path;
    config.field_types_path = result.paths.field_types_path;
  }

  // Doc link
  if (result.doc_link) {
    config.doc_link_icon_size = result.doc_link.doc_link_icon_size;
    const doc_link_icon_style = result.doc_link.doc_link_icon_style;
    if (doc_link_icon_style === "solid" || doc_link_icon_style === "outline") {
      config.doc_link_icon_style = doc_link_icon_style;
    }
    config.doc_link_column_width = result.doc_link.doc_link_column_width;
  }

  // PDF Panel
  if (result.pdf_panel) {
    config.pdf_panel_width = result.pdf_panel.pdf_panel_width;
    config.pdf_panel_min_width = result.pdf_panel.pdf_panel_min_width;
    config.pdf_panel_max_width = result.pdf_panel.pdf_panel_max_width;
  }

  // Formatting
  if (result.formatting) {
    config.default_currency_symbol = result.formatting.default_currency_symbol;
    config.date_format = result.formatting.date_format;
    config.percentage_suffix = result.formatting.percentage_suffix;
    if (result.formatting.default_decimal_places) {
      config.default_decimal_places = parse_number(
        result.formatting.default_decimal_places,
        2
      );
    }
  }

  // Feature flags (new)
  if (result.features) {
    if (result.features.enable_pdf_panel) {
      config.enable_pdf_panel = result.features.enable_pdf_panel === "true";
    }
    if (result.features.collapsible_sections) {
      config.collapsible_sections = result.features.collapsible_sections === "true";
    }
    if (result.features.validate_on_blur) {
      config.validate_on_blur = result.features.validate_on_blur === "true";
    }
    if (result.features.validate_on_change) {
      config.validate_on_change = result.features.validate_on_change === "true";
    }
  }

  // File manager settings
  if (result.file_manager) {
    const fm = result.file_manager;
    config.file_manager = {
      ...DEFAULT_FORM_CONFIG.file_manager,
      ...(fm.display_mode === "sidebar" || fm.display_mode === "dialog" ? { display_mode: fm.display_mode } : {}),
      ...(fm.icon_size ? { icon_size: fm.icon_size } : {}),
      ...(fm.icon_color ? { icon_color: fm.icon_color } : {}),
      ...(fm.icon_color_hover ? { icon_color_hover: fm.icon_color_hover } : {}),
      ...(fm.icon_color_with_files ? { icon_color_with_files: fm.icon_color_with_files } : {}),
      ...(fm.badge_background ? { badge_background: fm.badge_background } : {}),
      ...(fm.badge_text_color ? { badge_text_color: fm.badge_text_color } : {}),
      ...(fm.dialog_width ? { dialog_width: fm.dialog_width } : {}),
      ...(fm.dialog_max_height ? { dialog_max_height: fm.dialog_max_height } : {}),
      ...(fm.button_column_width ? { button_column_width: fm.button_column_width } : {}),
    };
  }

  // Legacy support: Colors (deprecated)
  if (result.colors) {
    config.label_color = result.colors.label_color;
    config.label_color_required = result.colors.label_color_required;
    config.field_border_color = result.colors.field_border_color;
    config.field_border_color_focus = result.colors.field_border_color_focus;
    config.field_background_color = result.colors.field_background_color;
    config.field_background_color_disabled = result.colors.field_background_color_disabled;
    config.section_header_color = result.colors.section_header_color;
    config.section_header_background = result.colors.section_header_background;
    config.sub_section_header_color = result.colors.sub_section_header_color;
    config.error_color = result.colors.error_color;
    config.doc_link_icon_color = result.colors.doc_link_icon_color;
    config.doc_link_hover_color = result.colors.doc_link_hover_color;
    config.view_mode_background = result.colors.view_mode_background;
    config.view_mode_border = result.colors.view_mode_border;
  }

  // Legacy support: Fonts (deprecated)
  if (result.fonts) {
    config.label_font_family = result.fonts.label_font_family;
    config.label_font_size = result.fonts.label_font_size;
    config.label_font_weight = result.fonts.label_font_weight;
    config.field_font_family = result.fonts.field_font_family;
    config.field_font_size = result.fonts.field_font_size;
    config.section_header_font_size = result.fonts.section_header_font_size;
    config.sub_section_header_font_size = result.fonts.sub_section_header_font_size;
  }

  // Legacy support: Spacing (deprecated)
  if (result.spacing) {
    config.section_spacing = result.spacing.section_spacing;
    config.sub_section_spacing = result.spacing.sub_section_spacing;
    config.field_spacing = result.spacing.field_spacing;
    config.field_gap_horizontal = result.spacing.field_gap_horizontal;
    config.field_gap_vertical = result.spacing.field_gap_vertical;
    config.label_field_gap = result.spacing.label_field_gap;
  }

  // Legacy support: Item code styling (deprecated)
  if (result.item_code) {
    config.item_code_border_color = result.item_code.item_code_border_color;
    config.item_code_background = result.item_code.item_code_background;
    config.item_code_font_size = result.item_code.item_code_font_size;
  }

  // Legacy support: Worksheet styling (deprecated)
  if (result.worksheet) {
    config.worksheet_indent = result.worksheet.worksheet_indent;
    config.worksheet_label_font_weight = result.worksheet.worksheet_label_font_weight;
  }

  // Legacy support: Highlight row styling (deprecated)
  if (result.highlight_row) {
    config.highlight_row_background = result.highlight_row.highlight_row_background;
  }

  // Legacy support: Badge styling (deprecated)
  if (result.badge) {
    config.badge_background = result.badge.badge_background;
    config.badge_text_color = result.badge.badge_text_color;
  }

  // Legacy support: Hierarchical styles (deprecated)
  const style_variants: StyleVariant[] = [
    "header_h1", "header_h2", "header_h3", "header_h4", "header_h5", "header_h6",
    "total_h1", "total_h2", "total_h3", "total_h4", "total_h5", "total_h6",
  ];

  const parsed_styles: Partial<HierarchicalStyleConfig> = {};
  let has_any_style = false;

  for (const variant of style_variants) {
    if (result[variant]) {
      has_any_style = true;
      parsed_styles[variant] = {
        font_size: result[variant].font_size || DEFAULT_FORM_CONFIG.styles[variant].font_size,
        font_weight: result[variant].font_weight || DEFAULT_FORM_CONFIG.styles[variant].font_weight,
        font_color: result[variant].font_color || DEFAULT_FORM_CONFIG.styles[variant].font_color,
        background_color: result[variant].background_color || DEFAULT_FORM_CONFIG.styles[variant].background_color,
        indent: result[variant].indent || DEFAULT_FORM_CONFIG.styles[variant].indent,
      };
    }
  }

  // Only set styles if we found any style sections in the INI file
  if (has_any_style) {
    config.styles = {
      ...DEFAULT_FORM_CONFIG.styles,
      ...parsed_styles,
    } as HierarchicalStyleConfig;
  }

  // Remove undefined values
  return Object.fromEntries(
    Object.entries(config).filter(([, v]) => v !== undefined)
  ) as PartialFormConfig;
}

/**
 * Get a single config value with type safety
 */
export function useConfigValue<K extends keyof FormConfig>(
  config: FormConfig,
  key: K
): FormConfig[K] {
  return config[key];
}
