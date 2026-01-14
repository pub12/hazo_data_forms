# TECHDOC.md - Technical Design Documentation

## Overview

**hazo_data_forms** is a declarative form rendering system that transforms JSON schema definitions into fully functional React forms. This document provides comprehensive technical details for developers who need to understand, maintain, or extend the library.

## Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Application Layer                       │
│  (Consumer code using HazoDataForm component)                   │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                     HazoDataForm Component                       │
│  • Form state management (react-hook-form)                       │
│  • Config loading and merging                                    │
│  • Computed field orchestration                                  │
│  • PDF panel state management                                    │
│  • Event delegation                                              │
└────┬──────────────────────────────────────┬─────────────────────┘
     │                                       │
     ▼                                       ▼
┌────────────────┐                  ┌──────────────────┐
│ Form Rendering │                  │  PDF Panel       │
│   Pipeline     │                  │  (hazo_pdf)      │
└────┬───────────┘                  └──────────────────┘
     │
     ├──► SectionRenderer ──► SubSectionRenderer ──► FieldRenderer
     │
     └──► FieldRegistry (get_field_renderer)
               │
               ├──► TextField
               ├──► NumberField
               ├──► DateField
               ├──► BooleanField
               ├──► OptionField
               ├──► EmailField
               ├──► TelField
               ├──► CurrencyField
               ├──► PercentageField
               ├──► TextareaField
               ├──► TableField
               └──► ComputedField
```

### Data Flow Architecture

```
User Input
    │
    ▼
┌──────────────────────┐
│  Field Renderer      │
│  (on_change handler) │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ react-hook-form      │
│ (setValue)           │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐       ┌─────────────────────┐
│ Form Watch           │──────►│ Computed Field      │
│ (subscription)       │       │ Evaluation          │
└──────────┬───────────┘       └──────────┬──────────┘
           │                              │
           ├──────────────────────────────┘
           │
           ▼
┌──────────────────────┐
│ Callbacks            │
│ • on_change          │
│ • on_field_change    │
└──────────────────────┘
```

## File Structure

```
hazo_data_forms/
├── config/
│   └── hazo_data_forms_config.ini          # Default INI configuration
│
├── src/
│   ├── components/
│   │   ├── hazo_data_form/
│   │   │   ├── index.tsx                   # Main form orchestrator
│   │   │   └── types.ts                    # Component prop types
│   │   │
│   │   ├── field_renderers/
│   │   │   ├── index.tsx                   # Auto-registration module
│   │   │   ├── text_field.tsx              # Text input (includes email, tel)
│   │   │   ├── number_field.tsx            # Numeric input
│   │   │   ├── date_field.tsx              # HTML5 date picker
│   │   │   ├── boolean_field.tsx           # Checkbox
│   │   │   ├── option_field.tsx            # Select dropdown
│   │   │   ├── email_field.tsx             # Email input with validation
│   │   │   ├── tel_field.tsx               # Phone number input
│   │   │   ├── currency_field.tsx          # Currency with symbol and formatting
│   │   │   ├── percentage_field.tsx        # Percentage with suffix
│   │   │   ├── textarea_field.tsx          # Multi-line text
│   │   │   ├── table_field.tsx             # Dynamic array/table
│   │   │   └── computed_field.tsx          # Read-only calculated field
│   │   │
│   │   ├── section_renderer/
│   │   │   ├── index.tsx                   # Section container with collapse
│   │   │   └── sub_section_renderer.tsx    # Sub-section grouping
│   │   │
│   │   ├── pdf_panel/
│   │   │   ├── index.tsx                   # PDF viewer panel (resizable)
│   │   │   └── doc_link_button.tsx         # Document link icon button
│   │   │
│   │   └── ui/                             # shadcn/ui components (vendored)
│   │       ├── button.tsx
│   │       ├── checkbox.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── select.tsx
│   │       ├── textarea.tsx
│   │       └── tooltip.tsx
│   │
│   ├── hooks/
│   │   └── use_form_config.ts              # INI config loading hook
│   │
│   ├── lib/
│   │   ├── types.ts                        # Core TypeScript definitions
│   │   ├── utils.ts                        # Utility functions
│   │   └── field_registry.ts               # Field renderer registry
│   │
│   └── index.ts                            # Public API exports
│
├── test-app/                               # Next.js test application
│   ├── app/
│   │   ├── layout.tsx                      # Root layout with sidebar
│   │   ├── page.tsx                        # Landing page
│   │   ├── basic-fields/                   # Test: All field types
│   │   ├── nested-sections/                # Test: Section hierarchy
│   │   ├── tables-worksheets/              # Test: Table fields
│   │   ├── document-links/                 # Test: PDF integration
│   │   └── edit-vs-view/                   # Test: Mode switching
│   │
│   └── components/
│       └── sidebar.tsx                     # Navigation sidebar
│
├── package.json                            # Package metadata
├── tsconfig.json                           # TypeScript configuration
├── tsup.config.ts                          # Build configuration
└── tailwind.config.ts                      # Tailwind CSS configuration
```

## Core Components

### 1. HazoDataForm (Main Orchestrator)

**Location**: `/src/components/hazo_data_form/index.tsx`

**Responsibilities**:
- Form state management via react-hook-form
- Configuration loading and merging (INI file + overrides)
- Schema parsing and validation
- Computed field orchestration
- PDF panel state management
- Event handling and delegation

**Key Logic**:

```typescript
// Config cascade: defaults < INI file < prop overrides
const config = useFormConfig(config_path, config_override);

// Extract default values from schema
const schema_defaults = useMemo(() => {
  // Parse schema and extract field.value properties
}, [schema]);

// Initialize react-hook-form
const form_methods = useForm<FormValues>({
  defaultValues: { ...schema_defaults, ...default_values },
  values: values, // Controlled mode
  mode: validate_on_change ? "onChange" : validate_on_blur ? "onBlur" : "onSubmit"
});

// Watch for changes and update computed fields
useEffect(() => {
  const subscription = form_methods.watch((values, { name }) => {
    on_change?.(values);
    on_field_change?.(name, values[name]);
    update_computed_fields(values);
  });
  return () => subscription.unsubscribe();
}, [form_methods, on_change, on_field_change]);
```

**Props Interface**: See `/src/components/hazo_data_form/types.ts` (HazoDataFormProps)

### 2. Field Registry System

**Location**: `/src/lib/field_registry.ts`

**Pattern**: Self-registering field renderers

**Design**:
- Global registry (Map) stores field type → component mappings
- Field renderers auto-register on module import
- Extensible: consumers can register custom field types

**API**:

```typescript
// Register a field renderer
register_field_renderer(type: string, renderer: FieldRenderer): void

// Retrieve a field renderer
get_field_renderer(type: string): FieldRenderer | undefined

// Check if registered
has_field_renderer(type: string): boolean

// Get all registered types
get_registered_field_types(): string[]

// Unregister
unregister_field_renderer(type: string): boolean
```

**Field Renderer Interface**:

```typescript
interface FieldRendererProps {
  field: FormField;
  mode: FormMode;
  value: unknown;
  error?: string;
  config: FormConfig;
  on_change: (value: unknown) => void;
  on_blur?: () => void;
  on_doc_link_click?: () => void;
}

type FieldRenderer = React.ComponentType<FieldRendererProps>;
```

**Auto-Registration Pattern**:

```typescript
// In each field renderer file (e.g., text_field.tsx)
export function TextField(props: FieldRendererProps) {
  // Implementation
}

// Register on module load
register_field_renderer("text", TextField);

// In index.tsx, import all renderers to trigger registration
import "./text_field";
import "./number_field";
// ... etc
```

### 3. Configuration System

**Location**: `/src/hooks/use_form_config.ts`

**Three-Tier Cascade**:

1. **Hardcoded Defaults** (`DEFAULT_FORM_CONFIG` in `/src/lib/types.ts`)
2. **INI File** (loaded via hazo_config or fetch)
3. **Prop Overrides** (passed to component)

**Loading Strategy**:

- **Server-side**: Use hazo_config package to read INI file
- **Client-side**: Fetch INI file as text and parse manually
- **Fallback**: Use defaults if loading fails

**INI Format**:

```ini
[colors]
label_color = #374151
field_border_color = #d1d5db

[fonts]
label_font_size = 14px
field_font_family = system-ui, -apple-system, sans-serif

[spacing]
section_spacing = 32px
field_spacing = 16px

[formatting]
default_currency_symbol = $
date_format = MMM d, yyyy
default_decimal_places = 2

[pdf_panel]
pdf_panel_width = 400px
pdf_panel_min_width = 300px
pdf_panel_max_width = 800px

[doc_link]
doc_link_icon_size = 16px
```

**Merging Logic**:

```typescript
// Deep merge with priority: source overrides target
function deep_merge<T>(target: T, source: Partial<T>): T {
  // Recursively merge nested objects
  // Arrays are replaced, not merged
  // Undefined source values are ignored
}

// Usage
const final_config = deep_merge(
  deep_merge(DEFAULT_FORM_CONFIG, loaded_ini_config),
  prop_overrides
);
```

### 4. Section and Sub-Section Renderers

**SectionRenderer** (`/src/components/section_renderer/index.tsx`):
- Renders section header (optional)
- Implements collapsible sections with state management
- Maps sub-sections to SubSectionRenderer

**SubSectionRenderer** (`/src/components/section_renderer/sub_section_renderer.tsx`):
- Renders sub-section header (optional)
- Handles field group orientation (horizontal/vertical)
- Maps fields to FieldRenderer via registry

**Layout**:

```typescript
// Horizontal orientation
<div className="grid grid-cols-2 gap-4">
  {fields.map(field => <FieldRenderer />)}
</div>

// Vertical orientation
<div className="flex flex-col space-y-4">
  {fields.map(field => <FieldRenderer />)}
</div>
```

### 5. Field Renderers

All field renderers follow a consistent pattern:

**Common Structure**:

```typescript
export function FieldTypeRenderer({
  field,
  mode,
  value,
  error,
  config,
  on_change,
  on_blur,
  on_doc_link_click
}: FieldRendererProps) {
  // 1. Parse field_info for field-specific config
  const { required, placeholder, disabled } = field.field_info;

  // 2. Handle mode (edit vs view)
  if (mode === "view") {
    return <ReadOnlyDisplay />;
  }

  // 3. Render editable field
  return (
    <div className="cls_field_wrapper">
      <Label>
        {field.label}
        {required && <span className="text-red-600">*</span>}
        {field.doc_link && (
          <DocLinkButton onClick={on_doc_link_click} />
        )}
      </Label>
      <Input
        value={value}
        onChange={on_change}
        onBlur={on_blur}
        disabled={disabled}
        // Apply config styles
        style={{
          borderColor: config.field_border_color,
          backgroundColor: config.field_background_color
        }}
      />
      {error && <span className="text-red-600">{error}</span>}
    </div>
  );
}
```

**Special Field Types**:

**TableField** (`/src/components/field_renderers/table_field.tsx`):
- Manages array of row objects
- Each column has its own FieldInfo
- Supports add/remove rows with min/max constraints
- Nested FieldRenderer instances for each cell

**ComputedField** (`/src/components/field_renderers/computed_field.tsx`):
- Read-only (even in edit mode)
- Formula evaluated in HazoDataForm component
- Updates automatically when dependencies change
- Uses `evaluate_formula()` utility

### 6. PDF Panel

**Location**: `/src/components/pdf_panel/index.tsx`

**Features**:
- Resizable panel (via CSS resize or custom logic)
- Three positions: right, left, bottom
- Integrates with hazo_pdf package
- Close button
- Fixed positioning within form container

**DocLinkButton** (`/src/components/pdf_panel/doc_link_button.tsx`):
- Small icon button next to field label
- File icon from lucide-react
- Tooltip showing document name
- Click triggers PDF panel open with document

## Type System

### Core Types

**FormSchema** (hierarchical):

```typescript
type FormSchema = FormSection[];

interface FormSection {
  section_name: string;           // Display name
  sub_sections: SubSection[];
}

interface SubSection {
  sub_section_id: string;         // Unique ID
  sub_section_label: string;      // Display name
  field_group: FieldGroup;
}

interface FieldGroup {
  orientation: "horizontal" | "vertical";
  fields: FormField[];
}

interface FormField {
  id: string;                     // Unique field ID (used as form key)
  label: string;                  // Display label
  field_info: FieldInfo;          // Field configuration
  value?: unknown;                // Default value
  doc_link?: DocLink;             // Optional PDF link
}
```

**FieldInfo** (field configuration):

```typescript
interface FieldInfo {
  field_type: FieldType;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;

  // Option fields
  options?: OptionItem[];

  // Numeric constraints
  min?: number;
  max?: number;
  decimal_places?: number;

  // Currency
  currency_symbol?: string;

  // Text constraints
  min_length?: number;
  max_length?: number;

  // Textarea
  rows?: number;

  // Computed fields
  computed_formula?: string;
  computed_dependencies?: string[];

  // Table fields
  table_columns?: TableColumn[];
  table_min_rows?: number;
  table_max_rows?: number;
}
```

**DocLink**:

```typescript
interface DocLink {
  type: "pdf";                    // Currently only PDF supported
  url: string;                    // PDF URL (relative or absolute)
  page?: number;                  // Optional starting page
}
```

**FormValues**:

```typescript
// Flat key-value map
type FormValues = Record<string, unknown>;

// Example:
{
  first_name: "John",
  age: 30,
  agree_terms: true,
  line_items: [
    { description: "Item 1", quantity: 2, price: 10.00 },
    { description: "Item 2", quantity: 1, price: 25.50 }
  ]
}
```

## Key Algorithms

### 1. Computed Field Evaluation

**Function**: `evaluate_formula()` in `/src/lib/utils.ts`

**Algorithm**:

```typescript
function evaluate_formula(
  formula: string,
  values: Record<string, unknown>
): number | null {
  // 1. Extract field references (variable names)
  const field_refs = formula.match(/[a-zA-Z_][a-zA-Z0-9_]*/g) || [];

  // 2. Replace each reference with its numeric value
  let expression = formula;
  for (const ref of field_refs) {
    const value = values[ref];
    if (typeof value === "number") {
      expression = expression.replace(new RegExp(`\\b${ref}\\b`, "g"), String(value));
    } else {
      return null; // Non-numeric dependency
    }
  }

  // 3. Validate expression (security: only allow arithmetic)
  if (!/^[\d\s+\-*/().]+$/.test(expression)) {
    return null;
  }

  // 4. Evaluate using Function constructor (safe after validation)
  try {
    const result = new Function(`return (${expression})`)();
    return typeof result === "number" && !isNaN(result) ? result : null;
  } catch {
    return null;
  }
}
```

**Security**:
- Only allows arithmetic operators: `+ - * / ( )`
- No function calls
- No property access
- No array indexing
- Regex validation before evaluation

**Limitations**:
- Only numeric fields can be referenced
- No string concatenation
- No conditional logic
- No Math functions (e.g., Math.sqrt)

### 2. Date Formatting

**Function**: `format_date()` in `/src/lib/utils.ts`

**Supported Tokens**:
- `d` - Day without padding (1-31)
- `dd` - Day with padding (01-31)
- `MMM` - Short month name (Jan, Feb, ...)
- `MMMM` - Full month name (January, February, ...)
- `MM` - Month with padding (01-12)
- `yy` - Two-digit year (24)
- `yyyy` - Four-digit year (2024)

**Algorithm**:

```typescript
function format_date(value: string | Date, format: string): string {
  const date = typeof value === "string" ? new Date(value) : value;

  // Extract date components
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();

  // Replace tokens in order (longest first to avoid conflicts)
  return format
    .replace("MMMM", full_months[month])
    .replace("MMM", short_months[month])
    .replace("MM", String(month + 1).padStart(2, "0"))
    .replace("dd", String(day).padStart(2, "0"))
    .replace("d", String(day))
    .replace("yyyy", String(year))
    .replace("yy", String(year).slice(-2));
}
```

### 3. Currency Formatting

**Function**: `format_currency()` in `/src/lib/utils.ts`

**Features**:
- Thousands separators (comma)
- Configurable decimal places
- Configurable currency symbol

**Algorithm**:

```typescript
function format_currency(
  value: number,
  symbol: string = "$",
  decimal_places: number = 2
): string {
  // 1. Format to fixed decimal places
  const formatted = value.toFixed(decimal_places);

  // 2. Split integer and decimal parts
  const parts = formatted.split(".");

  // 3. Add thousands separators to integer part
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // 4. Rejoin and prepend symbol
  return `${symbol}${parts.join(".")}`;
}
```

**Example**:
```typescript
format_currency(1234567.89, "$", 2)  // "$1,234,567.89"
format_currency(1234567.89, "€", 2)  // "€1,234,567.89"
```

## State Management

### React Hook Form Integration

**Why react-hook-form?**
- Performance: uncontrolled components with minimal re-renders
- Built-in validation
- TypeScript support
- Form state management (dirty, touched, errors)

**Usage in HazoDataForm**:

```typescript
const form_methods = useForm<FormValues>({
  defaultValues: { ...schema_defaults, ...default_values },
  values: values,  // Controlled mode
  mode: "onBlur"   // Validation timing
});

// Access form state
const { formState: { errors, isDirty, isSubmitting } } = form_methods;

// Programmatic control
form_methods.setValue("field_id", value);
form_methods.trigger("field_id");  // Trigger validation
form_methods.reset();              // Reset form
```

**Field Registration**:

Each field renderer uses `useFormContext()` to access form methods:

```typescript
function TextField({ field, on_change }: FieldRendererProps) {
  const { register } = useFormContext();

  return (
    <input
      {...register(field.id, {
        required: field.field_info.required,
        minLength: field.field_info.min_length,
        maxLength: field.field_info.max_length
      })}
      onChange={(e) => on_change(e.target.value)}
    />
  );
}
```

### Computed Field Updates

**Trigger**: Form value changes (via watch subscription)

**Flow**:

```typescript
// 1. User updates field "price"
on_change(50)

// 2. react-hook-form updates value
form_methods.setValue("price", 50)

// 3. Watch subscription fires
form_methods.watch((values) => {
  // 4. Find computed fields dependent on "price"
  computed_fields
    .filter(f => f.computed_dependencies?.includes("price"))
    .forEach(field => {
      // 5. Re-evaluate formula
      const result = evaluate_formula(field.computed_formula, values);

      // 6. Update computed field value
      form_methods.setValue(field.id, result, { shouldDirty: false });
    });
})
```

**Performance**: Only re-evaluates computed fields with matching dependencies.

## Styling System

### Approach

**Hybrid System**:
1. **Tailwind CSS** - Utility classes for layout and structure
2. **INI Config** - Dynamic colors, fonts, spacing via CSS variables
3. **CSS Classes** - All prefixed with `cls_` for easy targeting

### Tailwind Configuration

Consumers must include library in Tailwind content:

```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/hazo_data_forms/dist/**/*.{js,mjs,cjs}"
  ]
};
```

### CSS Class Naming Convention

**Pattern**: `cls_<component>_<element>_<modifier>`

**Examples**:
- `cls_hazo_data_form` - Root container
- `cls_section` - Section container
- `cls_section_header` - Section header
- `cls_section_collapsed` - Collapsed section
- `cls_field_wrapper` - Individual field wrapper
- `cls_field_label` - Field label
- `cls_field_label_required` - Required field label
- `cls_text_field` - Text input field
- `cls_doc_link_button` - Document link button
- `cls_pdf_panel` - PDF panel container

### Dynamic Styling via Config

Fields apply config values as inline styles:

```typescript
<input
  style={{
    borderColor: config.field_border_color,
    backgroundColor: config.field_background_color,
    fontSize: config.field_font_size,
    fontFamily: config.field_font_family
  }}
/>
```

## Validation System

### Built-in Validation

Handled by react-hook-form:

```typescript
register(field.id, {
  required: field.field_info.required,
  min: field.field_info.min,
  max: field.field_info.max,
  minLength: field.field_info.min_length,
  maxLength: field.field_info.max_length,
  pattern: field.field_info.field_type === "email" ? EMAIL_REGEX : undefined
})
```

### Custom Validation

Via `validate` prop:

```typescript
<HazoDataForm
  validate={(values) => {
    const errors: FormErrors = {};
    if (values.age < 18) {
      errors.age = "Must be 18 or older";
    }
    return errors;
  }}
/>
```

**Timing**:
- Called before `on_submit`
- If errors returned, form submission blocked
- Errors displayed via field error state

### External Validation

Via `errors` prop (for server-side validation):

```typescript
const [server_errors, set_server_errors] = useState<FormErrors>({});

<HazoDataForm
  errors={server_errors}
  on_submit={async (values) => {
    const result = await api.submit(values);
    if (result.errors) {
      set_server_errors(result.errors);
    }
  }}
/>
```

## Performance Considerations

### 1. Memoization

**Schema Parsing**: Memoized to avoid re-parsing on every render

```typescript
const schema_defaults = useMemo(() => {
  // Extract default values from schema
}, [schema]);

const computed_fields = useMemo(() => {
  // Extract computed fields
}, [schema]);
```

**Field Renderers**: Use `useMemo` for expensive formatting

```typescript
const formatted_value = useMemo(
  () => format_currency(value, symbol, decimal_places),
  [value, symbol, decimal_places]
);
```

### 2. Uncontrolled Components

react-hook-form uses uncontrolled inputs by default, minimizing re-renders.

### 3. Watch Subscription

Only subscribes to form changes when `on_change` or computed fields present:

```typescript
useEffect(() => {
  if (!on_change && computed_fields.length === 0) {
    return; // No subscription needed
  }

  const subscription = form_methods.watch((values) => {
    // Handle changes
  });

  return () => subscription.unsubscribe();
}, [form_methods, on_change, computed_fields]);
```

### 4. Large Forms

**Recommendations**:
- Use collapsible sections for 100+ fields
- Initialize with `collapsed_sections` prop
- Consider pagination for very large datasets
- Use table virtualization for 1000+ row tables (custom renderer)

## Extension Guide

### Adding a Custom Field Type

**Step 1**: Create field renderer component

```typescript
// custom_slider_field.tsx
import { FieldRendererProps, register_field_renderer } from "hazo_data_forms";

export function SliderField({
  field,
  mode,
  value,
  error,
  config,
  on_change,
  on_blur
}: FieldRendererProps) {
  const { min = 0, max = 100 } = field.field_info;

  if (mode === "view") {
    return <div>{value}</div>;
  }

  return (
    <div>
      <label>{field.label}</label>
      <input
        type="range"
        min={min}
        max={max}
        value={value as number}
        onChange={(e) => on_change(Number(e.target.value))}
        onBlur={on_blur}
      />
      <span>{value}</span>
      {error && <span>{error}</span>}
    </div>
  );
}

// Register on module load
register_field_renderer("slider", SliderField);
```

**Step 2**: Import to trigger registration

```typescript
// App.tsx or index.ts
import "./custom_slider_field";
```

**Step 3**: Use in schema

```typescript
const field: FormField = {
  id: "volume",
  label: "Volume",
  field_info: {
    field_type: "slider" as FieldType,  // Type assertion
    min: 0,
    max: 100
  }
};
```

### Extending FieldInfo Type

For custom field types with additional config:

```typescript
// Extend FieldInfo interface
declare module "hazo_data_forms" {
  interface FieldInfo {
    slider_step?: number;
    slider_show_value?: boolean;
  }
}

// Use in field renderer
const { slider_step = 1, slider_show_value = true } = field.field_info;
```

### Custom Validation Rules

```typescript
function validate_custom(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  // Complex business logic
  if (values.start_date > values.end_date) {
    errors.end_date = "End date must be after start date";
  }

  // Async validation (not recommended - use server-side instead)
  // Use errors prop for server-side validation results

  return errors;
}

<HazoDataForm
  schema={schema}
  validate={validate_custom}
/>
```

## Testing Strategy

### Manual Testing

Use the included test-app (Next.js):

```bash
cd test-app
npm install
npm run dev
```

**Test Cases**:
- `/basic-fields` - All 12 field types
- `/nested-sections` - Multiple sections and sub-sections
- `/tables-worksheets` - Table field with add/remove rows
- `/document-links` - PDF viewer integration
- `/edit-vs-view` - Mode switching

### Unit Testing (Recommended)

```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import { HazoDataForm, FormSchema } from "hazo_data_forms";

describe("HazoDataForm", () => {
  const schema: FormSchema = [
    // ... test schema
  ];

  it("renders fields from schema", () => {
    render(<HazoDataForm schema={schema} mode="edit" />);
    expect(screen.getByLabelText("First Name")).toBeInTheDocument();
  });

  it("calls on_submit with form values", () => {
    const handle_submit = jest.fn();
    render(<HazoDataForm schema={schema} on_submit={handle_submit} />);

    fireEvent.input(screen.getByLabelText("First Name"), {
      target: { value: "John" }
    });
    fireEvent.submit(screen.getByRole("form"));

    expect(handle_submit).toHaveBeenCalledWith({ first_name: "John" });
  });

  it("updates computed fields automatically", () => {
    // Test computed field dependencies
  });

  it("validates required fields", () => {
    // Test validation
  });
});
```

### Integration Testing

Test with real schemas from your application:

```typescript
import { my_production_schema } from "./schemas";

describe("Production Schema", () => {
  it("renders without crashing", () => {
    render(<HazoDataForm schema={my_production_schema} />);
  });
});
```

## Build System

### tsup Configuration

**File**: `tsup.config.ts`

**Features**:
- Dual output: ESM and CJS
- TypeScript declarations (.d.ts)
- CSS bundling
- Tree-shaking enabled

**Build Targets**:

```typescript
export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,              // Generate .d.ts files
  splitting: false,
  sourcemap: true,
  clean: true,
  external: [             // Peer dependencies
    "react",
    "react-dom",
    "react-hook-form",
    "hazo_config",
    "hazo_pdf",
    "lucide-react"
  ]
});
```

**Output**:
- `dist/index.js` - ESM bundle
- `dist/index.cjs` - CommonJS bundle
- `dist/index.d.ts` - TypeScript definitions
- `dist/styles.css` - CSS bundle

### Package Exports

```json
{
  "exports": {
    ".": {
      "import": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.js"
      },
      "require": {
        "types": "./dist/index.d.cts",
        "default": "./dist/index.cjs"
      }
    },
    "./styles.css": "./dist/styles.css"
  }
}
```

## Security Considerations

### 1. Computed Field Formulas

**Risk**: Code injection via formula strings

**Mitigation**:
- Whitelist-only approach: only `+ - * / ( )` and numbers allowed
- Regex validation before evaluation
- No access to global scope
- No function calls

**Safe**:
```typescript
"price * quantity"
"(subtotal + tax) * 0.1"
```

**Unsafe** (rejected):
```typescript
"Math.random()"           // Function call
"process.env.SECRET"      // Property access
"eval('malicious code')"  // eval
```

### 2. PDF URLs

**Risk**: XSS via malicious PDF URLs

**Mitigation**: None in library (consumer responsibility)

**Recommendation**: Validate and sanitize PDF URLs server-side before including in schema.

### 3. User Input

**Risk**: XSS via user input displayed in view mode

**Mitigation**: React automatically escapes text content

**Additional**: Sanitize before storage and when displaying in non-React contexts.

### 4. INI Configuration

**Risk**: Arbitrary code execution via malicious INI files

**Mitigation**: INI parser only reads strings, no code evaluation

**Recommendation**: Serve INI files from trusted sources only.

## Browser Compatibility

### Minimum Versions

- Chrome/Edge: Latest 2 major versions
- Firefox: Latest 2 major versions
- Safari: Latest 2 major versions

### Feature Dependencies

- **ES2020**: Optional chaining, nullish coalescing
- **HTML5**: date input, email/tel validation
- **CSS**: Grid, Flexbox, CSS variables
- **JavaScript**: Promises, async/await, Map, Set

### Polyfills

None required for target browsers. For older browsers, consider:
- @babel/preset-env
- core-js

## Deployment

### NPM Package

**Build**:
```bash
npm run build
```

**Publish**:
```bash
npm publish
```

**Pre-publish Checks**:
- Type checking: `npm run type-check`
- Linting: `npm run lint`
- Build succeeds: `npm run build`

### Versioning

Follow Semantic Versioning:
- **Major**: Breaking changes (API changes, removed features)
- **Minor**: New features (backward compatible)
- **Patch**: Bug fixes (backward compatible)

## Troubleshooting

### Common Issues

**Issue**: "Cannot find module 'hazo_data_forms/styles.css'"

**Solution**: Ensure Tailwind is configured and library is in content array.

---

**Issue**: Computed fields not updating

**Solution**: Check `computed_dependencies` array includes all referenced fields.

---

**Issue**: PDF panel not showing

**Solution**: Install `hazo_pdf` peer dependency or set `show_pdf_panel={false}`.

---

**Issue**: Field values not persisting

**Solution**: Use controlled mode with `values` prop, not `default_values`.

---

**Issue**: Tailwind classes not applying

**Solution**: Add library to Tailwind content in `tailwind.config.js`.

## Future Enhancements

### Potential Features

- **Field Groups**: Group related fields visually
- **Conditional Fields**: Show/hide fields based on other field values
- **Field Dependencies**: Enable/disable fields based on conditions
- **Multi-page Forms**: Wizard-style forms with step navigation
- **Async Validation**: Server-side validation during input
- **Field Masking**: Input masks for phone, SSN, etc.
- **Rich Text Editor**: WYSIWYG field type
- **File Upload**: File/image upload field type
- **Repeatable Groups**: Dynamic field groups (not just tables)
- **Schema Versioning**: Schema migration utilities

### Architecture Improvements

- **Virtual Scrolling**: For very large forms
- **Lazy Loading**: Load sections on demand
- **Schema Caching**: Cache parsed schemas
- **Web Workers**: Compute fields in worker threads
- **React Server Components**: SSR optimization

## References

### External Dependencies

- **react-hook-form**: https://react-hook-form.com/
- **Tailwind CSS**: https://tailwindcss.com/
- **lucide-react**: https://lucide.dev/
- **hazo_config**: Internal package for INI file parsing
- **hazo_pdf**: Internal package for PDF viewing

### Related Documentation

- **CLAUDE.md**: AI assistant context and design principles
- **README.md**: User-facing documentation and quick start
- **CHANGE_LOG.md**: Version history and release notes
