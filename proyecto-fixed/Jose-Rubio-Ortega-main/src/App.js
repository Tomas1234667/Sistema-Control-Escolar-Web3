import React, { useState, createContext, useContext } from "react";
import { BrowserRouter, Routes, Route, NavLink, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useDB } from "./useDB";

import Login          from "./login";
import Dashboard      from "./Dashboard";
import Alumnos        from "./Alumnos";
import Maestros       from "./Maestros";
import Grupos         from "./Grupos";
import Asistencia     from "./Asistencia";
import Calificaciones from "./Calificaciones";
import Avisos         from "./Avisos";
import Riesgo         from "./Riesgo";

import "./App.css";

export const DBContext  = createContext(null);
export const useAppDB  = () => useContext(DBContext);
export const AuthCtx   = createContext(null);
export const useAuth   = () => useContext(AuthCtx);

// Nav completo — solo admin lo ve todo
const NAV_ADMIN = [
  { to:"/",               label:"Dashboard",      icon:"📊", exact:true },
  { to:"/alumnos",        label:"Alumnos",        icon:"👨‍🎓" },
  { to:"/maestros",       label:"Maestros",       icon:"👩‍🏫" },
  { to:"/grupos",         label:"Grupos",         icon:"🏫" },
  { to:"/asistencia",     label:"Asistencia",     icon:"✅" },
  { to:"/calificaciones", label:"Calificaciones", icon:"📝" },
  { to:"/avisos",         label:"Avisos",         icon:"🔔" },
  { to:"/riesgo",         label:"Alertas",        icon:"⚠️" },
];

// Maestros NO ven "Maestros"
const NAV_MAESTRO = NAV_ADMIN.filter(n=>n.to!=="/maestros");

const BOTTOM_NAV = [
  { to:"/",           label:"Inicio",     icon:"📊", exact:true },
  { to:"/alumnos",    label:"Alumnos",    icon:"👨‍🎓" },
  { to:"/asistencia", label:"Asistencia", icon:"✅" },
  { to:"/avisos",     label:"Avisos",     icon:"🔔" },
  { to:"/riesgo",     label:"Alertas",    icon:"⚠️" },
];

function Sidebar({ collapsed, setCollapsed, nav, auth, onLogout }) {
  const avatarLetras = auth?.nombre?.split(" ").map(w=>w[0]).slice(0,2).join("") || "??";
  const rolLabel = auth?.rol==="admin" ? "Directora" : `Maestro(a)${auth?.grupo?" · "+auth.grupo:""}`;

  return (
    <aside className={`sidebar ${collapsed?"collapsed":""}`}>
      <div className="sidebar-logo">
        <span className="logo-icon">🏫</span>
        {!collapsed&&(
          <div>
            <div className="logo-title">EduGestión</div>
            <div className="logo-sub">Sistema Escolar</div>
          </div>
        )}
        <button className="collapse-btn" onClick={()=>setCollapsed(c=>!c)}
          title={collapsed?"Expandir":"Colapsar"}>
          {collapsed?"›":"‹"}
        </button>
      </div>

      <nav className="sidebar-nav">
        {!collapsed&&<div className="nav-section">MENÚ PRINCIPAL</div>}
        {nav.map(({to,label,icon,exact})=>(
          <NavLink key={to} to={to} end={exact}
            className={({isActive})=>`nav-item ${isActive?"active":""}`}
            title={collapsed?label:undefined}>
            <span className="nav-icon">{icon}</span>
            {!collapsed&&<span className="nav-label">{label}</span>}
          </NavLink>
        ))}
      </nav>

      <button className="logout-btn" onClick={onLogout} title="Cerrar sesión">
        <span className="logout-icon">🚪</span>
        {!collapsed&&<span className="logout-text"> Cerrar sesión</span>}
      </button>

      <div className="sidebar-footer">
        <div className="user-pill">
          <div className="user-avatar">{avatarLetras}</div>
          {!collapsed&&(
            <div>
              <div className="user-name">{auth?.nombre||"Usuario"}</div>
              <div className="user-role">{rolLabel}</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

function BottomNav({ nav, onLogout }) {
  const items = nav.filter(n=>
    ["/","/alumnos","/asistencia","/avisos","/riesgo"].includes(n.to)
  );
  return (
    <nav className="bottom-nav" aria-label="Navegación principal">
      {items.map(({to,label,icon,exact})=>(
        <NavLink key={to} to={to} end={exact}
          className={({isActive})=>`bottom-nav-item ${isActive?"active":""}`}>
          <span className="bnav-icon">{icon}</span>
          <span className="bnav-label">{label}</span>
        </NavLink>
      ))}
      <button className="bnav-logout" onClick={onLogout} title="Cerrar sesión">
        <span className="bnav-icon">🚪</span>
        <span>Salir</span>
      </button>
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
            {new Date().toLocaleDateString("es-MX",{
              weekday:"long",year:"numeric",month:"long",day:"numeric",
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

  const leerAuth = () => {
    if(localStorage.getItem("auth")==="true"){
      return {
        rol:       localStorage.getItem("rol")||"admin",
        nombre:    localStorage.getItem("authNombre")||"Usuario",
        grupo:     localStorage.getItem("authGrupo")||"",
        maestroId: localStorage.getItem("authMaestroId")||"",
      };
    }
    return null;
  };

  const [auth, setAuth]           = useState(leerAuth);
  const [collapsed, setCollapsed] = useState(false);

  const handleLogin = (info) => setAuth(info);

  const handleLogout = () => {
    ["auth","rol","authNombre","authGrupo","authMaestroId"]
      .forEach(k=>localStorage.removeItem(k));
    setAuth(null);
  };

  if(!auth) return <Login onLogin={handleLogin}/>;

  const nav = auth.rol==="admin" ? NAV_ADMIN : NAV_MAESTRO;

  return (
    <AuthCtx.Provider value={auth}>
      <DBContext.Provider value={db}>
        <BrowserRouter>
          <div className="app-shell">
            <Sidebar
              collapsed={collapsed}
              setCollapsed={setCollapsed}
              nav={nav}
              auth={auth}
              onLogout={handleLogout}
            />

            <div className="app-content">
              <Routes>
                <Route path="/"               element={<Dashboard/>}/>
                <Route path="/alumnos"        element={<Alumnos/>}/>
                {/* Sólo admin puede ver Maestros */}
                <Route path="/maestros"       element={
                  auth.rol==="admin" ? <Maestros/> : <Navigate to="/" replace/>
                }/>
                <Route path="/grupos"         element={<Grupos/>}/>
                <Route path="/asistencia"     element={<Asistencia/>}/>
                <Route path="/calificaciones" element={<Calificaciones/>}/>
                <Route path="/avisos"         element={<Avisos/>}/>
                <Route path="/riesgo"         element={<Riesgo/>}/>
              </Routes>
            </div>

            <BottomNav nav={nav} onLogout={handleLogout}/>
          </div>

          <Toaster position="top-right" toastOptions={{duration:3000}}/>
        </BrowserRouter>
      </DBContext.Provider>
    </AuthCtx.Provider>
  );
}

export default App;
