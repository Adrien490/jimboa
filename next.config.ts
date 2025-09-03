import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "lh3.googleusercontent.com",
			},
		],
	},
	experimental: {
		useCache: true,
		optimizePackageImports: ["framer-motion"],
	},
	transpilePackages: ["framer-motion"],
};

export default nextConfig;
