import { randomRange } from "@prozilla-os/shared";
import {
	GRAVITY,
	PARTICLE_LIFETIME,
	SPEED_MULTIPLIER,
	TERMINAL_VELOCITY
} from "../constants/const";

function parseCssColor(value: string): { r: number; g: number; b: number } | null {
	const trimmed = value.trim();
	if (!trimmed) {
		return null;
	}
	const hexMatch = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(trimmed);
	if (hexMatch) {
		return {
			r: Number.parseInt(hexMatch[1], 16),
			g: Number.parseInt(hexMatch[2], 16),
			b: Number.parseInt(hexMatch[3], 16)
		};
	}
	const rgbMatch = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i.exec(trimmed);
	if (rgbMatch) {
		return {
			r: Number.parseInt(rgbMatch[1], 10),
			g: Number.parseInt(rgbMatch[2], 10),
			b: Number.parseInt(rgbMatch[3], 10)
		};
	}
	return null;
}

type ParticleBody = {
	color: { r: number; g: number; b: number };
	dimensions: { x: number; y: number };
	scale: { x: number; y: number };
	position: { x: number; y: number };
	rotation: number;
	velocity: { x: number; y: number };
	birth?: number;
	age?: number;
	opacity?: number;
};

/**
 * Canvas particle bursts scoped to the game container (same visual behavior as the legacy full-page build).
 */
export class Particles {
	private paletteElement: HTMLElement | null = null;
	private canvas: HTMLCanvasElement | null = null;
	private readonly bodies: ParticleBody[] = [];
	private animationHandle: number | null = null;
	private renderStartTimestamp: number | undefined;
	private previousRenderTimestamp: number | undefined;
	private tileScale = 0;
	private resizeObserver: ResizeObserver | null = null;

	setTileScaleFromElement(element: HTMLElement): void {
		this.tileScale = element.getBoundingClientRect().width;
	}

	attachPalette(element: HTMLDivElement | null): void {
		this.paletteElement = element;
		if (element != null && this.canvas != null) {
			this.setupResizeObservation();
			this.syncCanvasSize();
		}
	}

	attachCanvas(canvas: HTMLCanvasElement | null): void {
		this.teardownCanvas();
		if (canvas == null) {
			return;
		}
		this.canvas = canvas;
		const context = canvas.getContext("2d");
		if (context == null) {
			return;
		}

		this.setupResizeObservation();
		this.syncCanvasSize();

		const render = (timestamp: number): void => {
			if (this.canvas == null || context == null) {
				return;
			}
			context.clearRect(0, 0, canvas.width, canvas.height);
			context.filter = "contrast(75%)";
			if (this.renderStartTimestamp == null) {
				this.renderStartTimestamp = timestamp;
			}
			if (this.previousRenderTimestamp == null) {
				this.previousRenderTimestamp = timestamp;
			}
			const deltaTime = (timestamp - this.previousRenderTimestamp) * SPEED_MULTIPLIER;
			this.previousRenderTimestamp = timestamp;
			const totalTime = timestamp - this.renderStartTimestamp;

			for (let index = this.bodies.length - 1; index >= 0; index--) {
				const particle = this.bodies[index];
				const width = particle.dimensions.x * particle.scale.x;
				const height = particle.dimensions.y * particle.scale.y;
				if (particle.birth == null) {
					particle.birth = totalTime;
				}
				particle.age = totalTime - particle.birth;
				particle.opacity = 1 - particle.age / PARTICLE_LIFETIME;

				context.translate(particle.position.x, particle.position.y);
				context.rotate(particle.rotation);
				particle.velocity.y = Math.min(particle.velocity.y + GRAVITY * deltaTime, TERMINAL_VELOCITY * deltaTime);
				particle.position.x += particle.velocity.x;
				particle.position.y += particle.velocity.y;

				if (particle.position.y >= canvas.height || particle.position.x < 0 || particle.position.x >= canvas.width || particle.age > PARTICLE_LIFETIME) {
					this.bodies.splice(index, 1);
				}

				context.fillStyle = `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${particle.opacity ?? 1})`;
				context.fillRect(-width / 2, -height / 2, width, height);
				context.setTransform(1, 0, 0, 1, 0, 0);
			}

			this.animationHandle = window.requestAnimationFrame(render);
		};

		this.animationHandle = window.requestAnimationFrame(render);
	}

	emitFromTile(tile: HTMLButtonElement | null, colors: string[], min: number, max: number): void {
		if (tile == null || Math.random() < 0.5) {
			return;
		}
		const canvas = this.canvas;
		if (canvas == null) {
			return;
		}
		const rect = tile.getBoundingClientRect();
		const canvasBounds = canvas.getBoundingClientRect();
		const tileWidth = rect.width > 0 ? rect.width : (this.tileScale > 0 ? this.tileScale : 65);
		const scaleX = canvasBounds.width > 0 ? canvas.width / canvasBounds.width : 1;
		const scaleY = canvasBounds.height > 0 ? canvas.height / canvasBounds.height : 1;
		for (let i = 0; i < Math.floor(randomRange(min, max + 1)); i++) {
			const color = colors[Math.floor(Math.random() * colors.length)];
			const x = (randomRange(rect.left, rect.right) - canvasBounds.left) * scaleX;
			const y = (randomRange(rect.top, rect.bottom) - canvasBounds.top) * scaleY;
			this.spawnParticle(color, tileWidth, x, y);
		}
	}

	dispose(): void {
		this.teardownCanvas();
		this.paletteElement = null;
		this.bodies.length = 0;
	}

	private teardownCanvas(): void {
		this.teardownResizeObservation();
		if (this.animationHandle != null) {
			window.cancelAnimationFrame(this.animationHandle);
			this.animationHandle = null;
		}
		this.canvas = null;
		this.renderStartTimestamp = undefined;
		this.previousRenderTimestamp = undefined;
	}

	private getLayoutRoot(): HTMLElement | null {
		return this.paletteElement ?? this.canvas?.parentElement ?? null;
	}

	private syncCanvasSize(): void {
		const canvas = this.canvas;
		const root = this.getLayoutRoot();
		if (canvas == null || root == null) {
			return;
		}
		const width = root.clientWidth;
		const height = root.clientHeight;
		if (width <= 0 || height <= 0) {
			return;
		}
		canvas.width = width;
		canvas.height = height;
	}

	private setupResizeObservation(): void {
		this.teardownResizeObservation();
		const root = this.getLayoutRoot();
		if (root == null || this.canvas == null) {
			return;
		}
		this.resizeObserver = new ResizeObserver(() => {
			this.syncCanvasSize();
		});
		this.resizeObserver.observe(root);
	}

	private teardownResizeObservation(): void {
		if (this.resizeObserver != null) {
			this.resizeObserver.disconnect();
			this.resizeObserver = null;
		}
	}

	private resolveCssVar(name: string): string {
		const palette = this.paletteElement;
		if (palette == null) {
			return "";
		}
		return getComputedStyle(palette).getPropertyValue(`--${name}`).trim();
	}

	private spawnParticle(colorName: string, tileWidth: number, x: number, y: number): void {
		const raw = this.resolveCssVar(colorName);
		const color = parseCssColor(raw);
		if (color == null) {
			return;
		}

		this.bodies.push({
			color,
			dimensions: {
				x: 15 * tileWidth / 65,
				y: 15 * tileWidth / 65
			},
			scale: { x: 1, y: 1 },
			position: { x, y },
			rotation: randomRange(0, 2 * Math.PI),
			velocity: {
				x: randomRange(-1, 1),
				y: randomRange(-2, 0)
			}
		});
	}
}
