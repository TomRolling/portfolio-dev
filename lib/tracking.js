// Petits helpers pour l'analytics maison.
// Tout est enveloppé dans des try/catch : en navigation privée ou avec les
// cookies bloqués, l'accès au localStorage peut lever une exception.

const ADMIN_KEY = "tr-admin-device";
const SEEN_PREFIX = "tr-seen:";

// Cet appareil est-il le tien (connecté à l'admin au moins une fois) ?
export function isAdminDevice() {
  try {
    return localStorage.getItem(ADMIN_KEY) === "1";
  } catch {
    return false;
  }
}

// Marque / démarque l'appareil comme étant le tien, pour exclure tes visites.
export function setAdminDevice(value) {
  try {
    if (value) localStorage.setItem(ADMIN_KEY, "1");
    else localStorage.removeItem(ADMIN_KEY);
  } catch {
    /* stockage indisponible : on ignore */
  }
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
