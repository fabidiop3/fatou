import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import de useNavigate pour la redirection
import Layout from '../components/commun/Layout';
import Reservations from '../components/professionel/Reservations';
import Consultations from '../components/professionel/Consultations';
import {
  CalendarDays,
  UserCheck,
  Info,
  ChevronsLeft,
  ChevronsRight,
  Moon,
  Sun,
  XCircle
} from 'lucide-react';

// IMPORT DE LA FONCTION POUR LIRE L'UTILISATEUR DANS LOCALSTORAGE
import { getCurrentUserInfo } from '../services/serviceAuth';
import Disponibilite from '../components/professionel/Disponibilite';

const TableauProfessionnel = () => {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState(null);
  const [activeTab, setActiveTab] = useState('informations');
  const [sidebarReduced, setSidebarReduced] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true';
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  useEffect(() => {
    const fetchUserData = () => {
      try {
        const user = getCurrentUserInfo();
        if (!user || !(user.role === 'PSYCHOLOGUE' || user.role === 'PSYCHIATRE')) {
          setGlobalError("Accès refusé : Vous n'êtes pas un professionnel de santé mentale ou non connecté.");
          navigate('/connexion'); // redirection vers page de connexion
        } else {
          setCurrentUser(user);  // on stocke bien l'utilisateur valide
          setGlobalError(null);
        }
      } catch (error) {
        setCurrentUser(null);
        setGlobalError("Erreur lors du chargement de l'utilisateur.");
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [navigate]);

  const renderSection = () => {
    switch (activeTab) {
      
      
      case 'disponibilites':
        // Passer proId si besoin (à adapter selon composant Disponibilites)
        return <Disponibilite proId={currentUser?.id} />;
      case 'reservations':
        return <Reservations proId={currentUser?.id} />;
      case 'consultations':
        return <Consultations />;
      default:
        return <p>Onglet non reconnu</p>;
    }
  };

  if (loading)
    return (
      <Layout>
        <div className="text-center p-8 text-blue-600 dark:text-blue-400">
          Chargement...
        </div>
      </Layout>
    );

  if (globalError && !currentUser)
    return (
      <Layout>
        <div className="p-6 text-red-600 dark:text-red-400">{globalError}</div>
      </Layout>
    );

  return (
    <Layout>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        {/* Sidebar */}
        <nav
          className={`flex flex-col justify-between bg-gradient-to-b from-blue-800 to-blue-600 text-white shadow-lg
            transition-width duration-300 ease-in-out
            ${sidebarReduced ? 'w-20' : 'w-64'}
          `}
        >
          {/* User info */}
          <div className="flex flex-col items-center p-3 border-b border-blue-500 space-y-1">
            {currentUser?.photoUrl ? (
              <img
                src={currentUser.photoUrl}
                alt="pro"
                className="w-14 h-14 rounded-full"
              />
            ) : (
              <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center text-white text-lg font-semibold">
                {currentUser?.prenom?.[0] || 'P'}
              </div>
            )}

            {!sidebarReduced && (
              <>
                <div className="flex gap-1 font-semibold text-base leading-tight justify-center">
                  <span>{currentUser?.prenom}</span>
                  <span>{currentUser?.nom}</span>
                </div>
                <span className="text-blue-300 text-xs">Professionnel</span>
              </>
            )}
          </div>

          {/* Nav items */}
          <div className="flex-grow mt-1 space-y-1 px-2">
          
            <NavItem
              icon={<CalendarDays size={20} />}
              label="Disponibilités"
              active={activeTab === 'disponibilites'}
              onClick={() => setActiveTab('disponibilites')}
              reduced={sidebarReduced}
            />
            <NavItem
              icon={<UserCheck size={20} />}
              label="Réservations"
              active={activeTab === 'reservations'}
              onClick={() => setActiveTab('reservations')}
              reduced={sidebarReduced}
            />
            <NavItem
              icon={<CalendarDays size={20} />}
              label="Consultations"
              active={activeTab === 'consultations'}
              onClick={() => setActiveTab('consultations')}
              reduced={sidebarReduced}
            />
          </div>

          {/* Dark mode toggle */}
          <div className="flex flex-col items-center gap-1 px-2 mt-2">
            {!sidebarReduced ? (
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="flex items-center gap-2 text-blue-200 hover:text-white transition px-4 py-2 rounded w-full justify-center bg-blue-700 dark:bg-blue-900"
                aria-label="Toggle mode sombre"
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                <span>{darkMode ? 'Clair' : 'Sombre'}</span>
              </button>
            ) : (
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="text-blue-200 hover:text-white transition p-2 rounded"
                aria-label="Toggle mode sombre"
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            )}
          </div>

          {/* Sidebar toggle */}
          <div className="p-1 border-t border-blue-500 flex justify-center mt-2 mb-4">
            <button
              onClick={() => setSidebarReduced(!sidebarReduced)}
              className="text-blue-200 hover:text-white transition-transform duration-200 ease-in-out"
              aria-label={sidebarReduced ? 'Ouvrir sidebar' : 'Réduire sidebar'}
              style={{ transformOrigin: 'center' }}
            >
              {sidebarReduced ? <ChevronsRight size={24} /> : <ChevronsLeft size={24} />}
            </button>
          </div>
        </nav>

        {/* Contenu principal */}
        <main className="flex-grow p-6 text-gray-900 dark:text-gray-100 transition-colors duration-300">
          {globalError && (
            <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-400 px-4 py-2 rounded flex items-center gap-2 mb-4">
              <XCircle size={20} />
              <span>{globalError}</span>
            </div>
          )}
          {renderSection()}
        </main>
      </div>
    </Layout>
  );
};

const NavItem = ({ icon, label, active, onClick, reduced }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 
      ${active ? 'bg-blue-900 dark:bg-blue-700' : 'hover:bg-blue-700 dark:hover:bg-blue-800'} ${reduced ? 'justify-center' : ''}`}
  >
    {icon}
    {!reduced && <span>{label}</span>}
  </button>
);

export default TableauProfessionnel;
