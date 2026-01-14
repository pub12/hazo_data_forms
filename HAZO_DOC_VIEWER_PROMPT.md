# hazo_pdf Enhancement - Technical Requirements Document

## Executive Summary

**Package**: `hazo_pdf` (existing package at `/Users/pubs/Local/01.code/00.lib/hazo_pdf`)

**Objective**: Extend hazo_pdf from a single-PDF viewer/annotator to a full file manager with multi-file support, file uploads, and automatic PDF conversion for non-PDF files.

**Constraint**: All new features must be opt-in. Existing consumers using hazo_pdf as a simple PDF viewer must continue working without changes.

---

## Current Architecture Reference

### Package Overview
- **Version**: 1.3.0
- **Core Tech**: pdfjs-dist (rendering), pdf-lib (annotation embedding)
- **Config**: INI-based via `hazo_pdf_config.ini`
- **Build**: tsup (TypeScript bundler)

### Component Hierarchy (Current)
```
PdfViewer (orchestrator)
├── Toolbar (zoom, annotations, save)
├── PdfViewerLayout
│   ├── PdfPageRenderer (per page)
│   └── AnnotationOverlay (SVG layer)
├── MetadataSidepanel (retractable)
├── TextAnnotationDialog (FreeText editing)
└── ContextMenu (right-click actions)
```

### Key Files
| File | Purpose |
|------|---------|
| `src/components/pdf_viewer/pdf_viewer.tsx` | Main orchestrator, state management |
| `src/components/pdf_viewer/pdf_viewer_layout.tsx` | Page layout and scroll container |
| `src/components/pdf_viewer/pdf_page_renderer.tsx` | Canvas rendering per page |
| `src/components/pdf_viewer/annotation_overlay.tsx` | SVG annotation layer |
| `src/utils/pdf_saver.ts` | PDF save/download with embedded annotations |
| `src/utils/config_loader.ts` | INI config loading (sync/async) |
| `src/config/default_config.ts` | Default configuration values |
| `config/hazo_pdf_config.ini` | User configuration file |

### Current Props Interface (PdfViewerProps)
```typescript
interface PdfViewerProps {
  url: string;                    // PDF URL to load
  className?: string;
  default_scale?: number | "page-width" | "page-fit" | "auto";
  annotations?: PdfAnnotation[];
  on_annotation_create?: (annotation: PdfAnnotation) => void;
  on_annotation_update?: (annotation: PdfAnnotation) => void;
  on_annotation_delete?: (id: string) => void;
  on_save?: (pdf_bytes: Uint8Array, filename: string) => void;
  on_error?: (error: Error) => void;
  metadata?: MetadataInput;
  config_file?: string;
  // ... toolbar visibility props
}
```

### Current Config Sections
```ini
[fonts]           # FreeText font settings
[highlight_annotation]
[square_annotation]
[freetext_annotation]
[page_styling]    # PDF page borders/shadows
[viewer]          # Background, timestamps
[context_menu]    # Right-click menu
[dialog]          # Modal dialogs
[toolbar]         # Toolbar visibility
```

---

## New Features Specification

### Feature 1: Multi-File Support

**Purpose**: Allow hazo_pdf to manage multiple files, not just a single PDF.

**Technical Approach**:
- New `files` prop accepting array of file items
- Internal state for selected file index
- File list UI component (horizontal tabs)
- Selected file renders in existing PdfViewer

**New Props**:
```typescript
interface PdfViewerProps {
  // Existing single-file mode
  url?: string;

  // New multi-file mode (mutually exclusive with url)
  files?: FileItem[];
  on_file_select?: (file: FileItem, index: number) => void;

  // File manager features (only when files provided)
  enable_file_list?: boolean;        // Show file list UI
  enable_file_upload?: boolean;      // Allow uploads
  enable_file_delete?: boolean;      // Allow deletion
}

interface FileItem {
  id: string;
  filename: string;
  url: string;
  type: "pdf" | "image" | "document" | "other";
  source: "provided" | "uploaded";
  file_id?: string;  // For uploaded files
  page?: number;     // Starting page for PDFs
}
```

**Backward Compatibility**:
- If `url` prop provided (current usage), behave exactly as today
- Multi-file mode only activates when `files` prop is provided
- All file manager UI hidden by default

**Component Changes**:
- New `FileList` component (horizontal scrollable)
- New `FileListItem` sub-component
- PdfViewer conditionally renders FileList above viewer

**Refactoring Opportunity**:
- Extract PDF loading logic into reusable hook `usePdfDocument(url)`
- Current implementation mixes loading with rendering

---

### Feature 2: File List UI

**Purpose**: Display and navigate between multiple files.

**Technical Specification**:

**Layout**:
```
┌──────────────────────────────────────────────────────────┐
│ [📄 file1.pdf] [🖼 image.png] [📄 report.pdf] [+ Add]    │  ← FileList
├──────────────────────────────────────────────────────────┤
│                                                          │
│                    PDF Viewer Area                       │  ← Existing
│                    (current implementation)              │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**File List Component**:
```typescript
interface FileListProps {
  files: FileItem[];
  selected_index: number;
  on_select: (index: number) => void;
  on_delete?: (file_id: string) => Promise<boolean>;
  on_add_click?: () => void;
  config: PdfViewerConfig;
  show_add_button?: boolean;
  drag_drop_enabled?: boolean;
}
```

**File Type Icons** (react-icons/fa):
| Type | Icon |
|------|------|
| pdf | `FaFilePdf` |
| image | `FaFileImage` |
| document | `FaFileWord` |
| other | `FaFile` |

**Interactions**:
- Click file → select and load
- Hover uploaded file → show delete button
- Click delete → confirmation dialog → remove
- Drag files → trigger upload flow

**CSS Classes**: `cls_file_list`, `cls_file_list_item`, `cls_file_delete_btn`

**Refactoring Opportunity**:
- Consider virtualization for 50+ files (react-window)
- Current design assumes <20 files typical

---

### Feature 3: File Upload with Dropzone

**Purpose**: Allow users to add files via drag-and-drop or click.

**Technical Specification**:

**Upload Flow**:
1. User drags files OR clicks "Add file" button
2. Validation runs (type, size, count)
3. **If non-PDF**: Route through PDF conversion module
4. **If PDF**: Pass directly to upload handler
5. Upload handler (provided by consumer) stores file
6. New FileItem added to files array

**New Props**:
```typescript
interface PdfViewerProps {
  // Upload handling
  on_upload?: (files: File[], converted_pdfs: ConvertedPdf[]) => Promise<UploadResult[]>;
  on_delete?: (file_id: string) => Promise<boolean>;

  // Upload config (can also be in INI)
  allowed_types?: string[];      // MIME patterns
  max_file_size?: number;        // Bytes
  max_files?: number;            // Total limit
  convert_to_pdf?: boolean;      // Enable conversion
}

interface ConvertedPdf {
  original_file: File;
  pdf_bytes: Uint8Array;
  pdf_filename: string;
}

interface UploadResult {
  success: boolean;
  file_item?: FileItem;
  error?: string;
}
```

**Dropzone Behavior**:
- Dropzone overlay appears when dragging over file list area
- Visual feedback: blue dashed border, "Drop files here" text
- Accepts multiple files
- Rejects invalid files with specific error messages

**Progress Tracking**:
```typescript
interface UploadProgress {
  filename: string;
  status: "converting" | "uploading" | "success" | "error";
  progress: number;  // 0-100
  error?: string;
}
```

**CSS Classes**: `cls_dropzone_overlay`, `cls_upload_progress`

**Refactoring Opportunity**:
- Current hazo_pdf has no drag-drop handling
- Consider using react-dropzone library vs custom implementation
- Custom gives more control, library gives accessibility features

---

### Feature 4: PDF Conversion Module

**Purpose**: Convert non-PDF files to PDF format before upload.

**Critical Requirement**: This module must be **completely independent** and testable outside of any React component.

**Module Location**: `src/utils/pdf_converter.ts`

**Public API**:
```typescript
/**
 * Convert a file to PDF format
 * @param file - The file to convert
 * @param options - Conversion options
 * @returns PDF bytes and metadata
 */
export async function convert_to_pdf(
  file: File,
  options?: ConversionOptions
): Promise<ConversionResult>;

/**
 * Check if a file type is convertible
 */
export function is_convertible(mime_type: string): boolean;

/**
 * Get supported conversion types
 */
export function get_supported_types(): string[];

interface ConversionOptions {
  page_size?: "a4" | "letter" | "original";  // PDF page size
  image_quality?: number;                     // 0-100 for images
  image_fit?: "contain" | "cover" | "stretch";
  margin?: number;                            // Points
}

interface ConversionResult {
  success: boolean;
  pdf_bytes?: Uint8Array;
  filename?: string;          // Original name with .pdf extension
  page_count?: number;
  error?: string;
  warnings?: string[];        // Non-fatal issues
}
```

**Supported Conversions**:

| Input Type | Conversion Method | Notes |
|------------|-------------------|-------|
| JPEG/PNG/GIF/WebP | Embed in PDF page | Use pdf-lib |
| TIFF | Convert to PNG, then embed | May need canvas |
| SVG | Render to canvas, embed | Limited support |
| Plain text | Render as text PDF | Use pdf-lib |

**Implementation Strategy**:
```typescript
// pdf_converter.ts
import { PDFDocument, PDFPage } from "pdf-lib";

export async function convert_to_pdf(
  file: File,
  options: ConversionOptions = {}
): Promise<ConversionResult> {
  const mime = file.type;

  if (mime.startsWith("image/")) {
    return convert_image_to_pdf(file, options);
  }

  if (mime === "text/plain") {
    return convert_text_to_pdf(file, options);
  }

  return {
    success: false,
    error: `Unsupported file type: ${mime}`,
  };
}

async function convert_image_to_pdf(
  file: File,
  options: ConversionOptions
): Promise<ConversionResult> {
  // 1. Read file as ArrayBuffer
  // 2. Create new PDFDocument
  // 3. Embed image (embedJpg, embedPng)
  // 4. Add page with image dimensions
  // 5. Return PDF bytes
}
```

**Testing Strategy**:
```typescript
// pdf_converter.test.ts
describe("convert_to_pdf", () => {
  it("converts JPEG to single-page PDF", async () => {
    const jpeg_file = new File([jpeg_bytes], "test.jpg", { type: "image/jpeg" });
    const result = await convert_to_pdf(jpeg_file);

    expect(result.success).toBe(true);
    expect(result.page_count).toBe(1);
    expect(result.pdf_bytes).toBeDefined();
  });

  it("rejects unsupported types", async () => {
    const exe_file = new File([bytes], "app.exe", { type: "application/octet-stream" });
    const result = await convert_to_pdf(exe_file);

    expect(result.success).toBe(false);
    expect(result.error).toContain("Unsupported");
  });

  it("handles corrupted images gracefully", async () => {
    const bad_file = new File([garbage_bytes], "bad.jpg", { type: "image/jpeg" });
    const result = await convert_to_pdf(bad_file);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
```

**Refactoring Opportunity**:
- pdf-lib already used in hazo_pdf for annotation embedding
- Reuse existing pdf-lib import, no new dependencies
- Consider Web Worker for large image conversion (off main thread)
- Consider WASM-based converters for Office documents (future)

---

### Feature 5: File Manager Button with Badge

**Purpose**: Compact trigger showing file count at a glance.

**Technical Specification**:

**Component**:
```typescript
interface FileManagerButtonProps {
  file_count: number;
  has_files: boolean;
  on_click: () => void;
  disabled?: boolean;
  config: PdfViewerConfig;
  tooltip?: string;
}
```

**Behavior**:
- Icon: `FaFileUpload` (no files) or `FaFileAlt` (has files)
- Badge: Shows count, "9+" for >9
- Colors: Configurable via INI
- Tooltip: "X files attached" or "No files"

**Integration Options**:
```typescript
// Option 1: Standalone export
import { FileManagerButton } from "hazo_pdf";

// Option 2: Part of PdfViewer
<PdfViewer
  files={files}
  render_trigger={(props) => <FileManagerButton {...props} />}
/>
```

**CSS Classes**: `cls_file_manager_btn`, `cls_file_count_badge`

---

### Feature 6: Display Modes

**Purpose**: Render file manager in different layout contexts.

**Modes**:

| Mode | Description | Use Case |
|------|-------------|----------|
| `embedded` | Renders inline (current behavior) | Split panes, panels |
| `dialog` | Renders in modal | Action-triggered viewing |
| `standalone` | Full page component | Dedicated viewer pages |

**Implementation**:
```typescript
interface PdfViewerProps {
  display_mode?: "embedded" | "dialog" | "standalone";

  // Dialog-specific
  dialog_open?: boolean;
  on_dialog_close?: () => void;
  dialog_title?: string;
}
```

**Dialog Wrapper**:
```typescript
// New component: PdfViewerDialog
export function PdfViewerDialog({
  open,
  on_close,
  title,
  ...viewer_props
}: PdfViewerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && on_close?.()}>
      <DialogContent className="cls_pdf_viewer_dialog">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <PdfViewer {...viewer_props} display_mode="embedded" />
      </DialogContent>
    </Dialog>
  );
}
```

**Backward Compatibility**:
- Default `display_mode` is `"embedded"` (current behavior)
- Dialog requires explicit `dialog_open` prop

---

### Feature 7: Popout to New Tab

**Purpose**: Open viewer in dedicated browser tab for full-screen review.

**Technical Approach**:
- Popout button in toolbar (when multi-file mode enabled)
- Context passed via sessionStorage
- Consumer provides popout page route

**Props**:
```typescript
interface PdfViewerProps {
  enable_popout?: boolean;
  on_popout?: (context: PopoutContext) => void;
}

interface PopoutContext {
  files: FileItem[];
  selected_index: number;
  // Serializable subset of state
}
```

**Consumer Implementation**:
```typescript
// In PdfViewer usage
on_popout={(context) => {
  sessionStorage.setItem("pdf_viewer_context", JSON.stringify(context));
  window.open("/pdf-viewer", "_blank");
}}

// In /pdf-viewer route
const context = JSON.parse(sessionStorage.getItem("pdf_viewer_context"));
<PdfViewer files={context.files} initial_index={context.selected_index} />
```

**Refactoring Opportunity**:
- Consider URL-based state (query params) as alternative to sessionStorage
- sessionStorage doesn't persist across browser restart
- URL approach enables bookmarking/sharing

---

## Configuration Changes

### New INI Sections

```ini
; =============================================================================
; [file_manager] - Multi-file management settings
; =============================================================================
[file_manager]

; Enable multi-file UI (requires files prop)
; Default: false
enabled = false

; Show file list above viewer
; Default: true (when enabled)
show_file_list = true

; Allow file deletion
; Default: true
allow_delete = true

; Show popout button
; Default: true
show_popout_button = true

; File list height
; Default: auto
file_list_height = auto

; Selected file highlight color
; Default: #3b82f6
selected_color = #3b82f6


; =============================================================================
; [file_upload] - File upload settings
; =============================================================================
[file_upload]

; Enable drag-and-drop upload
; Default: false
enabled = false

; Allowed MIME types (comma-separated)
; Default: application/pdf,image/*
allowed_types = application/pdf,image/*

; Max file size in bytes (10MB default)
; Default: 10485760
max_file_size = 10485760

; Max total files
; Default: 20
max_files = 20

; Show "Add file" button
; Default: true
show_add_button = true


; =============================================================================
; [pdf_conversion] - Auto-convert non-PDFs to PDF
; =============================================================================
[pdf_conversion]

; Enable automatic conversion
; Default: true (when file_upload enabled)
enabled = true

; Page size for converted PDFs
; Options: a4, letter, original
; Default: a4
page_size = a4

; Image quality (1-100) for JPEG conversion
; Default: 90
image_quality = 90

; How images fit on page
; Options: contain, cover, stretch
; Default: contain
image_fit = contain

; Page margins in points
; Default: 36 (0.5 inch)
margin = 36


; =============================================================================
; [file_button] - File manager button styling
; =============================================================================
[file_button]

; Icon size in pixels
; Default: 20
icon_size = 20

; Icon color (no files)
; Default: #6b7280
icon_color = #6b7280

; Icon color (hover)
; Default: #3b82f6
icon_color_hover = #3b82f6

; Icon color (has files)
; Default: #3b82f6
icon_color_with_files = #3b82f6

; Badge background
; Default: #3b82f6
badge_background = #3b82f6

; Badge text color
; Default: #ffffff
badge_text_color = #ffffff
```

### Config Type Updates

```typescript
// src/types/config.ts

interface PdfViewerConfig {
  // ... existing sections ...

  file_manager: {
    enabled: boolean;
    show_file_list: boolean;
    allow_delete: boolean;
    show_popout_button: boolean;
    file_list_height: string;
    selected_color: string;
  };

  file_upload: {
    enabled: boolean;
    allowed_types: string[];
    max_file_size: number;
    max_files: number;
    show_add_button: boolean;
  };

  pdf_conversion: {
    enabled: boolean;
    page_size: "a4" | "letter" | "original";
    image_quality: number;
    image_fit: "contain" | "cover" | "stretch";
    margin: number;
  };

  file_button: {
    icon_size: number;
    icon_color: string;
    icon_color_hover: string;
    icon_color_with_files: string;
    badge_background: string;
    badge_text_color: string;
  };
}
```

---

## Backward Compatibility Requirements

### Scenario 1: Existing Single-PDF Usage
```typescript
// This must continue working exactly as before
<PdfViewer
  url="/documents/contract.pdf"
  on_save={handleSave}
  annotations={annotations}
/>
```
**Guarantee**: No visible changes, no new UI elements, identical behavior.

### Scenario 2: Opt-in Multi-File
```typescript
// New multi-file mode - explicit opt-in
<PdfViewer
  files={fileItems}
  enable_file_list={true}
  enable_file_upload={true}
  on_upload={handleUpload}
/>
```
**Behavior**: File list appears, drag-drop enabled, full file manager features.

### Scenario 3: INI-Based Defaults
```ini
[file_manager]
enabled = true
```
**Behavior**: If `files` prop provided AND INI enabled, show file manager UI.

### Breaking Change Prevention
- New props have `undefined` defaults (feature disabled)
- INI sections have `enabled = false` defaults
- No behavioral changes without explicit opt-in
- Type additions are non-breaking (optional properties)

---

## New File Structure

```
src/
├── components/
│   ├── pdf_viewer/
│   │   ├── pdf_viewer.tsx          # Updated: conditional file manager
│   │   ├── pdf_viewer_layout.tsx   # Unchanged
│   │   ├── pdf_page_renderer.tsx   # Unchanged
│   │   ├── annotation_overlay.tsx  # Unchanged
│   │   └── ...existing files...
│   │
│   ├── file_manager/               # NEW DIRECTORY
│   │   ├── index.tsx               # FileManager component
│   │   ├── file_list.tsx           # Horizontal file list
│   │   ├── file_list_item.tsx      # Individual file item
│   │   ├── file_manager_button.tsx # Trigger button with badge
│   │   ├── upload_dropzone.tsx     # Drag-and-drop zone
│   │   ├── upload_progress.tsx     # Progress display
│   │   └── types.ts                # File manager types
│   │
│   └── ui/                         # Shared UI components
│       └── ...existing...
│
├── utils/
│   ├── pdf_converter.ts            # NEW: PDF conversion module
│   ├── pdf_converter.test.ts       # NEW: Conversion tests
│   ├── pdf_saver.ts                # Existing
│   ├── config_loader.ts            # Updated: new sections
│   └── ...existing...
│
└── types/
    ├── index.ts                    # Updated: new types
    └── config.ts                   # Updated: new config sections
```

---

## Implementation Phases

### Phase 1: PDF Conversion Module (Independent)
1. Create `src/utils/pdf_converter.ts`
2. Implement `convert_to_pdf()` for images
3. Implement `is_convertible()` and `get_supported_types()`
4. Write comprehensive tests
5. **Deliverable**: Standalone, tested conversion module

### Phase 2: File Manager Types & Config
1. Add new types to `src/types/index.ts`
2. Add new config sections to `src/types/config.ts`
3. Update `src/config/default_config.ts`
4. Update `src/utils/config_loader.ts`
5. Update `config/hazo_pdf_config.ini`
6. **Deliverable**: Type-safe config system for new features

### Phase 3: File List Component
1. Create `src/components/file_manager/file_list.tsx`
2. Create `src/components/file_manager/file_list_item.tsx`
3. Implement selection, icons, delete button
4. **Deliverable**: File list UI component

### Phase 4: Upload & Dropzone
1. Create `src/components/file_manager/upload_dropzone.tsx`
2. Create `src/components/file_manager/upload_progress.tsx`
3. Integrate with PDF conversion module
4. **Deliverable**: Upload flow with conversion

### Phase 5: File Manager Button
1. Create `src/components/file_manager/file_manager_button.tsx`
2. Implement icon states, badge, tooltip
3. **Deliverable**: Standalone trigger component

### Phase 6: Integration
1. Update `PdfViewer` to conditionally render file manager
2. Add new props to `PdfViewerProps`
3. Wire up all components
4. **Deliverable**: Integrated multi-file viewer

### Phase 7: Dialog & Popout
1. Create `PdfViewerDialog` wrapper
2. Implement popout functionality
3. **Deliverable**: Display mode options

### Phase 8: Testing & Documentation
1. Update Storybook stories
2. Update README.md
3. Update test-app with new scenarios
4. **Deliverable**: Complete documentation

---

## Improvement & Refactoring Opportunities

### 1. PDF Loading Hook
**Current**: PDF loading mixed into PdfViewer component
**Improvement**: Extract to `usePdfDocument(url)` hook
**Benefit**: Reusable, testable, cleaner component

### 2. State Management
**Current**: useState for all state in PdfViewer
**Improvement**: Consider useReducer for complex state
**Benefit**: Easier to track state transitions, undo/redo

### 3. Coordinate System
**Current**: Manual coordinate conversion scattered
**Improvement**: Centralize in coordinate service
**Benefit**: Single source of truth, easier debugging

### 4. Error Boundaries
**Current**: try/catch in various places
**Improvement**: React Error Boundary at viewer level
**Benefit**: Graceful degradation, better UX

### 5. Virtualization
**Current**: All pages rendered
**Improvement**: Virtualize for large PDFs (>50 pages)
**Benefit**: Memory efficiency, faster rendering

### 6. Web Workers
**Current**: PDF parsing on main thread
**Improvement**: Already uses pdfjs worker, extend to conversion
**Benefit**: Non-blocking UI during heavy operations

### 7. Caching
**Current**: No caching of loaded PDFs
**Improvement**: Cache converted PDFs, recently viewed files
**Benefit**: Faster switching, reduced network

### 8. Accessibility
**Current**: Basic accessibility
**Improvement**: Full keyboard navigation, ARIA labels
**Benefit**: Broader user support, compliance

### 9. Testing Coverage
**Current**: Manual testing via test-app
**Improvement**: Unit tests for utilities, integration tests
**Benefit**: Regression prevention, confidence

### 10. Bundle Optimization
**Current**: All components in main bundle
**Improvement**: Lazy load file manager components
**Benefit**: Smaller initial bundle for PDF-only users

---

## Testing Strategy

### Unit Tests
- `pdf_converter.ts`: All conversion functions
- `config_loader.ts`: INI parsing with new sections
- Utility functions

### Component Tests
- FileList: Selection, deletion, keyboard nav
- FileManagerButton: States, badge rendering
- UploadDropzone: Drag events, validation

### Integration Tests
- Full upload flow: drop → convert → upload → display
- Mode switching: single-file ↔ multi-file
- Config loading: INI → component behavior

### Manual Test Scenarios
| Scenario | Steps | Expected |
|----------|-------|----------|
| Single PDF (existing) | Load with `url` prop | Unchanged behavior |
| Multi-file view | Load with `files` prop | File list + viewer |
| Image upload | Drag JPG onto dropzone | Converts to PDF, displays |
| Large PDF | Load 100+ page PDF | Renders without freeze |
| Invalid upload | Drag .exe file | Rejection with error |
| Delete file | Click delete on uploaded | Confirmation, removal |

---

## Dependencies

### Existing (No Changes)
- `pdfjs-dist` - PDF rendering
- `pdf-lib` - PDF manipulation (also for conversion)
- `hazo_config` - Config loading (optional)
- `@radix-ui/*` - Dialog, tooltip
- `lucide-react` - Icons

### New
- `react-icons` - File type icons (FaFilePdf, FaFileImage, etc.)

### Optional Future
- `react-dropzone` - Enhanced drag-drop (accessibility)
- `react-window` - Virtualization for large file lists

---

## Success Criteria

### Backward Compatibility
- [ ] Existing `<PdfViewer url="..." />` works identically
- [ ] No console warnings/errors for existing usage
- [ ] No visual changes without opt-in

### New Features
- [ ] Multi-file selection works
- [ ] File upload with conversion works
- [ ] File deletion with confirmation works
- [ ] Badge shows correct count
- [ ] All features configurable via INI

### Performance
- [ ] PDF conversion <2s for typical image
- [ ] File list handles 50+ files without lag
- [ ] No memory leaks on file switching

### Code Quality
- [ ] PDF converter has >90% test coverage
- [ ] All new types documented
- [ ] Storybook stories for all components
