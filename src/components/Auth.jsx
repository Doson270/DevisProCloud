import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // Nouveau champ
  const [isSignUp, setIsSignUp] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    // --- SÉCURITÉ CÔTÉ CLIENT ---
    if (isSignUp) {
      if (password !== confirmPassword) {
        setErrorMsg("Les mots de passe ne correspondent pas.");
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setErrorMsg("Le mot de passe doit faire au moins 6 caractères.");
        setLoading(false);
        return;
      }
    }

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: { emailRedirectTo: window.location.origin }
        });
        if (error) throw error;
        alert('Inscription réussie ! Vérifiez vos emails pour confirmer.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <h1>🛠️ ArtisanPro</h1>
          <p>{isSignUp ? 'Créez votre compte pro' : 'Accédez à votre espace'}</p>
        </div>

        {errorMsg && (
          <div className="auth-error-badge">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleAuth} className="auth-form">
          <div className="input-group">
            <label>Adresse Email</label>
            <input 
              type="email" 
              placeholder="votre@email.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div className="input-group">
            <label>Mot de passe</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          {/* CHAMP DE CONFIRMATION (Uniquement en mode Inscription) */}
          {isSignUp && (
            <div className="input-group animate-in">
              <label>Confirmez le mot de passe</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required 
              />
            </div>
          )}

          <button type="submit" className="btn-save auth-submit" disabled={loading}>
            {loading ? 'Traitement en cours...' : (isSignUp ? 'Créer mon compte' : 'Se connecter')}
          </button>
        </form>

        <div className="auth-footer">
          <button 
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg('');
            }} 
            className="btn-link"
          >
            {isSignUp ? 'Déjà inscrit ? Connectez-vous' : 'Nouveau ici ? Créez un compte'}
          </button>
        </div>
      </div>
    </div>
  );
}