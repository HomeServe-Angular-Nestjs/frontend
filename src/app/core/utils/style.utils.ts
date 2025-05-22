export function getColorFromChar(char: string): string {
    const charCode = char.toUpperCase().charCodeAt(0);
    const hue = (charCode - 65) * 14;
    return `hsl(${hue}, 70%, 50%)`;
}