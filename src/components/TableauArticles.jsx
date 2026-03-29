import React from 'react';

export function TableauArticles({ items, setItems }) {
  
  const handleItemChange = (id, field, value) => {
    setItems(items.map(item => {
      if (item.id === id) {
        // Pour les nombres, on laisse la chaîne vide s'afficher 
        // sinon on ne peut pas tout effacer pour retaper
        let val = value;
        if (field === 'qte' || field === 'pu') {
          val = value === '' ? '' : parseFloat(value);
        }
        return { ...item, [field]: val };
      }
      return item;
    }));
  };

  const addLine = () => setItems([...items, { id: Date.now(), service: '', qte: 1, pu: 0 }]);
  const deleteLine = (id) => items.length > 1 && setItems(items.filter(i => i.id !== id));

  return (
    <div className="items-section">
      <div className="devis-table-wrapper"> {/* Wrapper ajouté pour la sécurité mobile */}
        <table className="devis-table">
          <thead>
            <tr>
              <th>Désignation des travaux</th>
              <th className="w-100">Qté</th>
              <th className="w-150">PU HT</th>
              <th className="w-100 text-right">Total HT</th>
              <th className="w-50 no-print"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                {/* L'attribut data-label permet au CSS d'afficher le titre sur mobile */}
                <td data-label="Désignation">
                  <input 
                    value={item.service} 
                    onChange={e => handleItemChange(item.id, 'service', e.target.value)} 
                    placeholder="Ex: Pose de carrelage..."
                  />
                </td>
                <td data-label="Quantité">
                  <input 
                    type="number" 
                    value={item.qte} 
                    onChange={e => handleItemChange(item.id, 'qte', e.target.value)} 
                  />
                </td>
                <td data-label="PU HT">
                  <input 
                    type="number" 
                    step="0.01" // Permet les centimes
                    value={item.pu} 
                    onChange={e => handleItemChange(item.id, 'pu', e.target.value)} 
                  />
                </td>
                <td data-label="Total HT" className="text-right">
                  <span className="total-cell-value">
                    {(Number(item.qte || 0) * Number(item.pu || 0)).toFixed(2)} €
                  </span>
                </td>
                <td className="no-print">
                  <button className="btn-delete" onClick={() => deleteLine(item.id)} title="Supprimer la ligne">×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="btn-add no-print" onClick={addLine}>
        <span>+</span> Ajouter une prestation
      </button>
    </div>
  );
}