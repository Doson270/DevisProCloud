import React, { useState, useEffect } from 'react';
import { fetchEntreprises, deleteEntreprise, upsertEntreprise, uploadLogo } from '../services/api';

export default function Configuration({ session }) {
  const [entreprises, setEntreprises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // État du formulaire incluant logo_url
  const [form, setForm] = useState({ id: null, nom: '', adresse: '', siret: '', logo_url: '' });

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchEntreprises(session.user.id);
      setEntreprises(data);
    } catch (err) {
      alert("Erreur : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [session]);

  // --- LOGIQUE UPLOAD LOGO ---
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const publicUrl = await uploadLogo(file, session.user.id);
      setForm({ ...form, logo_url: publicUrl }); // On met à jour l'URL dans le formulaire
      alert("Logo chargé avec succès !");
    } catch (err) {
      alert("Erreur lors de l'envoi du logo : " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await upsertEntreprise(form, session.user.id);
      alert(form.id ? "Société modifiée !" : "Société ajoutée !");
      setForm({ id: null, nom: '', adresse: '', siret: '', logo_url: '' }); // Reset complet
      loadData();
    } catch (err) {
      alert("Erreur sauvegarde : " + err.message);
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm("Supprimer cette société ?")) return;
    try {
      await deleteEntreprise(id);
      loadData();
    } catch (err) {
      alert("Impossible de supprimer : elle est liée à des devis existants.");
    }
  };

  return (
    <div className="config-container">
      <h2>⚙️ Paramètres de mes sociétés</h2>

      {/* --- BLOC 1 : LE FORMULAIRE --- */}
      <div className="section-card shadow-sm">
        <h3>{form.id ? "✏️ Modifier la société" : "➕ Ajouter une société"}</h3>
        
        <form onSubmit={handleSave}>
          {/* ZONE LOGO */}
          <div className="logo-upload-wrapper" style={{ textAlign: 'center', marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>Logo de l'entreprise</label>
            <div className="logo-preview-container">
              {form.logo_url ? (
                <img src={form.logo_url} alt="Aperçu logo" className="logo-preview" />
              ) : (
                <span className="logo-placeholder">Aucun Logo</span>
              )}
            </div>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              style={{ fontSize: '0.8rem', marginTop: '10px' }}
            />
            {uploading && <p style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>Envoi en cours...</p>}
          </div>

          <div className="input-group">
            <input 
              placeholder="Nom de l'entreprise" 
              value={form.nom} 
              onChange={e => setForm({...form, nom: e.target.value})} 
              required 
            />
          </div>
          
          <div className="input-group">
            <input 
              placeholder="Adresse" 
              value={form.adresse} 
              onChange={e => setForm({...form, adresse: e.target.value})} 
            />
          </div>

          <div className="input-group">
            <input 
              placeholder="SIRET" 
              value={form.siret} 
              onChange={e => setForm({...form, siret: e.target.value})} 
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="submit" className="btn-save" disabled={uploading}>
              {form.id ? "Mettre à jour" : "Enregistrer la société"}
            </button>
            {form.id && (
              <button 
                type="button" 
                className="btn-secondary"
                onClick={() => setForm({ id: null, nom: '', adresse: '', siret: '', logo_url: '' })}
              >
                Annuler
              </button>
            )}
          </div>
        </form>
      </div>

      {/* --- BLOC 2 : LA LISTE --- */}
      <div className="list-entreprises" style={{ marginTop: '30px' }}>
        <h3>📋 Mes sociétés enregistrées</h3>
        {loading ? <p>Chargement...</p> : (
          <div className="table-container section-card">
            {entreprises.length === 0 && <p>Aucune société enregistrée.</p>}
            {entreprises.map(ent => (
              <div key={ent.id} className="admin-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  {ent.logo_url && <img src={ent.logo_url} alt="logo" style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '4px' }} />}
                  <div>
                    <strong style={{ display: 'block' }}>{ent.nom}</strong>
                    <small style={{ color: 'var(--text-muted)' }}>SIRET: {ent.siret || 'N/A'}</small>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn-save" style={{ padding: '6px 10px' }} onClick={() => setForm(ent)}>✏️</button>
                  <button className="btn-danger" style={{ padding: '6px 10px' }} onClick={() => handleRemove(ent.id)}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}