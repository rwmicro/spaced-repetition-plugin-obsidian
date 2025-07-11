export function formatDistanceToNow(date: Date | string): string {
    const now = new Date();
    const targetDate = typeof date === 'string' ? new Date(date) : date;
    const diffMs = targetDate.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays < -1) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays === -1) return '1 day overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays <= 7) return `In ${diffDays} days`;
    if (diffDays <= 30) return `In ${Math.floor(diffDays / 7)} weeks`;
    if (diffDays <= 365) return `In ${Math.floor(diffDays / 30)} months`;
    return `In ${Math.floor(diffDays / 365)} years`;
}