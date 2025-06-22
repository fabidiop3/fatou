import React, { useEffect, useState } from 'react';
import {
  getDisponibilitesByProId,
  ajouterDisponibilite,
  modifierDisponibilite,
  supprimerDisponibilite
} from '../../services/servicePsy';

import { CheckCircle, XCircle, Trash2, Pencil } from 'lucide-react';

const Disponibilite = ({ proId }) => {
  const [disponibilites, setDisponibilites] = useState([]);
  const [formData, setFormData] = useState({
    date: '',
    heureDebut: '',
    heureFin: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!proId) return;
    chargerDisponibilites();
  }, [proId]);

  const chargerDisponibilites = async () => {
    try {
      setLoading(true);
      const data = await getDisponibilitesByProId(proId);
      setDisponibilites(data);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: "Erreur lors du chargement des disponibilités." });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ date: '', heureDebut: '', heureFin: '' });
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.date || !formData.heureDebut || !formData.heureFin) {
        setMessage({ type: 'error', text: 'Tous les champs sont requis.' });
        return;
      }

      if (editingId) {
        // Modification sans passer professionnelId
        await modifierDisponibilite(editingId, formData);
        setMessage({ type: 'success', text: 'Disponibilité modifiée avec succès.' });
      } else {
        // Ajout sans passer professionnelId
        await ajouterDisponibilite(formData);
        setMessage({ type: 'success', text: 'Disponibilité ajoutée avec succès.' });
      }

      resetForm();
      chargerDisponibilites();
    } catch (err) {
      console.error("Erreur sauvegarde :", err);
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde.' });
    }
  };

  const handleEdit = (dispo) => {
    setEditingId(dispo.id);
    setFormData({
      date: dispo.date,
      heureDebut: dispo.heureDebut,
      heureFin: dispo.heureFin
    });
  };

  const handleDelete = async (id) => {
    try {
      await supprimerDisponibilite(id);
      setMessage({ type: 'success', text: 'Disponibilité supprimée.' });
      chargerDisponibilites();
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Erreur lors de la suppression.' });
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 bg-white shadow-md rounded-md space-y-4">
      <h2 className="text-2xl font-semibold text-center">Mes disponibilités</h2>

      {message.text && (
        <div className={`flex items-center gap-2 p-3 text-sm rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="flex-1 border px-2 py-1 rounded"
            required
          />
          <input
            type="time"
            name="heureDebut"
            value={formData.heureDebut}
            onChange={handleChange}
            className="flex-1 border px-2 py-1 rounded"
            required
          />
          <input
            type="time"
            name="heureFin"
            value={formData.heureFin}
            onChange={handleChange}
            className="flex-1 border px-2 py-1 rounded"
            required
          />
        </div>
        <div className="flex justify-end gap-2">
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-200 hover:bg-gray-300 text-sm px-4 py-1 rounded"
            >
              Annuler
            </button>
          )}
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-1 rounded"
          >
            {editingId ? 'Modifier' : 'Ajouter'}
          </button>
        </div>
      </form>

      <div className="border-t pt-3">
        {loading ? (
          <p className="text-center">Chargement...</p>
        ) : disponibilites.length === 0 ? (
          <p className="text-center text-gray-600">Aucune disponibilité enregistrée.</p>
        ) : (
          <ul className="divide-y">
            {disponibilites.map((dispo) => (
              <li key={dispo.id} className="py-2 flex justify-between items-center">
                <span>{dispo.date} | {dispo.heureDebut} - {dispo.heureFin}</span>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleEdit(dispo)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Modifier"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(dispo.id)}
                    className="text-red-600 hover:text-red-800"
                    title="Supprimer"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Disponibilite;
