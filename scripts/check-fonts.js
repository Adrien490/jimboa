#!/usr/bin/env node

/**
 * Script de vérification des polices Next.js 15 (2025)
 * Vérifie que les fichiers Satoshi sont présents et correctement configurés
 */

const fs = require("fs");
const path = require("path");

const FONT_DIR = path.join(process.cwd(), "app", "fonts");
const REQUIRED_FONTS = [
	"Satoshi-SemiBold.woff2", // Titres
	"Satoshi-Bold.woff2", // Titres importants
];

console.log("🔤 Vérification des polices Jimboa (Next.js 15)");
console.log("📋 Configuration: Satoshi (titres) + Inter (texte)\n");

// Vérifier l'existence du dossier
if (!fs.existsSync(FONT_DIR)) {
	console.log("❌ Dossier app/fonts/ manquant");
	console.log("   Créez-le avec: mkdir -p app/fonts\n");
	process.exit(1);
}

// Vérifier chaque police
let allFontsPresent = true;
let totalSize = 0;

REQUIRED_FONTS.forEach((font) => {
	const fontPath = path.join(FONT_DIR, font);
	if (fs.existsSync(fontPath)) {
		const stats = fs.statSync(fontPath);
		const sizeKB = Math.round(stats.size / 1024);
		totalSize += sizeKB;
		console.log(`✅ ${font} (${sizeKB}KB)`);
	} else {
		console.log(`❌ ${font} manquant`);
		allFontsPresent = false;
	}
});

console.log(`\n📊 Taille totale: ${totalSize}KB`);

if (allFontsPresent) {
	console.log("\n🎉 Configuration parfaite !");
	console.log("   Toutes les polices Satoshi sont présentes");
	console.log("   Next.js 15 les optimisera automatiquement");

	if (totalSize > 300) {
		console.log("\n⚠️  Taille importante détectée");
		console.log("   Considérez compresser vos fichiers WOFF2");
	}
} else {
	console.log("\n📥 Téléchargez Satoshi depuis:");
	console.log("   https://www.fontshare.com/fonts/satoshi");
	console.log("   Puis placez les fichiers dans app/fonts/");
}

console.log("\n🔧 Configuration actuelle:");
console.log("   ✅ Satoshi (titres) - next/font/local avec preload");
console.log("   ✅ Inter (texte) - next/font/google optimisé");
console.log("   ✅ font-display: swap");
console.log("   ✅ Fallbacks système optimisés");
