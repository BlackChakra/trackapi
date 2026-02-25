type LogLevel = 'info' | 'warn' | 'error';

interface LogEntry {
    timestamp: string;
    level: LogLevel;
    context: string;
    message: string;
    data?: unknown;
}

function formatEntry(entry: LogEntry): string {
    const base = `[${entry.timestamp}] ${entry.level.toUpperCase()} [${entry.context}] ${entry.message}`;
    if (entry.data !== undefined) {
        return `${base} ${JSON.stringify(entry.data)}`;
    }
    return base;
}

function createEntry(level: LogLevel, context: string, message: string, data?: unknown): LogEntry {
    return {
        timestamp: new Date().toISOString(),
        level,
        context,
        message,
        data,
    };
}

export const logger = {
    info(context: string, message: string, data?: unknown): void {
        const entry = createEntry('info', context, message, data);
        console.log(formatEntry(entry));
    },

    warn(context: string, message: string, data?: unknown): void {
        const entry = createEntry('warn', context, message, data);
        console.warn(formatEntry(entry));
    },

    error(context: string, message: string, data?: unknown): void {
        const entry = createEntry('error', context, message, data);
        console.error(formatEntry(entry));
    },
};
