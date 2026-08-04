interface: 
        - si tu définis une interface, l'objet doit avoir TOUS les champs requis, et AUCUN champ supplémentaire.
        - un paramètre soit optionnel, on ajoute un ?, comme ville?: string;, mais par défaut, tout est obligatoire

state :
    -Les données internes qui, lorsqu'elles sont modifiées, rafraîchissent le composant en temps réel à l'écran.

Props :
    - Les paramètres transmis au composant (comme des arguments de fonction).


Type d'export                        |	Déclaration dans le composant   |	Syntax d'importation
Default (obligatoire pour page.tsx)	 | export default functtion Page() {}| import Page from './page'
Nommé(recommandé pour les composants)| export function Bouton() {}      |import { Bouton } from './Bouton'

syntaxe :
    -Un titre principal <h1>.
    -Un paragraphe <p> de présentation.

axios
react query
react hook form

