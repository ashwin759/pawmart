import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AIChatWidget from './components/AIChatWidget'
import TopLoadingBar from './components/TopLoadingBar'
import SplashScreen from './components/SplashScreen'
import Home from './pages/Home'
import Marketplace from './pages/Marketplace'
import PetDetail from './pages/PetDetail'
import BreedDetail from './pages/BreedDetail'
import SearchResults from './pages/SearchResults'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import AdminDashboard from './pages/AdminDashboard'

export default function App() {
  return (
    <>
      <SplashScreen />
      <TopLoadingBar />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/pet/:id" element={<PetDetail />} />
        <Route path="/breed/:id" element={<BreedDetail />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
      <Footer />
      <AIChatWidget />
    </>
  )
}
