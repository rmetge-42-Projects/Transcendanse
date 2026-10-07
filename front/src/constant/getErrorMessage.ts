
// export const getErrorMessage = (
// 	error:any,
// 	defaultMessage: string = "Une erreur est survenue."
// ): string => {
// 	// 1. Récupération du message d'erreur renvoyé par le backend
// 	const serverMessage = error.response?.data?.message;
// 	// 2. Gestion si NestJS renvoie plusieurs erreurs de validation (tableau) ou un message simple (string)
// 	if (Array.isArray(serverMessage)) {
//     	return serverMessage.join(". ");
//     }

//     // Si le serveur renvoie une simple chaîne de caractères
//     if (typeof serverMessage === "string" && serverMessage.trim() !== "") {
//         return serverMessage;
//     }

//     // Sinon, on retourne le message par défaut fourni
//     return defaultMessage;
// }