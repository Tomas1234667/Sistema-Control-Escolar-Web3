export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-black text-white p-6">

      <h1 className="text-3xl font-bold mb-6">
        🏫 Dashboard Escolar
      </h1>

      {/* CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="bg-white/10 p-5 rounded-2xl">
          👨‍🎓 Alumnos <br />
          <span className="text-2xl font-bold">120</span>
        </div>

        <div className="bg-white/10 p-5 rounded-2xl">
          📚 Materias <br />
          <span className="text-2xl font-bold">8</span>
        </div>

        <div className="bg-white/10 p-5 rounded-2xl">
          📝 Tareas <br />
          <span className="text-2xl font-bold">15</span>
        </div>

        <div className="bg-white/10 p-5 rounded-2xl">
          📊 Promedio <br />
          <span className="text-2xl font-bold">8.7</span>
        </div>

      </div>

    </div>
  )
}