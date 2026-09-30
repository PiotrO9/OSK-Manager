export function formatPolishCount(
    count: number,
    forms: readonly [singular: string, plural: string, genitive: string],
): string {
    const absolute = Math.abs(count);
    const lastTwoDigits = absolute % 100;
    const lastDigit = absolute % 10;
    const form =
        absolute === 1
            ? forms[0]
            : lastDigit >= 2 &&
                lastDigit <= 4 &&
                !(lastTwoDigits >= 12 && lastTwoDigits <= 14)
              ? forms[1]
              : forms[2];

    return `${count} ${form}`;
}
