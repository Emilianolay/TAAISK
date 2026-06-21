import { useState, useEffect } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Flame, Trophy, CheckCircle, Palette, Trash2, Plus, User, Moon, X } from 'lucide-react';
import Customizacion from './customizacion';

function Dashboard({ user, onLogout }) {
  // --- ESTADOS DE LA UI (Compañero) ---
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [primaryColor, setPrimaryColor] = useState({
    id: 'blue', hex: '#4f46e5', lightHex: '#818cf8'
  });

  // --- ESTADOS DE DATOS (Tuyos) ---
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'Alta',
    status: 'TODO',
    tags: [],
    date: '',
    file: null
  });

  //estado estra que se usa para escribir las etiquetas 
  //antes de a;adir la tarea
  const [tagInput, setTagInput] = useState('');

  // --- EFECTO: MODO OSCURO ---
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // --- EFECTO: DESCARGAR TAREAS DE LA BASE DE DATOS ---
  useEffect(() => {
    const fetchMyTasks = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/tasks/${user.id}`);
        setTasks(response.data);
      } catch (error) {
        console.error("Error al descargar mis tareas:", error);
      }
    };

    if (user && user.id) {
      fetchMyTasks();
    }
  }, [user]);

  // Filtramos las tareas por columna
  const todoTasks = tasks.filter(t => t.status === 'TODO');
  const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS');
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED');

  // --- FUNCIÓN PARA GUARDAR LA NUEVA TAREA ---
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    try {
      const responder = await
        axios.post('http://localhost:3000/api/tasks', {
          title: newTask.title,
          status: newTask.status,
          userId: user.id
        });

      const tareaDB = responder.data;
      setTasks([...tasks, tareaDB]);

      //limpiar formulario
      setNewTask({
        title: '',
        description: '',
        priority: 'Alta',
        status: 'TODO',
        tags: [],
        date: '',
        file: null
      });
      setIsModalOpen(false); //cerramos ventana
    } catch (error) {
      console.error("Error al guardar la tarea:", error);
      alert("Hubo un error al guardar");
    }
  };

  // --- FUNCIÓN PARA ARRASTRAR Y SOLTAR ---
  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    // 1. Movimiento Visual
    const movedTask = tasks.find(t => t.id === draggableId);
    const newTasks = tasks.filter(t => t.id !== draggableId);
    const updatedTask = { ...movedTask, status: destination.droppableId };

    newTasks.splice(destination.index, 0, updatedTask);
    setTasks(newTasks);

    // 2. Movimiento Real (Base de datos)
    try {
      await axios.put(`http://localhost:3000/api/tasks/${draggableId}`, {
        status: destination.droppableId
      });
    } catch (error) {
      console.error("Error al guardar la posición en la base de datos:", error);
    }
  };

  const añadir_tag = (e) => {
    e.preventDefault();
    if (tagInput.trim() !== '' &&
      !newTask.tags.includes(tagInput.trim())) {
      //copiamos la tarea y en los tags metemos todo
      //lo que ya se tenia
      setNewTask({ ...newTask, tags: [...newTask.tags, tagInput.trim()] });
      setTagInput(''); //vaciamos la cajita para escribir otra
    }
  };

  const quitar_tag = (tagToRemove) => {
    //hacemos un filtrado para quedarnos con las que no queremos borrar
    setNewTask({ ...newTask, tags: newTask.tags.filter(tag => tag !== tagToRemove) });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#000033] text-slate-800 dark:text-blue-50 transition-colors duration-500 p-6 md:p-12 font-sans relative">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* --- HEADER --- */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-[var(--c_primario)] tracking-tight drop-shadow-sm transition-colors duration-300">TaAlsk</h1>
            <p className="text-slate-500 dark:text-blue-300 font-medium mt-1">Organiza tu trabajo y mantén tu racha activa</p>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto">
            <button onClick={() => setIsCustomizerOpen(true)} className='p-2.5 bg-white dark:bg-[#01004A] border border-slate-200 dark:border-[#030188] rounded-xl hover:bg-slate-100 dark:hover:bg-[#020166] shadow-sm transition-all text-slate-500 dark:text-blue-200 cursor-pointer'>
              <Palette className="w-5 h-5" />
            </button>
            <button onClick={() => setIsDark(!isDark)} className='p-2.5 bg-white dark:bg-[#01004A] border border-slate-200 dark:border-[#030188] rounded-xl hover:bg-slate-100 dark:hover:bg-[#020166] shadow-sm transition-all text-slate-500 dark:text-blue-200 cursor-pointer'>
              <Moon className="w-5 h-5" />
            </button>
            <button className="p-2.5 bg-white dark:bg-[#01004A] border border-slate-200 dark:border-[#030188] rounded-xl hover:bg-slate-100 dark:hover:bg-[#020166] shadow-sm transition-all text-slate-500 dark:text-blue-200">
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[var(--c_primario)] text-white px-5 py-2.5 rounded-xl font-bold hover:opacity-80 shadow-md shadow-[var(--c_primario)]/20 flex items-center gap-2 transition-all duration-300 text-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Nueva Tarea
            </button>
            <button onClick={onLogout} className="p-2.5 bg-white dark:bg-[#01004A] border border-slate-200 dark:border-[#030188] rounded-xl hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/40 dark:hover:text-red-400 shadow-sm transition-all text-slate-500 dark:text-blue-200 cursor-pointer" title="Cerrar sesión">
              <User className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* --- PANEL DE ESTADÍSTICAS --- */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

        {/* --- TABLERO KANBAN CON DRAG AND DROP --- */}
        <DragDropContext onDragEnd={onDragEnd}>
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">

            {/* COLUMNA 1: POR HACER */}
            <Droppable droppableId="TODO">
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`bg-slate-100/70 dark:bg-[#01004A] rounded-3xl p-5 border transition-all duration-500 ${snapshot.isDraggingOver ? 'border-indigo-300 dark:border-indigo-500 bg-indigo-50/50 dark:bg-[#020166]/80' : 'border-slate-200/50 dark:border-[#030188]'}`}
                >
                  <div className="flex justify-between items-center mb-5 px-1">
                    <h3 className="font-extrabold text-slate-700 dark:text-blue-100 tracking-wide">Por Hacer</h3>
                    <span className="bg-slate-200 dark:bg-[#020166] text-[var(--c_primario)] px-2.5 py-1 rounded-lg text-xs font-black shadow-sm transition-colors duration-300">{todoTasks.length}</span>
                  </div>
                  <div className="space-y-4 min-h-[350px]">
                    {todoTasks.map((t, index) => (
                      <Draggable key={t.id} draggableId={t.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-white dark:bg-[#020166] p-5 rounded-2xl shadow-sm border font-bold text-sm text-slate-700 dark:text-blue-50 transition-all cursor-grab active:cursor-grabbing ${snapshot.isDragging ? 'shadow-lg ring-2 ring-[var(--c_primario)]/50 rotate-2 dark:border-[#0401AD]' : 'border-slate-200/80 dark:border-[#030188] hover:shadow-[0_4px_15px_rgba(6,2,213,0.4)] dark:hover:border-[#0401AD]'}`}
                          >
                            {t.title}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>

            {/* COLUMNA 2: EN PROGRESO */}
            <Droppable droppableId="IN_PROGRESS">
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`bg-slate-100/70 dark:bg-[#01004A] rounded-3xl p-5 border transition-all duration-500 ${snapshot.isDraggingOver ? 'border-amber-300 dark:border-amber-500 bg-amber-50/50 dark:bg-[#020166]/80' : 'border-slate-200/50 dark:border-[#030188]'}`}
                >
                  <div className="flex justify-between items-center mb-5 px-1">
                    <h3 className="font-extrabold text-slate-700 dark:text-blue-100 tracking-wide">En Progreso</h3>
                    <span className="bg-slate-200 dark:bg-[#020166] text-[var(--c_primario)] px-2.5 py-1 rounded-lg text-xs font-black shadow-sm transition-colors duration-300">{inProgressTasks.length}</span>
                  </div>
                  <div className="space-y-4 min-h-[350px]">
                    {inProgressTasks.length === 0 && !snapshot.isDraggingOver && <p className="text-center text-slate-400 dark:text-blue-400 font-medium text-sm mt-12 border-2 border-dashed border-slate-200 dark:border-[#030188] rounded-xl py-8">Arrastra tareas aquí</p>}
                    {inProgressTasks.map((t, index) => (
                      <Draggable key={t.id} draggableId={t.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-white dark:bg-[#020166] p-5 rounded-2xl shadow-sm border font-bold text-sm text-slate-700 dark:text-blue-50 transition-all cursor-grab active:cursor-grabbing ${snapshot.isDragging ? 'shadow-lg ring-2 ring-[var(--c_primario)]/50 rotate-2 dark:border-[#0401AD]' : 'border-slate-200/80 dark:border-[#030188] hover:shadow-[0_4px_15px_rgba(6,2,213,0.4)] dark:hover:border-[#0401AD]'}`}
                          >
                            {t.title}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>

            {/* COLUMNA 3: COMPLETADO */}
            <Droppable droppableId="COMPLETED">
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`bg-slate-100/70 dark:bg-[#01004A] rounded-3xl p-5 border transition-all duration-500 ${snapshot.isDraggingOver ? 'border-emerald-300 dark:border-emerald-500 bg-emerald-50/50 dark:bg-[#020166]/80' : 'border-slate-200/50 dark:border-[#030188]'}`}
                >
                  <div className="flex justify-between items-center mb-5 px-1">
                    <h3 className="font-extrabold text-slate-700 dark:text-blue-100 tracking-wide">Completado</h3>
                    <span className="bg-slate-200 dark:bg-[#020166] text-[var(--c_primario)] px-2.5 py-1 rounded-lg text-xs font-black shadow-sm transition-colors duration-300">{completedTasks.length}</span>
                  </div>
                  <div className="space-y-4 min-h-[350px]">
                    {completedTasks.map((t, index) => (
                      <Draggable key={t.id} draggableId={t.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-white dark:bg-[#020166]/60 p-5 rounded-2xl shadow-sm border font-bold text-sm text-slate-400 dark:text-blue-300 line-through transition-all cursor-grab active:cursor-grabbing ${snapshot.isDragging ? 'shadow-lg ring-2 ring-[var(--c_primario)]/50 rotate-2 dark:border-[#0401AD]' : 'border-slate-200/80 dark:border-[#030188] hover:shadow-[0_4px_15px_rgba(6,2,213,0.4)]'}`}
                          >
                            {t.title}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>

          </section>
        </DragDropContext>
      </div>

      {/* --- CAJA DEL PANEL DE CUSTOMIZACIÓN --- */}
      {isCustomizerOpen && (
        <Customizacion
          isDark={isDark}
          toggleDark={() => setIsDark(!isDark)}
          primaryColor={primaryColor}
          setPrimaryColor={setPrimaryColor}
          onClose={() => setIsCustomizerOpen(false)}
        />
      )}

      {/* --- VENTANA EMERGENTE (MODAL PARA NUEVA TAREA) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#01004A] border dark:border-[#030188] rounded-3xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800 dark:text-blue-50">Crear nueva tarea</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-blue-200 transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-[#020166] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className='espacio'>
              {/*Para el titulo*/}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-blue-100 mb-1">Titulo</label>
                <input
                  type='text' value={newTask.title}
                  onChange={(e) => setNewTask({
                    ...newTask, title: e.target.value
                  })}
                  placeholder='Avance de Proyecto'
                  className="w-full bg-slate-50 dark:bg-[#020166] border border-slate-200 dark:border-[#030188] rounded-xl px-4 py-2.5 outline-none focus:border-[var(--c_primario)] focus:ring-1 focus:ring-[var(--c_primario)] transition-all text-slate-800 dark:text-blue-50"
                  required />
              </div>
              {/*Descripcion de la tarea*/}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-blue-100 mb-1">Descripción</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder='Objetivos'
                  className="w-full bg-slate-50 dark:bg-[#020166] border border-slate-200 dark:border-[#030188] rounded-xl px-4 py-2.5 outline-none focus:border-[var(--c_primario)] focus:ring-1 focus:ring-[var(--c_primario)] transition-all text-slate-800 dark:text-blue-50 resize-none min-h-[80px]" />
              </div>

              {/*Prioridad de la tarea como su estado*/}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-blue-100 mb-1">Prioridad</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#020166] border border-slate-200 dark:border-[#030188] rounded-xl px-4 py-2.5 outline-none focus:border-[var(--c_primario)] text-slate-800 dark:text-blue-50 cursor-pointer">
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-blue-100 mb-1">Estado</label>
                  <select
                    value={newTask.status}
                    onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#020166] border border-slate-200 dark:border-[#030188] rounded-xl px-4 py-2.5 outline-none focus:border-[var(--c_primario)] text-slate-800 dark:text-blue-50 cursor-pointer">
                    <option value="TODO">Por Hacer</option>
                    <option value="IN_PROGRESS">En progreso</option>
                    <option value="COMPLETED">Completado</option>
                  </select>
                </div>
              </div>

              {/* Valores de fechas, archivos y etiquetas*/}
              <div>
                {/* Fecha y archivos para subir*/}
                <div className='grid grid-cols-2 gap-4 mb-4'>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-blue-100 mb-1">Fecha límite</label>
                    <input
                      type='date'
                      value={newTask.date}
                      onChange={(e) => setNewTask({ ...newTask, date: e.target.value })}
                      className='w-full bg-slate-50 dark:bg-[#020166] border border-slate-200 dark:border-[#030188] rounded-xl px-4 py-2.5 outline-none focus:border-[var(--c_primario)] text-slate-800 dark:text-blue-50 cursor-pointer' />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-blue-100 mb-1">Adjuntar Archivo</label>
                    <input
                      type='file'
                      onChange={(e) => setNewTask({ ...newTask, file: e.target.files[0] })}
                      className='w-full text-sm text-slate-500 dark:text-blue-300 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-slate-200 file:text-slate-700 dark:file:bg-[#030188] dark:file:text-blue-50 hover:file:bg-slate-300 dark:hover:file:bg-[#0401AD] cursor-pointer' />
                  </div>
                </div>
                <label className="block text-sm font-bold text-slate-700 dark:text-blue-100 mb-1">Etiquetas</label>
                <div className="flex gap-2">
                  <input type='text' value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault(); añadir_tag(e);
                      }
                    }}
                    placeholder='"Ej. Diseño, urgente...'
                    className="flex-1 bg-slate-50 dark:bg-[#020166] border border-slate-200 dark:border-[#030188] rounded-xl px-4 py-2.5 outline-none focus:border-[var(--c_primario)] text-slate-800 dark:text-blue-50" />
                  <button type='button' onClick={añadir_tag}
                    className="bg-slate-200 dark:bg-[#030188] text-slate-700 dark:text-blue-50 px-5 py-2.5 rounded-xl font-bold hover:opacity-80 transition-colors cursor-pointer">Añadir</button>
                </div>

                {/*Zona de las pildoras */}
                {newTask.tags.length > 0 && (
                  <div className='flex flex-wrap gap-2 mt-3'>
                    {newTask.tags.map((tag, index) => (
                      <span key={index} className="flex items-center gap-1.5 bg-[var(--c_primario)]/10 dark:bg-[#01004A] text-[var(--c_primario)] dark:text-blue-200 px-3 py-1.5 rounded-lg text-sm font-bold border border-[var(--c_primario)]/20 dark:border-[#030188]">
                        {tag}
                        <button type='button' onClick={() =>
                          quitar_tag(tag)} className='hover:text-red-500 cursor-pointer'>
                          <X className='w-3.5 h-3.5'></X>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/*Boton de guardar y cancelar*/}
              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 dark:border-[#030188] mt-6">
                <button type='button' onClick={() =>
                  setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 dark:text-blue-200 hover:bg-slate-100 dark:hover:bg-[#020166] transition-colors cursor-pointer">Cancelar</button>
                <button type='submit' className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-2.5 rounded-xl font-bold hover:opacity-90 shadow-md transition-colors cursor-pointer">Crear Tarea</button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}

export default Dashboard;