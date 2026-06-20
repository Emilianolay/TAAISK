import { Flame, Trophy, CheckCircle, Palette, Trash2, Plus, User, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import Customizacion from './customizacion';

function Dashboard({ user, onLogout }) {
  //diferentes colores de la barra de customizacion
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [primaryColor, setPrimaryColor] = useState({
    id: 'blue', hex: '#4f46e5', lightHex: '#818cf8'
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Simularemos unas tareas iniciales de prueba para ver cómo se renderizan
  const tasks = [
    { id: '1', title: 'Diseñar la base de datos en PostgreSQL', status: 'TODO' },
    { id: '2', title: 'Conectar el formulario con Axios', status: 'COMPLETED' },
  ];

  // Filtramos las tareas por columna
  const todoTasks = tasks.filter(t => t.status === 'TODO');
  const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS');
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#000033] text-slate-800 dark:text-blue-50 transition-colors duration-500 p-6 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* --- HEADER --- */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-[var(--c_primario)] tracking-tight drop-shadow-sm transition-colors duration-300">TaAlsk</h1>
            <p className="text-slate-500 dark:text-blue-300 font-medium mt-1">Organiza tu trabajo y mantén tu racha activa</p>
          </div>

          {/* Botones de Acción Superiores */}
          <div className="flex items-center gap-3 self-end md:self-auto">
            <button onClick={() => setIsCustomizerOpen(true)} className='p-2.5 bg-white dark:bg-[#01004A] border border-slate-200 dark:border-[#030188] rounded-xl hover:bg-slate-100 dark:hover:bg-[#020166] shadow-sm transition-all text-slate-500 dark:text-blue-200'>
              <Palette className="w-5 h-5" />
            </button>
            <button onClick={() => setIsDark(!isDark)} className='p-2.5 bg-white dark:bg-[#01004A] border border-slate-200 dark:border-[#030188] rounded-xl hover:bg-slate-100 dark:hover:bg-[#020166] shadow-sm transition-all text-slate-500 dark:text-blue-200'>
              <Moon className="w-5 h-5" />
            </button>
            <button className="p-2.5 bg-white dark:bg-[#01004A] border border-slate-200 dark:border-[#030188] rounded-xl hover:bg-slate-100 dark:hover:bg-[#020166] shadow-sm transition-all text-slate-500 dark:text-blue-200">
              <Trash2 className="w-5 h-5" />
            </button>
            <button className="bg-[var(--c_primario)] text-white px-5 py-2.5 rounded-xl font-bold hover:opacity-80 shadow-md shadow-[var(--c_primario)]/20 flex items-center gap-2 transition-all duration-300 text-sm">
              <Plus className="w-4 h-4" /> Nueva Tarea
            </button>
            <button onClick={onLogout} className="p-2.5 bg-white dark:bg-[#01004A] border border-slate-200 dark:border-[#030188] rounded-xl hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/40 dark:hover:text-red-400 shadow-sm transition-all text-slate-500 dark:text-blue-200" title="Cerrar sesión">
              <User className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* --- PANEL DE ESTADÍSTICAS Y RACHAS --- */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Racha Actual */}
          <div className="bg-white dark:bg-[#01004A] p-6 rounded-2xl border border-slate-200/80 dark:border-[#030188] shadow-sm flex items-center gap-5 transition-all duration-500 hover:shadow-[0_4px_20px_rgba(4,1,173,0.3)]">
            <div className="p-4 bg-orange-50 dark:bg-orange-500/10 rounded-2xl text-orange-500">
              <Flame className="w-8 h-8 fill-current drop-shadow-sm" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-400 dark:text-blue-300 uppercase tracking-widest">Racha Actual</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white mt-0.5">
                {user?.currentStreak || 0} <span className="text-lg font-bold text-slate-500 dark:text-blue-300">días</span>
              </p>
            </div>
          </div>

          {/* Mejor Racha */}
          <div className="bg-white dark:bg-[#01004A] p-6 rounded-2xl border border-slate-200/80 dark:border-[#030188] shadow-sm flex items-center gap-5 transition-all duration-500 hover:shadow-[0_4px_20px_rgba(4,1,173,0.3)]">
            <div className="p-4 bg-amber-50 dark:bg-amber-500/10 rounded-2xl text-amber-500">
              <Trophy className="w-8 h-8 fill-current drop-shadow-sm" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-400 dark:text-blue-300 uppercase tracking-widest">Mejor Racha</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white mt-0.5">
                {user?.bestStreak || 0} <span className="text-lg font-bold text-slate-500 dark:text-blue-300">días</span>
              </p>
            </div>
          </div>

          {/* Tareas Completadas */}
          <div className="bg-white dark:bg-[#01004A] p-6 rounded-2xl border border-slate-200/80 dark:border-[#030188] shadow-sm flex items-center gap-5 transition-all duration-500 hover:shadow-[0_4px_20px_rgba(4,1,173,0.3)]">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl text-emerald-500">
              <CheckCircle className="w-8 h-8 drop-shadow-sm" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-400 dark:text-blue-300 uppercase tracking-widest">Tareas Completadas</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white mt-0.5">
                {user?.tasksCompletedTotal || 0} <span className="text-lg font-bold text-slate-500 dark:text-blue-300">total</span>
              </p>
            </div>
          </div>
        </section>

        {/* --- TABLERO KANBAN --- */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">

          {/* Columna: Por Hacer */}
          <div className="bg-slate-100/70 dark:bg-[#01004A] rounded-3xl p-5 border border-slate-200/50 dark:border-[#030188] transition-all duration-500">
            <div className="flex justify-between items-center mb-5 px-1">
              <h3 className="font-extrabold text-slate-700 dark:text-blue-100 tracking-wide">Por Hacer</h3>
              <span className="bg-slate-200 dark:bg-[#020166] text-[var(--c_primario)] px-2.5 py-1 rounded-lg text-xs font-black shadow-sm transition-colors duration-300">{todoTasks.length}</span>
            </div>
            <div className="space-y-4 min-h-[350px]">
              {todoTasks.map(t => (
                <div key={t.id} className="bg-white dark:bg-[#020166] p-5 rounded-2xl shadow-sm border border-slate-200/80 dark:border-[#030188] font-bold text-sm text-slate-700 dark:text-blue-50 hover:shadow-[0_4px_15px_rgba(6,2,213,0.4)] dark:hover:border-[#0401AD] transition-all cursor-grab active:cursor-grabbing">
                  {t.title}
                </div>
              ))}
            </div>
          </div>

          {/* Columna: En Progreso */}
          <div className="bg-slate-100/70 dark:bg-[#01004A] rounded-3xl p-5 border border-slate-200/50 dark:border-[#030188] transition-all duration-500">
            <div className="flex justify-between items-center mb-5 px-1">
              <h3 className="font-extrabold text-slate-700 dark:text-blue-100 tracking-wide">En Progreso</h3>
              <span className="bg-slate-200 dark:bg-[#020166] text-[var(--c_primario)] px-2.5 py-1 rounded-lg text-xs font-black shadow-sm transition-colors duration-300">{inProgressTasks.length}</span>
            </div>
            <div className="space-y-4 min-h-[350px]">
              {inProgressTasks.length === 0 && <p className="text-center text-slate-400 dark:text-blue-400 font-medium text-sm mt-12 border-2 border-dashed border-slate-200 dark:border-[#030188] rounded-xl py-8">Arrastra tareas aquí</p>}
            </div>
          </div>

          {/* Columna: Completado */}
          <div className="bg-slate-100/70 dark:bg-[#01004A] rounded-3xl p-5 border border-slate-200/50 dark:border-[#030188] transition-all duration-500">
            <div className="flex justify-between items-center mb-5 px-1">
              <h3 className="font-extrabold text-slate-700 dark:text-blue-100 tracking-wide">Completado</h3>
              <span className="bg-slate-200 dark:bg-[#020166] text-[var(--c_primario)] px-2.5 py-1 rounded-lg text-xs font-black shadow-sm transition-colors duration-300">{completedTasks.length}</span>
            </div>
            <div className="space-y-4 min-h-[350px]">
              {completedTasks.map(t => (
                <div key={t.id} className="bg-white dark:bg-[#020166]/60 p-5 rounded-2xl shadow-sm border border-slate-200/80 dark:border-[#030188] font-bold text-sm text-slate-400 dark:text-blue-300 line-through hover:shadow-[0_4px_15px_rgba(6,2,213,0.4)] transition-all cursor-grab active:cursor-grabbing">
                  {t.title}
                </div>
              ))}
            </div>
          </div>

        </section>
      </div>

      {/*Caja del panel*/}
      {isCustomizerOpen && (
        <Customizacion 
          isDark={isDark} 
          toggleDark={() => setIsDark(!isDark)} 
          primaryColor={primaryColor} 
          setPrimaryColor={setPrimaryColor}
          onClose={() => setIsCustomizerOpen(false)}
        />
      )}
    </div>
  );
}

export default Dashboard;
