import {useEffect, useRef} from 'react';
import {useReducedMotion} from 'framer-motion';
import {useStarfieldStyles} from './starfield.style';
import {IStarfield} from './starfield';

interface IStar {
    x: number;
    y: number;
    r: number;
    layer: number;
    phase: number;
    hue: number;
}

// Lightweight 2D starfield: three parallax layers + gentle twinkle. Static under reduced motion,
// paused when off-screen, capped DPR for mid-range phones.
const StarfieldComponent = ({density = 1}: IStarfield) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const reduce = useReducedMotion();
    const {canvas} = useStarfieldStyles();

    useEffect(() => {
        const el = canvasRef.current;
        if (!el) return;
        const ctx = el.getContext('2d');
        if (!ctx) return;
        let raf = 0;
        let visible = true;
        let stars: IStar[] = [];
        const dpr = Math.min(window.devicePixelRatio || 1, 1.75);

        const resize = () => {
            const {clientWidth: w, clientHeight: h} = el;
            el.width = w * dpr;
            el.height = h * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            const count = Math.round((w * h) / 5200 * density);
            stars = Array.from({length: count}, () => {
                const layer = Math.random() < 0.6 ? 0 : Math.random() < 0.7 ? 1 : 2;
                return {
                    x: Math.random() * w,
                    y: Math.random() * h * 1.4,
                    r: [0.6, 1.0, 1.6][layer] * (0.7 + Math.random() * 0.6),
                    layer,
                    phase: Math.random() * Math.PI * 2,
                    hue: Math.random() < 0.15 ? 45 : Math.random() < 0.2 ? 250 : 0,
                };
            });
        };

        const draw = (t: number) => {
            const {clientWidth: w, clientHeight: h} = el;
            ctx.clearRect(0, 0, w, h);
            const scroll = window.scrollY;
            for (const s of stars) {
                const speed = [0.05, 0.12, 0.25][s.layer];
                const y = ((s.y - scroll * speed) % (h * 1.4) + h * 1.4) % (h * 1.4);
                if (y > h) continue;
                const tw = reduce ? 1 : 0.65 + 0.35 * Math.sin(t / 1000 * (0.6 + s.layer * 0.3) + s.phase);
                ctx.globalAlpha = tw * [0.55, 0.75, 0.95][s.layer];
                ctx.fillStyle = s.hue ? `hsl(${s.hue}, 80%, 85%)` : '#ffffff';
                ctx.beginPath();
                ctx.arc(s.x, y, s.r, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
        };

        const loop = (t: number) => {
            if (visible) draw(t);
            raf = requestAnimationFrame(loop);
        };

        resize();
        const ro = new ResizeObserver(() => {
            resize();
            if (reduce) draw(0);
        });
        ro.observe(el);
        const io = new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
        });
        io.observe(el);

        if (reduce) {
            draw(0);
        } else {
            raf = requestAnimationFrame(loop);
        }

        return () => {
            cancelAnimationFrame(raf);
            ro.disconnect();
            io.disconnect();
        };
    }, [reduce, density]);

    return <canvas ref={canvasRef} className={canvas} aria-hidden='true'/>;
};

export default StarfieldComponent;
