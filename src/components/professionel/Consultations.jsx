import React, { useEffect, useState } from 'react';
import { getConsultations } from '../../services/servicePsy';
import { CheckCircle } from 'lucide-react';

const Consultations = () => {
  const [consultations, setConsultations] = useState([]);
  const [filtreStatut, setFiltreStatut] = useState('TOUTES');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchConsultations = async () => {
    try {
      const data = await getConsultations(); // doit appeler /api/professionnels/mes-reservations
      setConsultations(data);
      setError(null);
    } catch (e) {
      console.error("Erreur lors du chargement :", e);
      setError("Erreur lors du chargement des consultations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultations();
  }, []);

  const consultationsFiltrees = consultations.filter(({ statut }) => {
    if (filtreStatut === 'TOUTES') return true;
    return statut === filtreStatut;
  });

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h2 className="text-2xl font-semibold text-blue-700 dark:text-blue-400 mb-4 flex items-center gap-2">
        <CheckCircle size={24} /> Mes consultations
      </h2>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {/* Filtre par statut */}
      <div className="mb-4 flex gap-3 flex-wrap">
        {['TOUTES', 'EN_ATTENTE', 'CONFIRMEE', 'TERMINEE'].map((statut) => (
          <button
            key={statut}
            onClick={() => setFiltreStatut(statut)}
            className={`px-3 py-1 rounded-full border text-sm ${
              filtreStatut === statut
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300'
            }`}
          >
            {statut === 'TOUTES'
              ? 'Toutes'
              : statut === 'EN_ATTENTE'
              ? 'En attente'
              : statut === 'CONFIRMEE'
              ? 'Confirmée'
              : 'Terminée'}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-blue-600 dark:text-blue-400">Chargement...</p>
      ) : consultationsFiltrees.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">Aucune consultation pour ce filtre.</p>
      ) : (
        <table className="w-full table-auto border-collapse border border-gray-300 dark:border-gray-700">
          <thead>
            <tr className="bg-blue-100 dark:bg-blue-800 text-left">
              <th className="p-2 border border-gray-300 dark:border-gray-700">Date</th>
              <th className="p-2 border border-gray-300 dark:border-gray-700">Heure</th>
              <th className="p-2 border border-gray-300 dark:border-gray-700">Utilisateur</th>
              <th className="p-2 border border-gray-300 dark:border-gray-700">Statut</th>
            </tr>
          </thead>
          <tbody>
            {consultationsFiltrees.map(({ id, date, heure, utilisateurNom, utilisateurPrenom, statut }) => (
              <tr key={id} className="border-t border-gray-300 dark:border-gray-700">
                <td className="p-2 border border-gray-300 dark:border-gray-700">{date}</td>
                <td className="p-2 border border-gray-300 dark:border-gray-700">{heure}</td>
                <td className="p-2 border border-gray-300 dark:border-gray-700">
                  {utilisateurPrenom} {utilisateurNom}
                </td>
                <td className="p-2 border border-gray-300 dark:border-gray-700 capitalize">
                  {statut.toLowerCase()}
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
