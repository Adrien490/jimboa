export interface FAQItem {
	id: string;
	question: string;
	answer: string;
}

export const faqData: FAQItem[] = [
	{
		id: "concept",
		question: "C'est quoi Jimboa exactement ?",
		answer:
			"Jimboa, c'est ton app de groupes privés pour traîner avec tes potes en toute tranquillité. Tu crées ton groupe, tu invites tes gars sûrs avec un code secret, et vous pouvez discuter sans que personne vienne foutre le bordel. Simple, efficace, et sans prise de tête.",
	},
	{
		id: "gratuit",
		question: "C'est gratuit ou pas ?",
		answer:
			"Ouais, c'est complètement gratuit ! Tu peux créer autant de groupes que tu veux, inviter tes potes, et utiliser toutes les fonctionnalités sans débourser un centime. On fait ça par passion, pas pour te vider les poches.",
	},
	{
		id: "installation",
		question: "Comment installer l'application ?",
		answer:
			"Rien de plus simple ! Tu vas sur le site, tu te connectes avec ton compte Google (ça prend 2 secondes), et c'est parti. C'est une PWA, donc ça marche direct dans ton navigateur. Si tu veux l'installer sur ton téléphone, tu peux l'ajouter à ton écran d'accueil depuis ton navigateur.",
	},
	{
		id: "codes-invitation",
		question: "Comment fonctionnent les codes d'invitation ?",
		answer:
			"Quand tu crées un groupe, on te génère un code unique. Tu le partages uniquement avec tes gars sûrs (pas à ta daronne, hein !). Ils entrent le code, ils rejoignent le groupe, et c'est réglé. Le code reste privé, donc seuls ceux qui l'ont peuvent entrer.",
	},
	{
		id: "securite",
		question: "Mes données sont-elles sécurisées ?",
		answer:
			"Évidemment ! On utilise Clerk pour l'authentification (du solide) et Convex pour stocker tes données de manière sécurisée. Tes conversations restent privées dans ton groupe, et on ne vend pas tes infos à des tiers. Ta vie privée, c'est sacré.",
	},
	{
		id: "nombre-groupes",
		question: "Combien de groupes je peux créer ?",
		answer:
			"Autant que tu veux ! Il n'y a pas de limite. Tu peux avoir un groupe pour tes potes du lycée, un pour tes collègues, un pour ta famille... Fais-toi plaisir, c'est fait pour ça.",
	},
	{
		id: "membres-groupe",
		question: "Combien de personnes peuvent rejoindre un groupe ?",
		answer:
			"Pour l'instant, on a mis une limite raisonnable pour que ça reste convivial, mais on peut l'ajuster selon les besoins. L'idée c'est de garder l'esprit 'petit groupe de potes', pas de faire un stade de foot.",
	},
	{
		id: "problemes",
		question: "J'ai un problème, qui contacter ?",
		answer:
			"Si tu galères ou que quelque chose déconne, pas de panique ! Tu peux nous contacter directement. On est réactifs et on fait tout pour résoudre tes problèmes rapidement. L'app est en constante évolution, donc tes retours nous aident à l'améliorer.",
	},
	{
		id: "connexion",
		question: "Pourquoi utiliser Google pour se connecter ?",
		answer:
			"C'est plus simple et plus sécurisé ! Pas besoin de retenir un énième mot de passe, Google s'occupe de tout. Et comme c'est ultra répandu, tu peux te connecter en deux clics. Efficace et sans galère.",
	},
];
