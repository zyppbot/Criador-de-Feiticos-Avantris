import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Book, Wand2, Key } from 'lucide-react';
import Home from './pages/Home';
import CreateSpell from './pages/CreateSpell';
import SpellDetails from './pages/SpellDetails';
import { useSpells } from './context/SpellContext';

function ApiKeyInput() {
  const { apiKey, setApiKey } = useSpells();
  
  return (
    <div className="glass-container" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <Key size={16} color="var(--text-muted)" />
      <input 
        type="password" 
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        placeholder="Gemini API Key..."
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--text-main)',
          outline: 'none',
          width: '150px',
          fontSize: '0.85rem',
          display: import.meta.env.VITE_GEMINI_API_KEY ? 'none' : 'block'
        }}
      />
    </div>
  );
}

function Layout({ children }) {
  return (
    <>
      <nav className="navbar">
        <Link to="/" className="navbar-brand">Avantris RPG</Link>
        <div className="nav-links">
          {!import.meta.env.VITE_GEMINI_API_KEY && <ApiKeyInput />}
          <Link to="/" className="nav-item"><Book size={18} /> Gaveta de Magias</Link>
          <Link to="/create" className="nav-item"><Wand2 size={18} /> Criar Magia</Link>
        </div>
      </nav>
      <main className="main-content">
        {children}
      </main>
    </>
  );
}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateSpell />} />
          <Route path="/spell/:id" element={<SpellDetails />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
