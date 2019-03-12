export var global = {
  isDebug: true,
  reportError: true,
}

export interface langExprType {
  wrongInput: string
  emailInUse: string,
  noConnection: string,
  wrongEmail: string,
  passwordMinLength: string,
  wrongPassword: string,
  noEmail: string,
  loginOk1: string,
  loginOk2: string,
  signUpOk1: string,
  signUpOk2: string,
  signUp: string,
  signUp2: string,
  name: string,
  password: string,
  confrimPassword: string,

}

export const langFR: langExprType = {
  wrongInput: 'Verifier votre email et votre mot de passe',
  emailInUse: "Désolé le email est déja utilisé par quelqun d'autre. Donner un autre email",
  noConnection: 'Vérifier votre connexion internet et réessayer.',
  wrongEmail: "Le email donné n'est pas correct, verifier et réessayer.",
  passwordMinLength: 'Le mot de passe doit avoir au moins 6 charactères.',
  wrongPassword: 'Le mot de passe est incorrect, vérifier et réessayer!',
  noEmail: "Email n'existe pas, verifier et réessayer.",
  loginOk1: 'Connexion réussie',
  loginOk2: 'Vous etez maintenant connecté',
  signUpOk1: 'Nouveau compte',
  signUpOk2: 'Félicitation, votre compte a été crée avec success',
  signUp: 'Inscrivez vous',
  signUp2: 'Créer compte',
  name: 'Prénom et nom',
  password: 'Mot de passe',
  confrimPassword: 'Confirmer le mot de passe',

}
