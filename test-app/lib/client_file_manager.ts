/**
 * Client-side file manager adapter for test-app
 * Implements HazoFileManagerInstance by calling API routes
 * since hazo_files' FileManager uses Node.js fs module (server-only)
 */
import type { HazoFileManagerInstance } from "hazo_data_forms";

export function create_client_file_manager(): HazoFileManagerInstance {
  return {
    async uploadFile(
      source: Buffer | Uint8Array | string,
      remotePath: string,
      options?: { overwrite?: boolean }
    ) {
      try {
        const form_data = new FormData();

        // Convert source to Blob
        let blob: Blob;
        if (source instanceof Uint8Array) {
          blob = new Blob([new Uint8Array(source)]);
        } else if (typeof source === "string") {
          blob = new Blob([source]);
        } else {
          // Buffer or other - convert to Uint8Array first
          blob = new Blob([new Uint8Array(source as ArrayBuffer)]);
        }

        form_data.append("file", blob, remotePath.split("/").pop() || "file");
        form_data.append("remote_path", remotePath);
        if (options?.overwrite) {
          form_data.append("overwrite", "true");
        }

        const response = await fetch("/api/files/upload", {
          method: "POST",
          body: form_data,
        });

        return await response.json();
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Upload failed",
        };
      }
    },

    async downloadFile(remotePath: string) {
      try {
        const response = await fetch(`/api/files/download?path=${encodeURIComponent(remotePath)}`);
        if (!response.ok) {
          return { success: false, error: `Download failed: ${response.statusText}` };
        }
        const buffer = await response.arrayBuffer();
        return { success: true, data: new Uint8Array(buffer) };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Download failed",
        };
      }
    },

    async deleteFile(path: string) {
      try {
        const response = await fetch(`/api/files/delete`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path }),
        });
        return await response.json();
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Delete failed",
        };
      }
    },

    isInitialized() {
      return true; // Client adapter is always ready
    },

    async exists(path: string) {
      try {
        const response = await fetch(`/api/files/exists?path=${encodeURIComponent(path)}`);
        const result = await response.json();
        return result.exists === true;
      } catch {
        return false;
      }
    },

    async ensureDirectory(path: string) {
      try {
        const response = await fetch("/api/files/ensure-dir", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path }),
        });
        return await response.json();
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to ensure directory",
        };
      }
    },
  };
}
