# CLAUDE.md - AI Assistant Context for hazo_data_forms

## Project Overview

**hazo_data_forms** is a React library that renders dynamic, schema-driven forms with integrated PDF document viewer support. It provides a declarative approach to building complex forms from JSON schema definitions, with dual-mode rendering (edit/view) and rich field type support.

**Core Purpose**: Enable developers to build data collection and display interfaces without manually creating form components, while maintaining full type safety and extensibility.

**Key Differentiators**:
- Schema-driven architecture with 12 field types
- Dual mode rendering (edit mode and view mode)
- Inline document links that open PDFs in embedded viewer
- INI-based configuration system for styling consistency
- Field renderer registry pattern for extensibility
- Built-in validation and computed fields

## Architecture

### High-Level Design

```
┌─────────────────────────────────────────────────────────┐
│                    HazoDataForm                         │
│  (Main orchestrator, react-hook-form integration)       │
└───────────────┬─────────────────────────────────────────┘
                │
        ┌───────┴────────┐
        │                │
┌───────▼────────┐   ┌──▼──────────────┐
│ SectionRenderer│   │   PdfPanel      │
│ (Sections loop)│   │ (Doc viewer)    │
└───────┬────────┘   └─────────────────┘
        │
┌───────▼─────────────┐
│ SubSectionRenderer  │
│ (Sub-sections loop) │
└───────┬─────────────┘
        │
┌───────▼─────────────┐
│  FieldRenderer      │
│  (Registry pattern) │
└───────┬─────────────┘
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

### Design Patterns

#### 1. Registry Pattern (Field Renderers)

All field renderers self-register on import via the field registry system.

**Key files**:
- `/src/lib/field_registry.ts` - Registry implementation
- `/src/components/field_renderers/index.tsx` - Auto-registration on import

**Usage**:
```typescript
// Custom field registration
import { register_field_renderer } from "hazo_data_forms";

register_field_renderer("custom_type", CustomFieldComponent);
```

#### 2. Configuration Cascade

Configuration follows a three-tier cascade:
1. **Defaults** - Hardcoded in `DEFAULT_FORM_CONFIG` (`/src/lib/types.ts`)
2. **INI File** - Loaded from `config/hazo_data_forms_config.ini`
3. **Prop Overrides** - Via `config_override` prop on `HazoDataForm`

**Implementation**: `/src/hooks/use_form_config.ts`

#### 3. Controlled/Uncontrolled Forms

Supports both patterns via `react-hook-form`:
- **Controlled**: Pass `values` prop (external state management)
- **Uncontrolled**: Pass `default_values` prop (internal state)

#### 4. Composition-Based Schema

Forms are composed hierarchically:
```
FormSchema (array)
  └─ FormSection
       └─ SubSection
            └─ FieldGroup (orientation: horizontal | vertical)
                 └─ FormField (with FieldInfo)
```

## File Structure

```
hazo_data_forms/
├── config/
│   └── hazo_data_forms_config.ini       # Default styling configuration
├── src/
│   ├── components/
│   │   ├── hazo_data_form/
│   │   │   ├── index.tsx                # Main HazoDataForm component
│   │   │   └── types.ts                 # HazoDataFormProps interface
│   │   ├── field_renderers/
│   │   │   ├── index.tsx                # Auto-registration of all fields
│   │   │   ├── text_field.tsx           # Text field renderer
│   │   │   ├── number_field.tsx         # Number field renderer
│   │   │   ├── date_field.tsx           # Date field renderer
│   │   │   ├── boolean_field.tsx        # Checkbox renderer
│   │   │   ├── option_field.tsx         # Select/dropdown renderer
│   │   │   ├── email_field.tsx          # Email field renderer
│   │   │   ├── tel_field.tsx            # Phone number renderer
│   │   │   ├── currency_field.tsx       # Currency input renderer
│   │   │   ├── percentage_field.tsx     # Percentage input renderer
│   │   │   ├── textarea_field.tsx       # Multi-line text renderer
│   │   │   ├── table_field.tsx          # Table/array renderer
│   │   │   └── computed_field.tsx       # Read-only computed field
│   │   ├── section_renderer/
│   │   │   ├── index.tsx                # Section renderer
│   │   │   └── sub_section_renderer.tsx # Sub-section renderer
│   │   ├── pdf_panel/
│   │   │   ├── index.tsx                # PDF viewer panel
│   │   │   └── doc_link_button.tsx      # Document link icon button
│   │   └── ui/                          # shadcn/ui components (internal)
│   ├── hooks/
│   │   └── use_form_config.ts           # Config loading hook
│   ├── lib/
│   │   ├── types.ts                     # Core TypeScript interfaces
│   │   ├── utils.ts                     # Utility functions
│   │   └── field_registry.ts            # Field renderer registry
│   └── index.ts                         # Package exports
├── test-app/                            # Next.js test application
│   ├── app/
│   │   ├── basic-fields/                # Test: Basic field types
│   │   ├── nested-sections/             # Test: Nested sections
│   │   ├── tables-worksheets/           # Test: Table fields
│   │   ├── document-links/              # Test: PDF integration
│   │   └── edit-vs-view/                # Test: Mode switching
│   └── components/
│       └── sidebar.tsx                  # Test app navigation
└── package.json
```

## Code Style Requirements

### Naming Conventions

- **Functions and Variables**: `snake_case`
  ```typescript
  const form_values = { ... };
  function calculate_total() { ... }
  ```

- **Constants**: `SCREAMING_SNAKE_CASE`
  ```typescript
  const DEFAULT_FORM_CONFIG = { ... };
  const MAX_TABLE_ROWS = 100;
  ```

- **Types and Interfaces**: `PascalCase`
  ```typescript
  interface FormField { ... }
  type FieldType = "text" | "number";
  ```

- **CSS Classes**: Prefix with `cls_`
  ```typescript
  <div className="cls_form_container">
  <Button className="cls_submit_btn">
  ```

- **React Components**: `PascalCase` for component names, `snake_case` for props
  ```typescript
  function TextField({ field, mode, on_change }: FieldRendererProps) {
    return <input className="cls_text_field" />;
  }
  ```

### TypeScript Standards

- Always use explicit types for public APIs
- Use `interface` for object shapes, `type` for unions/aliases
- Export types alongside implementations
- Use `unknown` instead of `any` for uncertain types

## UI Rules

### Button Placement - Left-to-Right Principle

In dialogs, modals, and action bars, follow the left-to-right reading flow for button placement:

- **Action/Change buttons** (Save, Submit, Delete, Remove, Confirm) go on the **LEFT**
- **Cancel/Dismiss buttons** (Cancel, Close, No) go on the **RIGHT**

This follows the natural left-to-right reading flow where the primary action comes first.

```typescript
// Correct - action on left, cancel on right
<DialogFooter>
  <Button onClick={handle_save}>Save</Button>
  <Button variant="outline" onClick={handle_cancel}>Cancel</Button>
</DialogFooter>

// Correct - destructive action on left, cancel on right
<AlertDialogFooter>
  <AlertDialogAction onClick={handle_delete}>Remove</AlertDialogAction>
  <AlertDialogCancel>Cancel</AlertDialogCancel>
</AlertDialogFooter>
```

## Core Type Definitions

### FormSchema Structure

```typescript
// Top-level schema is an array of sections
type FormSchema = FormSection[];

interface FormSection {
  section_name: string;
  sub_sections: SubSection[];
}

interface SubSection {
  sub_section_id: string;
  sub_section_label: string;
  field_group: FieldGroup;
}

interface FieldGroup {
  orientation: "horizontal" | "vertical";
  fields: FormField[];
}

interface FormField {
  id: string;
  label: string;
  field_info: FieldInfo;
  value?: unknown;
  doc_links?: DocLink[];  // Array of document links
}
```

### FieldInfo Configuration

```typescript
interface FieldInfo {
  field_type: FieldType;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;

  // Option field
  options?: OptionItem[];

  // Numeric fields
  min?: number;
  max?: number;
  decimal_places?: number;

  // Currency field
  currency_symbol?: string;

  // Text fields
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

### Document Link

```typescript
interface DocLink {
  type: "pdf";
  url: string;
  page?: number;  // Optional starting page
}
```

## Design Principles

### 1. Schema-First Design

All form structure is defined declaratively in JSON schema. This enables:
- Forms generated from backend APIs
- Dynamic forms based on user roles or data
- Version control for form structures
- Easy testing with mock schemas

### 2. Zero Config by Default, Configurable When Needed

- Works out-of-the-box with sensible defaults
- INI file configuration for project-wide consistency
- Component-level overrides for special cases

### 3. Progressive Enhancement

- Basic HTML5 validation built-in
- Supports custom validation functions
- External error injection for server-side validation
- Client-side computed fields

### 4. Separation of Concerns

- **Schema**: Structure and validation rules
- **Config**: Visual styling and formatting
- **Component**: Behavior and interaction logic
- **Validation**: Business rules

### 5. Extensibility Without Modification

Register custom field types without forking:
```typescript
register_field_renderer("slider", SliderField);
```

## Common Patterns

### Pattern: Basic Form

```typescript
import { HazoDataForm, FormSchema } from "hazo_data_forms";

const schema: FormSchema = [
  {
    section_name: "Personal Information",
    sub_sections: [
      {
        sub_section_id: "basic_info",
        sub_section_label: "Basic Info",
        field_group: {
          orientation: "vertical",
          fields: [
            {
              id: "first_name",
              label: "First Name",
              field_info: { field_type: "text", required: true }
            },
            {
              id: "email",
              label: "Email",
              field_info: { field_type: "email", required: true }
            }
          ]
        }
      }
    ]
  }
];

function MyForm() {
  return (
    <HazoDataForm
      schema={schema}
      mode="edit"
      on_submit={(values) => console.log(values)}
    />
  );
}
```

### Pattern: View Mode (Read-Only Display)

```typescript
<HazoDataForm
  schema={schema}
  mode="view"
  values={existing_data}
/>
```

### Pattern: Document Links

```typescript
const field_with_doc: FormField = {
  id: "contract_value",
  label: "Contract Value",
  field_info: { field_type: "currency" },
  doc_links: [
    {
      type: "pdf",
      url: "/documents/contract.pdf",
      page: 3,  // Open to page 3
      filename: "Main Contract"
    },
    {
      type: "pdf",
      url: "/documents/amendment.pdf",
      filename: "Amendment 1"
    }
  ]
};
```

### Pattern: Computed Fields

```typescript
const total_field: FormField = {
  id: "total",
  label: "Total",
  field_info: {
    field_type: "computed",
    computed_formula: "price * quantity",
    computed_dependencies: ["price", "quantity"]
  }
};
```

### Pattern: Custom Configuration

```typescript
<HazoDataForm
  schema={schema}
  config_override={{
    label_color: "#2563eb",
    field_border_color: "#60a5fa",
    default_currency_symbol: "€"
  }}
/>
```

### Pattern: Table Fields (Arrays)

```typescript
const table_field: FormField = {
  id: "line_items",
  label: "Line Items",
  field_info: {
    field_type: "table",
    table_columns: [
      {
        id: "item",
        label: "Item",
        field_info: { field_type: "text" },
        width: "40%"
      },
      {
        id: "qty",
        label: "Quantity",
        field_info: { field_type: "number", min: 1 },
        width: "20%"
      },
      {
        id: "price",
        label: "Price",
        field_info: { field_type: "currency" },
        width: "40%"
      }
    ],
    table_min_rows: 1,
    table_max_rows: 50
  }
};
```

## Common Gotchas

### 1. Config File Loading

The INI file must be publicly accessible:
- Next.js: Place in `/public/config/hazo_data_forms_config.ini`
- Pass `config_path="/config/hazo_data_forms_config.ini"` to component

### 2. Field IDs Must Be Unique

Field IDs are used as form keys. Duplicate IDs will cause:
- Value collisions
- Validation errors not displaying correctly
- Computed field evaluation failures

### 3. Computed Field Formula Syntax

Formulas use simple JavaScript expressions:
```typescript
// Valid
"price * quantity"
"(base + bonus) * 1.1"
"total - discount"

// Invalid (security restricted)
"Math.random()"        // No function calls
"field[0]"             // No array access
"field.nested"         // No property access
```

### 4. Table Field Value Structure

Table fields expect an array of objects:
```typescript
const table_value = [
  { item: "Widget", qty: 5, price: 10.00 },
  { item: "Gadget", qty: 3, price: 25.50 }
];
```

### 5. Date Field Format

Date fields use HTML5 date input format (YYYY-MM-DD):
```typescript
// Correct
value: "2024-03-15"

// Incorrect
value: "03/15/2024"
value: "March 15, 2024"
```

Display format is controlled by `date_format` config.

### 6. PDF Panel Requires hazo_pdf

The PDF viewer depends on the `hazo_pdf` peer dependency:
```bash
npm install hazo_pdf
```

Set `show_pdf_panel={false}` if not using PDF features.

### 7. Mode Switching

When switching between edit and view mode, ensure values are synchronized:
```typescript
const [mode, set_mode] = useState<FormMode>("edit");
const [values, set_values] = useState<FormValues>({});

<HazoDataForm
  schema={schema}
  mode={mode}
  values={values}  // Keep values in sync
  on_change={set_values}
/>
```

### 8. Resizable PDF Panel (react-resizable-panels)

The PDF panel uses `react-resizable-panels` library. Key learnings:

**Library exports**: Use `Group`, `Panel`, `Separator` (NOT `PanelGroup`, `PanelResizeHandle`):
```typescript
import { Group, Panel, Separator } from "react-resizable-panels"
```

**Use `orientation` not `direction`**:
```typescript
<Group orientation="horizontal">  // Correct
<Group direction="horizontal">    // Wrong - doesn't exist
```

**Use simple percentage-based minSize only**:
```typescript
// Good - simple fixed percentages
<Panel id="form-panel" minSize={30} />
<Panel id="pdf-panel" minSize={15} />

// Bad - complex calculated constraints cause issues
<Panel minSize={calculatedFromPixels} maxSize={calculatedFromVw} />
```

**Don't use maxSize** - let the other panel's minSize naturally constrain it:
```typescript
// Good - form min 30% means PDF can grow to 70%
<Panel id="form-panel" minSize={30} />
<Panel id="pdf-panel" minSize={15} />

// Bad - conflicting maxSize causes resize issues
<Panel id="pdf-panel" minSize={20} maxSize={60} />
```

**Always provide unique IDs** to panels:
```typescript
<Panel id="form-panel">...</Panel>
<Panel id="pdf-panel">...</Panel>
```

**Use `defaultLayout` on Group** instead of `defaultSize` on individual panels:
```typescript
const default_layout = { "form-panel": 50, "pdf-panel": 50 };
<Group defaultLayout={default_layout}>
  <Panel id="form-panel" />
  <Separator />
  <Panel id="pdf-panel" />
</Group>
```

## Integration Points

### react-hook-form Integration

Forms use `react-hook-form` internally. Access form methods via `on_form_ready`:
```typescript
<HazoDataForm
  schema={schema}
  on_form_ready={(methods) => {
    // Access react-hook-form methods
    methods.setValue("field_id", "value");
    methods.trigger("field_id");  // Trigger validation
    const errors = methods.formState.errors;
  }}
/>
```

### hazo_config Integration

Optional integration with `hazo_config` package for server-side config loading:
```typescript
import { HazoConfig } from "hazo_config";

const config = new HazoConfig({
  filePath: "/path/to/hazo_data_forms_config.ini"
});
```

### hazo_pdf Integration

Optional PDF viewer integration:
```typescript
import { PdfViewer } from "hazo_pdf";

// Used internally by PdfPanel component
// Can be disabled via show_pdf_panel={false}
```

## Command Reference

```bash
# Development
npm run dev              # Watch mode for library development
npm run build            # Build library for distribution
npm run build:watch      # Build in watch mode

# Code Quality
npm run lint             # Run ESLint
npm run type-check       # TypeScript type checking

# Cleanup
npm run clean            # Remove dist directory

# Publishing
npm run prepublishOnly   # Automatically runs build before publish
```

## Testing Strategy

Use the included test-app (Next.js) for manual testing:

```bash
cd test-app
npm install
npm run dev
```

Test cases available:
- `/basic-fields` - All 12 field types
- `/nested-sections` - Multiple sections and sub-sections
- `/tables-worksheets` - Table field rendering
- `/document-links` - PDF viewer integration
- `/edit-vs-view` - Mode switching

## Performance Considerations

### 1. Memoization

Field renderers should memoize expensive computations:
```typescript
const formatted_value = useMemo(
  () => format_currency(value, symbol, decimal_places),
  [value, symbol, decimal_places]
);
```

### 2. Computed Field Updates

Computed fields only re-evaluate when dependencies change (tracked via `computed_dependencies`).

### 3. Large Forms

For forms with 100+ fields:
- Consider splitting into multiple sections
- Use `collapsible_sections={true}`
- Initialize with `collapsed_sections={["section_name"]}`

### 4. Table Fields

Large tables (50+ rows) may impact performance:
- Set reasonable `table_max_rows`
- Consider pagination for very large datasets
- Use virtualization for extreme cases (custom renderer)

## Extension Guide

### Adding a Custom Field Type

```typescript
// 1. Define field renderer component
import { FieldRendererProps, register_field_renderer } from "hazo_data_forms";

function CustomField({
  field,
  mode,
  value,
  error,
  config,
  on_change,
  on_blur,
  on_doc_link_click
}: FieldRendererProps) {
  return (
    <div>
      <label>{field.label}</label>
      <input
        type="custom"
        value={value as string}
        onChange={(e) => on_change(e.target.value)}
        onBlur={on_blur}
        disabled={mode === "view"}
      />
      {error && <span>{error}</span>}
    </div>
  );
}

// 2. Register the renderer
register_field_renderer("custom", CustomField);

// 3. Use in schema
const schema: FormSchema = [{
  section_name: "Custom Fields",
  sub_sections: [{
    sub_section_id: "custom",
    sub_section_label: "Custom",
    field_group: {
      orientation: "vertical",
      fields: [{
        id: "custom_field",
        label: "Custom Field",
        field_info: {
          field_type: "custom" as FieldType  // Type assertion needed
        }
      }]
    }
  }]
}];
```

## Validation

### Built-in Validation

- `required` - Field must have a value
- `min` / `max` - Numeric range validation
- `min_length` / `max_length` - String length validation
- `field_type` - Type-specific validation (email, tel, etc.)

### Custom Validation

```typescript
<HazoDataForm
  schema={schema}
  validate={(values) => {
    const errors: FormErrors = {};

    if (values.age < 18) {
      errors.age = "Must be 18 or older";
    }

    if (values.password !== values.confirm_password) {
      errors.confirm_password = "Passwords must match";
    }

    return errors;
  }}
/>
```

### External Validation (Server-Side)

```typescript
const [server_errors, set_server_errors] = useState<FormErrors>({});

<HazoDataForm
  schema={schema}
  errors={server_errors}
  on_submit={async (values) => {
    const response = await api.submit(values);
    if (response.errors) {
      set_server_errors(response.errors);
    }
  }}
/>
```

## Styling Approach

The library uses a hybrid approach:
1. **Tailwind CSS** - Utility classes for structure
2. **INI Config** - Dynamic CSS variables for colors/spacing
3. **CSS Classes** - All classes prefixed with `cls_` for easy overriding

Override styles using CSS:
```css
.cls_hazo_data_form {
  /* Form container styles */
}

.cls_text_field {
  /* Text field specific styles */
}

.cls_submit_btn {
  /* Submit button styles */
}
```

## UI/CSS Positioning Learnings

### 1. Tailwind Classes vs Inline Styles

Tailwind utility classes can conflict with inline styles. When you need dynamic width calculations, **remove the Tailwind class** rather than trying to override it:

```typescript
// Problem: w-full conflicts with inline width
<div className="w-full" style={{ width: `calc(100% - ${indent})` }}>

// Solution: Conditionally remove the class
<div
  className={cn("cls_container", !needs_calc && "w-full")}
  style={{ width: needs_calc ? `calc(100% - ${indent})` : undefined }}
>
```

### 2. Indented Containers That Should Align

When a container has `margin-left` for indentation but needs its right edge to align with non-indented siblings:

```typescript
// Both margin-left AND reduced width are needed
style={{
  marginLeft: indent,
  width: `calc(100% - ${indent})`,
  maxWidth: `calc(100% - ${indent})`,  // Safety net
  boxSizing: "border-box",
}}
```

The math: `margin-left + width = indent + (100% - indent) = 100%`

### 3. Tables Respecting Container Width

Use `table-layout: fixed` to force tables to respect their container's width instead of expanding based on content:

```typescript
<div className="cls_table_wrapper w-full overflow-hidden">
  <table className="w-full" style={{ tableLayout: "fixed" }}>
    {/* Columns will respect percentage widths */}
  </table>
</div>
```

Without `table-layout: fixed`, tables with wide content (like long text inputs) will overflow their container.

### 4. Debugging Width Overflow Issues

When content overflows horizontally:
1. Check for conflicting Tailwind classes (especially `w-full`)
2. Verify `box-sizing: border-box` is applied
3. Check if parent has padding that affects child's 100% width
4. Use browser DevTools to inspect computed widths at each level
5. Consider `overflow-x: auto` on containers as a last resort

## Development Workflow

### Library Changes and test-app

The test-app uses built dist files via `"hazo_data_forms": "file:.."`. Source changes require rebuilding:

```bash
# After changing src/ files
npm run build          # Rebuild library

# Clear Next.js cache if changes don't appear
cd test-app && rm -rf .next

# Restart dev server
npm run dev
```

**Common mistake**: Editing source files and expecting test-app to reflect changes without rebuilding. The `file:..` dependency resolves to `dist/`, not `src/`.

## Security Considerations

### Computed Field Formulas

Formulas are sanitized to prevent code injection:
- Only arithmetic operators allowed: `+ - * / ( )`
- No function calls
- No property access
- No array indexing

### PDF URLs

PDF URLs should be validated server-side. The component does not validate URLs.

### User Input

All field values should be sanitized before storage/display in other contexts. The component does not perform XSS protection on display values.
