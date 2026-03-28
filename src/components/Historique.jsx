import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export function Historique({ onSelectDevis, notify }) {
  const [devisList, setDevisList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Charger les données au montage du composant
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      // Requête avec jointures pour récupérer le client et les articles associés
      const { data, error } = await supabase
        .from('devis')
        .select(`
          *,
          clients ( nom, adresse, email ),
          entreprises ( nom, adresse, siret, email ),
          devis_items ( service, qte, pu )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDevisList(data || []);
    } catch (error) {
      console.error("Erreur historique:", error.message);
      if (notify) notify("Impossible de charger l'historique", "error");
    } finally {
      setLoading(false);
    }
  };

  const deleteDevis = async (id, e) => {
    // Empêche le clic sur la ligne (qui chargerait le devis)
    e.stopPropagation(); 
    
    if (!window.confirm("Supprimer définitivement ce devis et ses articles ?")) return;

    try {
      // 1. Supprimer les articles liés (important pour la base de données)
      const { error: itemsError } = await supabase
        .from('devis_items')
        .delete()
        .eq('devis_id', id);

      if (itemsError) throw itemsError;

      // 2. Supprimer le devis lui-même
      const { error: devisError } = await supabase
        .from('devis')
        .delete()
        .eq('id', id);

      if (devisError) throw devisError;

      // 3. Succès : Notification et rafraîchissement
      if (notify) notify("🗑️ Devis supprimé avec succès");
      fetchHistory();
      
    } catch (error) {
      console.error("Erreur lors de la suppression:", error.message);
      if (notify) notify("❌ Erreur lors de la suppression", "error");
    }
  };

  if (loading) return <div className="loading-state">Chargement de vos archives...</div>;

  return (
    <div className="history-container">
      <div className="history-header">
        <h2>📂 Historique des Devis</h2>
        <button className="btn-refresh no-print" onClick={fetchHistory}>
          🔄 Actualiser
        </button>
      </div>

      <div className="history-table-wrapper">
        <table className="history-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>N° Devis</th>
              <th>Client</th>
              <th className="text-right">Total TTC</th>
              <th className="no-print">Actions</th>
            </tr>
          </thead>
          <tbody>
            {devisList.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-msg">Aucun devis enregistré pour le moment.</td>
              </tr>
            ) : (
              devisList.map((d) => (
                <tr 
                  key={d.id} 
                  onClick={() => onSelectDevis(d)} 
                  className="history-row"
                >
                  <td>{new Date(d.created_at).toLocaleDateString()}</td>
                  <td><strong>{d.numero}</strong></td>
                  <td>{d.clients?.nom || 'Client inconnu'}</td>
                  <td className="text-right bold">{d.total_ttc?.toFixed(2)} €</td>
                  <td className="no-print">
                    <div className="action-btns">
                      <button className="btn-icon-view" title="Ouvrir">👁️</button>
                      <button 
                        className="btn-icon-delete" 
                        title="Supprimer" 
                        onClick={(e) => deleteDevis(d.id, e)}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}