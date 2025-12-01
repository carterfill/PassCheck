import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import PasswordChecker from './pages/PasswordChecker';
import PasswordGenerator from './pages/PasswordGenerator';
import BreachChecker from './pages/BreachChecker';
import SecurityCommitment from './pages/SecurityCommitment';
import './App.css';

function App() {
  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#333',
          },
        }}
      />
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/checker" element={<PasswordChecker />} />
          <Route path="/generator" element={<PasswordGenerator />} />
          <Route path="/breach" element={<BreachChecker />} />
          <Route path="/security" element={<SecurityCommitment />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
