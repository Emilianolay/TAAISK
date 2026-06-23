const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const prisma = new PrismaClient();

app.use(cors()); // Permite que React se comunique con Node
app.use(express.json()); // Permite leer los datos en formato JSON

const SECRET_KEY = process.env.JWT_SECRET || "secreto_temporal";

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Le ponemos la fecha actual al nombre para que nunca se repitan
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
  }
});
const upload = multer({ storage: storage });

app.post('/api/subir', upload.single('archivo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ningún archivo' });
    }
    // Devolvemos la URL local donde quedó guardada la imagen
    const archivoUrl = `http://localhost:3000/uploads/${req.file.filename}`;
    res.json({ archivoUrl });
  } catch (error) {
    console.error("Error al subir archivo:", error);
    res.status(500).json({ error: 'Error al procesar la imagen' });
  }
});


// 🚀 Endpoint: REGISTRO
app.post('/api/registro', async (req, res) => {
  try {
    const { nombre, correo, contrasena } = req.body;

    // 1. Verificar si el usuario ya existe
    const usuarioExistente = await prisma.usuario.findUnique({ where: { correo } });
    if (usuarioExistente) {
      return res.status(400).json({ error: "El correo ya está registrado" });
    }

    // 2. Encriptar la contraseña
    const contrasenaEncriptada = await bcrypt.hash(contrasena, 10);

    // 3. Crear el usuario en la base de datos
    const nuevoUsuario = await prisma.usuario.create({
      data: { nombre, correo, contrasena: contrasenaEncriptada }
    });

    res.status(201).json({ message: "Usuario creado exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// 🔑 Endpoint: LOGIN
app.post('/api/login', async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    // 1. Buscar al usuario
    const usuario = await prisma.usuario.findUnique({ where: { correo } });
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // 2. Comparar contraseñas
    const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!contrasenaValida) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    // 3. Generar Token de sesión
    const token = jwt.sign({ usuarioId: usuario.id }, SECRET_KEY, { expiresIn: '7d' });

    res.json({ message: "Login exitoso", token, usuario: { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// --- RUTA: CREAR TAREA ---
app.post('/api/tareas', async (req, res) => {
  try {
    const { titulo, descripcion, prioridad, estado, fechaLimite, etiquetas, usuarioId, archivoUrl } = req.body;

    const nuevaTarea = await prisma.tarea.create({
      data: {
        titulo: titulo,
        descripcion: descripcion || null,
        estado: estado || 'POR_HACER',
        prioridad: prioridad || 'BAJA',
        fechaLimite: fechaLimite ? new Date(fechaLimite) : null,
        etiquetas: etiquetas || [],
        archivoUrl: archivoUrl || null,
        posicion: 0,
        usuarioId: usuarioId
      }
    });

    res.json(nuevaTarea);
  } catch (error) {
    console.error("Error creando tarea:", error);
    res.status(500).json({ error: "No se pudieron guardar los detalles de la tarea" });
  }
});

// --- RUTA PARA CARGAR LAS TAREAS DEL USUARIO ---
app.get('/api/tareas/:usuarioId', async (req, res) => {
  try {
    const { usuarioId } = req.params;

    // Le pedimos a Prisma que busque todas las tareas de este usuario
    const tareasUsuario = await prisma.tarea.findMany({
      where: {
        usuarioId: usuarioId
      },
      orderBy: {
        fechaCreacion: 'asc' // Las ordenamos desde la más vieja a la más nueva
      }
    });

    res.json(tareasUsuario);
  } catch (error) {
    console.error("Error al cargar tareas:", error);
    res.status(500).json({ error: "Error al obtener las tareas de la base de datos" });
  }
});

app.put('/api/tareas/:tareaId', async (req, res) => {
  try {
    const { tareaId } = req.params;
    const { titulo, descripcion, estado, prioridad, fechaLimite, etiquetas, archivoUrl } = req.body;

    const datosAActualizar = {};
    if (titulo !== undefined) datosAActualizar.titulo = titulo;
    if (descripcion !== undefined) datosAActualizar.descripcion = descripcion;
    if (estado !== undefined) datosAActualizar.estado = estado;
    if (prioridad !== undefined) datosAActualizar.prioridad = prioridad;
    if (etiquetas !== undefined) datosAActualizar.etiquetas = etiquetas;
    if (archivoUrl !== undefined) datosAActualizar.archivoUrl = archivoUrl;
    if (fechaLimite !== undefined) {
      datosAActualizar.fechaLimite = fechaLimite ? new Date(fechaLimite) : null;
    }

    const tareaActualizada = await prisma.tarea.update({
      where: { id: tareaId },
      data: datosAActualizar
    });

    res.json(tareaActualizada);
  } catch (error) {
    console.error("Error al actualizar la tarea:", error);
    res.status(500).json({ error: "No se pudo actualizar la tarea" });
  }
});

// --- NUEVA RUTA: ELIMINAR TAREA ---
app.delete('/api/tareas/:tareaId', async (req, res) => {
  try {
    const { tareaId } = req.params;

    await prisma.tarea.delete({
      where: { id: tareaId }
    });

    res.json({ message: "Tarea eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar la tarea:", error);
    res.status(500).json({ error: "No se pudo eliminar la tarea" });
  }
});

//Editamos el perfil del usuario
//Para su nombre 
app.put('/api/usuarios/:usuarioId/perfil', async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const { nuevoNombre } = req.body;

    const usActualizado = await prisma.usuario.update({
      where: { id: usuarioId },
      data: { nombre: nuevoNombre }
    });

    res.json(usActualizado);
  } catch (error) {
    console.error("Error al actualizar el perfil:", error);
    res.status(500).json({ error: "No se actualizo el perfil" });
  }
});

//Para su contraseña
app.put('/api/usuarios/:usuarioId/contrasena', async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const { contraVieja, contraNueva } = req.body;
    //Aqui buscamos el usuario
    const usEncontrado = await prisma.usuario.findUnique({ where: { id: usuarioId } });
    if (!usEncontrado) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    //Revisamos si la contra vieja esta bien
    const contraValida = await bcrypt.compare(contraVieja, usEncontrado.contrasena);
    if (!contraValida) {
      return res.status(401).json({ error: "La contraseña actual es incorrecta" });
    }

    // Encriptamos la contra nueva para que sea segura
    const encrNuevaContra = await bcrypt.hash(contraNueva, 10);

    //La volvemos a guardar en la base
    await prisma.usuario.update({
      where: { id: usuarioId },
      data: { contrasena: encrNuevaContra }
    });
    res.json({ message: "Contraseña actualizada con exito" });
  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    res.status(500).json({ error: "Error al cambiar la contraseña" });
  }
});

app.post('/api/usuarios/:id/sumar-racha', async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await prisma.usuario.findUnique({ where: { id } });

    const nuevoTotal = usuario.tareasCompletadas + 1;
    const nuevaRacha = usuario.rachaActual + 1;
    const nuevaMejorRacha = nuevaRacha > usuario.mejorRacha ? nuevaRacha : usuario.mejorRacha;

    const usuarioActualizado = await prisma.usuario.update({
      where: { id },
      data: {
        tareasCompletadas: nuevoTotal,
        rachaActual: nuevaRacha,
        mejorRacha: nuevaMejorRacha
      }
    });

    res.json(usuarioActualizado);
  } catch (error) {
    console.error("Error al actualizar estadísticas:", error);
    res.status(500).json({ error: "No se pudieron actualizar las rachas" });
  }
});

// --- NUEVA RUTA: RESTAR RACHAS (EVITAR TRAMPAS) ---
app.post('/api/usuarios/:id/restar-racha', async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await prisma.usuario.findUnique({ where: { id } });

    const nuevoTotal = Math.max(0, usuario.tareasCompletadas - 1);
    const nuevaRacha = Math.max(0, usuario.rachaActual - 1);

    const usuarioActualizado = await prisma.usuario.update({
      where: { id },
      data: {
        tareasCompletadas: nuevoTotal,
        rachaActual: nuevaRacha
      }
    });

    res.json(usuarioActualizado);
  } catch (error) {
    console.error("Error al restar estadísticas:", error);
    res.status(500).json({ error: "No se pudieron restar las rachas" });
  }
});

app.get('/api/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Buscamos al usuario directamente en la base de datos
    const usuario = await prisma.usuario.findUnique({
      where: { id },
      // Seleccionamos solo lo que necesitamos, sin la contraseña por seguridad
      select: {
        id: true,
        nombre: true,
        correo: true,
        rachaActual: true,
        mejorRacha: true,
        tareasCompletadas: true,
        fechaCreacion: true
      }
    });

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(usuario); // Devolvemos los datos más frescos
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    res.status(500).json({ error: "Error de servidor al obtener el usuario" });
  }
});

app.delete('/api/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Borrar tareas antes
    await prisma.tarea.deleteMany({
      where: { usuarioId: id }
    });

    await prisma.usuario.delete({
      where: { id }
    });

    res.json({ message: "Usuario y sus tareas eliminados correctamente" });
  } catch (error) {
    console.error("Error al eliminar el usuario:", error);
    res.status(500).json({ error: "No se pudo eliminar el usuario" });
  }
});

// Iniciar el servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor Backend corriendo en http://localhost:${PORT}`);
});