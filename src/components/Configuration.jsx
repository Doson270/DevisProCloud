import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function Configuration({ session }) {
  const [entreprises, setEntreprises] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // État du formulaire (Vide par défaut)
  const [form, setForm] = useState({ id: null, nom: '', adresse: '', siret: '' });

  // 1. CHARGEMENT (READ)
  const fetchEntreprises = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('entreprises')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEntreprises(data || []);
    } catch (error) {
      alert("Erreur lors du chargement : " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id) fetchEntreprises();
  }, [session]);

  // 2. ENREGISTRER (CREATE / UPDATE)
  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.nom) return alert("Le nom de l'entreprise est obligatoire");

    try {
      const payload = {
        nom: form.nom,
        adresse: form.adresse,
        siret: form.siret,
        user_id: session.user.id
      };

      // Si l'ID existe, Supabase fait un Update, sinon un Insert
      if (form.id) payload.id = form.id;

      const { error } = await supabase
        .from('entreprises')
        .upsert([payload]);

      if (error) throw error;

      alert(form.id ? "Société modifiée !" : "Nouvelle société ajoutée !");
      setForm({ id: null, nom: '', adresse: '', siret: '' }); // Reset formulaire
      fetchEntreprises(); // Rafraîchir la liste
    } catch (error) {
      alert("Erreur de sauvegarde : " + error.message);
    }
  };

  // 3. SUPPRIMER (DELETE)
  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer définitivement cette société ?")) return;

    try {
      const { error } = await supabase
        .from('entreprises')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      alert("Société supprimée");
      fetchEntreprises();
    } catch (error) {
      alert("Erreur : Cette société est probablement liée à des devis existants.");
    }
  };

  // 4. PRÉPARER LA MODIFICATION
  const handleEdit = (ent) => {
    setForm(ent); // Remplit le formulaire avec les données de la ligne
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Remonte au formulaire
  };

  return (
    <div className="config-container">
      <div className="config-header">
        <h3>🏢 Gestion de mes Sociétés</h3>
        <p>Ajoutez ou modifiez les informations de vos entreprises ici.</p>
      </div>

      {/* --- FORMULAIRE --- */}
      <div className="card-form shadow-sm">
        <form onSubmit={handleSave} className="crud-form-layout">
          <div className="input-group">
            <label>Nom de la société</label>
            <input 
              type="text" 
              value={form.nom} 
              onChange={(e) => setForm({...form, nom: e.target.value})} 
              placeholder="Ex: Jean Martin Électricité"
            />
          </div>
          <div className="input-group">
            <label>Adresse complète</label>
            <input 
              type="text" 
              value={form.adresse} 
              onChange={(e) => setForm({...form, adresse: e.target.value})} 
              placeholder="Numéro, rue, code postal, ville"
            />
          </div>
          <div className="input-group">
            <label>Numéro SIRET</label>
            <input 
              type="text" 
              value={form.siret} 
              onChange={(e) => setForm({...form, siret: e.target.value})} 
              placeholder="123 456 789 00012"
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary">
              {form.id ? "💾 Mettre à jour" : "➕ Ajouter la société"}
            </button>
            {form.id && (
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={() => setForm({ id: null, nom: '', adresse: '', siret: '' })}
              >
                Annuler
              </button>
            )}
          </div>
        </form>
      </div>

      {/* --- LISTE --- */}
      <div className="config-list-section">
        <h4>Mes sociétés enregistrées</h4>
        {loading ? (
          <p>Chargement...</p>
        ) : entreprises.length === 0 ? (
          <p className="empty-msg">Aucune société trouvée. Ajoutez-en une ci-dessus.</p>
        ) : (
          <div className="grid-list">
            {entreprises.map((ent) => (
              <div key={ent.id} className="admin-card">
                <div className="admin-card-info">
                  <strong>{ent.nom}</strong>
                  <span>{ent.siret || "Pas de SIRET"}</span>
                </div>
                <div className="admin-card-btns">
                  <button onClick={() => handleEdit(ent)} className="btn-icon" title="Modifier">✏️</button>
                  <button onClick={() => handleDelete(ent.id)} className="btn-icon btn-del" title="Supprimer">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}