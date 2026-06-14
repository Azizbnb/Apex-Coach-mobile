import { useState } from 'react';
import { Alert, Share } from 'react-native';
import { Button } from '@/components/ui/Button';
import { accountApi, ApiError } from '@/lib/api';

/**
 * Export RGPD (mirror web GdprExportButton).
 * GET /api/gdpr/export renvoie les données JSON ; on les partage via le
 * share sheet natif (l'utilisateur les enregistre/envoie où il veut).
 */
export function GdprExportButton() {
  const [loading, setLoading] = useState(false);

  const onExport = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const data = await accountApi.exportGdprData();
      const json = JSON.stringify(data, null, 2);
      await Share.share({
        title: 'Mes données Apex Coach',
        message: json,
      });
    } catch (e) {
      const message =
        e instanceof ApiError ? e.message : "L'export a échoué. Réessaie plus tard.";
      Alert.alert('Erreur', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="secondary" onPress={onExport} loading={loading}>
      Télécharger mes données
    </Button>
  );
}
