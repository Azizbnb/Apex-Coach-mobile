import { describe, it, expect } from '@jest/globals';
import { resolveVideoSrc, buildVideoHtml } from '@/lib/workout/video-html';
import type { ExerciseVideoData } from '@/types';

const API = 'https://apexcoach.app';

describe('resolveVideoSrc', () => {
  it('préfixe les chemins relatifs par l\'origine API', () => {
    expect(
      resolveVideoSrc('/api/exercises/video-proxy?url=x', API)
    ).toBe('https://apexcoach.app/api/exercises/video-proxy?url=x');
  });

  it('gère un apiBase avec slash final', () => {
    expect(resolveVideoSrc('/api/x', 'https://apexcoach.app/')).toBe(
      'https://apexcoach.app/api/x'
    );
  });

  it('laisse les URLs absolues inchangées', () => {
    expect(resolveVideoSrc('https://cdn.test/v.mp4', API)).toBe(
      'https://cdn.test/v.mp4'
    );
  });
});

describe('buildVideoHtml', () => {
  const youtube: ExerciseVideoData = {
    videoUrl: 'https://www.youtube.com/embed/abc',
    videoType: 'youtube',
    thumbnailUrl: null,
    muscles: ['Pectoraux'],
    nameEn: 'Bench Press',
  };

  const proxy: ExerciseVideoData = {
    videoUrl: '/api/exercises/video-proxy?url=https%3A%2F%2Fcdn%2Fv.mp4&t=1',
    videoType: 'proxy',
    thumbnailUrl: 'https://cdn/thumb.jpg',
    muscles: [],
    nameEn: 'Squat',
  };

  it('génère un iframe pour les vidéos youtube', () => {
    const html = buildVideoHtml(youtube, API);
    expect(html).toContain('<iframe');
    expect(html).toContain('src="https://www.youtube.com/embed/abc"');
    expect(html).toContain('allowfullscreen');
    expect(html).not.toContain('<video');
  });

  it('génère un tag video proxy en URL absolue avec poster', () => {
    const html = buildVideoHtml(proxy, API);
    expect(html).toContain('<video');
    expect(html).toContain('controls');
    expect(html).toContain('https://apexcoach.app/api/exercises/video-proxy');
    expect(html).toContain('poster="https://cdn/thumb.jpg"');
    expect(html).not.toContain('<iframe');
  });

  it('échappe les & dans les attributs d\'URL', () => {
    const html = buildVideoHtml(proxy, API);
    // l\'URL proxy contient un & d\'origine encodé ; on vérifie qu\'aucun &nu
    expect(html).toContain('&amp;');
  });

  it('omet le poster quand thumbnailUrl est null', () => {
    const html = buildVideoHtml(youtube, API);
    expect(html).not.toContain('poster=');
  });
});
