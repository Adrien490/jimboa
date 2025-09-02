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
		id: "nombre-groupes",
		question: "Combien de groupes je peux créer ?",
		answer:
			"Autant que tu veux ! Il n'y a pas de limite. Tu peux avoir un groupe pour tes potes du lycée, un pour tes collègues, un pour ta famille... Fais-toi plaisir, c'est fait pour ça.",
	},
];
