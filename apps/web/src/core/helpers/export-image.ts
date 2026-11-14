// Turning on-screen SVG (the chart wheel) into PNG files, and drawing a shareable card.
// Everything happens in the browser: nothing is uploaded anywhere.

const STYLE_PROPS = [
    'fill', 'fill-opacity', 'stroke', 'stroke-width', 'stroke-opacity', 'stroke-dasharray', 'stroke-dashoffset',
    'stroke-linecap', 'opacity', 'font-family', 'font-size', 'font-weight', 'font-style', 'text-anchor',
    'dominant-baseline', 'paint-order', 'letter-spacing', 'visibility', 'display',
];
// transform / transform-origin are not copied: SVG resolves them differently from CSS boxes. The element's own
// inline style (framer-motion transforms) is kept instead.

const fontCache = new Map<string, Promise<string>>();

const toDataUrl = (url: string) => {
    if (!fontCache.has(url)) {
        fontCache.set(url, fetch(url).then((r) => r.blob()).then((blob) => new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        })));
    }
    return fontCache.get(url)!;
};

const familyOf = (value: string) => value.split(',')[0].trim().replace(/^["']|["']$/g, '');

/** @font-face rules (same-origin sheets) for the given families, with their files inlined as data URLs. */
const embeddedFontCss = async (families: Set<string>) => {
    const rules: CSSFontFaceRule[] = [];
    for (const sheet of Array.from(document.styleSheets)) {
        let list: CSSRuleList;
        try {
            list = sheet.cssRules;
        } catch {
            continue; // cross-origin sheet
        }
        for (const rule of Array.from(list)) {
            if (rule instanceof CSSFontFaceRule && families.has(familyOf(rule.style.getPropertyValue('font-family')))) {
                rules.push(rule);
            }
        }
    }
    const css = await Promise.all(rules.map(async (rule) => {
        let text = rule.cssText;
        const urls = Array.from(text.matchAll(/url\(["']?([^"')]+)["']?\)/g)).map((m) => m[1]);
        for (const url of urls) {
            try {
                text = text.replace(url, await toDataUrl(new URL(url, document.baseURI).href));
            } catch {
                // a font that cannot be fetched just falls back to a system font
            }
        }
        return text;
    }));
    return css.join('\n');
};

/** A self-contained copy of an on-screen SVG: computed styles inlined, fonts embedded. */
export const serializeSvg = async (svg: SVGSVGElement) => {
    // The wheel draws itself in on first show: let running animations finish so the copy is complete
    await Promise.allSettled(svg.getAnimations({subtree: true}).map((a) => a.finished));
    const clone = svg.cloneNode(true) as SVGSVGElement;
    const source = [svg, ...Array.from(svg.querySelectorAll('*'))] as Element[];
    const target = [clone, ...Array.from(clone.querySelectorAll('*'))] as Element[];
    const families = new Set<string>();
    source.forEach((el, i) => {
        const cs = getComputedStyle(el);
        const own = el.getAttribute('style') ?? '';
        const style = STYLE_PROPS.map((p) => `${p}:${cs.getPropertyValue(p)}`).join(';');
        target[i].setAttribute('style', `${style};${own}`);
        target[i].removeAttribute('class');
        if (el instanceof SVGTextElement || el.tagName === 'tspan') families.add(familyOf(cs.fontFamily));
    });
    const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    style.textContent = await embeddedFontCss(families);
    clone.insertBefore(style, clone.firstChild);
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    return new XMLSerializer().serializeToString(clone);
};

export const loadSvgImage = async (svg: SVGSVGElement) => {
    const text = await serializeSvg(svg);
    const url = URL.createObjectURL(new Blob([text], {type: 'image/svg+xml'}));
    try {
        const img = new Image();
        img.decoding = 'async';
        img.src = url;
        await img.decode();
        return img;
    } finally {
        // decode() has rasterised the image; the object URL is no longer needed
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
};

const canvasBlob = (canvas: HTMLCanvasElement) => new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png');
});

/** The chart wheel as a square PNG on the site's dark background. */
export const svgToPng = async (svg: SVGSVGElement, size = 1600, background = '#0B0B1E') => {
    const img = await loadSvgImage(svg);
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, size, size);
    const pad = size * 0.04;
    ctx.drawImage(img, pad, pad, size - pad * 2, size - pad * 2);
    return canvasBlob(canvas);
};

export interface IShareCard {
    wheel: SVGSVGElement;
    title: string;
    subtitle: string;
    rows: {glyph: string; label: string; value: string}[];
    footer: string;
}

// Deterministic "random" stars so the card looks the same every time
const stars = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    let seed = 7;
    const rnd = () => {
        seed = (seed * 16807) % 2147483647;
        return seed / 2147483647;
    };
    for (let i = 0; i < 220; i++) {
        ctx.globalAlpha = 0.2 + rnd() * 0.6;
        ctx.fillStyle = rnd() > 0.85 ? '#E2C275' : '#FFFFFF';
        ctx.beginPath();
        ctx.arc(rnd() * w, rnd() * h, rnd() * 1.6 + 0.3, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
};

/** A 1080×1350 card (portrait, social-media friendly) with the wheel and the Big Three. */
export const shareCardPng = async ({wheel, title, subtitle, rows, footer}: IShareCard) => {
    await document.fonts.ready;
    const W = 1080;
    const H = 1350;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d')!;

    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#14102E');
    bg.addColorStop(1, '#06061A');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    const glow = ctx.createRadialGradient(W * 0.5, H * 0.45, 50, W * 0.5, H * 0.45, W * 0.7);
    glow.addColorStop(0, 'rgba(91,75,196,0.35)');
    glow.addColorStop(1, 'rgba(91,75,196,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);
    stars(ctx, W, H);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#E2C275';
    ctx.font = '600 26px "Inter Variable", "Inter Fallback", Arial, sans-serif';
    ctx.fillText('ASTRA', W / 2, 78);
    ctx.fillStyle = '#F1F0FA';
    ctx.font = '64px "Playfair Display", "Playfair Fallback", Georgia, serif';
    ctx.fillText(title, W / 2, 160, W - 120);
    ctx.fillStyle = '#A7A6C2';
    ctx.font = '30px "Inter Variable", "Inter Fallback", Arial, sans-serif';
    ctx.fillText(subtitle, W / 2, 210, W - 120);

    const img = await loadSvgImage(wheel);
    const size = 760;
    ctx.drawImage(img, (W - size) / 2, 250, size, size);

    const colW = (W - 120) / rows.length;
    rows.forEach((r, i) => {
        const x = 60 + colW * i + colW / 2;
        ctx.fillStyle = '#E2C275';
        ctx.font = '52px "Noto Sans Symbols", "Segoe UI Symbol", sans-serif';
        ctx.fillText(r.glyph, x, 1100);
        ctx.fillStyle = '#A7A6C2';
        ctx.font = '24px "Inter Variable", "Inter Fallback", Arial, sans-serif';
        ctx.fillText(r.label.toUpperCase(), x, 1148, colW - 20);
        ctx.fillStyle = '#F1F0FA';
        ctx.font = '38px "Playfair Display", "Playfair Fallback", Georgia, serif';
        ctx.fillText(r.value, x, 1198, colW - 20);
    });

    ctx.fillStyle = '#8A89A8';
    ctx.font = '24px "Inter Variable", "Inter Fallback", Arial, sans-serif';
    ctx.fillText(footer, W / 2, H - 50);
    return canvasBlob(canvas);
};

export const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/** Phones and tablets get the native share sheet (when it can take files); desktops simply download. */
export const shareOrDownload = async (blob: Blob, filename: string, title: string) => {
    const file = new File([blob], filename, {type: 'image/png'});
    const touch = window.matchMedia('(pointer: coarse)').matches;
    if (touch && navigator.canShare?.({files: [file]})) {
        try {
            await navigator.share({files: [file], title});
            return 'shared';
        } catch (e) {
            if ((e as DOMException)?.name === 'AbortError') return 'cancelled';
        }
    }
    downloadBlob(blob, filename);
    return 'downloaded';
};
