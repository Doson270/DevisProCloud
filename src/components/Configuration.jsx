import React, { useState, useEffect } from 'react';
import { fetchEntreprises, deleteEntreprise, upsertEntreprise } from '../services/api';

export default function Configuration({ session }) {
  const [entreprises, setEntreprises] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // État du formulaire : vide = Création / avec ID = Modification
  const [form, setForm] = useState({ id: null, nom: '', adresse: '', siret: '' });

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

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await upsertEntreprise(form, session.user.id);
      alert(form.id ? "Société modifiée !" : "Société ajoutée !");
      setForm({ id: null, nom: '', adresse: '', siret: '' }); // Reset
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

      {/* --- BLOC 1 : LE FORMULAIRE (CRÉER / MODIFIER) --- */}
      <div className="card-form shadow-sm" >
        <h3 >{form.id ? "✏️ Modifier la société" : "➕ Ajouter une société"}</h3>
        <form onSubmit={handleSave}>
          <input 
            placeholder="Nom de l'entreprise" 
            value={form.nom} 
            onChange={e => setForm({...form, nom: e.target.value})} 
            required 
          />
          <input 
            placeholder="Adresse" 
            value={form.adresse} 
            onChange={e => setForm({...form, adresse: e.target.value})} 
          />
          <input 
            placeholder="SIRET" 
            value={form.siret} 
            onChange={e => setForm({...form, siret: e.target.value})} 
          />
          <div>
            <button type="submit" className="btn-primary">
              {form.id ? "Mettre à jour" : "Enregistrer la société"}
            </button>
            {form.id && (
              <button type="button" onClick={() => setForm({ id: null, nom: '', adresse: '', siret: '' })}>Annuler</button>
            )}
          </div>
        </form>
      </div>

      {/* --- BLOC 2 : LA LISTE (MODIFIER / SUPPRIMER) --- */}
      <div className="list-entreprises">
        <h3>📋 Mes sociétés enregistrées</h3>
        {loading ? <p>Chargement...</p> : (
          <div>
            {entreprises.length === 0 && <p>Aucune société. Utilisez le formulaire ci-dessus.</p>}
            {entreprises.map(ent => (
              <div key={ent.id} className="admin-card">
                <div>
                  <strong>{ent.nom}</strong>
                  <div>SIRET: {ent.siret || 'N/A'}</div>
                </div>
                <div>
                  {/* BOUTON MODIFIER */}
                  <button 
                    onClick={() => setForm(ent)} 
                  >✏️</button>
                  
                  {/* BOUTON SUPPRIMER */}
                  <button 
                    onClick={() => handleRemove(ent.id)}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}