export interface ExportProgress {
    exportId: string;
    status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
    progress?: {
        total: number;
        processed: number;
        percentage: number;
        etaSeconds: number | null;
    };
    downloadUrl?: string;
    fileSize?: number;
    timestamp: string;
    error?: string;
}