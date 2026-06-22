import React, { useState, createContext, useContext } from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useDB } from "./useDB";

import Login        from "./login";
import Dashboard    from "./Dashboard";
import Alumnos      from "./Alumnos";
import Maestros     from "./Maestros";
import Grupos       from "./Grupos";
import Asistencia   from "./Asistencia";
import Calificaciones from "./Calificaciones";
import Avisos       from "./Avisos";
import Riesgo       from "./Riesgo";

import "./App.css";

export const DBContext = createContext(null);
export const useAppDB = () => useContext(DBContext);

const NAV = [
  { to: "/",               label: "Dashboard",      icon: "📊", exact: true },
  { to: "/alumnos",        label: "Alumnos",        icon: "👨‍🎓" },
  { to: "/maestros",       label: "Maestros",       icon: "👩‍🏫" },
  { to: "/grupos",         label: "Grupos",         icon: "🏫" },
  { to: "/asistencia",     label: "Asistencia",     icon: "✅" },
  { to: "/calificaciones", label: "Calificaciones", icon: "📝" },
  { to: "/avisos",         label: "Avisos",         icon: "🔔" },
  { to: "/riesgo",         label: "Alertas",        icon: "⚠️" },
];

// Solo los 5 más usados aparecen en el bottom-nav de móvil
const BOTTOM_NAV = [
  { to: "/",           label: "Inicio",     icon: "📊", exact: true },
  { to: "/alumnos",    label: "Alumnos",    icon: "👨‍🎓" },
  { to: "/asistencia", label: "Asistencia", icon: "✅" },
  { to: "/avisos",     label: "Avisos",     icon: "🔔" },
  { to: "/riesgo",     label: "Alertas",    icon: "⚠️" },
];

function Sidebar({ collapsed, setCollapsed }) {
  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>

      {/* LOGO */}
      <div className="sidebar-logo">
        <span className="logo-icon">🏫</span>
        {!collapsed && (
          <div>
            <div className="logo-title">EduGestión</div>
            <div className="logo-sub">Sistema Escolar</div>
          </div>
        )}
        <button
          className="collapse-btn"
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? "Expandir menú" : "Colapsar menú"}
        >
          {collapsed ? "›" : "‹"}
        </button>
      </div>

      {/* NAVEGACIÓN */}
      <nav className="sidebar-nav">
        {!collapsed && <div className="nav-section">MENÚ PRINCIPAL</div>}
        {NAV.map(({ to, label, icon, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            title={collapsed ? label : undefined}
          >
            <span className="nav-icon">{icon}</span>
            {!collapsed && <span className="nav-label">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* CERRAR SESIÓN — siempre visible, adapta tamaño */}
      <button
        className="logout-btn"
        onClick={() => { localStorage.removeItem("auth"); window.location.reload(); }}
        title="Cerrar sesión"
      >
        <span className="logout-icon">🚪</span>
        {!collapsed && <span className="logout-text"> Cerrar sesión</span>}
      </button>

      {/* USUARIO */}
      <div className="sidebar-footer">
        <div className="user-pill">
          <div className="user-avatar">MA</div>
          {!collapsed && (
            <div>
              <div className="user-name">Ma. Norma Alvarez</div>
              <div className="user-role">Directora</div>
            </div>
          )}
        </div>
      </div>

    </aside>
  );
}

/* Bottom navigation — solo visible en móvil vía CSS */
function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Navegación principal">
      {BOTTOM_NAV.map(({ to, label, icon, exact }) => (
        <NavLink
          key={to}
          to={to}
          end={exact}
          className={({ isActive }) => `bottom-nav-item ${isActive ? "active" : ""}`}
        >
          <span className="bnav-icon">{icon}</span>
          <span className="bnav-label">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export function Layout({ children, title }) {
  return (
    <div className="layout">
      <header className="topbar">
        <h1 className="page-title">{title}</h1>
        <div className="topbar-right">
          <span className="topbar-date">
            {new Date().toLocaleDateString("es-MX", {
              weekday: "long", year: "numeric",
              month: "long",  day: "numeric",
            })}
          </span>
        </div>
      </header>
      <main className="main-content">{children}</main>
    </div>
  );
}

function App() {
  const db = useDB();
  const [collapsed, setCollapsed] = useState(false);
  const [auth, setAuth] = useState(localStorage.getItem("auth") === "true");

  if (!auth) return <Login onLogin={() => setAuth(true)} />;

  return (
    <DBContext.Provider value={db}>
      <BrowserRouter>
        <div className="app-shell">
          <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

          <div className="app-content">
            <Routes>
              <Route path="/"               element={<Dashboard />} />
              <Route path="/alumnos"        element={<Alumnos />} />
              <Route path="/maestros"       element={<Maestros />} />
              <Route path="/grupos"         element={<Grupos />} />
              <Route path="/asistencia"     element={<Asistencia />} />
              <Route path="/calificaciones" element={<Calificaciones />} />
              <Route path="/avisos"         element={<Avisos />} />
              <Route path="/riesgo"         element={<Riesgo />} />
            </Routes>
          </div>

          {/* Bottom nav → solo visible en móvil via CSS */}
          <BottomNav />
        </div>

        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      </BrowserRouter>
    </DBContext.Provider>
  );
}

export default App;
