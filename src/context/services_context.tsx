"use client";

import * as React from "react";
import type { FileManager as HazoFilesFileManager } from "hazo_files";

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Logger interface (matches hazo_pdf's Logger interface)
 * Compatible with hazo_logs package
 */
export interface Logger {
  info: (message: string, data?: Record<string, unknown>) => void;
  debug: (message: string, data?: Record<string, unknown>) => void;
  warn: (message: string, data?: Record<string, unknown>) => void;
  error: (message: string, data?: Record<string, unknown>) => void;
}

/**
 * Database connection interface for hazo_connect
 * Consumers pass their own hazo_connect instance
 */
export interface HazoConnectInstance {
  /** Execute a query and return results */
  query: <T = unknown>(sql: string, params?: unknown[]) => Promise<T[]>;
  /** Execute a statement (INSERT, UPDATE, DELETE) */
  execute: (sql: string, params?: unknown[]) => Promise<{ affected_rows: number }>;
}

/**
 * Services that can be injected into hazo_data_forms
 */
export interface HazoServices {
  /** Database connection from hazo_connect */
  db?: HazoConnectInstance;
  /** Logger from hazo_logs (compatible with hazo_pdf's Logger) */
  logger?: Logger;
  /** File manager from hazo_files */
  file_manager: HazoFilesFileManager;
  /** Custom services for extensibility */
  custom?: Record<string, unknown>;
}

/**
 * Props for HazoServicesProvider
 */
export interface HazoServicesProviderProps {
  /** Services to provide to all child components */
  services?: HazoServices;
  /** Child components */
  children: React.ReactNode;
}

// ============================================================================
// Context
// ============================================================================

const HazoServicesContext = React.createContext<HazoServices | undefined>(undefined);

// ============================================================================
// Provider
// ============================================================================

/**
 * Provider component for injecting services into hazo_data_forms
 *
 * Usage:
 * ```tsx
 * // App-wide services (recommended - in layout.tsx)
 * import { HazoServicesProvider } from "hazo_data_forms";
 * import { db } from "./db";
 * import { logger } from "./logger";
 *
 * export default function Layout({ children }) {
 *   return (
 *     <HazoServicesProvider services={{ db, logger }}>
 *       {children}
 *     </HazoServicesProvider>
 *   );
 * }
 * ```
 */
export function HazoServicesProvider({
  services,
  children,
}: HazoServicesProviderProps): React.ReactElement {
  // Memoize services to prevent unnecessary re-renders
  const memoized_services = React.useMemo(() => services, [services]);

  return (
    <HazoServicesContext.Provider value={memoized_services}>
      {children}
    </HazoServicesContext.Provider>
  );
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook to access all injected services
 *
 * Usage:
 * ```tsx
 * import { useHazoServices } from "hazo_data_forms";
 *
 * function MyComponent() {
 *   const services = useHazoServices();
 *   // Access services.db, services.logger, services.custom
 * }
 * ```
 */
export function useHazoServices(): HazoServices | undefined {
  return React.useContext(HazoServicesContext);
}

/**
 * Hook to access the logger service
 * Returns undefined if no logger was provided
 *
 * Usage:
 * ```tsx
 * import { useHazoLogger } from "hazo_data_forms";
 *
 * function MyComponent() {
 *   const logger = useHazoLogger();
 *   logger?.info("Component mounted");
 * }
 * ```
 */
export function useHazoLogger(): Logger | undefined {
  const services = React.useContext(HazoServicesContext);
  return services?.logger;
}

/**
 * Hook to access the database service
 * Returns undefined if no database was provided
 *
 * Usage:
 * ```tsx
 * import { useHazoDb } from "hazo_data_forms";
 *
 * function MyComponent() {
 *   const db = useHazoDb();
 *   // Query database
 *   const data = await db?.query("SELECT * FROM users");
 * }
 * ```
 */
export function useHazoDb(): HazoConnectInstance | undefined {
  const services = React.useContext(HazoServicesContext);
  return services?.db;
}

/**
 * Hook to access a custom service by key
 *
 * Usage:
 * ```tsx
 * import { useHazoCustomService } from "hazo_data_forms";
 *
 * function MyComponent() {
 *   const myService = useHazoCustomService<MyService>("my_service");
 * }
 * ```
 */
export function useHazoCustomService<T>(key: string): T | undefined {
  const services = React.useContext(HazoServicesContext);
  return services?.custom?.[key] as T | undefined;
}

/**
 * Hook to access the file manager service
 * Returns undefined if no file manager was provided
 *
 * Usage:
 * ```tsx
 * import { useHazoFileManager } from "hazo_data_forms";
 *
 * function MyComponent() {
 *   const file_manager = useHazoFileManager();
 *   if (file_manager?.isInitialized()) {
 *     await file_manager.uploadFile(data, "/path/to/file.pdf");
 *   }
 * }
 * ```
 */
export function useHazoFileManager(): HazoFilesFileManager | undefined {
  const services = React.useContext(HazoServicesContext);
  return services?.file_manager;
}
