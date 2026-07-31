app/page/page.tsx : page d'accuille  ->liens vers les politique de confidentialité 
                            ->liens vers la page de connection

app/privacy/page.tsx : page de politique de confidentialité

app/login/pages.tsx : pas de login (envoie email et mdp au back)

app/component -> display/bottom.tsx : composant pour le fond
            /footer.tsx : composant pour le footer qui est en bas de chaque pas, il redirige vers les politique de confidentialité

app/profile/page.tsx : page de profile (nom, photo ...)

app/register/page.tsx : page pour cree un compte (envoie email mdp et verif mdp  au back )

app/creatProfile/page.tsx : page pour crea ton profile (envoie tout les info personnel au back [trouver un moyen pour la rendre obligatoir])

axios = faire un base de requette http, avec l'adresse et le header -> lib

React Query(useQuery) = permet de garder les donner recuperé dans le back pendant 5min pour evité les requete inutile, si il y a un probleme il essaye une nouvelle fois avant d'envoyer un message d'error (il utilise avec axios au moment d'envoyer les requettes)