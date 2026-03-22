export type DateFormatVariant = 'short' | 'long' | 'relative';

export function formatDate(
    dateInput: Date | string | number,
    variant: DateFormatVariant = 'short',
): string {
    if (!dateInput) return '';

    const date = new Date(dateInput);

    if (Number.isNaN(date.getTime())) return '';

    if (variant === 'relative') {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Now';

        if (diffMins < 60) return `${diffMins} min ago`;

        if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hrs ago`;

        return date.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year:
                date.getFullYear() !== now.getFullYear()
                    ? 'numeric'
                    : undefined,
        });
    }

    const options: Intl.DateTimeFormatOptions =
        variant === 'long'
            ? {
                  year: 'numeric',
                  month: 'long',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
              }
            : { year: 'numeric', month: '2-digit', day: '2-digit' };

    return new Intl.DateTimeFormat('en-US', options).format(date);
}
