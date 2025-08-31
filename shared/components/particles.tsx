"use client";

import { cn } from "@/shared/lib/cn";
import { motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

interface Particles {
	id: number;
	x: number;
	y: number;
	size: number;
	speed: number;
	angle: number;
	opacity: number;
	color: string;
	type: "dot" | "plus" | "star" | "circle";
}

interface ParticlesProps {
	className?: string;
	particleCount?: number;
	colors?: string[];
}

const particleTypes = ["dot", "plus", "star", "circle"] as const;
const defaultColors = [
	"#6366f1", // indigo
	"#8b5cf6", // violet
	"#06b6d4", // cyan
	"#10b981", // emerald
	"#f59e0b", // amber
];

const getRandomPosition = () => ({
	x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1000),
	y:
		Math.random() * (typeof window !== "undefined" ? window.innerHeight : 1000),
});

const createParticle = (id: number, colors: string[]): Particles => {
	const { x, y } = getRandomPosition();
	return {
		id,
		x,
		y,
		size: Math.random() * 4 + 2,
		speed: Math.random() * 0.5 + 0.1,
		angle: Math.random() * Math.PI * 2,
		opacity: Math.random() * 0.6 + 0.2,
		color: colors[Math.floor(Math.random() * colors.length)],
		type: particleTypes[Math.floor(Math.random() * particleTypes.length)],
	};
};

const ParticleShape: React.FC<{ particle: Particles }> = ({ particle }) => {
	const baseProps = {
		width: particle.size,
		height: particle.size,
		fill: particle.color,
		opacity: particle.opacity,
	};

	switch (particle.type) {
		case "dot":
			return (
				<circle
					cx={particle.size / 2}
					cy={particle.size / 2}
					r={particle.size / 2}
					{...baseProps}
				/>
			);

		case "plus":
			return (
				<g {...baseProps}>
					<rect
						x={particle.size * 0.4}
						y={0}
						width={particle.size * 0.2}
						height={particle.size}
					/>
					<rect
						x={0}
						y={particle.size * 0.4}
						width={particle.size}
						height={particle.size * 0.2}
					/>
				</g>
			);

		case "star":
			const points = `${particle.size / 2},0 ${particle.size * 0.6},${particle.size * 0.4} ${particle.size},${particle.size * 0.4} ${particle.size * 0.7},${particle.size * 0.7} ${particle.size * 0.8},${particle.size} ${particle.size / 2},${particle.size * 0.8} ${particle.size * 0.2},${particle.size} ${particle.size * 0.3},${particle.size * 0.7} 0,${particle.size * 0.4} ${particle.size * 0.4},${particle.size * 0.4}`;
			return <polygon points={points} {...baseProps} />;

		case "circle":
			return (
				<circle
					cx={particle.size / 2}
					cy={particle.size / 2}
					r={particle.size / 3}
					stroke={particle.color}
					strokeWidth="1"
					fill="none"
					opacity={particle.opacity}
				/>
			);

		default:
			return (
				<circle
					cx={particle.size / 2}
					cy={particle.size / 2}
					r={particle.size / 2}
					{...baseProps}
				/>
			);
	}
};

export const Particles: React.FC<ParticlesProps> = ({
	className,
	particleCount = 50,
	colors = defaultColors,
}) => {
	const [particles, setParticles] = useState<Particles[]>([]);
	const [dimensions, setDimensions] = useState({ width: 1000, height: 1000 });
	const animationRef = useRef<number>(0);

	// Initialize particles
	useEffect(() => {
		const initialParticles = Array.from({ length: particleCount }, (_, i) =>
			createParticle(i, colors)
		);
		setParticles(initialParticles);
	}, [particleCount, colors]);

	// Handle window resize
	useEffect(() => {
		const updateDimensions = () => {
			setDimensions({
				width: window.innerWidth,
				height: window.innerHeight,
			});
		};

		if (typeof window !== "undefined") {
			updateDimensions();
			window.addEventListener("resize", updateDimensions);
			return () => window.removeEventListener("resize", updateDimensions);
		}
	}, []);

	// Animate particles
	useEffect(() => {
		const animate = () => {
			setParticles((prevParticles) =>
				prevParticles.map((particle) => {
					let newX = particle.x + Math.cos(particle.angle) * particle.speed;
					let newY = particle.y + Math.sin(particle.angle) * particle.speed;

					// Wrap around screen edges
					if (newX > dimensions.width + 10) newX = -10;
					if (newX < -10) newX = dimensions.width + 10;
					if (newY > dimensions.height + 10) newY = -10;
					if (newY < -10) newY = dimensions.height + 10;

					return {
						...particle,
						x: newX,
						y: newY,
					};
				})
			);

			animationRef.current = requestAnimationFrame(animate);
		};

		animationRef.current = requestAnimationFrame(animate);

		return () => {
			if (animationRef.current) {
				cancelAnimationFrame(animationRef.current);
			}
		};
	}, [dimensions]);

	return (
		<div
			className={cn(
				"fixed inset-0 overflow-hidden pointer-events-none",
				className
			)}
		>
			{/* Gradient overlay */}
			<div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background/90" />

			{/* Animated particles */}
			<svg
				className="absolute inset-0 w-full h-full"
				width={dimensions.width}
				height={dimensions.height}
			>
				{particles.map((particle) => (
					<motion.g
						key={particle.id}
						initial={{ scale: 0, rotate: 0 }}
						animate={{
							scale: [1, 1.2, 1],
							rotate: 360,
							x: particle.x,
							y: particle.y,
						}}
						transition={{
							scale: {
								duration: 3 + Math.random() * 2,
								repeat: Infinity,
								ease: "easeInOut",
							},
							rotate: {
								duration: 10 + Math.random() * 10,
								repeat: Infinity,
								ease: "linear",
							},
						}}
					>
						<ParticleShape particle={particle} />
					</motion.g>
				))}
			</svg>

			{/* Subtle grid pattern */}
			<div
				className="absolute inset-0 opacity-[0.02]"
				style={{
					backgroundImage: `
            linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)
          `,
					backgroundSize: "50px 50px",
				}}
			/>

			{/* Corner glow effects */}
			<div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
			<div className="absolute bottom-0 right-0 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />
		</div>
	);
};
