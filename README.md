# hazo_data_forms

Dynamic form rendering from JSON schema with document link support and embedded PDF viewer integration.

## Overview

**hazo_data_forms** is a React library that transforms JSON schema definitions into fully functional forms with rich field types, dual-mode rendering (edit/view), and integrated PDF document viewing capabilities. Build complex data collection interfaces without writing form components.

### Key Features

- **12 Field Types**: text, number, date, boolean, option, email, tel, currency, percentage, textarea, table, computed
- **Dual Mode Rendering**: Switch between edit mode (editable) and view mode (read-only display)
- **Document Links**: Click inline doc links to open PDFs in resizable side panel
- **Schema-Driven**: Define forms declaratively in JSON
- **Config-Based Styling**: INI configuration file for consistent styling across projects
- **Computed Fields**: Automatic calculation based on other field values
- **Table Fields**: Dynamic arrays with configurable columns
- **Built-in Validation**: Required fields, min/max, length constraints, custom validators
- **TypeScript**: Full type safety and IntelliSense support
- **Extensible**: Register custom field renderers without forking

## Installation

```bash
npm install hazo_data_forms react react-dom react-hook-form lucide-react hazo_config

# Optional: For PDF viewer support
npm install hazo_pdf
```

**Important:** This library requires Tailwind CSS to be configured in your project. See the Quick Start section for setup instructions.

### Peer Dependencies

### Required Versions

- React: ^18.0.0 or ^19.0.0
- react-hook-form: ^7.0.0
- hazo_config: ^1.0.0
- hazo_pdf: ^1.0.0 (optional)

## Quick Start

### 1. Configure Tailwind CSS

This library uses Tailwind CSS classes. Add the library's source to your Tailwind config:

```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/hazo_data_forms/dist/**/*.{js,mjs,cjs}",
  ],
  // ... rest of your config
};
```

### 2. Import the component

```typescript
import { HazoDataForm, FormSchema } from "hazo_data_forms";
```

### 3. Define your form schema

```typescript
const schema: FormSchema = [
  {
    section_name: "Personal Information",
    sub_sections: [
      {
        sub_section_id: "basic_info",
        sub_section_label: "Basic Details",
        field_group: {
          orientation: "vertical",
          fields: [
            {
              id: "first_name",
              label: "First Name",
              field_info: {
                field_type: "text",
                required: true,
                placeholder: "Enter your first name"
              }
            },
            {
              id: "email",
              label: "Email Address",
              field_info: {
                field_type: "email",
                required: true
              }
            },
            {
              id: "birth_date",
              label: "Date of Birth",
              field_info: {
                field_type: "date"
              }
            }
          ]
        }
      }
    ]
  }
];
```

### 3. Render the form

```typescript
function MyForm() {
  const handle_submit = (values: FormValues) => {
    console.log("Form submitted:", values);
  };

  return (
    <HazoDataForm
      schema={schema}
      mode="edit"
      on_submit={handle_submit}
    />
  );
}
```

## Field Types

### Text Fields

```typescript
// Basic text
{
  id: "username",
  label: "Username",
  field_info: {
    field_type: "text",
    required: true,
    min_length: 3,
    max_length: 20
  }
}

// Email
{
  id: "email",
  label: "Email",
  field_info: { field_type: "email" }
}

// Phone
{
  id: "phone",
  label: "Phone Number",
  field_info: { field_type: "tel" }
}

// Textarea
{
  id: "comments",
  label: "Comments",
  field_info: {
    field_type: "textarea",
    rows: 4,
    max_length: 500
  }
}
```

### Numeric Fields

```typescript
// Number
{
  id: "age",
  label: "Age",
  field_info: {
    field_type: "number",
    min: 0,
    max: 120
  }
}

// Currency
{
  id: "salary",
  label: "Annual Salary",
  field_info: {
    field_type: "currency",
    currency_symbol: "$",
    decimal_places: 2
  }
}

// Percentage
{
  id: "discount",
  label: "Discount Rate",
  field_info: {
    field_type: "percentage",
    decimal_places: 1,
    min: 0,
    max: 100
  }
}
```

### Selection Fields

```typescript
// Boolean (checkbox)
{
  id: "agree_terms",
  label: "I agree to the terms and conditions",
  field_info: {
    field_type: "boolean",
    required: true
  }
}

// Option (dropdown)
{
  id: "country",
  label: "Country",
  field_info: {
    field_type: "option",
    options: [
      { label: "United States", value: "US" },
      { label: "Canada", value: "CA" },
      { label: "United Kingdom", value: "UK" }
    ],
    required: true
  }
}
```

### Date Field

```typescript
{
  id: "start_date",
  label: "Start Date",
  field_info: {
    field_type: "date",
    required: true
  }
}
```

### Computed Field

```typescript
{
  id: "total",
  label: "Total Amount",
  field_info: {
    field_type: "computed",
    computed_formula: "price * quantity * (1 - discount / 100)",
    computed_dependencies: ["price", "quantity", "discount"]
  }
}
```

### Table Field (Arrays)

```typescript
{
  id: "line_items",
  label: "Line Items",
  field_info: {
    field_type: "table",
    table_columns: [
      {
        id: "description",
        label: "Description",
        field_info: { field_type: "text" },
        width: "40%"
      },
      {
        id: "quantity",
        label: "Qty",
        field_info: { field_type: "number", min: 1 },
        width: "20%"
      },
      {
        id: "unit_price",
        label: "Unit Price",
        field_info: { field_type: "currency" },
        width: "20%"
      },
      {
        id: "total",
        label: "Total",
        field_info: {
          field_type: "computed",
          computed_formula: "quantity * unit_price"
        },
        width: "20%"
      }
    ],
    table_min_rows: 1,
    table_max_rows: 50
  }
}
```

## Document Links

Add inline document links that open PDFs in an embedded viewer:

```typescript
{
  id: "contract_value",
  label: "Contract Value",
  field_info: { field_type: "currency" },
  doc_link: {
    type: "pdf",
    url: "/documents/contract.pdf",
    page: 3  // Optional: Open to specific page
  }
}
```

### PDF Panel Configuration

```typescript
<HazoDataForm
  schema={schema}
  show_pdf_panel={true}
  pdf_panel_position="right"  // "right" | "left" | "bottom"
  pdf_panel_width="500px"
  pdf_panel_resizable={true}
/>
```

## Form Modes

### Edit Mode (Editable)

```typescript
<HazoDataForm
  schema={schema}
  mode="edit"
  on_submit={(values) => {
    // Handle form submission
    console.log(values);
  }}
/>
```

### View Mode (Read-Only)

```typescript
const existing_data = {
  first_name: "John",
  email: "john@example.com",
  birth_date: "1990-05-15"
};

<HazoDataForm
  schema={schema}
  mode="view"
  values={existing_data}
/>
```

## Configuration

### Using INI Configuration File

Create a configuration file (e.g., `/public/config/hazo_data_forms_config.ini`):

```ini
[colors]
label_color = #374151
field_border_color = #d1d5db
field_border_color_focus = #3b82f6

[fonts]
label_font_size = 14px
field_font_size = 14px

[spacing]
section_spacing = 32px
field_spacing = 16px

[formatting]
default_currency_symbol = $
date_format = MMM d, yyyy
```

Pass the path to your component:

```typescript
<HazoDataForm
  schema={schema}
  config_path="/config/hazo_data_forms_config.ini"
/>
```

### Runtime Configuration Override

```typescript
<HazoDataForm
  schema={schema}
  config_override={{
    label_color: "#1e40af",
    field_border_color: "#60a5fa",
    default_currency_symbol: "€",
    date_format: "dd/MM/yyyy"
  }}
/>
```

## API Reference

### HazoDataForm Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `schema` | `FormSchema` | required | Form schema defining sections and fields |
| `mode` | `"edit" \| "view"` | `"edit"` | Form mode (edit allows input, view is read-only) |
| `values` | `FormValues` | `{}` | Controlled form values |
| `default_values` | `FormValues` | `{}` | Default values for uncontrolled form |
| `on_change` | `(values: FormValues) => void` | - | Callback when any field value changes |
| `on_field_change` | `(field_id: string, value: unknown) => void` | - | Callback when specific field changes |
| `on_submit` | `(values: FormValues) => void` | - | Callback when form is submitted |
| `on_doc_link_click` | `(doc_link: DocLink) => void` | - | Callback when document link is clicked |
| `show_pdf_panel` | `boolean` | `true` | Whether to show PDF panel for doc links |
| `pdf_panel_position` | `"left" \| "right"` | `"right"` | Position of PDF panel |
| `pdf_panel_width` | `string` | from config | Width of PDF panel |
| `pdf_panel_resizable` | `boolean` | `true` | Whether PDF panel is resizable |
| `config_path` | `string` | - | Path to INI configuration file |
| `config_override` | `PartialFormConfig` | - | Runtime configuration overrides |
| `errors` | `FormErrors` | - | External validation errors |
| `validate_on_blur` | `boolean` | `true` | Validate fields on blur |
| `validate_on_change` | `boolean` | `false` | Validate fields on change |
| `validate` | `(values: FormValues) => FormErrors` | - | Custom validation function |
| `class_name` | `string` | - | Additional CSS class for form container |
| `show_section_headers` | `boolean` | `true` | Show section headers |
| `show_sub_section_headers` | `boolean` | `true` | Show sub-section headers |
| `collapsible_sections` | `boolean` | `false` | Make sections collapsible |
| `collapsed_sections` | `string[]` | `[]` | IDs of initially collapsed sections |
| `on_form_ready` | `(methods: UseFormReturn) => void` | - | Callback with react-hook-form methods |
| `show_submit_button` | `boolean` | - | Show submit button at bottom of form |
| `submit_button_text` | `string` | `"Submit"` | Text for submit button |

## Custom Field Renderers

Register custom field types:

```tsx
import { register_field_renderer, type FieldRendererProps } from "hazo_data_forms";

function CustomField({ field, value, on_change, mode, config }: FieldRendererProps) {
  // Your custom field implementation
  return <div>...</div>;
}

register_field_renderer("custom_type", CustomField);
```

Then use in your schema:

```tsx
{
  id: "my_field",
  label: "My Custom Field",
  field_info: {
    field_type: "custom_type" as any
  }
}
```

## Exported Types

```tsx
import type {
  // Schema types
  FormSchema,
  FormSection,
  SubSection,
  FieldGroup,
  FormField,
  FieldInfo,
  FieldType,
  OptionItem,
  TableColumn,

  // Runtime types
  FormValues,
  FormErrors,
  FormMode,
  DocLink,
  DocLinkClickEvent,
  PdfPanelPosition,

  // Configuration
  FormConfig,
  PartialFormConfig,

  // Component props
  HazoDataFormProps,
  FieldRendererProps,
  FieldRenderer,
} from "hazo_data_forms";
```

## Exported Utilities

```tsx
import {
  // Styling
  cn,

  // Formatting
  format_currency,
  format_percentage,
  format_date,

  // Parsing
  parse_boolean,
  parse_number,
  parse_string,

  // Computed fields
  evaluate_formula,

  // Utilities
  generate_id,
  deep_merge,
} from "hazo_data_forms";
```

## Styling

This library uses Tailwind CSS for styling. Make sure you've added the library to your Tailwind config's content array (see Quick Start section).

All CSS classes use the `cls_` prefix following hazo ecosystem conventions:

- `cls_hazo_data_form` - Main form container
- `cls_section` - Section container
- `cls_sub_section` - Sub-section container
- `cls_field_group` - Field group container
- `cls_field_wrapper` - Individual field wrapper
- `cls_field_label` - Field label
- `cls_field_input` - Field input element
- `cls_doc_link_button` - Document link button
- `cls_pdf_panel` - PDF panel container

You can override these styles in your own CSS or use the configuration system to customize colors, fonts, and spacing.

## Examples

### Complete Form Example

See the `test-app` directory in the repository for a complete Next.js example with various field types and PDF integration.

### View Mode

```tsx
<HazoDataForm
  schema={schema}
  mode="view"
  values={savedData}
/>
```

### Validation

```tsx
<HazoDataForm
  schema={schema}
  validate={(values) => {
    const errors: FormErrors = {};
    if (!values.email?.includes("@")) {
      errors.email = "Invalid email address";
    }
    return errors;
  }}
  validate_on_blur={true}
/>
```

### Accessing Form Methods

```tsx
function MyForm() {
  const formMethodsRef = React.useRef<UseFormReturn | null>(null);

  return (
    <HazoDataForm
      schema={schema}
      on_form_ready={(methods) => {
        formMethodsRef.current = methods;
      }}
    />
  );
}
```

## License

MIT

## Repository

https://github.com/pub12/hazo_data_forms
