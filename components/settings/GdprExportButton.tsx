import { useState } from 'react';
import { Alert } from 'react-native';
import { Button } from '@/components/ui/Button';
import { accountApi, ApiError } from '@/lib/api';

/**
 * Export RGPD (mirror web GdprExportButton).
 * Déclenche l'envoi d'une archive de données par email côté serveur.
 */
export function GdprExportButton() {
  const [loading, setLoading] = useState(false);

  const onExport = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await accountApi.exportGdprData();
      Alert.alert(
        'Demande envoyée',
        'Tu vas recevoir un email avec ton archive de données.'
      );
    } catch (e) {
      const message =
        e instanceof ApiError ? e.message : 'La demande a échoué. Réessaie plus tard.';
      Alert.alert('Erreur', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="secondary" onPress={onExport} loading={loading}>
      Exporter mes données
    </Button>
  );
}
