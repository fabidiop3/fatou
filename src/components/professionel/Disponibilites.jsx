// src/components/professionnel/Disponibilites.jsx
import React, { useEffect, useState } from 'react';
import {
  getDisponibilites,
  ajouterDisponibilite,
  modifierDisponibilite,
  supprimerDisponibilite,
} from '../../services/servicePsy';
import { CalendarPlus, Edit, Trash2 } from 'lucide-react';

const Disponibilites = () => {
  const [disponibilites, setDisponibilites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [formData, setFormData] = useState({ date: '', heureDebut: '', heureFin: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const fetchDisponibilites = async () => {
    try {
      const data = await getDisponibilites();
      setDisponibilites(data);
      setErreur(null);
    } catch (err) {
      setErreur("Erreur lors du chargement des disponibilités.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisponibilites();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await modifierDisponibilite(editingId, formData);
      } else {
        await ajouterDisponibilite(formData);
      }
      await fetchDisponibilites();
      setFormData({ date: '', heureDebut: '', heureFin: '' });
      setIsEditing(false);
      setEditingId(null);
    } catch (err) {
      setErreur("Erreur lors de l’enregistrement.");
    }
  };

  const handleEdit = (dispo) => {
    setFormData({ date: dispo.date, heureDebut: dispo.heureDebut, heureFin: dispo.heureFin });
    setIsEditing(true);
    setEditingId(dispo.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer cette disponibilité ?')) {
      try {
        await supprimerDisponibilite(id);
        await fetchDisponibilites();
      } catch {
        setErreur("Erreur lors de la suppression.");
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-semibold text-blue-700 dark:text-blue-400 flex items-center gap-2 mb-4">
        <CalendarPlus size={24} /> Gérer mes disponibilités
      </h2>

      {erreur && <div className="text-red-500 mb-2">{erreur}</div>}

      <form onSubmit={handleSubmit} className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
          className="border p-2 rounded"
        />
        <input
          type="time"
          value={formData.heureDebut}
          onChange={(e) => setFormData({ ...formData, heureDebut: e.target.value })}
          required
          className="border p-2 rounded"
        />
        <input
          type="time"
          value={formData.heureFin}
          onChange={(e) => setFormData({ ...formData, heureFin: e.target.value })}
          required
          className="border p-2 rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
        >
          {isEditing ? "Modifier" : "Ajouter"}
        </button>
      </form>

      {loading ? (
        <p className="text-blue-600 dark:text-blue-400">Chargement...</p>
      ) : (
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-blue-100 dark:bg-blue-800 text-left">
              <th className="p-2">Date</th>
              <th className="p-2">Heure début</th>
              <th className="p-2">Heure fin</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {disponibilites.length > 0 ? (
              disponibilites.map((dispo) => (
                <tr key={dispo.id} className="border-t dark:border-gray-700">
                  <td className="p-2">{dispo.date}</td>
                  <td className="p-2">{dispo.heureDebut}</td>
                  <td className="p-2">{dispo.heureFin}</td>
                  <td className="p-2 flex gap-2">
                    <button
                      onClick={() => handleEdit(dispo)}
                      className="text-yellow-600 hover:text-yellow-800"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(dispo.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="4" className="text-center p-4 text-gray-500">Aucune disponibilité.</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Disponibilites;
