// Petits helpers pour l'analytics maison.
// Tout est enveloppé dans des try/catch : en navigation privée ou avec les
// cookies bloqués, l'accès au localStorage peut lever une exception.

const ADMIN_KEY = "tr-admin-device";
const SEEN_PREFIX = "tr-seen:";

// Préférence de l'appareil : true (exclu), false (compté explicitement), ou
// null si rien n'a encore été choisi. Le tri-état permet de distinguer « jamais
// décidé » de « décidé de compter », pour qu'une ouverture de l'admin ne
// réactive pas l'exclusion que tu viens de désactiver.
export function getAdminDevicePref() {
  try {
    const value = localStorage.getItem(ADMIN_KEY);
    return value === null ? null : value === "1";
  } catch {
    return null;
  }
}

// Cet appareil est-il le tien (visites exclues du comptage) ?
export function isAdminDevice() {
  return getAdminDevicePref() === true;
}

// Marque / démarque l'appareil comme étant le tien, pour exclure tes visites.
export function setAdminDevice(value) {
  try {
    localStorage.setItem(ADMIN_KEY, value ? "1" : "0");
  } catch {
    /* stockage indisponible : on ignore */
  }
}

// Appelé quand une session admin valide est détectée : par défaut l'appareil du
// propriétaire est exclu, sauf s'il a explicitement demandé le contraire.
export function ensureAdminDevice() {
  if (getAdminDevicePref() === null) setAdminDevice(true);
}

// Renvoie true la première fois qu'une page est vue dans l'onglet courant,
// false ensuite — pour qu'un simple rafraîchissement ne gonfle pas les stats.
export function markPathSeen(path) {
  try {
    const key = SEEN_PREFIX + path;
    if (sessionStorage.getItem(key)) return false;
    sessionStorage.setItem(key, "1");
    return true;
  } catch {
    return true;
  }
}
