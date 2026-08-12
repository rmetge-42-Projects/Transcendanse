module = fait le liens entre service et contoller
controller = recupere les info envoyer par le front (ecoute les requette)
service = l'agorithmie

main = ecoute sur les port (app.enableCors();)

auth = authantification 

dto = c'est pour verifier que les info recu soit bonne


commande a faire pour cree un nouveau dossier (ex: users) :
npx @nestjs/cli g module users
npx @nestjs/cli g controller users
npx @nestjs/cli g service users