export default function getFormattedDate(dateString: string): string {
    return new Intl.DateTimeFormat('bg-BG', { dateStyle: 'long' }).format(new Date(dateString))
}