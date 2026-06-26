/**
 * Kopiuje tekst do schowka. Używa Clipboard API, z fallbackiem na execCommand.
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
    if (!text) return false;

    try {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);

            return true;
        }
    } catch (error) {
        console.error(error);
    }

    try {
        const textarea = document.createElement('textarea');

        textarea.value = text;
        textarea.setAttribute('readonly', 'true');
        textarea.className = 'fixed left-0 top-0 opacity-0 pointer-events-none';
        document.body.appendChild(textarea);
        textarea.select();
        textarea.setSelectionRange(0, textarea.value.length);
        const isCopied = document.execCommand('copy');

        document.body.removeChild(textarea);

        return isCopied;
    } catch {
        return false;
    }
}
