import { useState, useEffect } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Flame, Trophy, CheckCircle, Palette, Trash2, Plus, Moon, X, Flag, Calendar, Image as ImageIcon, LayoutList, Loader2, CheckCircle2, Settings, Key, LogOut } from 'lucide-react';
import Customizacion from './customizacion';
import './Dashboard.css';

function Dashboard({ usuario, onLogout }) {
  // --- ESTADOS DE LA UI ---
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [primaryColor, setPrimaryColor] = useState({ id: 'blue', hex: '#4f46e5', lightHex: '#818cf8' });
  
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [Editprofile, setIsEditProfile] = useState(false);
  const [ChangePass, setIsChangePass] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState(usuario?.nombre || '');
  const [contraVieja, setContraVieja] = useState('');
  const [contraNueva, setContraNueva] = useState('');

  // --- ESTADOS DE DATOS ---
  const [estadisticas, setEstadisticas] = useState({
    rachaActual: 0,
    mejorRacha: 0,
    tareasCompletadas: 0
  });

  const [weather, setWeather] = useState(null);
  const [tareas, setTareas] = useState([]); 
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editandoTareaId, setEditandoTareaId] = useState(null);
  const [nuevoTituloTarea, setNuevoTituloTarea] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [prioridad, setPrioridad] = useState('BAJA');
  const [estado, setEstado] = useState('POR_HACER');
  const [fechaLimite, setFechaLimite] = useState('');
  const [entradaEtiqueta, setEntradaEtiqueta] = useState('');
  const [listaEtiquetas, setListaEtiquetas] = useState([]);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [archivoUrl, setArchivoUrl] = useState(''); 

  // --- EFECTOS ---
  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDark]);

  useEffect(() => {
    document.documentElement.style.setProperty('--c_primario', primaryColor.hex);
    document.documentElement.style.setProperty('--c_primario_claro', primaryColor.lightHex);
  }, [primaryColor]);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await axios.get('https://api.open-meteo.com/v1/forecast?latitude=19.4284&longitude=-99.1276&current_weather=true');
        setWeather(response.data.current_weather);
      } catch (error) {
        console.error("Error clima:", error);
      }
    };
    fetchWeather();
  }, []);

  const getWeatherEmoji = (code) => {
    if (code === 0) return '☀️'; 
    if (code >= 1 && code <= 3) return '⛅'; 
    if (code >= 45 && code <= 48) return '🌫️'; 
    if (code >= 51 && code <= 67) return '🌧️'; 
    if (code >= 71 && code <= 77) return '❄️'; 
    if (code >= 95 && code <= 99) return '⛈️'; 
    return '🌡️'; 
  };

  // Carga de stats reales para F5
  useEffect(() => {
    const fetchLatestUserStats = async () => {
      if (usuario && usuario.id) {
        try {
          const response = await axios.get(`http://localhost:3000/api/usuarios/${usuario.id}`);
          setEstadisticas({
            rachaActual: response.data.rachaActual,
            mejorRacha: response.data.mejorRacha,
            tareasCompletadas: response.data.tareasCompletadas
          });
          setNuevoNombre(response.data.nombre);
        } catch (error) {
          console.error("Error al cargar estadísticas actualizadas:", error);
        }
      }
    };
    fetchLatestUserStats();
  }, [usuario]); 

  useEffect(() => {
    const fetchMyTasks = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/tareas/${usuario.id}`);
        setTareas(response.data);
      } catch (error) {
        console.error("Error al descargar tareas:", error);
      }
    };
    if (usuario && usuario.id) fetchMyTasks();
  }, [usuario]);

  const tareasPorHacer = tareas.filter(t => t.estado === 'POR_HACER');
  const tareasEnProgreso = tareas.filter(t => t.estado === 'EN_PROGRESO');
  const tareasCompletadasLista = tareas.filter(t => t.estado === 'COMPLETADO');

  const totalTareas = tareas.length;
  const progressPercentage = totalTareas === 0 ? 0 : Math.round((tareasCompletadasLista.length / totalTareas) * 100);

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  const priorityConfig = {
    BAJA: { color: 'text-slate-400 dark:text-blue-300', bg: 'bg-slate-100 dark:bg-[#01004A]', label: 'Baja' },
    MEDIA: { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40', label: 'Media' },
    ALTA: { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/40', label: 'Alta' }
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (entradaEtiqueta.trim() && !listaEtiquetas.includes(entradaEtiqueta.trim())) {
      setListaEtiquetas([...listaEtiquetas, entradaEtiqueta.trim()]);
      setEntradaEtiqueta('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setListaEtiquetas(listaEtiquetas.filter(t => t !== tagToRemove));
  };

  const openEditModal = (tarea) => {
    setEditandoTareaId(tarea.id);
    setNuevoTituloTarea(tarea.titulo);
    setDescripcion(tarea.descripcion || '');
    setPrioridad(tarea.prioridad);
    setEstado(tarea.estado);
    setFechaLimite(tarea.fechaLimite ? new Date(tarea.fechaLimite).toISOString().split('T')[0] : '');
    setListaEtiquetas(tarea.etiquetas || []);
    setArchivoUrl(tarea.archivoUrl || '');
    setArchivoSeleccionado(null);
    setIsModalOpen(true);
  };

  const resetModal = () => {
    setEditandoTareaId(null);
    setNuevoTituloTarea('');
    setDescripcion('');
    setPrioridad('BAJA');
    setEstado('POR_HACER');
    setFechaLimite('');
    setListaEtiquetas([]);
    setArchivoUrl('');
    setArchivoSeleccionado(null);
    setIsModalOpen(false);
  };

  // --- LÓGICA DE API ---
  const handleSaveTask = async (e) => {
    e.preventDefault();
    if (!nuevoTituloTarea.trim()) return;

    let finalFileUrl = archivoUrl;

    if (archivoSeleccionado) {
      const formData = new FormData();
      formData.append('archivo', archivoSeleccionado);
      try {
        const uploadResponse = await axios.post('http://localhost:3000/api/subir', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        finalFileUrl = uploadResponse.data.archivoUrl; 
      } catch (error) {
        console.error("Error al subir imagen:", error);
        alert("No se pudo subir la imagen");
        return; 
      }
    }

    try {
      if (editandoTareaId) {
        const response = await axios.put(`http://localhost:3000/api/tareas/${editandoTareaId}`, {
          titulo: nuevoTituloTarea, descripcion, prioridad, estado, fechaLimite: fechaLimite || null, etiquetas: listaEtiquetas, archivoUrl: finalFileUrl
        });
        setTareas(tareas.map(t => t.id === editandoTareaId ? response.data : t));
      } else {
        const response = await axios.post('http://localhost:3000/api/tareas', {
          titulo: nuevoTituloTarea, descripcion, prioridad, estado, fechaLimite: fechaLimite || null, etiquetas: listaEtiquetas, usuarioId: usuario.id, archivoUrl: finalFileUrl
        });
        setTareas([...tareas, response.data]); 
      }
      resetModal();
    } catch (error) {
      console.error("Error al guardar la tarea:", error);
      alert("Hubo un error al guardar la tarea");
    }
  };

  const handleDeleteTask = async (taskId, e) => {
    e.stopPropagation();
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta tarea permanentemente?")) return;
    try {
      await axios.delete(`http://localhost:3000/api/tareas/${taskId}`);
      setTareas(tareas.filter(t => t.id !== taskId));
    } catch (error) {
      console.error("Error al eliminar la tarea:", error);
    }
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const movedTask = tareas.find(t => t.id === draggableId);
    const newTasks = tareas.filter(t => t.id !== draggableId);
    const updatedTask = { ...movedTask, estado: destination.droppableId };
    
    newTasks.splice(destination.index, 0, updatedTask);
    setTareas(newTasks);

    try {
      await axios.put(`http://localhost:3000/api/tareas/${draggableId}`, {
        estado: destination.droppableId
      });

      if (destination.droppableId === 'COMPLETADO' && source.droppableId !== 'COMPLETADO') {
        const scoreResponse = await axios.post(`http://localhost:3000/api/usuarios/${usuario.id}/sumar-racha`);
        setEstadisticas({
          rachaActual: scoreResponse.data.rachaActual,
          mejorRacha: scoreResponse.data.mejorRacha,
          tareasCompletadas: scoreResponse.data.tareasCompletadas
        });
      }
      else if (source.droppableId === 'COMPLETADO' && destination.droppableId !== 'COMPLETADO') {
        const scoreResponse = await axios.post(`http://localhost:3000/api/usuarios/${usuario.id}/restar-racha`);
        setEstadisticas({
          rachaActual: scoreResponse.data.rachaActual,
          mejorRacha: scoreResponse.data.mejorRacha,
          tareasCompletadas: scoreResponse.data.tareasCompletadas
        });
      }
    } catch (error) {
      console.error("Error al guardar la posición:", error);
    }
  };

  const guardarPerfil = async () => {
    if(!nuevoNombre.trim()) return alert("El nombre no puede estar vacío");
    try {
      await axios.put(`http://localhost:3000/api/usuarios/${usuario.id}/perfil`, {
        nuevoNombre: nuevoNombre
      });
      alert("Perfil actualizado, vuelve a entrar para ver los cambios.");
      setIsEditProfile(false); 
    }catch(error){
      alert("Error al actualizar el perfil");
    }
  };

  const actualizarContra = async () => {
    if(!contraVieja || !contraNueva) return alert("Por favor llena ambos campos");
    try {
      await axios.put(`http://localhost:3000/api/usuarios/${usuario.id}/contrasena`, {
        contraVieja: contraVieja,
        contraNueva: contraNueva
      });
      alert("Contraseña actualizada, se cerrará tu sesion por seguridad(:");
      setIsChangePass(false);
      onLogout(); 
    }catch (error) {
      alert(error.response?.data?.error || "Error al cambiar contraseña");
    }
  };

  return (
    <div className="fondo_app">
      <div className="contenedor_principal">
        
        {/* --- HEADER --- */}
        <header className="encabezado">
          <div>
            <h1 className="titulo_principal">TaAlsk</h1>
            <p className="subtitulo">Organiza tu trabajo y mantén tu racha activa</p>
            
            {weather && (
              <div className="clima_caja" title={`Código WMO: ${weather.weathercode}`}>
                <span className="text-lg">{getWeatherEmoji(weather.weathercode)}</span>
                Ciudad de México: {weather.temperature}°C
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3 self-end md:self-auto relative">
            <button onClick={() => setIsCustomizerOpen(true)} className='btn_icono'>
              <Palette className="w-5 h-5" />
            </button>
            <button onClick={() => setIsDark(!isDark)} className='btn_icono'>
              <Moon className="w-5 h-5" />
            </button>
            <button 
              onClick={() => { resetModal(); setIsModalOpen(true); }}
              className="btn_primario"
            >
              <Plus className="w-4 h-4" /> Nueva Tarea
            </button>
            
            {/* MENÚ DE USUARIO */}
            <div className="relative">
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} 
                className="btn_perfil" 
                title="Menú de usuario"
              >
                <div className="btn_perfil_avatar">
                  {nuevoNombre ? nuevoNombre.charAt(0).toUpperCase() : 'U'}
                </div>
              </button>

              {isUserMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsUserMenuOpen(false)}></div>
                  
                  <div className="caja_menu">
                    <div className="menu_header">
                      <p className="menu_nombre">{nuevoNombre || 'Usuario'}</p>
                      <p className="menu_correo">{usuario?.correo || 'correo@ejemplo.com'}</p>
                    </div>
                    <div className="p-2 space-y-1 relative z-20">
                      <button 
                        onClick={() => { setIsUserMenuOpen(false); setIsEditProfile(true); }} 
                        className="menu_opcion"
                      >
                        <Settings className="w-4 h-4" /> Editar perfil
                      </button>
                      <button 
                        onClick={() => { setIsUserMenuOpen(false); setIsChangePass(true); }} 
                        className="menu_opcion"
                      >
                        <Key className="w-4 h-4" /> Cambiar contraseña
                      </button>
                      <div className="h-px bg-slate-100 dark:bg-[#030188] my-1 mx-2"></div>
                      <button 
                        onClick={onLogout} 
                        className="menu_opcion_salir"
                      >
                        <LogOut className="w-4 h-4" /> Cerrar Sesión
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

          </div>
        </header>

        {/* --- PANEL DE ESTADÍSTICAS --- */}
        <section className="estadisticas_grid">
          <div className="estadistica_caja">
            <div className="estadistica_icono_naranja"><Flame className="w-8 h-8 fill-current" /></div>
            <div>
              <p className="estadistica_titulo">Racha Actual</p>
              <p className="estadistica_valor">{estadisticas.rachaActual} <span className="estadistica_subtexto">días</span></p>
            </div>
          </div>
          <div className="estadistica_caja">
            <div className="estadistica_icono_ambar"><Trophy className="w-8 h-8 fill-current" /></div>
            <div>
              <p className="estadistica_titulo">Mejor Racha</p>
              <p className="estadistica_valor">{estadisticas.mejorRacha} <span className="estadistica_subtexto">días</span></p>
            </div>
          </div>
          <div className="estadistica_caja">
            <div className="estadistica_icono_esmeralda"><CheckCircle className="w-8 h-8" /></div>
            <div>
              <p className="estadistica_titulo">Tareas Completadas</p>
              <p className="estadistica_valor">{estadisticas.tareasCompletadas} <span className="estadistica_subtexto">total</span></p>
            </div>
          </div>
        </section>

        {/* --- BARRA DE PROGRESO DE TAREAS --- */}
        <div className="progreso_caja">
          <div className="progreso_titulo">Progreso del Proyecto</div>
          <div className="progreso_barra_fondo">
            <div 
              className="progreso_barra_relleno" 
              style={{ width: `${progressPercentage}%` }}
            >
              {progressPercentage > 5 && <span className="text-[9px] font-black text-white/90 drop-shadow-sm">{progressPercentage}%</span>}
            </div>
          </div>
          <div className="progreso_valor">{tareasCompletadasLista.length} / {totalTareas}</div>
        </div>

        {/* --- TABLERO KANBAN ESTABLE --- */}
        <DragDropContext onDragEnd={onDragEnd}>
          <section className="kanban_grid">
            
            {[{ id: 'POR_HACER', title: 'Por Hacer', icon: <LayoutList className="w-5 h-5 text-indigo-500" />, data: tareasPorHacer },
              { id: 'EN_PROGRESO', title: 'En Progreso', icon: <Loader2 className="w-5 h-5 text-amber-500 animate-spin-slow" />, data: tareasEnProgreso },
              { id: 'COMPLETADO', title: 'Completado', icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />, data: tareasCompletadasLista }
            ].map(col => (
              <Droppable key={col.id} droppableId={col.id}>
                {(provided, snapshot) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="columna_kanban">
                    
                    <div className="flex justify-between items-center mb-5 px-1">
                      <div className="flex items-center gap-2">
                        {col.icon}
                        <h3 className="columna_titulo">{col.title}</h3>
                      </div>
                      <span className="columna_contador">{col.data.length}</span>
                    </div>

                    <div className="space-y-4 min-h-[350px]">
                      {col.data.length === 0 && !snapshot.isDraggingOver && col.id === 'EN_PROGRESO' && <div className="tarea_vacia"><Loader2 className="w-6 h-6 opacity-50" /> Arrastra tareas aquí</div>}
                      {col.data.length === 0 && !snapshot.isDraggingOver && col.id === 'COMPLETADO' && <div className="tarea_vacia"><CheckCircle2 className="w-6 h-6 opacity-50" /> Listo para terminar</div>}
                      
                      {col.data.map((t, index) => (
                        <Draggable key={t.id} draggableId={t.id} index={index}>
                          {(provided, snapshot) => (
                            <div 
                              ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} 
                              onClick={() => openEditModal(t)}
                              className={snapshot.isDragging ? 'tarea_tarjeta_drag' : 'tarea_tarjeta_normal'}
                            >
                              
                              {t.archivoUrl && (
                                <div className="tarea_imagen_caja">
                                  <img src={t.archivoUrl} alt="Adjunto" className="tarea_imagen" />
                                </div>
                              )}

                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  {t.prioridad && (
                                    <span className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-md ${col.id === 'COMPLETADO' ? 'opacity-50' : ''} ${priorityConfig[t.prioridad].bg} ${priorityConfig[t.prioridad].color}`}>
                                      <Flag className="w-3 h-3 fill-current" /> {priorityConfig[t.prioridad].label}
                                    </span>
                                  )}
                                </div>
                                <button onClick={(e) => handleDeleteTask(t.id, e)} className="btn_borrar">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                              <div className={col.id === 'COMPLETADO' ? 'tarea_titulo_hecho' : 'tarea_titulo_normal'}>{t.titulo}</div>
                              {t.descripcion && <div className={col.id === 'COMPLETADO' ? 'tarea_desc_hecho' : 'tarea_desc_normal'}>{t.descripcion}</div>}
                              
                              <div className="tarea_pie">
                                <div className="flex flex-wrap gap-1">
                                  {t.etiquetas && t.etiquetas.length > 0 && t.etiquetas.map((tag, i) => (
                                    <span key={i} className="tarea_etiqueta">#{tag}</span>
                                  ))}
                                </div>
                                {t.fechaLimite && (
                                  <div className="tarea_fecha">
                                    <Calendar className="w-3 h-3" /> {formatDate(t.fechaLimite)}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            ))}

          </section>
        </DragDropContext>
      </div>

      {isCustomizerOpen && (
        <Customizacion isDark={isDark} toggleDark={() => setIsDark(!isDark)} primaryColor={primaryColor} setPrimaryColor={setPrimaryColor} onClose={() => setIsCustomizerOpen(false)} />
      )}

      {/* --- MODALES --- */}

      {/* 1. Modal de Tareas */}
      {isModalOpen && (
        <div className="modal_fondo">
          <div className="modal_caja modal_caja_larga">
            <div className="modal_encabezado">
              <h2 className="modal_titulo">{editandoTareaId ? "Editar Tarea" : "Crear nueva tarea"}</h2>
              <button onClick={resetModal} className="btn_cerrar"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveTask} className="space-y-4">
              {(archivoUrl || archivoSeleccionado) && (<div className="relative w-full h-32 mb-4 rounded-xl overflow-hidden border border-slate-200 dark:border-[#030188] shadow-inner"><img src={archivoSeleccionado ? URL.createObjectURL(archivoSeleccionado) : archivoUrl} alt="Preview" className="w-full h-full object-cover"/><button type="button" onClick={() => { setArchivoUrl(''); setArchivoSeleccionado(null); }} className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-lg backdrop-blur-sm cursor-pointer"><X className="w-4 h-4" /></button></div>)}
              <div>
                <label className="form_label">Título</label>
                <input type="text" value={nuevoTituloTarea} onChange={(e) => setNuevoTituloTarea(e.target.value)} placeholder="Avance de Proyecto" className="form_input" required autoFocus />
              </div>
              <div>
                <label className="form_label">Descripción</label>
                <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Objetivos" className="form_textarea" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form_label">Prioridad</label>
                  <select value={prioridad} onChange={(e) => setPrioridad(e.target.value)} className="form_select">
                    <option value="BAJA">Baja</option>
                    <option value="MEDIA">Media</option>
                    <option value="ALTA">Alta</option>
                  </select>
                </div>
                <div>
                  <label className="form_label">Estado</label>
                  <select value={estado} onChange={(e) => setEstado(e.target.value)} className="form_select">
                    <option value="POR_HACER">Por Hacer</option>
                    <option value="EN_PROGRESO">En Progreso</option>
                    <option value="COMPLETADO">Completado</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form_label">Fecha límite</label>
                  <input type="date" value={fechaLimite} onChange={(e) => setFechaLimite(e.target.value)} className="form_input" />
                </div>
                <div>
                  <label className="btn_upload mt-5">
                    <ImageIcon className="w-4 h-4" /> {archivoSeleccionado ? 'Cambiar' : 'Seleccionar'}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => setArchivoSeleccionado(e.target.files[0])} />
                  </label>
                </div>
              </div>
              <div>
                <label className="form_label">Etiquetas</label>
                <div className="flex gap-2">
                  <input type="text" value={entradaEtiqueta} onChange={(e) => setEntradaEtiqueta(e.target.value)} placeholder="Ej. Diseño..." className="form_input" />
                  <button type="button" onClick={handleAddTag} className="btn_anadir">Añadir</button>
                </div>
                {listaEtiquetas.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {listaEtiquetas.map((tag, index) => (
                      <span key={index} className="etiqueta_badge">
                        #{tag}<X onClick={() => handleRemoveTag(tag)} className="w-3 h-3 cursor-pointer hover:text-red-500" />
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="modal_footer">
                <button type="button" onClick={resetModal} className="btn_cancelar">Cancelar</button>
                <button type="submit" className="btn_guardar">{editandoTareaId ? "Guardar" : "Crear"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal de Editar Perfil */}
      {Editprofile && (
        <div className='modal_fondo'>
          <div className='modal_caja modal_caja_corta'>
            <div className='modal_encabezado'>
              <h2 className="modal_titulo">Editar Perfil</h2>
              <button onClick={() => setIsEditProfile(false)} className='btn_cerrar'><X className='w-5 h-5'/></button>
            </div>
            <div className="space-y-3">
              <label className='form_label'>Nombre Completo</label>
              <input type='text' value={nuevoNombre} onChange={(e) => setNuevoNombre(e.target.value)} className='form_input'/>
            </div>
            <div className='modal_footer'>
              <button onClick={() => setIsEditProfile(false)} className='btn_cancelar'>Cancelar</button>
              <button onClick={guardarPerfil} className='btn_guardar'>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Modal de Cambiar contraseña */}
      {ChangePass && (
        <div className='modal_fondo'>
          <div className='modal_caja modal_caja_corta'>
            <div className='modal_encabezado'>
              <h2 className='modal_titulo'>Cambiar contraseña</h2>
              <button onClick={() => setIsChangePass(false)} className='btn_cerrar'><X className='w-5 h-5'/></button>
            </div>
            <div className='space-y-4'>
              <div>
                <label className='form_label'>Contraseña Actual</label>
                <input type='password' value={contraVieja} onChange={(e) => setContraVieja(e.target.value)} placeholder='........' className='form_input'/>
              </div>
              <div>
                <label className='form_label'>Nueva Contraseña</label>
                <input type='password' value={contraNueva} onChange={(e) => setContraNueva(e.target.value)} placeholder='........' className='form_input'/>
              </div>
            </div>
            <div className='modal_footer'>
              <button onClick={() => setIsChangePass(false)} className='btn_cancelar'>Cancelar</button>
              <button onClick={actualizarContra} className='btn_peligro'>Actualizar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Dashboard;