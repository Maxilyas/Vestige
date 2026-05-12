// Helpers couleur partagés par les visuels d'ennemis.

export function eclaircir(c, f) {
    const r = (c >> 16) & 0xff, g = (c >> 8) & 0xff, b = c & 0xff;
    const k = (x) => Math.min(255, Math.round(x + (255 - x) * f));
    return (k(r) << 16) | (k(g) << 8) | k(b);
}

export function assombrir(c, f) {
    const r = (c >> 16) & 0xff, g = (c >> 8) & 0xff, b = c & 0xff;
    const k = (x) => Math.max(0, Math.round(x * (1 - f)));
    return (k(r) << 16) | (k(g) << 8) | k(b);
}
