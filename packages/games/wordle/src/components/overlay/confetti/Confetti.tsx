import { randomFromArray, randomRange } from "@prozilla-os/shared";
import { useEffect, useRef } from "react";
import styles from "./Confetti.module.css";

const CONFETTI_COUNT = 200;
const GRAVITY = 0.5;
const TERMINAL_VELOCITY = 5;
const DRAG = 0.1;
const COLORS = ["--red", "--yellow", "--green", "--blue", "--purple"];

const createConfetto = (canvasWidth: number, canvasHeight: number, colors: string[]) => ({
    color: randomFromArray(colors),
    dimensions: {
        x: randomRange(10, 20),
        y: randomRange(10, 30),
    },
    position: {
        x: randomRange(0, canvasWidth),
        y: canvasHeight - 1,
    },
    rotation: randomRange(0, 2 * Math.PI),
    scale: { x: 1, y: 1 },
    velocity: {
        x: randomRange(-25, 25),
        y: randomRange(0, -0.0575 * window.innerHeight),
    },
});

export default function Confetti() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext("2d");
        if (!context) return;

        const root = getComputedStyle(canvas);
        const colors = COLORS.map((color) => root.getPropertyValue(color).trim());

        let animationId: number;
        let confetti: ReturnType<typeof createConfetto>[] = [];

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const initConfetti = () => {
            confetti = [];
            for (let i = 0; i < CONFETTI_COUNT; i++) {
                confetti.push(createConfetto(canvas.width, canvas.height, colors));
            }
        };

        const render = () => {
            context.clearRect(0, 0, canvas.width, canvas.height);

            confetti.forEach((confetto, index) => {
                const width = confetto.dimensions.x * confetto.scale.x;
                const height = confetto.dimensions.y * confetto.scale.y;

				// Move canvas to position and rotate
                context.translate(confetto.position.x, confetto.position.y);
                context.rotate(confetto.rotation);

				// Apply forces to velocity
                confetto.velocity.x -= confetto.velocity.x * DRAG;
                confetto.velocity.y = Math.min(confetto.velocity.y + GRAVITY, TERMINAL_VELOCITY);
                confetto.velocity.x += Math.random() > 0.5 ? Math.random() : -Math.random();

				// Set position
                confetto.position.x += confetto.velocity.x;
                confetto.position.y += confetto.velocity.y;

				// Delete confetti when out of frame
                if (confetto.position.y >= canvas.height) {
					confetti.splice(index, 1);
					return;
				}

				// Loop confetto x position
                if (confetto.position.x > canvas.width) confetto.position.x = 0;
                if (confetto.position.x < 0) confetto.position.x = canvas.width;

				// Spin confetto by scaling y
                confetto.scale.y = Math.cos(confetto.position.y * 0.1);
                context.fillStyle = confetto.color;

				// Draw confetto
                context.fillRect(-width / 2, -height / 2, width, height);

				// Reset transform matrix
                context.setTransform(1, 0, 0, 1, 0, 0);
            });

            animationId = window.requestAnimationFrame(render);
        };

        resizeCanvas();
        initConfetti();
        render();

        window.addEventListener("resize", resizeCanvas);

        return () => {
            window.cancelAnimationFrame(animationId);
            window.removeEventListener("resize", resizeCanvas);
        };
    }, [canvasRef]);

    return <canvas ref={canvasRef} className={styles.Confetti}/>;
}