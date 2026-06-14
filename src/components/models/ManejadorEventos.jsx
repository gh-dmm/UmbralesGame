import * as XLSX from 'xlsx';
import { GoogleGenAI } from '@google/genai';

// =========================================================================
// 1. CONTROL DE ALMACENAMIENTO (VITRINA)
// =========================================================================
export const guardarEnVitrina = (pieza, inventario, setInventario) => {
  if (!pieza) return;
  const key = `${pieza.origen}_${pieza.id}`;
  if (inventario.some(item => item.key === key)) return;

  setInventario([...inventario, {
    key,
    id: pieza.id,
    origen: pieza.origen,
    titulo: pieza.titulo,
    imagen: pieza.imagen
  }]);
  console.log(`🎒 Item recolectado en vitrina: ${pieza.titulo}`);
};

export const removerDeVitrina = (key, inventario, setInventario) => {
  setInventario(inventario.filter(item => item.key !== key));
  console.log(`🗑️ Item removido de la vitrina: ${key}`);
};

// =========================================================================
// 2. PROCESAMIENTO ASÍNCRONO DE EXCEL (AJX)
// =========================================================================
export const solicitarCargaExcel = async (id, origen, tipoVisor, setStatusCarga, setPiezaSeleccionada, setModalActivo) => {
  const RUTAS_EXCEL = {
    inah_museos: '/data/inah_museos.xlsx',
    monumentos: '/data/monumentos.xlsx',
    objetos_externos: '/data/objetos_externos.xlsx',
    solicitudes: '/data/solicitudes.xlsx',
  };

  setStatusCarga(`Abriendo caja de cartón: ${origen.toUpperCase()}...`);
  
  try {
    const response = await fetch(RUTAS_EXCEL[origen]);
    if (!response.ok) throw new Error('Error al leer el archivo binario');
    
    const buffer = await response.arrayBuffer();
    const dataBinaria = new Uint8Array(buffer);
    const libroExcel = XLSX.read(dataBinaria, { type: 'array' });
    const hojaCalculoActiva = libroExcel.Sheets[libroExcel.SheetNames[0]];
    const filasJSON = XLSX.utils.sheet_to_json(hojaCalculoActiva);

    const filaEncontrada = filasJSON.find((f) => {
      const idCelda = f['id_museo'] || f['id_monumento'] || f['id_item'] || f['id_solicitud'] || f['id'];
      return parseInt(idCelda, 10) === id;
    });

    if (filaEncontrada) {
      let titulo = filaEncontrada['nombre'] || filaEncontrada['nombre_actual'] || filaEncontrada['asunto'] || 'Pieza';
      let imagen = origen === 'monumentos' ? '/img/img2.jpeg' : '/img/img1.jpg';
      let nombreColumnaOriginal = origen === 'monumentos' ? 'nombre_original' : (origen === 'solicitudes' ? 'observaciones' : 'descripcion');
      
      const valorCelda = filaEncontrada[nombreColumnaOriginal];
      let campoEscaneable = valorCelda ? String(valorCelda).trim() : 'sin informacion';

      let linea1 = origen === 'inah_museos' ? `Estado: ${filaEncontrada['estado'] || 'N/A'}` : `Ubicación: ${filaEncontrada['localizacion'] || 'No especificada'}`;
      let linea2 = origen === 'monumentos' ? `Entidad: ${filaEncontrada['entidad_federativa'] || 'N/D'}` : 'Colección del Museo';

      setPiezaSeleccionada({
        id, origen, tipoVisor, titulo, imagen, campoEscaneable, nombreColumnaOriginal, linea1, linea2
      });
      setModalActivo('acervo');
      setStatusCarga('');
    } else {
      setStatusCarga(`ID ${id} no encontrado.`);
    }
  } catch (error) {
    console.error(error);
    setStatusCarga('Fallo al jalar datos de las celdas.');
  }
};

// =========================================================================
// 3. INTEGRACIÓN ASÍNCRONA CON GEMINI AI
// =========================================================================
export const abrirAuditoriaIA = async (piezaSeleccionada, setModalActivo, setChatHistorial) => {
  setModalActivo('gemini');
  // Inicializa el chat dejando claro el estado de carga
  setChatHistorial([{ emisor: 'ia', texto: 'Gemini analizando la descripción de la pieza...' }]);

  const prompt = `Actúas como un curador experto de museos. Registro: [${piezaSeleccionada.origen}]. Título: "${piezaSeleccionada.titulo}". Celda Excel: "${piezaSeleccionada.campoEscaneable}". Genera una lista corta de qué datos técnicos hacen falta.`;
  
  // 🔐 CORREGIDO: Consumo de llave mediante variables de entorno de Vite (.env)
  const CREDENCIAL_AUTH = import.meta.env.VITE_GEMINI_API_KEY;

  try {
    const ai = new GoogleGenAI({ apiKey: CREDENCIAL_AUTH });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });
    
    // 🔁 CORREGIDO: Mantiene el mensaje de análisis y agrega la respuesta abajo
    setChatHistorial(prev => [...prev, { emisor: 'ia', texto: response.text }]);
  } catch (error) {
    console.error(error);
    setChatHistorial(prev => [...prev, { emisor: 'ia', texto: 'Error de comunicación con la IA. Verifica tu variable de entorno.' }]);
  }
};

// =========================================================================
// 4. PROCESAR APORTE DE TEXTO DEL USUARIO
// =========================================================================
export const enviarAporteUsuario = (textoAporte, setTextoAporte, piezaSeleccionada, setPiezaSeleccionada, setChatHistorial) => {
  if (!textoAporte.trim()) return;

  // Inserta el mensaje del usuario en el flujo visible del chat
  setChatHistorial(prev => [...prev, { emisor: 'usuario', texto: textoAporte }]);
  
  if (piezaSeleccionada.campoEscaneable.toLowerCase() === 'sin informacion' && textoAporte.length > 3) {
    // 💾 CORREGIDO: Actualización limpia e inmutable para asegurar el re-render de la UI
    setPiezaSeleccionada(prev => ({ ...prev, campoEscaneable: textoAporte }));
    
    setChatHistorial(prev => [...prev, { emisor: 'ia', texto: 'Análisis Sintáctico Exitoso. Parchado reactivo en el Excel.' }]);
  } else {
    setChatHistorial(prev => [...prev, { emisor: 'ia', texto: 'Celda protegida con registros sólidos.' }]);
  }
  
  setTextoAporte('');
};