export function sum(...args: number[]): number {
    return args.reduce((a: number, b: number) => a + b, 0);
}

export function shift(str: string): string {
    return [...str].map((e: string) => String.fromCharCode(e.charCodeAt(0) + 1)).join("");
}
