const CURTAIN_ID = 'auth-privacy-curtain';

/** Keep private content covered even when the browser restores a frozen document. */
export function showAuthPrivacyCurtain(): void {
    if (typeof document === 'undefined' || !document.body) return;

    const appRoot = document.getElementById('__nuxt');

    appRoot?.setAttribute('inert', '');

    if (document.getElementById(CURTAIN_ID)) return;

    const curtain = document.createElement('div');

    curtain.id = CURTAIN_ID;
    curtain.setAttribute('role', 'status');
    curtain.setAttribute('aria-live', 'polite');
    curtain.textContent = 'Sprawdzanie sesji…';
    document.body.append(curtain);
}

export function hideAuthPrivacyCurtain(): void {
    if (typeof document === 'undefined') return;

    document.getElementById(CURTAIN_ID)?.remove();
    document.getElementById('__nuxt')?.removeAttribute('inert');
}
