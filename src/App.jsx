import { useState, useEffect } from "react";

const SALAS = [
  { id: "recepcion", nombre: "Sala Recepción", desc: "Tía Sandra · 1er piso", color: "#E8734A" },
  { id: "salita1", nombre: "Salita 1", desc: "2do piso", color: "#4A90D9" },
  { id: "salita2", nombre: "Salita 2", desc: "2do piso", color: "#7B5EA7" },
  { id: "salita3", nombre: "Salita 3", desc: "2do piso", color: "#3AAA72" },
];

const SEMANA = ["Lun", "Mar", "Mié", "Jue", "Vie"];
const SEMANA_FULL = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

function getWeekDates(baseDate) {
  const d = new Date(baseDate);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return Array.from({ length: 5 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    return date;
  });
}

function formatDate(date) {
  return date.toISOString().split("T")[0];
}

function formatDisplay(date) {
  return `${date.getDate()}/${date.getMonth() + 1}`;
}

const SAMPLE_DATA = {
  "2026-04-07_recepcion": [
    { nombre: "Jared Araya", hora: "09:45 - 10:30", docente: true },
  ],
  "2026-04-08_recepcion": [
    { nombre: "Danilo González", hora: "10:50 - 11:35", docente: true },
    { nombre: "Danilo González", hora: "11:50 - 12:35", docente: true },
  ],
  "2026-04-09_recepcion": [
    { nombre: "Fernanda Castro", hora: "15:30 - 16:00", docente: true },
  ],
  "2026-04-07_salita1": [
    { nombre: "Sofía Meza", hora: "08:15 - 09:45", docente: true },
  ],
  "2026-04-09_salita1": [
    { nombre: "Bárbara G.", hora: "15:00 - 15:40", docente: true },
    { nombre: "Bárbara G.", hora: "16:15 - 16:40", docente: true },
  ],
  "2026-04-07_salita2": [
    { nombre: "Matrona C.E.", hora: "09:00 - 12:15", docente: true },
  ],
  "2026-04-07_salita3": [
    { nombre: "Francisca Méndez", hora: "08:30 - 09:15", docente: true },
  ],
  "2026-04-08_salita3": [
    { nombre: "Bárbara González", hora: "08:15 - 09:00", docente: true },
  ],
};

function loadData() {
  try {
    const stored = sessionStorage.getItem("salas_data");
    return stored ? JSON.parse(stored) : { ...SAMPLE_DATA };
  } catch {
    return { ...SAMPLE_DATA };
  }
}

function saveData(data) {
  try {
    sessionStorage.setItem("salas_data", JSON.stringify(data));
  } catch {}
}

export default function App() {
  const [weekBase, setWeekBase] = useState(new Date("2026-04-07"));
  const [data, setData] = useState(loadData);
  const [modal, setModal] = useState(null);
  const [viewSala, setViewSala] = useState(null);
  const [form, setForm] = useState({ nombre: "", horaInicio: "", horaFin: "" });
  const [showStats, setShowStats] = useState(false);
  const [toast, setToast] = useState(null);

  const weekDates = getWeekDates(weekBase);

  useEffect(() => {
    saveData(data);
  }, [data]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  function getKey(date, salaId) {
    return `${formatDate(date)}_${salaId}`;
  }

  function getReservas(date, salaId) {
    return data[getKey(date, salaId)] || [];
  }

  function addReserva() {
    if (!form.nombre.trim() || !form.horaInicio || !form.horaFin) return;
    const key = getKey(modal.date, modal.sala.id);
    const nueva = { nombre: form.nombre.trim(), hora: `${form.horaInicio} - ${form.horaFin}` };
    setData(prev => ({
      ...prev,
      [key]: [...(prev[key] || []), nueva],
    }));
    setToast(`✓ Reserva agregada en ${modal.sala.nombre}`);
    setModal(null);
    setForm({ nombre: "", horaInicio: "", horaFin: "" });
  }

  function removeReserva(date, salaId, idx) {
    const key = getKey(date, salaId);
    setData(prev => {
      const next = [...(prev[key] || [])];
      next.splice(idx, 1);
      return { ...prev, [key]: next };
    });
    setToast("✓ Reserva eliminada");
  }

  function prevWeek() {
    const d = new Date(weekBase);
    d.setDate(d.getDate() - 7);
    setWeekBase(d);
  }

  function nextWeek() {
    const d = new Date(weekBase);
    d.setDate(d.getDate() + 7);
    setWeekBase(d);
  }

  function getWeekLabel() {
    const first = weekDates[0];
    const last = weekDates[4];
    const months = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
    return `${first.getDate()} al ${last.getDate()} de ${months[first.getMonth()]} ${first.getFullYear()}`;
  }

  function totalReservasSemana() {
    return weekDates.reduce((acc, date) => {
      return acc + SALAS.reduce((a, sala) => a + getReservas(date, sala.id).length, 0);
    }, 0);
  }

  function reservasPorSala() {
    return SALAS.map(sala => ({
      sala,
      count: weekDates.reduce((acc, date) => acc + getReservas(date, sala.id).length, 0),
    }));
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0F1117",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      color: "#E8E8EE",
    }}>
      {/* Header */}
      <div style={{
        borderBottom: "1px solid #1E2030",
        padding: "20px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#0F1117",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg, #E8734A, #D94A4A)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18,
          }}>🏫</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-0.02em" }}>Salas · Entrevistas</div>
            <div style={{ fontSize: 12, color: "#6B7280" }}>Reserva de espacios</div>
          </div>
        </div>
        <button
          onClick={() => setShowStats(!showStats)}
          style={{
            background: showStats ? "#1E2030" : "transparent",
            border: "1px solid #2A2D3E",
            borderRadius: 8, padding: "8px 16px",
            color: "#9CA3AF", fontSize: 13, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6,
          }}
        >
          📊 Stats semana
        </button>
      </div>

      <div style={{ padding: "24px 32px" }}>
        {/* Week nav */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 24,
        }}>
          <button onClick={prevWeek} style={navBtn}>← Anterior</button>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.03em" }}>
              Semana {getWeekLabel()}
            </div>
            <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
              {totalReservasSemana()} reservas esta semana
            </div>
          </div>
          <button onClick={nextWeek} style={navBtn}>Siguiente →</button>
        </div>

        {/* Stats panel */}
        {showStats && (
          <div style={{
            background: "#161820",
            border: "1px solid #2A2D3E",
            borderRadius: 12,
            padding: 20,
            marginBottom: 24,
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 12,
          }}>
            {reservasPorSala().map(({ sala, count }) => (
              <div key={sala.id} style={{
                background: "#0F1117",
                borderRadius: 10,
                padding: "14px 16px",
                borderLeft: `3px solid ${sala.color}`,
              }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: sala.color }}>{count}</div>
                <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>{sala.nombre}</div>
              </div>
            ))}
          </div>
        )}

        {/* Grid */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 8px" }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, width: 160 }}>Sala</th>
                {weekDates.map((date, i) => (
                  <th key={i} style={thStyle}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{SEMANA[i]}</div>
                    <div style={{ fontSize: 12, color: "#6B7280", fontWeight: 400 }}>{formatDisplay(date)}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SALAS.map(sala => (
                <tr key={sala.id}>
                  <td style={{
                    padding: "12px 14px",
                    background: "#161820",
                    borderRadius: "10px 0 0 10px",
                    borderLeft: `3px solid ${sala.color}`,
                    verticalAlign: "top",
                  }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{sala.nombre}</div>
                    <div style={{ fontSize: 11, color: "#6B7280" }}>{sala.desc}</div>
                  </td>
                  {weekDates.map((date, di) => {
                    const reservas = getReservas(date, sala.id);
                    const pct = Math.min(reservas.length / 5, 1);
                    return (
                      <td key={di} style={{
                        padding: 6,
                        background: "#161820",
                        verticalAlign: "top",
                        borderRadius: di === 4 ? "0 10px 10px 0" : 0,
                      }}>
                        <div style={{ minHeight: 80 }}>
                          {reservas.map((r, ri) => (
                            <div key={ri} style={{
                              background: sala.color + "22",
                              border: `1px solid ${sala.color}55`,
                              borderRadius: 6,
                              padding: "5px 8px",
                              marginBottom: 4,
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              gap: 4,
                            }}>
                              <div>
                                <div style={{ fontSize: 11, fontWeight: 600, color: sala.color, lineHeight: 1.3 }}>
                                  {r.nombre}
                                </div>
                                <div style={{ fontSize: 10, color: "#9CA3AF" }}>{r.hora}</div>
                              </div>
                              <button
                                onClick={() => removeReserva(date, sala.id, ri)}
                                style={{
                                  background: "none", border: "none", cursor: "pointer",
                                  color: "#4B5563", fontSize: 13, lineHeight: 1, padding: 0,
                                  flexShrink: 0, marginTop: 1,
                                }}
                                title="Eliminar"
                              >×</button>
                            </div>
                          ))}
                          <button
                            onClick={() => {
                              setModal({ date, sala });
                              setForm({ nombre: "", horaInicio: "", horaFin: "" });
                            }}
                            style={{
                              width: "100%",
                              background: "none",
                              border: `1px dashed #2A2D3E`,
                              borderRadius: 6,
                              padding: "5px 0",
                              color: "#4B5563",
                              fontSize: 11,
                              cursor: "pointer",
                              transition: "all 0.15s",
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.borderColor = sala.color;
                              e.currentTarget.style.color = sala.color;
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.borderColor = "#2A2D3E";
                              e.currentTarget.style.color = "#4B5563";
                            }}
                          >+ Reservar</button>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: 16, marginTop: 20, flexWrap: "wrap" }}>
          {SALAS.map(sala => (
            <div key={sala.id} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6B7280" }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: sala.color }} />
              {sala.nombre}
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.7)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 100,
          backdropFilter: "blur(4px)",
        }} onClick={() => setModal(null)}>
          <div style={{
            background: "#161820",
            border: "1px solid #2A2D3E",
            borderRadius: 16,
            padding: 28,
            width: 380,
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          }} onClick={e => e.stopPropagation()}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 4 }}>Nueva reserva</div>
              <div style={{ fontWeight: 700, fontSize: 18, letterSpacing: "-0.02em" }}>
                {modal.sala.nombre}
              </div>
              <div style={{ fontSize: 13, color: "#9CA3AF", marginTop: 2 }}>
                {SEMANA_FULL[weekDates.findIndex(d => formatDate(d) === formatDate(modal.date))]}, {formatDisplay(modal.date)}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={labelStyle}>Nombre del docente</label>
                <input
                  style={inputStyle}
                  placeholder="Ej: María González"
                  value={form.nombre}
                  onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                  autoFocus
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={labelStyle}>Hora inicio</label>
                  <input
                    type="time"
                    style={inputStyle}
                    value={form.horaInicio}
                    onChange={e => setForm(f => ({ ...f, horaInicio: e.target.value }))}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Hora fin</label>
                  <input
                    type="time"
                    style={inputStyle}
                    value={form.horaFin}
                    onChange={e => setForm(f => ({ ...f, horaFin: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
              <button onClick={() => setModal(null)} style={{
                flex: 1, padding: "10px 0",
                background: "none", border: "1px solid #2A2D3E",
                borderRadius: 8, color: "#9CA3AF", cursor: "pointer", fontSize: 14,
              }}>Cancelar</button>
              <button
                onClick={addReserva}
                disabled={!form.nombre.trim() || !form.horaInicio || !form.horaFin}
                style={{
                  flex: 1, padding: "10px 0",
                  background: modal.sala.color,
                  border: "none", borderRadius: 8,
                  color: "#fff", cursor: "pointer",
                  fontSize: 14, fontWeight: 600,
                  opacity: (!form.nombre.trim() || !form.horaInicio || !form.horaFin) ? 0.4 : 1,
                  transition: "opacity 0.15s",
                }}
              >Reservar</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 24, right: 24,
          background: "#1E2030", border: "1px solid #2A2D3E",
          borderRadius: 10, padding: "12px 18px",
          fontSize: 14, color: "#E8E8EE",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          zIndex: 200,
          animation: "fadeIn 0.2s ease",
        }}>
          {toast}
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        input[type="time"]::-webkit-calendar-picker-indicator { filter: invert(0.5); }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}

const navBtn = {
  background: "#161820",
  border: "1px solid #2A2D3E",
  borderRadius: 8,
  padding: "8px 16px",
  color: "#9CA3AF",
  cursor: "pointer",
  fontSize: 13,
};

const thStyle = {
  padding: "8px 12px",
  textAlign: "center",
  color: "#9CA3AF",
  fontWeight: 500,
  fontSize: 13,
};

const labelStyle = {
  display: "block",
  fontSize: 12,
  color: "#6B7280",
  marginBottom: 6,
};

const inputStyle = {
  width: "100%",
  background: "#0F1117",
  border: "1px solid #2A2D3E",
  borderRadius: 8,
  padding: "10px 12px",
  color: "#E8E8EE",
  fontSize: 14,
  outline: "none",
};
