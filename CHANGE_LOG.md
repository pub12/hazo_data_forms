# Change Log

All notable changes to the hazo_data_forms project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-08

### Added

#### Core Functionality
- **HazoDataForm Component**: Main form orchestrator with full schema-driven rendering
- **12 Field Types**: text, number, date, boolean, option, email, tel, currency, percentage, textarea, table, computed
- **Dual Mode Rendering**: Edit mode (editable fields) and View mode (read-only display)
- **Schema-Driven Architecture**: Declarative JSON schema for form structure definition
- **Field Registry System**: Extensible field renderer registry pattern with auto-registration
- **Section Hierarchy**: Support for sections, sub-sections, and field groups with horizontal/vertical orientation

#### Document Integration
- **Document Links**: Inline doc_link support for associating fields with PDF documents
- **PDF Panel**: Resizable embedded PDF viewer panel with three position options (right, left, bottom)
- **Doc Link Button**: Icon button component that appears next to fields with document links
- **hazo_pdf Integration**: Optional integration with hazo_pdf package for PDF viewing

#### Configuration System
- **INI Configuration**: Config-driven styling via hazo_data_forms_config.ini file
- **Three-Tier Cascade**: Defaults → INI file → Runtime overrides
- **useFormConfig Hook**: Hook for loading and merging configuration from multiple sources
- **42 Config Options**: Comprehensive configuration covering colors, fonts, spacing, and formatting
- **Runtime Overrides**: config_override prop for component-level customization

#### Form Features
- **Computed Fields**: Automatic calculation based on formula and field dependencies
- **Table Fields**: Dynamic array/table fields with configurable columns and row constraints
- **Form Validation**: Built-in validation (required, min/max, length constraints)
- **Custom Validation**: validate prop for custom validation logic
- **External Errors**: errors prop for server-side validation error injection
- **Collapsible Sections**: Optional section collapsing with collapsed_sections prop
- **Field Groups**: Horizontal and vertical field group orientations

#### State Management
- **react-hook-form Integration**: Form state management via react-hook-form
- **Controlled/Uncontrolled**: Support for both controlled (values) and uncontrolled (default_values) modes
- **Form Methods Access**: on_form_ready callback provides access to react-hook-form methods
- **Change Callbacks**: on_change and on_field_change for value change notifications
- **Submit Handling**: on_submit callback with built-in validation

#### Field Types

##### Text Fields
- **TextField**: Basic text input with min/max length validation
- **EmailField**: Email input with HTML5 validation
- **TelField**: Phone number input
- **TextareaField**: Multi-line text input with configurable rows

##### Numeric Fields
- **NumberField**: Numeric input with min/max constraints and decimal support
- **CurrencyField**: Currency input with symbol, formatting, and thousands separators
- **PercentageField**: Percentage input with suffix and decimal places

##### Selection Fields
- **BooleanField**: Checkbox with required validation support
- **OptionField**: Select dropdown with configurable options

##### Other Fields
- **DateField**: HTML5 date picker with configurable date format for display
- **TableField**: Dynamic table/array field with nested field renderers
- **ComputedField**: Read-only calculated field with formula evaluation

#### Utilities
- **format_currency()**: Currency formatting with symbol and thousands separators
- **format_percentage()**: Percentage formatting with configurable decimal places
- **format_date()**: Date formatting with configurable format string (d, dd, MMM, MMMM, MM, yy, yyyy)
- **evaluate_formula()**: Safe formula evaluation for computed fields (arithmetic only)
- **parse_boolean()**: String to boolean parsing
- **parse_number()**: String to number parsing with fallback
- **parse_string()**: String parsing with default value
- **cn()**: Tailwind CSS class merging utility
- **generate_id()**: Unique ID generation
- **deep_merge()**: Deep object merging for configuration

#### TypeScript Support
- **Full Type Definitions**: Complete TypeScript type definitions for all interfaces
- **Exported Types**: 20+ exported types for schema, configuration, and runtime use
- **Type Safety**: Strict typing for field types, form values, and configuration options
- **Interface Extensions**: Extensible interfaces for custom field types

#### Developer Experience
- **Test Application**: Complete Next.js test app with 5 test cases
- **Documentation**: Comprehensive documentation (README, CLAUDE, TECHDOC, CHANGE_LOG)
- **Code Examples**: Copy-paste ready examples for common use cases
- **Extension Guide**: Guide for adding custom field types and validation

#### Build & Distribution
- **tsup Build System**: Modern build system with ESM and CJS output
- **Dual Format**: ESM and CommonJS support
- **CSS Bundle**: Bundled Tailwind CSS styles
- **Type Declarations**: Generated TypeScript declaration files (.d.ts)
- **Package Exports**: Modern package.json exports configuration

#### Testing
- **Basic Fields Test**: Test page for all 12 field types
- **Nested Sections Test**: Test page for section hierarchy
- **Tables & Worksheets Test**: Test page for table fields with computed columns
- **Document Links Test**: Test page for PDF integration
- **Edit vs View Test**: Test page for mode switching

### Configuration Options

#### Colors (14 options)
- label_color
- label_color_required
- field_border_color
- field_border_color_focus
- field_background_color
- field_background_color_disabled
- section_header_color
- section_header_background
- sub_section_header_color
- error_color
- doc_link_icon_color
- doc_link_hover_color
- view_mode_background
- view_mode_border

#### Fonts (7 options)
- label_font_family
- label_font_size
- label_font_weight
- field_font_family
- field_font_size
- section_header_font_size
- sub_section_header_font_size

#### Spacing (6 options)
- section_spacing
- sub_section_spacing
- field_spacing
- field_gap_horizontal
- field_gap_vertical
- label_field_gap

#### Formatting (4 options)
- default_currency_symbol
- date_format
- default_decimal_places
- percentage_suffix

#### PDF Panel (3 options)
- pdf_panel_width
- pdf_panel_min_width
- pdf_panel_max_width

#### Doc Link (1 option)
- doc_link_icon_size

### Technical Details

#### Dependencies
- **Core**: clsx, tailwind-merge
- **Peer**: react, react-dom, react-hook-form, hazo_config, lucide-react
- **Optional Peer**: hazo_pdf (for PDF viewer functionality)

#### Browser Support
- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions

#### Code Style
- snake_case for functions and variables
- SCREAMING_SNAKE_CASE for constants
- PascalCase for types and interfaces
- cls_ prefix for CSS classes

### Design Principles
- Schema-first design for declarative form definition
- Zero config by default, configurable when needed
- Progressive enhancement with built-in and custom validation
- Separation of concerns (schema, config, component, validation)
- Extensibility without modification via field registry

### Security Features
- **Formula Validation**: Computed field formulas restricted to arithmetic operators only
- **No Code Execution**: INI parser reads strings only, no eval or code execution
- **XSS Protection**: React automatic escaping for text content
- **Input Sanitization**: HTML5 validation for email, tel, and other field types

### Known Limitations
- Computed fields only support numeric operations (no string concatenation)
- Date fields use HTML5 date input (YYYY-MM-DD format internally)
- Table fields may impact performance with 100+ rows (virtualization recommended)
- PDF panel requires hazo_pdf peer dependency for full functionality

### Migration Notes
- This is the initial release (1.0.0)
- No migration required

---

## Release Notes Format

For future releases, use the following categories:

### Added
- New features, components, or capabilities

### Changed
- Changes to existing functionality (backward compatible)

### Deprecated
- Features marked for removal in future versions

### Removed
- Features removed in this version

### Fixed
- Bug fixes

### Security
- Security-related fixes or improvements

---

## Unreleased

### Notes
- Future changes will be documented here before release
- Review this section when preparing new releases
- Move items to versioned section when releasing
