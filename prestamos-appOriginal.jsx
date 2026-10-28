import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Home, TableProperties, CalendarDays, BarChart3, Search, Plus, X, Check,
  Wallet, TrendingUp, AlertTriangle, LogOut, ChevronLeft, ChevronRight,
  Trash2, ChevronDown, ChevronUp, Landmark, Bot, Send, KeyRound, HelpCircle, Lock
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from "recharts";

/* ---------------------------------------------------------
   ESTILO / TOKENS DE DISEÑO
   Concepto: libro contable de prestamista de barrio.
   Verde billete profundo + papel hueso + dorado (interés) +
   rojo tinta (mora). Números en fuente "ledger" con cifras
   tabulares. Fondo con rayado sutil tipo papel de cuentas.
--------------------------------------------------------- */
const Style = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

    :root{
      --ink:#182620;
      --ink-soft:#4b564d;
      --paper:#F6F2E7;
      --paper-line:#e4dcc4;
      --card:#FFFDF7;
      --green:#2F6F4E;
      --green-dark:#1D4531;
      --green-pale:#E3ECE4;
      --gold:#AD8A2E;
      --gold-pale:#F3E9CC;
      --red:#9C3B31;
      --red-pale:#F3E0DC;
      --line:#DAD2B8;
    }
    .pf-root{
      font-family:'IBM Plex Sans', sans-serif;
      color:var(--ink);
      background:var(--paper);
      background-image: repeating-linear-gradient(
        to bottom, transparent, transparent 27px, var(--paper-line) 28px
      );
      min-height:100%;
      -webkit-font-smoothing:antialiased;
    }
    .pf-display{ font-family:'Fraunces', serif; }
    .pf-mono{ font-family:'IBM Plex Mono', monospace; font-variant-numeric: tabular-nums; }

    .pf-card{
      background:var(--card);
      border:1px solid var(--line);
      border-radius:10px;
      box-shadow: 0 1px 0 rgba(24,38,32,0.04);
    }
    .pf-btn{
      display:inline-flex; align-items:center; gap:6px;
      border-radius:8px; font-weight:500; cursor:pointer;
      border:1px solid transparent; transition:all .15s ease;
      font-family:'IBM Plex Sans',sans-serif;
    }
    .pf-btn-primary{ background:var(--green); color:#fff; padding:10px 16px; }
    .pf-btn-primary:hover{ background:var(--green-dark); }
    .pf-btn-ghost{ background:transparent; color:var(--ink); border-color:var(--line); padding:9px 14px; }
    .pf-btn-ghost:hover{ background:var(--green-pale); }
    .pf-btn-danger{ background:transparent; color:var(--red); padding:6px; }
    .pf-btn-danger:hover{ background:var(--red-pale); }

    .pf-input, .pf-select{
      width:100%; padding:9px 11px; border-radius:7px;
      border:1px solid var(--line); background:#fff; color:var(--ink);
      font-family:'IBM Plex Sans',sans-serif; font-size:14px;
    }
    .pf-input:focus, .pf-select:focus{ outline:2px solid var(--green); outline-offset:1px; }
    .pf-label{ font-size:12px; color:var(--ink-soft); font-weight:500; margin-bottom:4px; display:block; letter-spacing:.02em; }

    .pf-nav-item{
      display:flex; align-items:center; gap:10px; padding:11px 14px;
      border-radius:8px; cursor:pointer; color:var(--paper);
      font-size:14px; font-weight:500; opacity:.75;
    }
    .pf-nav-item:hover{ opacity:1; background:rgba(255,255,255,0.06); }
    .pf-nav-item.active{ opacity:1; background:rgba(255,255,255,0.12); }

    .pf-pill{ display:inline-flex; align-items:center; gap:5px; padding:3px 9px; border-radius:100px; font-size:12px; font-weight:500; }
    .pf-pill-red{ background:var(--red-pale); color:var(--red); }
    .pf-pill-gold{ background:var(--gold-pale); color:var(--gold); }
    .pf-pill-green{ background:var(--green-pale); color:var(--green-dark); }

    .pf-stamp{
      width:70px; height:70px; border-radius:50%;
      border:2.5px solid var(--gold); color:var(--gold);
      display:flex; align-items:center; justify-content:center;
      transform: rotate(-8deg); flex-shrink:0;
    }
    table.pf-table{ width:100%; border-collapse:collapse; font-size:13.5px; }
    table.pf-table th{ text-align:left; padding:9px 12px; color:var(--ink-soft); font-weight:500; font-size:12px; text-transform:uppercase; letter-spacing:.04em; border-bottom:1.5px solid var(--line); }
    table.pf-table td{ padding:10px 12px; border-bottom:1px solid var(--line); vertical-align:middle; }
    table.pf-table tr:hover td{ background:var(--green-pale); }

    .pf-modal-backdrop{ position:fixed; inset:0; background:rgba(24,38,32,0.45); display:flex; align-items:center; justify-content:center; z-index:50; padding:20px; }
    .pf-scroll::-webkit-scrollbar{ width:8px; }
    .pf-scroll::-webkit-scrollbar-thumb{ background:var(--line); border-radius:8px; }
  `}</style>
);

/* ---------------------------------------------------------
   UTILIDADES DE FECHA Y DINERO
--------------------------------------------------------- */
const fmt = (n) =>
  (isNaN(n) ? 0 : n).toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });

const todayISO = () => new Date().toISOString().slice(0, 10);

const addDays = (dateISO, days) => {
  const d = new Date(dateISO + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};
const addMonths = (dateISO, months) => {
  const d = new Date(dateISO + "T00:00:00");
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
};
const fechaLegible = (iso) =>
  new Date(iso + "T00:00:00").toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
const monthKey = (iso) => iso.slice(0, 7);
const monthLabel = (key) => {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("es-CO", { month: "short", year: "2-digit" });
};

/* ---------------------------------------------------------
   FESTIVOS COLOMBIA (Ley Emiliani) + DÍAS HÁBILES
   Se usan para: (1) nunca poner una cuota en domingo/festivo,
   corriéndola al siguiente día hábil, y (2) no acumular mora
   los domingos/festivos.
--------------------------------------------------------- */
function easterDate(year) {
  const a = year % 19, b = Math.floor(year / 100), c = year % 100;
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}
const addDaysToDate = (date, days) => { const d = new Date(date); d.setDate(d.getDate() + days); return d; };
function moverALunes(date) {
  const day = date.getDay();
  const diff = (8 - day) % 7;
  return addDaysToDate(date, diff);
}
const _festivosCache = {};
function festivosColombia(year) {
  if (_festivosCache[year]) return _festivosCache[year];
  const holidays = [];
  const fijo = (m, d) => holidays.push(new Date(year, m - 1, d));
  const movible = (m, d) => holidays.push(moverALunes(new Date(year, m - 1, d)));
  fijo(1, 1); fijo(5, 1); fijo(7, 20); fijo(8, 7); fijo(12, 8); fijo(12, 25);
  movible(1, 6); movible(3, 19); movible(6, 29); movible(8, 15);
  movible(10, 12); movible(11, 1); movible(11, 11);
  const pascua = easterDate(year);
  holidays.push(addDaysToDate(pascua, -3)); // Jueves Santo
  holidays.push(addDaysToDate(pascua, -2)); // Viernes Santo
  holidays.push(moverALunes(addDaysToDate(pascua, 39))); // Ascensión
  holidays.push(moverALunes(addDaysToDate(pascua, 60))); // Corpus Christi
  holidays.push(moverALunes(addDaysToDate(pascua, 68))); // Sagrado Corazón
  const isoList = holidays.map((d) => d.toISOString().slice(0, 10));
  _festivosCache[year] = isoList;
  return isoList;
}
const esFestivo = (iso) => festivosColombia(Number(iso.slice(0, 4))).includes(iso);
const esDomingo = (iso) => new Date(iso + "T00:00:00").getDay() === 0;
const esDiaNoHabil = (iso) => esDomingo(iso) || esFestivo(iso);
const siguienteDiaHabil = (iso) => { let d = iso; while (esDiaNoHabil(d)) d = addDays(d, 1); return d; };

// Cuenta cuántos días de mora "cobrables" (sin domingos ni festivos) hay
// entre la fecha de vencimiento (exclusiva) y la fecha hasta la que se calcula (inclusiva).
function diasMora(fechaVencimiento, fechaHasta) {
  if (fechaHasta <= fechaVencimiento) return 0;
  let count = 0;
  let d = addDays(fechaVencimiento, 1);
  while (d <= fechaHasta) {
    if (!esDiaNoHabil(d)) count++;
    d = addDays(d, 1);
  }
  return count;
}
const calcularMora = (fechaVencimiento, fechaHasta, recargoPorDia) => diasMora(fechaVencimiento, fechaHasta) * recargoPorDia;

const FREC = {
  diaria: { porMes: 30, label: "Diaria", paso: (iso, i) => siguienteDiaHabil(addDays(iso, i)) },
  semanal: { porMes: 4, label: "Semanal", paso: (iso, i) => siguienteDiaHabil(addDays(iso, 7 * i)) },
  quincenal: { porMes: 2, label: "Quincenal", paso: (iso, i) => siguienteDiaHabil(addDays(iso, 15 * i)) },
  mensual: { porMes: 1, label: "Mensual", paso: (iso, i) => siguienteDiaHabil(addMonths(iso, i)) },
};

function generarCuotas({ valor, tasa, plazoMeses, frecuencia, fechaInicio }) {
  const cfg = FREC[frecuencia];
  const numCuotas = Math.max(1, Math.round(plazoMeses * cfg.porMes));
  const interesTotal = valor * (tasa / 100) * plazoMeses;
  const capitalCuota = valor / numCuotas;
  const interesCuota = interesTotal / numCuotas;
  const cuotas = [];
  for (let i = 1; i <= numCuotas; i++) {
    cuotas.push({
      numero: i,
      fecha: cfg.paso(fechaInicio, i),
      capital: capitalCuota,
      interes: interesCuota,
      cuota: capitalCuota + interesCuota,
      pagado: false,
      fechaPago: null,
    });
  }
  return cuotas;
}

const DEFAULT_DATA = {
  patrimonioInicial: 5000000,
  recargoPorDiaAtraso: 5000,
  creditos: [
    (() => {
      const cuotas = generarCuotas({ valor: 1000000, tasa: 20, plazoMeses: 1, frecuencia: "quincenal", fechaInicio: addDays(todayISO(), -20) });
      cuotas[0].pagado = true;
      cuotas[0].fechaPago = addDays(todayISO(), -5);
      return { id: 1, cliente: "Juan Pérez", valor: 1000000, tasa: 20, plazoMeses: 1, frecuencia: "quincenal", fechaInicio: addDays(todayISO(), -20), cuotas };
    })(),
  ],
};

/* ---------------------------------------------------------
   COMPONENTE PRINCIPAL
--------------------------------------------------------- */
export default function App() {
  const [session, setSession] = useState(null);
  const [view, setView] = useState("dashboard");
  const [data, setData] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [showNuevo, setShowNuevo] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [saveError, setSaveError] = useState(false);

  // --- Autenticación local con contraseña propia por instalación ---
  const [auth, setAuth] = useState(null); // { passHash, pregunta, respuestaHash } | false mientras carga
  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get("app-auth");
        setAuth(res && res.value ? JSON.parse(res.value) : false);
      } catch {
        setAuth(false);
      }
    })();
  }, []);
  const guardarAuth = useCallback(async (nuevaAuth) => {
    setAuth(nuevaAuth);
    try { await window.storage.set("app-auth", JSON.stringify(nuevaAuth)); } catch {}
  }, []);

  // Cargar datos persistidos
  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get("app-data");
        if (res && res.value) setData(JSON.parse(res.value));
        else setData(DEFAULT_DATA);
      } catch {
        setData(DEFAULT_DATA);
      }
      setLoaded(true);
    })();
  }, []);

  // Guardar datos persistidos
  useEffect(() => {
    if (!loaded || !data) return;
    (async () => {
      try {
        const r = await window.storage.set("app-data", JSON.stringify(data));
        setSaveError(!r);
      } catch {
        setSaveError(true);
      }
    })();
  }, [data, loaded]);

  const addCredito = useCallback((form) => {
    const cuotas = generarCuotas(form);
    setData((d) => ({
      ...d,
      creditos: [...d.creditos, { id: Date.now(), ...form, cuotas }],
    }));
  }, []);

  const deleteCredito = useCallback((id) => {
    setData((d) => ({ ...d, creditos: d.creditos.filter((c) => c.id !== id) }));
  }, []);

  const togglePago = useCallback((creditoId, numero) => {
    setData((d) => ({
      ...d,
      creditos: d.creditos.map((c) => {
        if (c.id !== creditoId) return c;
        return {
          ...c,
          cuotas: c.cuotas.map((q) => {
            if (q.numero !== numero) return q;
            if (q.pagado) {
              // Deshacer pago
              return { ...q, pagado: false, fechaPago: null, moraPagada: 0 };
            }
            const hoy = todayISO();
            const mora = calcularMora(q.fecha, hoy, d.recargoPorDiaAtraso || 5000);
            return { ...q, pagado: true, fechaPago: hoy, moraPagada: mora };
          }),
        };
      }),
    }));
  }, []);

  const setPatrimonioInicial = useCallback((val) => {
    setData((d) => ({ ...d, patrimonioInicial: val }));
  }, []);

  const setRecargoPorDiaAtraso = useCallback((val) => {
    setData((d) => ({ ...d, recargoPorDiaAtraso: val }));
  }, []);

  if (auth === null) return <LoadingScreen />;
  if (auth === false) return <CrearContrasena onListo={(a) => { guardarAuth(a); setSession(true); }} />;
  if (!session) return <Login auth={auth} onEnter={() => setSession(true)} onRecuperada={(a) => guardarAuth(a)} />;
  if (!loaded || !data) return <LoadingScreen />;

  return (
    <div className="pf-root" style={{ display: "flex", minHeight: "600px", borderRadius: "12px", overflow: "hidden" }}>
      <Style />
      <Sidebar view={view} setView={setView} onLogout={() => setSession(false)} />
      <main style={{ flex: 1, padding: "24px 28px", overflowY: "auto", maxHeight: "780px" }} className="pf-scroll">
        {saveError && (
          <div className="pf-pill pf-pill-red" style={{ marginBottom: 12 }}>
            <AlertTriangle size={13} /> No se pudo guardar el último cambio. Revisa tu conexión.
          </div>
        )}
        {view === "dashboard" && <Dashboard data={data} onNuevo={() => setShowNuevo(true)} togglePago={togglePago} setView={setView} />}
        {view === "creditos" && (
          <Creditos
            data={data}
            onNuevo={() => setShowNuevo(true)}
            deleteCredito={deleteCredito}
            togglePago={togglePago}
            expanded={expanded}
            setExpanded={setExpanded}
          />
        )}
        {view === "calendario" && <Calendario data={data} togglePago={togglePago} />}
        {view === "estadisticas" && <Estadisticas data={data} setPatrimonioInicial={setPatrimonioInicial} setRecargoPorDiaAtraso={setRecargoPorDiaAtraso} />}
        {view === "asistente" && <AsistenteIA data={data} />}
      </main>
      {showNuevo && <ModalNuevoCredito onClose={() => setShowNuevo(false)} onSave={addCredito} />}
    </div>
  );
}

/* ---------------------------------------------------------
   SEGURIDAD LOCAL: hash de contraseña (SHA-256)
   Cada instalación de la app guarda su propia contraseña
   (y su propia pregunta de recuperación) en su almacenamiento
   local — es decir, cada cliente que compre la app tiene una
   contraseña distinta, y nadie más puede ver sus créditos.
--------------------------------------------------------- */
async function sha256(texto) {
  const enc = new TextEncoder().encode(texto);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

/* ---------------------------------------------------------
   PRIMER INGRESO: crear contraseña + pregunta de recuperación
--------------------------------------------------------- */
function CrearContrasena({ onListo }) {
  const [pass, setPass] = useState("");
  const [pass2, setPass2] = useState("");
  const [pregunta, setPregunta] = useState("");
  const [respuesta, setRespuesta] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  const submit = async () => {
    setError("");
    if (pass.length < 4) return setError("La contraseña debe tener mínimo 4 caracteres.");
    if (pass !== pass2) return setError("Las contraseñas no coinciden.");
    if (!pregunta.trim() || !respuesta.trim()) return setError("Completa la pregunta y la respuesta de recuperación.");
    setGuardando(true);
    const passHash = await sha256(pass);
    const respuestaHash = await sha256(respuesta.trim().toLowerCase());
    onListo({ passHash, pregunta: pregunta.trim(), respuestaHash });
  };

  return (
    <div className="pf-root" style={{ minHeight: "640px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "12px" }}>
      <Style />
      <div className="pf-card" style={{ width: 380, padding: 32 }}>
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <div className="pf-stamp" style={{ margin: "0 auto 16px" }}><Lock size={26} /></div>
          <h1 className="pf-display" style={{ fontSize: 22, fontWeight: 700, margin: "0 0 4px" }}>Protege tu Libro Mayor</h1>
          <p style={{ fontSize: 13, color: "var(--ink-soft)", margin: 0 }}>Crea una contraseña. Solo tú la sabrás.</p>
        </div>
        <div style={{ marginBottom: 10 }}>
          <label className="pf-label">Nueva contraseña</label>
          <input className="pf-input" type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Mínimo 4 caracteres" />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label className="pf-label">Repite la contraseña</label>
          <input className="pf-input" type="password" value={pass2} onChange={(e) => setPass2(e.target.value)} />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label className="pf-label">Pregunta de recuperación (por si la olvidas)</label>
          <input className="pf-input" value={pregunta} onChange={(e) => setPregunta(e.target.value)} placeholder="Ej: ¿Nombre de mi primera mascota?" />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label className="pf-label">Respuesta</label>
          <input className="pf-input" value={respuesta} onChange={(e) => setRespuesta(e.target.value)} />
        </div>
        {error && <p style={{ fontSize: 12.5, color: "var(--red)", marginBottom: 12 }}>{error}</p>}
        <button className="pf-btn pf-btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={guardando} onClick={submit}>
          {guardando ? "Guardando…" : "Crear contraseña y entrar"}
        </button>
        <p style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: 14, lineHeight: 1.5 }}>
          Tu contraseña se guarda cifrada (SHA-256) solo en este dispositivo/cuenta. Cada cliente que use esta app crea la suya propia y nadie más puede ver sus créditos. Para producción con varios usuarios por negocio, esto se reemplaza por el login con bcrypt + JWT de la Guía 1.
        </p>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   LOGIN (valida contra la contraseña propia + recuperación)
--------------------------------------------------------- */
function Login({ auth, onEnter, onRecuperada }) {
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [modoRecuperar, setModoRecuperar] = useState(false);

  const submit = async () => {
    const hash = await sha256(pass);
    if (hash === auth.passHash) { setError(""); onEnter(); }
    else setError("Contraseña incorrecta.");
  };

  if (modoRecuperar) {
    return <Recuperar auth={auth} onCancelar={() => setModoRecuperar(false)} onRecuperada={(a) => { onRecuperada(a); setModoRecuperar(false); }} />;
  }

  return (
    <div className="pf-root" style={{ minHeight: "640px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "12px" }}>
      <Style />
      <div className="pf-card" style={{ width: 360, padding: 32, textAlign: "center" }}>
        <div className="pf-stamp" style={{ margin: "0 auto 16px" }}>
          <Landmark size={28} />
        </div>
        <h1 className="pf-display" style={{ fontSize: 26, fontWeight: 700, margin: "0 0 4px" }}>Libro Mayor</h1>
        <p style={{ fontSize: 13, color: "var(--ink-soft)", margin: "0 0 24px" }}>Gestión de créditos y cobros</p>
        <div style={{ textAlign: "left", marginBottom: 8 }}>
          <label className="pf-label">Contraseña</label>
          <input
            className="pf-input" type="password" placeholder="••••••••" value={pass}
            onChange={(e) => setPass(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
        </div>
        {error && <p style={{ fontSize: 12.5, color: "var(--red)", margin: "4px 0 8px", textAlign: "left" }}>{error}</p>}
        <button className="pf-btn pf-btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 12 }} onClick={submit}>
          <KeyRound size={15} /> Entrar
        </button>
        <p style={{ fontSize: 12.5, color: "var(--green)", marginTop: 14, cursor: "pointer" }} onClick={() => setModoRecuperar(true)}>
          ¿Olvidaste tu contraseña?
        </p>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   RECUPERAR CONTRASEÑA (con pregunta de seguridad)
--------------------------------------------------------- */
function Recuperar({ auth, onCancelar, onRecuperada }) {
  const [respuesta, setRespuesta] = useState("");
  const [nueva, setNueva] = useState("");
  const [nueva2, setNueva2] = useState("");
  const [paso, setPaso] = useState(1);
  const [error, setError] = useState("");

  const verificar = async () => {
    const hash = await sha256(respuesta.trim().toLowerCase());
    if (hash === auth.respuestaHash) { setError(""); setPaso(2); }
    else setError("Esa respuesta no coincide con la que registraste.");
  };

  const guardarNueva = async () => {
    if (nueva.length < 4) return setError("La contraseña debe tener mínimo 4 caracteres.");
    if (nueva !== nueva2) return setError("Las contraseñas no coinciden.");
    const passHash = await sha256(nueva);
    onRecuperada({ ...auth, passHash });
  };

  return (
    <div className="pf-root" style={{ minHeight: "640px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "12px" }}>
      <Style />
      <div className="pf-card" style={{ width: 370, padding: 32 }}>
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <div className="pf-stamp" style={{ margin: "0 auto 16px" }}><HelpCircle size={26} /></div>
          <h1 className="pf-display" style={{ fontSize: 20, fontWeight: 700, margin: "0 0 4px" }}>Recuperar contraseña</h1>
        </div>
        {paso === 1 ? (
          <>
            <p style={{ fontSize: 13, marginBottom: 10 }}><strong>{auth.pregunta}</strong></p>
            <input className="pf-input" value={respuesta} onChange={(e) => setRespuesta(e.target.value)} placeholder="Tu respuesta" style={{ marginBottom: 12 }} />
            {error && <p style={{ fontSize: 12.5, color: "var(--red)", marginBottom: 10 }}>{error}</p>}
            <div style={{ display: "flex", gap: 8 }}>
              <button className="pf-btn pf-btn-ghost" style={{ flex: 1, justifyContent: "center" }} onClick={onCancelar}>Cancelar</button>
              <button className="pf-btn pf-btn-primary" style={{ flex: 1, justifyContent: "center" }} onClick={verificar}>Verificar</button>
            </div>
          </>
        ) : (
          <>
            <div style={{ marginBottom: 10 }}>
              <label className="pf-label">Nueva contraseña</label>
              <input className="pf-input" type="password" value={nueva} onChange={(e) => setNueva(e.target.value)} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label className="pf-label">Repite la contraseña</label>
              <input className="pf-input" type="password" value={nueva2} onChange={(e) => setNueva2(e.target.value)} />
            </div>
            {error && <p style={{ fontSize: 12.5, color: "var(--red)", marginBottom: 10 }}>{error}</p>}
            <button className="pf-btn pf-btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={guardarNueva}>Guardar y entrar</button>
          </>
        )}
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="pf-root" style={{ minHeight: "500px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "12px" }}>
      <Style />
      <p style={{ color: "var(--ink-soft)" }}>Cargando…</p>
    </div>
  );
}

/* ---------------------------------------------------------
   SIDEBAR
--------------------------------------------------------- */
function Sidebar({ view, setView, onLogout }) {
  const items = [
    { id: "dashboard", label: "Inicio", icon: Home },
    { id: "creditos", label: "Créditos", icon: TableProperties },
    { id: "calendario", label: "Calendario", icon: CalendarDays },
    { id: "estadisticas", label: "Estadísticas", icon: BarChart3 },
    { id: "asistente", label: "Asistente IA", icon: Bot },
  ];
  return (
    <aside style={{ width: 210, background: "var(--green-dark)", padding: "22px 14px", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 10px", marginBottom: 26 }}>
        <Landmark size={20} color="var(--gold)" />
        <span className="pf-display" style={{ color: "#fff", fontWeight: 700, fontSize: 17 }}>Libro Mayor</span>
      </div>
      <nav style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
        {items.map((it) => (
          <div key={it.id} className={`pf-nav-item ${view === it.id ? "active" : ""}`} onClick={() => setView(it.id)}>
            <it.icon size={17} /> {it.label}
          </div>
        ))}
      </nav>
      <div className="pf-nav-item" onClick={onLogout}>
        <LogOut size={17} /> Salir
      </div>
    </aside>
  );
}

/* ---------------------------------------------------------
   CÁLCULOS DERIVADOS (patrimonio)
--------------------------------------------------------- */
function usePatrimonio(data) {
  return useMemo(() => {
    const hoy = todayISO();
    const recargo = data.recargoPorDiaAtraso || 5000;
    let capitalPendiente = 0, interesCobrado = 0, capitalCobrado = 0, interesTotalProyectado = 0,
      cuotasAtrasadas = 0, valorTotalPrestado = 0, moraCobrada = 0, moraPendiente = 0;
    for (const c of data.creditos) {
      valorTotalPrestado += c.valor;
      for (const q of c.cuotas) {
        interesTotalProyectado += q.interes;
        if (q.pagado) {
          interesCobrado += q.interes; capitalCobrado += q.capital; moraCobrada += q.moraPagada || 0;
        } else {
          capitalPendiente += q.capital;
          if (q.fecha < hoy) {
            cuotasAtrasadas++;
            moraPendiente += calcularMora(q.fecha, hoy, recargo);
          }
        }
      }
    }
    const disponible = data.patrimonioInicial - valorTotalPrestado + capitalCobrado + interesCobrado + moraCobrada;
    const patrimonioActual = data.patrimonioInicial + interesCobrado + moraCobrada;
    const patrimonioProyectado = data.patrimonioInicial + interesTotalProyectado + moraCobrada + moraPendiente;
    return { disponible, capitalPendiente, interesCobrado, patrimonioActual, patrimonioProyectado, cuotasAtrasadas, valorTotalPrestado, moraCobrada, moraPendiente };
  }, [data]);
}

/* ---------------------------------------------------------
   DASHBOARD
--------------------------------------------------------- */
function Dashboard({ data, onNuevo, togglePago, setView }) {
  const p = usePatrimonio(data);
  const hoy = todayISO();
  const recargo = data.recargoPorDiaAtraso || 5000;
  const pendientesHoy = [], atrasados = [];
  data.creditos.forEach((c) =>
    c.cuotas.forEach((q) => {
      if (q.pagado) return;
      const item = { cliente: c.cliente, creditoId: c.id, ...q };
      if (q.fecha === hoy) pendientesHoy.push(item);
      else if (q.fecha < hoy) atrasados.push({ ...item, mora: calcularMora(q.fecha, hoy, recargo) });
    })
  );

  return (
    <div>
      <Header title="Buenos días" subtitle="Este es el estado de tu negocio hoy" onNuevo={onNuevo} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 22 }}>
        <StatCard icon={Wallet} label="Patrimonio actual" value={fmt(p.patrimonioActual)} tone="green" />
        <StatCard icon={TrendingUp} label="Interés cobrado" value={fmt(p.interesCobrado)} tone="gold" />
        <StatCard icon={AlertTriangle} label="Cuotas atrasadas" value={p.cuotasAtrasadas} tone={p.cuotasAtrasadas > 0 ? "red" : "green"} />
        <StatCard icon={AlertTriangle} label="Mora acumulada por cobrar" value={fmt(p.moraPendiente)} tone={p.moraPendiente > 0 ? "red" : "green"} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <ListaCobro
          title="Cobros de hoy"
          empty="No tienes cobros programados para hoy."
          items={pendientesHoy}
          togglePago={togglePago}
          tone="gold"
        />
        <ListaCobro
          title="Atrasados"
          empty="No tienes cuotas atrasadas. ¡Vas al día!"
          items={atrasados}
          togglePago={togglePago}
          tone="red"
          mostrarMora
        />
      </div>

      <div className="pf-card" style={{ padding: 16, marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "var(--ink-soft)" }}>¿Quieres ver el calendario completo de cobros del mes?</span>
        <button className="pf-btn pf-btn-ghost" onClick={() => setView("calendario")}>Ver calendario <ChevronRight size={15} /></button>
      </div>
    </div>
  );
}

function ListaCobro({ title, empty, items, togglePago, tone, mostrarMora }) {
  return (
    <div className="pf-card" style={{ padding: 16 }}>
      <h3 className="pf-display" style={{ fontSize: 16, margin: "0 0 10px", fontWeight: 600 }}>{title} <span className={`pf-pill pf-pill-${tone}`}>{items.length}</span></h3>
      {items.length === 0 ? (
        <p style={{ fontSize: 13, color: "var(--ink-soft)" }}>{empty}</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.slice(0, 6).map((it) => (
            <div key={it.creditoId + "-" + it.numero} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--line)" }}>
              <div>
                <div style={{ fontWeight: 500, fontSize: 13.5 }}>{it.cliente}</div>
                <div className="pf-mono" style={{ fontSize: 12, color: "var(--ink-soft)" }}>
                  Cuota {it.numero} · {fmt(it.cuota)}
                  {mostrarMora && it.mora > 0 && <span style={{ color: "var(--red)" }}> · Mora: {fmt(it.mora)}</span>}
                </div>
              </div>
              <button className="pf-btn pf-btn-ghost" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => togglePago(it.creditoId, it.numero)}>
                <Check size={13} /> Marcar pagado
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tone }) {
  const colors = { green: "var(--green)", gold: "var(--gold)", red: "var(--red)" };
  return (
    <div className="pf-card" style={{ padding: 16, display: "flex", gap: 12, alignItems: "flex-start" }}>
      <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--paper)", display: "flex", alignItems: "center", justifyContent: "center", color: colors[tone], flexShrink: 0 }}>
        <Icon size={18} />
      </div>
      <div>
        <div style={{ fontSize: 12, color: "var(--ink-soft)", marginBottom: 2 }}>{label}</div>
        <div className="pf-mono pf-display" style={{ fontSize: 20, fontWeight: 600 }}>{value}</div>
      </div>
    </div>
  );
}

function Header({ title, subtitle, onNuevo }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
      <div>
        <h1 className="pf-display" style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>{title}</h1>
        <p style={{ fontSize: 13.5, color: "var(--ink-soft)", margin: "3px 0 0" }}>{subtitle}</p>
      </div>
      {onNuevo && (
        <button className="pf-btn pf-btn-primary" onClick={onNuevo}>
          <Plus size={16} /> Nuevo crédito
        </button>
      )}
    </div>
  );
}

/* ---------------------------------------------------------
   VISTA: CRÉDITOS (tabla + cuotas expandibles)
--------------------------------------------------------- */
function Creditos({ data, onNuevo, deleteCredito, togglePago, expanded, setExpanded }) {
  const hoy = todayISO();
  const [porEliminar, setPorEliminar] = useState(null); // crédito seleccionado para confirmar borrado
  return (
    <div>
      <Header title="Créditos" subtitle={`${data.creditos.length} crédito(s) registrados`} onNuevo={onNuevo} />
      <div className="pf-card" style={{ overflow: "hidden" }}>
        <table className="pf-table">
          <thead>
            <tr>
              <th></th><th>Cliente</th><th>Valor</th><th>Interés</th><th>Frecuencia</th><th>Cuotas</th><th>Estado</th><th></th>
            </tr>
          </thead>
          <tbody>
            {data.creditos.map((c) => {
              const pagadas = c.cuotas.filter((q) => q.pagado).length;
              const atrasadas = c.cuotas.filter((q) => !q.pagado && q.fecha < hoy).length;
              const isOpen = expanded === c.id;
              return (
                <React.Fragment key={c.id}>
                  <tr onClick={() => setExpanded(isOpen ? null : c.id)} style={{ cursor: "pointer" }}>
                    <td>{isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}</td>
                    <td style={{ fontWeight: 500 }}>{c.cliente}</td>
                    <td className="pf-mono">{fmt(c.valor)}</td>
                    <td>{c.tasa}% / mes</td>
                    <td>{FREC[c.frecuencia].label}</td>
                    <td>{pagadas}/{c.cuotas.length}</td>
                    <td>
                      {atrasadas > 0 ? <span className="pf-pill pf-pill-red">{atrasadas} atrasada(s)</span> : pagadas === c.cuotas.length ? <span className="pf-pill pf-pill-green">Pagado</span> : <span className="pf-pill pf-pill-gold">Al día</span>}
                    </td>
                    <td>
                      <button className="pf-btn pf-btn-danger" onClick={(e) => { e.stopPropagation(); setPorEliminar(c); }}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                  {isOpen && (
                    <tr>
                      <td colSpan={8} style={{ background: "var(--paper)", padding: 14 }}>
                        <TablaCuotas credito={c} togglePago={togglePago} recargoPorDiaAtraso={data.recargoPorDiaAtraso} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
        {data.creditos.length === 0 && <p style={{ padding: 24, textAlign: "center", color: "var(--ink-soft)" }}>Aún no hay créditos. Crea el primero con "Nuevo crédito".</p>}
      </div>
      {porEliminar && (
        <div className="pf-modal-backdrop" onClick={() => setPorEliminar(null)}>
          <div className="pf-card" style={{ width: 360, padding: 24 }} onClick={(e) => e.stopPropagation()}>
            <h2 className="pf-display" style={{ fontSize: 18, fontWeight: 600, margin: "0 0 8px" }}>¿Eliminar crédito?</h2>
            <p style={{ fontSize: 13.5, color: "var(--ink-soft)", margin: "0 0 20px" }}>
              Vas a borrar el crédito de <strong>{porEliminar.cliente}</strong> por {fmt(porEliminar.valor)}. Esta acción no se puede deshacer.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="pf-btn pf-btn-ghost" style={{ flex: 1, justifyContent: "center" }} onClick={() => setPorEliminar(null)}>Cancelar</button>
              <button
                className="pf-btn pf-btn-primary"
                style={{ flex: 1, justifyContent: "center", background: "var(--red)" }}
                onClick={() => { deleteCredito(porEliminar.id); setPorEliminar(null); }}
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TablaCuotas({ credito, togglePago, recargoPorDiaAtraso }) {
  const hoy = todayISO();
  const recargo = recargoPorDiaAtraso || 5000;
  return (
    <div style={{ overflowX: "auto" }}>
      <table className="pf-table" style={{ background: "#fff", borderRadius: 8 }}>
        <thead>
          <tr>
            <th>Pago</th><th>Fecha</th><th>Capital</th><th>Interés</th><th>Cuota</th><th>Mora</th><th>Estado</th><th></th>
          </tr>
        </thead>
        <tbody>
          {credito.cuotas.map((q) => {
            const atrasada = !q.pagado && q.fecha < hoy;
            const mora = q.pagado ? (q.moraPagada || 0) : atrasada ? calcularMora(q.fecha, hoy, recargo) : 0;
            return (
              <tr key={q.numero}>
                <td>Pago {q.numero}</td>
                <td>{fechaLegible(q.fecha)}</td>
                <td className="pf-mono">{fmt(q.capital)}</td>
                <td className="pf-mono">{fmt(q.interes)}</td>
                <td className="pf-mono" style={{ fontWeight: 600 }}>{fmt(q.cuota)}</td>
                <td className="pf-mono" style={{ color: mora > 0 ? "var(--red)" : "var(--ink-soft)" }}>{mora > 0 ? fmt(mora) : "—"}</td>
                <td>
                  {q.pagado ? <span className="pf-pill pf-pill-green">Pagado {fechaLegible(q.fechaPago)}</span> : atrasada ? <span className="pf-pill pf-pill-red">Atrasado</span> : <span className="pf-pill pf-pill-gold">Pendiente</span>}
                </td>
                <td>
                  <button className="pf-btn pf-btn-ghost" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => togglePago(credito.id, q.numero)}>
                    {q.pagado ? "Deshacer" : "Marcar pagado"}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ---------------------------------------------------------
   MODAL: NUEVO CRÉDITO
--------------------------------------------------------- */
function ModalNuevoCredito({ onClose, onSave }) {
  const [form, setForm] = useState({ cliente: "", valor: "", tasa: "20", plazoMeses: "1", frecuencia: "quincenal", fechaInicio: todayISO() });
  const numCuotas = Math.max(1, Math.round((Number(form.plazoMeses) || 0) * FREC[form.frecuencia].porMes));
  const valid = form.cliente.trim() && Number(form.valor) > 0 && Number(form.tasa) > 0 && Number(form.plazoMeses) > 0;

  const submit = () => {
    if (!valid) return;
    onSave({ cliente: form.cliente.trim(), valor: Number(form.valor), tasa: Number(form.tasa), plazoMeses: Number(form.plazoMeses), frecuencia: form.frecuencia, fechaInicio: form.fechaInicio });
    onClose();
  };

  return (
    <div className="pf-modal-backdrop" onClick={onClose}>
      <div className="pf-card" style={{ width: 420, padding: 24, maxHeight: "85vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h2 className="pf-display" style={{ fontSize: 19, fontWeight: 600, margin: 0 }}>Nuevo crédito</h2>
          <button className="pf-btn pf-btn-ghost" style={{ padding: 6 }} onClick={onClose}><X size={16} /></button>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label className="pf-label">Nombre del cliente</label>
          <input className="pf-input" value={form.cliente} onChange={(e) => setForm({ ...form, cliente: e.target.value })} placeholder="Ej: Juan Pérez" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
          <div>
            <label className="pf-label">Valor del crédito</label>
            <input className="pf-input" type="number" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} placeholder="1000000" />
          </div>
          <div>
            <label className="pf-label">Interés mensual (%)</label>
            <input className="pf-input" type="number" value={form.tasa} onChange={(e) => setForm({ ...form, tasa: e.target.value })} placeholder="20" />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
          <div>
            <label className="pf-label">Plazo (meses)</label>
            <input className="pf-input" type="number" value={form.plazoMeses} onChange={(e) => setForm({ ...form, plazoMeses: e.target.value })} placeholder="1" />
          </div>
          <div>
            <label className="pf-label">Frecuencia de pago</label>
            <select className="pf-select" value={form.frecuencia} onChange={(e) => setForm({ ...form, frecuencia: e.target.value })}>
              <option value="diaria">Diaria</option>
              <option value="semanal">Semanal</option>
              <option value="quincenal">Quincenal</option>
              <option value="mensual">Mensual</option>
            </select>
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label className="pf-label">Fecha de inicio</label>
          <input className="pf-input" type="date" value={form.fechaInicio} onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })} />
        </div>

        <div style={{ background: "var(--paper)", borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 13 }}>
          Este crédito generará <strong>{numCuotas} pagos</strong> {form.frecuencia === "diaria" ? "diarios" : form.frecuencia === "quincenal" ? "quincenales" : form.frecuencia === "semanal" ? "semanales" : "mensuales"}. Si una fecha cae domingo o festivo, se corre automáticamente al siguiente día hábil.
        </div>

        <button className="pf-btn pf-btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={!valid} onClick={submit}>
          Guardar crédito
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   VISTA: CALENDARIO
--------------------------------------------------------- */
function Calendario({ data, togglePago }) {
  const [cursor, setCursor] = useState(new Date());
  const [selDay, setSelDay] = useState(todayISO());

  const year = cursor.getFullYear(), month = cursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7; // lunes=0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cuotasPorDia = useMemo(() => {
    const map = {};
    data.creditos.forEach((c) =>
      c.cuotas.forEach((q) => {
        if (q.pagado) return;
        (map[q.fecha] = map[q.fecha] || []).push({ cliente: c.cliente, creditoId: c.id, ...q });
      })
    );
    return map;
  }, [data]);

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const hoy = todayISO();
  const isoOf = (d) => `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  return (
    <div>
      <Header title="Calendario de cobros" subtitle="Días con pagos programados por cobrar · los domingos y festivos (sombreados) no generan mora ni fechas de pago" />
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
        <div className="pf-card" style={{ padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <button className="pf-btn pf-btn-ghost" style={{ padding: 6 }} onClick={() => setCursor(new Date(year, month - 1, 1))}><ChevronLeft size={16} /></button>
            <h3 className="pf-display" style={{ margin: 0, fontWeight: 600, textTransform: "capitalize" }}>
              {cursor.toLocaleDateString("es-CO", { month: "long", year: "numeric" })}
            </h3>
            <button className="pf-btn pf-btn-ghost" style={{ padding: 6 }} onClick={() => setCursor(new Date(year, month + 1, 1))}><ChevronRight size={16} /></button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, fontSize: 11, color: "var(--ink-soft)", marginBottom: 4, textAlign: "center" }}>
            {["L", "M", "X", "J", "V", "S", "D"].map((d) => <div key={d}>{d}</div>)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
            {cells.map((d, i) => {
              if (!d) return <div key={i} />;
              const iso = isoOf(d);
              const items = cuotasPorDia[iso] || [];
              const isToday = iso === hoy;
              const isSel = iso === selDay;
              const overdue = iso < hoy && items.length > 0;
              const noHabil = esDiaNoHabil(iso);
              return (
                <div
                  key={i}
                  onClick={() => setSelDay(iso)}
                  title={noHabil ? "Domingo o festivo: no se cobra mora ni se programan cuotas este día" : undefined}
                  style={{
                    aspectRatio: "1", borderRadius: 8, padding: 6, cursor: "pointer",
                    border: isSel ? "2px solid var(--green)" : "1px solid var(--line)",
                    background: isToday ? "var(--green-pale)" : noHabil ? "var(--paper-line)" : "#fff",
                    display: "flex", flexDirection: "column", justifyContent: "space-between",
                    opacity: noHabil ? 0.7 : 1,
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: isToday ? 700 : 400 }}>{d}</span>
                  {items.length > 0 && (
                    <span className={`pf-pill ${overdue ? "pf-pill-red" : "pf-pill-gold"}`} style={{ fontSize: 10, padding: "1px 6px" }}>{items.length}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="pf-card" style={{ padding: 16 }}>
          <h3 className="pf-display" style={{ fontSize: 15, fontWeight: 600, margin: "0 0 10px" }}>{fechaLegible(selDay)}</h3>
          {(cuotasPorDia[selDay] || []).length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--ink-soft)" }}>No hay cobros programados este día.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {cuotasPorDia[selDay].map((it) => {
                const atrasada = it.fecha < todayISO();
                const mora = atrasada ? calcularMora(it.fecha, todayISO(), data.recargoPorDiaAtraso) : 0;
                return (
                  <div key={it.creditoId + "-" + it.numero} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--line)" }}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 13.5 }}>{it.cliente}</div>
                      <div className="pf-mono" style={{ fontSize: 12, color: "var(--ink-soft)" }}>
                        Cuota {it.numero} · {fmt(it.cuota)}
                        {mora > 0 && <span style={{ color: "var(--red)" }}> · Mora: {fmt(mora)}</span>}
                      </div>
                    </div>
                    <button className="pf-btn pf-btn-ghost" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => togglePago(it.creditoId, it.numero)}>
                      <Check size={13} /> Pagado
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   VISTA: ESTADÍSTICAS + CONSULTA DE CLIENTE
--------------------------------------------------------- */
function Estadisticas({ data, setPatrimonioInicial, setRecargoPorDiaAtraso }) {
  const p = usePatrimonio(data);
  const [editando, setEditando] = useState(false);
  const [tempVal, setTempVal] = useState(data.patrimonioInicial);
  const [editandoRecargo, setEditandoRecargo] = useState(false);
  const [tempRecargo, setTempRecargo] = useState(data.recargoPorDiaAtraso || 5000);
  const [query, setQuery] = useState("");

  const chartData = useMemo(() => {
    const map = {};
    data.creditos.forEach((c) =>
      c.cuotas.forEach((q) => {
        if (!q.pagado) return;
        const k = monthKey(q.fechaPago);
        map[k] = (map[k] || 0) + q.interes + (q.moraPagada || 0);
      })
    );
    return Object.entries(map).sort(([a], [b]) => (a > b ? 1 : -1)).map(([k, v]) => ({ mes: monthLabel(k), interes: Math.round(v) }));
  }, [data]);

  // Reporte mensual explícito: cuánto recibiste, cuántos atrasos, cuánto ganaste (interés + mora)
  const reporteMensual = useMemo(() => {
    const map = {};
    data.creditos.forEach((c) =>
      c.cuotas.forEach((q) => {
        if (!q.pagado) return;
        const k = monthKey(q.fechaPago);
        if (!map[k]) map[k] = { recibido: 0, interes: 0, mora: 0, atrasos: 0 };
        map[k].recibido += q.cuota + (q.moraPagada || 0);
        map[k].interes += q.interes;
        map[k].mora += q.moraPagada || 0;
        if (q.fechaPago > q.fecha) map[k].atrasos += 1;
      })
    );
    return Object.entries(map)
      .sort(([a], [b]) => (a > b ? -1 : 1))
      .map(([k, v]) => ({ key: k, mes: monthLabel(k), ...v, ganancia: v.interes + v.mora }));
  }, [data]);

  const resultados = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.trim().toLowerCase();
    return data.creditos.filter((c) => c.cliente.toLowerCase().includes(q));
  }, [query, data]);

  const hoy = todayISO();

  return (
    <div>
      <Header title="Estadísticas" subtitle="Tu patrimonio y el rendimiento de tus créditos" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
        <div className="pf-card" style={{ padding: 16 }}>
          <div style={{ fontSize: 12, color: "var(--ink-soft)", marginBottom: 4 }}>Patrimonio inicial</div>
          {editando ? (
            <div style={{ display: "flex", gap: 6 }}>
              <input className="pf-input pf-mono" type="number" value={tempVal} onChange={(e) => setTempVal(e.target.value)} style={{ fontSize: 14 }} />
              <button className="pf-btn pf-btn-primary" style={{ padding: "6px 10px" }} onClick={() => { setPatrimonioInicial(Number(tempVal)); setEditando(false); }}><Check size={14} /></button>
            </div>
          ) : (
            <div className="pf-mono pf-display" style={{ fontSize: 18, fontWeight: 600, cursor: "pointer" }} onClick={() => { setTempVal(data.patrimonioInicial); setEditando(true); }}>
              {fmt(data.patrimonioInicial)}
            </div>
          )}
        </div>
        <StatCard icon={Wallet} label="Disponible en caja" value={fmt(p.disponible)} tone="green" />
        <StatCard icon={TrendingUp} label="Patrimonio actual" value={fmt(p.patrimonioActual)} tone="gold" />
        <StatCard icon={Landmark} label="Proyectado (si pagan todo)" value={fmt(p.patrimonioProyectado)} tone="green" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 20 }}>
        <div className="pf-card" style={{ padding: 16 }}>
          <div style={{ fontSize: 12, color: "var(--ink-soft)", marginBottom: 4 }}>Recargo por día de atraso</div>
          {editandoRecargo ? (
            <div style={{ display: "flex", gap: 6 }}>
              <input className="pf-input pf-mono" type="number" value={tempRecargo} onChange={(e) => setTempRecargo(e.target.value)} style={{ fontSize: 14 }} />
              <button className="pf-btn pf-btn-primary" style={{ padding: "6px 10px" }} onClick={() => { setRecargoPorDiaAtraso(Number(tempRecargo)); setEditandoRecargo(false); }}><Check size={14} /></button>
            </div>
          ) : (
            <div className="pf-mono pf-display" style={{ fontSize: 18, fontWeight: 600, cursor: "pointer" }} onClick={() => { setTempRecargo(data.recargoPorDiaAtraso || 5000); setEditandoRecargo(true); }}>
              {fmt(data.recargoPorDiaAtraso || 5000)} / día
            </div>
          )}
          <p style={{ fontSize: 11.5, color: "var(--ink-soft)", margin: "6px 0 0" }}>Se cobra por cada día hábil de atraso (sin domingos ni festivos). Ej: 5 días de atraso = 5× este valor.</p>
        </div>
        <StatCard icon={AlertTriangle} label="Mora ya cobrada" value={fmt(p.moraCobrada)} tone="gold" />
        <StatCard icon={AlertTriangle} label="Mora pendiente por cobrar" value={fmt(p.moraPendiente)} tone={p.moraPendiente > 0 ? "red" : "green"} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <div className="pf-card" style={{ padding: 16 }}>
          <h3 className="pf-display" style={{ fontSize: 15, fontWeight: 600, margin: "0 0 10px" }}>Interés cobrado por mes</h3>
          {chartData.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--ink-soft)" }}>Aún no hay pagos registrados para graficar.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid stroke="var(--line)" vertical={false} />
                <XAxis dataKey="mes" tick={{ fontSize: 11 }} stroke="var(--ink-soft)" />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--ink-soft)" width={50} />
                <Tooltip formatter={(v) => fmt(v)} />
                <Line type="monotone" dataKey="interes" stroke="var(--gold)" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="pf-card" style={{ padding: 16 }}>
          <h3 className="pf-display" style={{ fontSize: 15, fontWeight: 600, margin: "0 0 10px" }}>Capital pendiente vs. cobrado</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={[{ nombre: "Capital", Pendiente: Math.round(p.capitalPendiente), Cobrado: Math.round(p.valorTotalPrestado - p.capitalPendiente) }]}>
              <CartesianGrid stroke="var(--line)" vertical={false} />
              <XAxis dataKey="nombre" tick={{ fontSize: 11 }} stroke="var(--ink-soft)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--ink-soft)" width={50} />
              <Tooltip formatter={(v) => fmt(v)} />
              <Bar dataKey="Pendiente" fill="var(--red)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Cobrado" fill="var(--green)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="pf-card" style={{ padding: 16, marginBottom: 20 }}>
        <h3 className="pf-display" style={{ fontSize: 15, fontWeight: 600, margin: "0 0 4px" }}>Reporte mensual</h3>
        <p style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "0 0 12px" }}>Cuánto dinero recibiste, cuántos atrasos hubo y cuánto ganaste (interés + mora) cada mes.</p>
        {reporteMensual.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--ink-soft)" }}>Aún no hay pagos registrados.</p>
        ) : (
          <table className="pf-table">
            <thead>
              <tr>
                <th>Mes</th><th>Dinero recibido</th><th>Atrasos</th><th>Interés ganado</th><th>Mora cobrada</th><th>Ganancia total (capital nuevo)</th>
              </tr>
            </thead>
            <tbody>
              {reporteMensual.map((r) => (
                <tr key={r.key}>
                  <td style={{ textTransform: "capitalize", fontWeight: 500 }}>{r.mes}</td>
                  <td className="pf-mono">{fmt(r.recibido)}</td>
                  <td>{r.atrasos > 0 ? <span className="pf-pill pf-pill-red">{r.atrasos}</span> : <span className="pf-pill pf-pill-green">0</span>}</td>
                  <td className="pf-mono">{fmt(r.interes)}</td>
                  <td className="pf-mono">{fmt(r.mora)}</td>
                  <td className="pf-mono" style={{ fontWeight: 600, color: "var(--green-dark)" }}>{fmt(r.ganancia)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="pf-card" style={{ padding: 16 }}>
        <h3 className="pf-display" style={{ fontSize: 15, fontWeight: 600, margin: "0 0 10px" }}>Consultar cliente</h3>
        <div style={{ position: "relative", marginBottom: 14 }}>
          <Search size={15} style={{ position: "absolute", left: 10, top: 10, color: "var(--ink-soft)" }} />
          <input className="pf-input" style={{ paddingLeft: 32 }} placeholder="Escribe el nombre del cliente, ej: Juan" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        {resultados.map((c) => {
          const pagos = c.cuotas.filter((q) => q.pagado);
          const totalPagado = pagos.reduce((s, q) => s + q.cuota, 0);
          const atrasosHist = pagos.filter((q) => q.fechaPago > q.fecha).length;
          return (
            <div key={c.id} style={{ borderTop: "1px solid var(--line)", paddingTop: 10, marginTop: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <strong>{c.cliente}</strong>
                <span className="pf-mono" style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>
                  Prestado: {fmt(c.valor)} · Pagado: {fmt(totalPagado)} · Atrasos: {atrasosHist}
                </span>
              </div>
              {pagos.length === 0 ? (
                <p style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>Sin pagos registrados todavía.</p>
              ) : (
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: "var(--ink-soft)" }}>
                  {pagos.map((q) => (
                    <li key={q.numero}>
                      Pago {q.numero}: {fmt(q.cuota)} pagado el {fechaLegible(q.fechaPago)}
                      {q.fechaPago > q.fecha ? " (con atraso)" : ""}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
        {query && resultados.length === 0 && <p style={{ fontSize: 13, color: "var(--ink-soft)" }}>No se encontró ningún cliente con ese nombre.</p>}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   VISTA: ASISTENTE IA
   Responde preguntas en lenguaje natural sobre los créditos,
   usando la API de Claude con el estado actual como contexto.
--------------------------------------------------------- */
function resumenParaIA(data) {
  const hoy = todayISO();
  const recargo = data.recargoPorDiaAtraso || 5000;
  return {
    hoy,
    patrimonioInicial: data.patrimonioInicial,
    recargoPorDiaAtraso: recargo,
    creditos: data.creditos.map((c) => ({
      cliente: c.cliente,
      valor: c.valor,
      tasaMensual: c.tasa,
      frecuencia: c.frecuencia,
      fechaInicio: c.fechaInicio,
      cuotas: c.cuotas.map((q) => ({
        numero: q.numero,
        fechaVencimiento: q.fecha,
        cuota: Math.round(q.cuota),
        capital: Math.round(q.capital),
        interes: Math.round(q.interes),
        pagado: q.pagado,
        fechaPago: q.fechaPago,
        moraPagada: q.moraPagada || 0,
        moraActualSiNoPagada: q.pagado ? 0 : calcularMora(q.fecha, hoy, recargo),
      })),
    })),
  };
}

function AsistenteIA({ data }) {
  const [mensajes, setMensajes] = useState([
    { rol: "asistente", texto: "Hola, soy tu asistente de Libro Mayor. Pregúntame lo que quieras sobre tus créditos: quién debe, cuánto has ganado, quién está atrasado, etc." },
  ]);
  const [input, setInput] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const enviar = async () => {
    const pregunta = input.trim();
    if (!pregunta || cargando) return;
    setInput("");
    setError("");
    const nuevosMensajes = [...mensajes, { rol: "usuario", texto: pregunta }];
    setMensajes(nuevosMensajes);
    setCargando(true);
    try {
      const resumen = resumenParaIA(data);
      const system = `Eres el asistente virtual dentro de la app "Libro Mayor" de un prestamista informal en Colombia. Responde en español, de forma breve, clara y en pesos colombianos (COP). Aquí están los datos actuales del negocio en JSON: ${JSON.stringify(resumen)}. Usa solo esta información para responder preguntas sobre clientes, créditos, atrasos, mora y ganancias. Si algo no está en los datos, dilo con honestidad.`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system,
          messages: [{ role: "user", content: pregunta }],
        }),
      });
      const respData = await response.json();
      const texto = (respData.content || []).map((b) => b.text || "").join("\n").trim() || "No pude generar una respuesta, intenta de nuevo.";
      setMensajes((m) => [...m, { rol: "asistente", texto }]);
    } catch (e) {
      setError("No se pudo conectar con el asistente. Revisa tu conexión e intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div>
      <Header title="Asistente IA" subtitle="Pregunta cualquier cosa sobre tus créditos, clientes y ganancias" />
      <div className="pf-card" style={{ padding: 16, display: "flex", flexDirection: "column", height: 520 }}>
        <div className="pf-scroll" style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, marginBottom: 12 }}>
          {mensajes.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.rol === "usuario" ? "flex-end" : "flex-start" }}>
              <div
                style={{
                  maxWidth: "78%", padding: "10px 13px", borderRadius: 10, fontSize: 13.5, lineHeight: 1.45,
                  background: m.rol === "usuario" ? "var(--green)" : "var(--paper)",
                  color: m.rol === "usuario" ? "#fff" : "var(--ink)",
                  whiteSpace: "pre-wrap",
                }}
              >
                {m.texto}
              </div>
            </div>
          ))}
          {cargando && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div style={{ padding: "10px 13px", borderRadius: 10, fontSize: 13.5, background: "var(--paper)", color: "var(--ink-soft)" }}>
                Pensando…
              </div>
            </div>
          )}
        </div>
        {error && <p style={{ fontSize: 12.5, color: "var(--red)", margin: "0 0 8px" }}>{error}</p>}
        <div style={{ display: "flex", gap: 8 }}>
          <input
            className="pf-input"
            placeholder="Ej: ¿Cuánto me debe Juan Pérez?"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && enviar()}
            disabled={cargando}
          />
          <button className="pf-btn pf-btn-primary" onClick={enviar} disabled={cargando || !input.trim()}>
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
