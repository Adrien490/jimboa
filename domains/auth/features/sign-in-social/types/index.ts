type ProviderType = "google" | "github";

export type Provider = {
	id: ProviderType;
	name: string;
	icon: React.ReactNode;
};

export type ResponseState =
	| {
			redirect: boolean;
			token: string;
			url: undefined;
			user: {
				id: string;
				email: string;
				name: string;
				image: string | null | undefined;
				emailVerified: boolean;
				createdAt: Date;
				updatedAt: Date;
			};
	  }
	| {
			url: string;
			redirect: boolean;
	  };
