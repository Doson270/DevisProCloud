// src/pages/HistoryPage.jsx
import React from 'react';
import { Historique } from '../components/Historique';

export default function HistoryPage({ onSelect, notify }) {
  return (
    <div className="page-history">
      <Historique onSelectDevis={onSelect} notify={notify} />
    </div>
  );
}