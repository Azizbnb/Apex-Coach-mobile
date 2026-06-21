import type { ExerciseVideoData } from '@/types';

/** Échappe les caractères sensibles pour une valeur d'attribut HTML. */
function escapeAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Résout l'URL d'une vidéo proxy en URL absolue.
 * Les vidéos `proxy` arrivent en chemin relatif (`/api/exercises/video-proxy?...`)
 * et doivent être préfixées par l'origine de l'API pour être chargées dans la WebView.
 */
export function resolveVideoSrc(videoUrl: string, apiBase: string): string {
  if (/^https?:\/\//i.test(videoUrl)) return videoUrl;
  const base = apiBase.replace(/\/$/, '');
  return `${base}${videoUrl}`;
}

/**
 * Construit le document HTML chargé dans la WebView pour lire la démo.
 *
 * - `youtube` → `<iframe>` plein cadre (mirror exact du player web)
 * - `proxy`   → `<video controls loop playsinline>` avec poster optionnel
 *
 * Fond noir, sans marges, ratio géré par le conteneur RN (16:9).
 */
export function buildVideoHtml(
  video: ExerciseVideoData,
  apiBase: string
): string {
  const head =
    '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">' +
    '<style>html,body{margin:0;padding:0;background:#000;height:100%;overflow:hidden}' +
    'iframe,video{border:0;width:100%;height:100%;position:absolute;inset:0;object-fit:contain;background:#000}</style>';

  let body: string;
  if (video.videoType === 'youtube') {
    body = `<iframe src="${escapeAttr(
      video.videoUrl
    )}" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
  } else {
    const src = resolveVideoSrc(video.videoUrl, apiBase);
    const poster = video.thumbnailUrl
      ? ` poster="${escapeAttr(video.thumbnailUrl)}"`
      : '';
    body = `<video src="${escapeAttr(
      src
    )}" controls loop playsinline${poster}></video>`;
  }

  return `<!DOCTYPE html><html><head>${head}</head><body>${body}</body></html>`;
}
