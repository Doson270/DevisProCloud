import React, { useEffect, useRef } from 'react';
import SignaturePad from 'signature_pad';

export default function SignatureModal({ onSave, onClose }) {
  const canvasRef = useRef(null);
  const signaturePadRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current) {
      // Initialisation manuelle de la bibliothèque
      signaturePadRef.current = new SignaturePad(canvasRef.current, {
        backgroundColor: 'rgb(255, 255, 255)'
      });

      // Ajuster la taille du canvas pour le tactile
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      canvasRef.current.width = canvasRef.current.offsetWidth * ratio;
      canvasRef.current.height = canvasRef.current.offsetHeight * ratio;
      canvasRef.current.getContext("2d").scale(ratio, ratio);
    }

    return () => {
      if (signaturePadRef.current) signaturePadRef.current.off();
    };
  }, []);

  const clear = () => {
    if (signaturePadRef.current) signaturePadRef.current.clear();
  };

  const save = () => {
    if (signaturePadRef.current.isEmpty()) {
      return alert("Veuillez signer avant de valider.");
    }
    
    // On récupère l'image en base64
    const dataURL = signaturePadRef.current.toDataURL();
    onSave(dataURL);
  };

  return (
    <div className="modal-overlay" style={modalStyle}>
      <div className="section-card" style={{ width: '95%', maxWidth: '500px', background: '#fff', padding: '20px' }}>
        <h3 style={{ marginTop: 0 }}>✍️ Signature du Client</h3>
        
        <div style={{ border: '2px dashed #ccc', borderRadius: '8px', marginBottom: '20px', background: '#f9f9f9' }}>
          <canvas 
            ref={canvasRef} 
            style={{ width: '100%', height: '200px', display: 'block', touchAction: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn-secondary">Annuler</button>
          <button onClick={clear} className="btn-secondary">Effacer</button>
          <button onClick={save} className="btn-save" style={{ backgroundColor: '#27ae60' }}>
            Valider la signature
          </button>
        </div>
      </div>
    </div>
  );
}

const modalStyle = {
  position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
  backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center',
  alignItems: 'center', zIndex: 9999
};