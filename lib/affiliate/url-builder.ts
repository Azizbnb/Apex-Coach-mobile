/**
 * Construit une URL avec paramètre affilié.
 * Fonction pure, testable sans dépendances serveur.
 */
export function buildAffiliateUrl(productUrl: string, trackingParam: string, trackingValue: string): string {
  try {
    const url = new URL(productUrl)
    url.searchParams.set(trackingParam, trackingValue)
    return url.toString()
  } catch {
    return productUrl
  }
}
