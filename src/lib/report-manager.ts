/**
 * Report management utility for collecting and processing game session reports
 */

import { Logger } from "./logger";

export type ReportUpdaterFn = (report: any) => any;

export interface ReportManager {
  getReports(): object[];
  saveReport(report: any): void;
  collectReport(initialReport?: any): any;
  addReportUpdater(fn: ReportUpdaterFn): () => void;
  clearReports(): void;
  getReportCount(): number;
}

/**
 * Create a report manager instance
 */
export function createReportManager(logger: Logger): ReportManager {
  const reports: object[] = [];
  const reportUpdaters: ReportUpdaterFn[] = [];

  return {
    /**
     * Get all stored session reports
     */
    getReports(): object[] {
      return reports;
    },

    /**
     * Save a report to the reports history
     */
    saveReport(report: any): void {
      reports.push(report);
    },

    /**
     * Collect a report from the session
     * Triggers report update to collect data from updaters
     */
    collectReport(initialReport = {}): any {
      let finalReport = { ...initialReport };

      for (const updater of reportUpdaters) {
        try {
          const updates = updater(finalReport);
          if (updates && typeof updates === "object") {
            Object.assign(finalReport, updates);
          }
        } catch (error) {
          logger.warn("Error in report updater:", error);
        }
      }

      return finalReport;
    },

    /**
     * Register a function to update the report when collectReport is called
     */
    addReportUpdater(fn: ReportUpdaterFn): () => void {
      reportUpdaters.push(fn);

      // Return a function to remove this updater
      return () => {
        const index = reportUpdaters.indexOf(fn);
        if (index > -1) {
          reportUpdaters.splice(index, 1);
        }
      };
    },

    /**
     * Clear all stored reports
     */
    clearReports(): void {
      reports.length = 0;
    },

    /**
     * Get the total number of stored reports
     */
    getReportCount(): number {
      return reports.length;
    },
  };
}

/**
 * Report utilities for common operations
 */
export const reportUtils = {
  /**
   * Merge multiple reports into one
   */
  mergeReports(...reports: any[]): any {
    return Object.assign({}, ...reports);
  },

  /**
   * Extract specific fields from a report
   */
  extractFields(report: any, fields: string[]): any {
    const extracted: any = {};
    for (const field of fields) {
      if (field in report) {
        extracted[field] = report[field];
      }
    }
    return extracted;
  },

  /**
   * Calculate averages from multiple reports
   */
  calculateAverages(reports: any[], numericFields: string[]): any {
    if (reports.length === 0) return {};

    const averages: any = {};

    for (const field of numericFields) {
      const values = reports.map((report) => report[field]).filter((value) => typeof value === "number");

      if (values.length > 0) {
        averages[`${field}_avg`] = values.reduce((sum, val) => sum + val, 0) / values.length;
      }
    }

    return averages;
  },

  /**
   * Get summary statistics from reports
   */
  getSummaryStats(reports: any[]): any {
    return {
      totalReports: reports.length,
      firstReportTime: reports.length > 0 ? reports[0].timestamp : null,
      lastReportTime: reports.length > 0 ? reports[reports.length - 1].timestamp : null,
    };
  },
};
