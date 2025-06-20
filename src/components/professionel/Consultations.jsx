// src/components/professionnel/Consultations.jsx
import React, { useEffect, useState } from 'react';
import { getConsultations, modifierConsultation } from '../../services/servicePsy';
import { CheckCircle, XCircle, Edit } from 'lucide-react';

const Consultations = () => {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchConsultations = async () => {
    try {
      const data = await getConsultations();
      setConsultations(data);
      setError(null);
    } catch {
      setError("Erreur lors du chargement des consultations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultations();
  }, []);

  const handleModifierStatut = async (id, nouveauStatut) => {
    try {
      await modifierConsultation(id, { statut: nouveauStatut });
      fetchConsultations();
    } catch {
      setError("Erreur lors de la mise à jour.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-semibold text-blue-700 dark:text-blue-400 mb-4 flex items-center gap-2">
        <CheckCircle size={24} /> Mes consultations
      </h2>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {loading ? (
        <p className="text-blue-600 dark:text-blue-400">Chargement...</p>
      ) : consultations.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">Aucune consultation pour le moment.</p>
      ) : (
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-blue-100 dark:bg-blue-800 text-left">
              <th className="p-2">Date</th>
              <th className="p-2">Heure</th>
              <th className="p-2">Utilisateur</th>
              <th className="p-2">Statut</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {consultations.map(({ id, date, heure, utilisateur, statut }) => (
              <tr key={id} className="border-t dark:border-gray-700">
                <td className="p-2">{date}</td>
                <td className="p-2">{heure}</td>
                <td className="p-2">{utilisateur?.prenom} {utilisateur?.nom}</td>
                <td className="p-2 capitalize">{statut}</td>
                <td className="p-2 flex gap-2">
                  {statut !== 'terminée' && (
                    <>
                      <button
                        onClick={() => handleModifierStatut(id, 'terminée')}
                        className="text-green-600 hover:text-green-800"
                        title="Marquer comme terminée"
                      >
                        <CheckCircle size={18} />
                      </button>
                      <button
                        onClick={() => handleModifierStatut(id, 'annulée')}
                        className="text-red-600 hover:text-red-800"
                        title="Annuler la consultation"
                      >
                        <XCircle size={18} />
                      </button>
                    </>
                  )}
                  <button className="text-yellow-600 hover:text-yellow-800" title="Modifier">
                    <Edit size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Consultations;
