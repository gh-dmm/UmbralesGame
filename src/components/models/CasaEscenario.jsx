import React, { useState, useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import * as Motor from './ManejadorEventos';
import './style.css';
import * as THREE from 'three';

// =========================================================================
// 📑 DICCIONARIO DE MAPEO RECURSOS (MUSEO MAP)
// =========================================================================
const DICCIONARIO_MUSEO = {
  objetos_externos: {
    2: { imagen: 'malinche.jpg', titulo: 'Vaso figura Malinche - Maromero' },
    4: { imagen: 'img4.png', titulo: 'Vaso figura Malinche' },
    5: { imagen: 'img5.png', titulo: 'Ángel Arrodillado' }
  },
  inah_museos: {
    1: { imagen: 'img3.jpeg', titulo: 'Museo Regional' },
    101: { imagen: 'malinche.jpg', titulo: 'Vaso figura Malinche' }
  },
  monumentos: {
    4: { imagen: 'img2.jpeg', titulo: 'Antiguo Acueducto' },
    202: { imagen: 'img5.png', titulo: 'Ángel Arrodillado' }
  },
  solicitudes: {
    1: { imagen: 'img6.jpeg', titulo: 'Transcripción Paleográfica' }
  }
};

const obtenerRecursoPieza = (origen, id, piezaSurgida) => {
  const grupo = DICCIONARIO_MUSEO[origen];
  if (grupo && grupo[id]) {
    return {
      imagen: `/images/${grupo[id].imagen}`,
      titulo: grupo[id].titulo
    };
  }
  const imgFallback = piezaSurgida?.imagen ? `/images/${piezaSurgida.imagen.split('/').pop()}` : 'https://images.unsplash.com/photo-1580136579312-94651dfd596d?w=200&q=80';
  const txtFallback = piezaSurgida?.titulo || `Pieza Arqueológica #${id}`;
  
  return { imagen: imgFallback, titulo: txtFallback };
};

// =========================================================================
// 1. INTERFAZ OVERLAY (POPUPS HTML ESTILO CARTÓN PERSONALIZADOS)
// =========================================================================
export default function VistaLlamadas({ 
  inventario, setInventario,
  piezaSeleccionada, setPiezaSeleccionada,
  modalActivo, setModalActivo,
  statusCarga, setStatusCarga,
  chatHistorial, setChatHistorial,
  textoAporte, setTextoAporte
}) {

  const [cartaVolteada, setCartaVolteada] = useState(false);

  useEffect(() => {
    const box = document.getElementById('modal-chat-box');
    if (box) box.scrollTop = box.scrollHeight;
  }, [chatHistorial]);

  useEffect(() => {
    setCartaVolteada(false);
  }, [piezaSeleccionada, modalActivo]);

  const datosPieza = piezaSeleccionada 
    ? obtenerRecursoPieza(piezaSeleccionada.origen, piezaSeleccionada.id, piezaSeleccionada)
    : { imagen: '', titulo: '' };

  return (
    <div className="interfaz-popups-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 99999 }}>
      
      {/* ⚡ Toast de Carga Asíncrona */}
      {statusCarga && (
        <div id="status-carga" className="status-carga-toast" style={{ position: 'fixed', top: '20px', right: '20px', background: '#553e31', color: '#f5eae0', padding: '10px 20px', borderRadius: '4px', fontFamily: 'monospace', pointerEvents: 'auto', boxShadow: '0 4px 10px rgba(0,0,0,0.5)', zIndex: 100000 }}>
          {statusCarga}
        </div>
      )}

      {/* =========================================================================
          POPUP 1: VISTA DEL ACERVO (FICHA TÉCNICA / LOTERÍA DE CARTÓN)
         ========================================================================= */}
      {modalActivo === 'acervo' && piezaSeleccionada && (
        <div className="bg-shadow-fade" style={{ pointerEvents: 'auto' }}>
          <div className="carton-popup-container">
            <button type="button" className="btn-close-carton" onClick={() => setModalActivo(null)}>&times;</button>
            
            <div className="carton-content-wrapper">
              {piezaSeleccionada.tipoVisor === 'loteria' ? (
                <div className={`carton-loteria-card ${cartaVolteada ? 'flipped' : ''}`} onClick={() => setCartaVolteada(!cartaVolteada)}>
                  <div className="loteria-card-inner">
                    <div className="card-front-carton">
                      <h3 className="loteria-title-main">LOTERÍA</h3>
                      <p className="loteria-subtitle-origen">{piezaSeleccionada.origen.toUpperCase()}</p>
                      <span className="badge-tag-id">ID: {piezaSeleccionada.id}</span>
                    </div>
                    <div className="card-back-carton">
                      <img src={datosPieza.imagen} className="loteria-image-render" alt={datosPieza.titulo} />
                      <div className="carton-card-label">{datosPieza.titulo}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="carton-ficha-technical" id="popup-visor-body">
                  <img src={datosPieza.imagen} className="ficha-image-render" alt={datosPieza.titulo} />
                  <h5 className="ficha-title-text">{datosPieza.titulo}</h5>
                  <p className="ficha-description-text">
                    {piezaSeleccionada.linea1 || 'Registro Histórico Cultural'}<br />
                    {piezaSeleccionada.linea2 || 'Muestra de Acervo Local'}
                  </p>
                  <div className="ficha-excel-box">
                    <strong>EXCEL CELL:</strong><br />
                    <span id={`dom-excel-${piezaSeleccionada.origen}-${piezaSeleccionada.id}`}>{piezaSeleccionada.campoEscaneable}</span>
                  </div>
                </div>
              )}

              <div className="carton-actions-panel">
                <button 
                  className={`btn-action-kraft ${inventario.some(i => i.key === `${piezaSeleccionada.origen}_${piezaSeleccionada.id}`) ? 'kraft-disabled' : 'kraft-save'}`} 
                  onClick={() => {
                    const piezaEnriquecida = { ...piezaSeleccionada, titulo: datosPieza.titulo, imagen: datosPieza.imagen };
                    Motor.guardarEnVitrina(piezaEnriquecida, inventario, setInventario);
                  }}
                  disabled={inventario.some(i => i.key === `${piezaSeleccionada.origen}_${piezaSeleccionada.id}`)}
                >
                  {inventario.some(i => i.key === `${piezaSeleccionada.origen}_${piezaSeleccionada.id}`) ? '🎒 Guardado' : '📥 Guardar en Vitrina'}
                </button>
                <button className="btn-action-kraft kraft-chat" onClick={() => Motor.abrirAuditoriaIA(piezaSeleccionada, setModalActivo, setChatHistorial)}>🗣️ Gemini AI Chat</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          POPUP 2: PANEL DE AUDITORÍA CON INTELIGENCIA ARTIFICIAL
         ========================================================================= */}
      {modalActivo === 'gemini' && (
        <div className="bg-shadow-fade" style={{ pointerEvents: 'auto' }}>
          <div className="carton-popup-container">
            <div className="carton-content-wrapper">
              <div className="chat-header-carton">
                <h5 className="ficha-title-text m-0">Auditoría: {datosPieza.titulo}</h5>
                <button type="button" className="btn-close-chat" onClick={() => setModalActivo('acervo')}>&times;</button>
              </div>
              <div className="chat-body-carton">
                <div id="modal-chat-box" className="chat-box-scroll">
                  {chatHistorial.map((chat, i) => (
                    <div key={i} className={`chat-bubble-item ${chat.emisor === 'usuario' ? 'bubble-user' : 'bubble-ia'}`}>
                      {chat.emisor === 'ia' && <strong>Gemini AI Report:<br/></strong>}
                      {chat.texto}
                    </div>
                  ))}
                </div>
                <div className="chat-input-group">
                  <label className="chat-input-label">Aporta datos faltantes para el Excel:</label>
                  <textarea value={textoAporte} onChange={(e) => setTextoAporte(e.target.value)} className="chat-textarea-kraft" rows="3" placeholder="Escribe aquí..." />
                </div>
              </div>
              <div className="chat-footer-carton">
                <button type="button" className="btn-action-kraft kraft-back" onClick={() => setModalActivo('acervo')}>Atrás</button>
                <button type="button" className="btn-action-kraft kraft-scan" onClick={() => Motor.enviarAporteUsuario(textoAporte, setTextoAporte, piezaSeleccionada, setPiezaSeleccionada, setChatHistorial)}>Escanear con IA</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =========================================================================
// 2. COMPONENTE 3D (ENTIDAD EN EL CANVAS CON INVENTARIO INTEGRADO EN TIEMPO REAL)
// =========================================================================
export function Model({ 
  onZoomVitrina, 
  setStatusCarga, 
  setPiezaSeleccionada, 
  setModalActivo, 
  inventario = [], 
  ...props 
}) {
  const { nodes, materials } = useGLTF('/models/CasaEscenario.glb')
  const [ocultarPrincipales, setOcultarPrincipales] = useState(false)

  const offsetInterior = ocultarPrincipales ? 1.6 : 0;

  // 📐 Parámetros de la rejilla física 3D alineados con las repisas de la vitrina
  const X_INICIAL = -0.6;   
  const Y_INICIAL = 0.95;   
  const Z_FIJO = -4.38;     
  const ESPACIADO_X = 0.55; 
  const ESPACIADO_Y = -0.52; 
  const COLUMNAS_MAX = 3;   

  const handleClick = (e) => {
    e.stopPropagation() 
    setOcultarPrincipales(true) 
    if (onZoomVitrina) onZoomVitrina() 
  }

  const handlePointerOver = (e) => {
    e.stopPropagation()
    document.body.style.cursor = 'pointer'
  }
  const handlePointerOut = (e) => {
    e.stopPropagation()
    document.body.style.cursor = 'auto'
  }

  return (
    <group {...props} position={[props.position?.[0] || 0, (props.position?.[1] || 0) + 1, props.position?.[2] || 0]} dispose={null}>
       
      {/* 📦 Estructura Base de la Casa de Cartón */}
      <group position={[0, -0.3, 0]} scale={0.95}>
        <group position={[0, 0.255, 0]} scale={[0.999, 1.18, 0.999]} visible={!ocultarPrincipales}>
          <mesh geometry={nodes.Plane011.geometry} material={materials['Material.002']} />
          <mesh geometry={nodes.Plane011_1.geometry} material={materials.cardboard} />
        </group> 
        
        <group position={[0, -0.40, 0]}>
          <mesh visible={!ocultarPrincipales} geometry={nodes.Plane012.geometry} material={materials['Material.001']} />
          <mesh visible={!ocultarPrincipales} geometry={nodes.Plane012_1.geometry} material={materials.cardboard} /> 
          <mesh visible={!ocultarPrincipales} geometry={nodes.Plane008.geometry} material={materials.cardboard} />
          <mesh visible={!ocultarPrincipales} geometry={nodes.Plane008_1.geometry} material={materials.Material} />
        </group>

        <group position={[0, -1.5 + offsetInterior, -0.565]} scale={1.55}>
          <mesh geometry={nodes.Plane016.geometry} material={materials.pared} />
          <mesh geometry={nodes.Plane016_1.geometry} material={materials.cardboard} />
        </group>
      
        <mesh geometry={nodes.Cielo.geometry} material={materials.fondo} position={[-0.784, 1.074 + offsetInterior, -6.79]} scale={0.648} />
        <mesh geometry={nodes.Cielo001.geometry} material={materials['fondo.001']} position={[-0.784, 1.074 + offsetInterior, -6.79]} scale={0.648} />
        
        <mesh visible={!ocultarPrincipales} geometry={nodes['35Macetas'].geometry} material={materials['Material.001']} position={[0, offsetInterior, 0]} />
        <mesh visible={!ocultarPrincipales} geometry={nodes['35Macetas001'].geometry} material={materials['Material.007']} position={[0, -0.2 + offsetInterior, 0]} />
        
        <group position={[3.089, -1.744 + offsetInterior, 1.008]} rotation={[-0.01, 0.009, 0.134]} scale={[1.094, 0.671, 1.1]} visible={!ocultarPrincipales}>
          <mesh geometry={nodes.Plane007.geometry} material={materials['Material.005']} />
          <mesh geometry={nodes.Plane007_1.geometry} material={materials.cardboard} />
        </group>
      
        <mesh geometry={nodes.nube_1.geometry} material={materials['Material.026']} position={[3.256, 4.141 + offsetInterior, -5.671]} rotation={[Math.PI / 2, 0, 0]} scale={[2.177, 2.177, 1.36]} />
        <mesh geometry={nodes.nube_1001.geometry} material={materials['Material.026']} position={[-4.739, 3.087 + offsetInterior, -5.007]} rotation={[Math.PI / 2, 0, 0]} scale={[2.883, 2.883, 1.801]} />
        
        <group position={[0, -1 + offsetInterior, -1.528]}>
          <mesh geometry={nodes.Plane023.geometry} material={materials.cardboard} />
          <mesh geometry={nodes.Plane023_1.geometry} material={materials['comedor.001']} />
        </group>
      </group>
      
      <group position={[0, offsetInterior, 0]}>
        <group position={[0, -1.18, 0.03]}>
            <mesh geometry={nodes.Plane018.geometry} material={materials.cardboard} />
            <mesh geometry={nodes.Plane018_1.geometry} material={materials.tv} />
        </group>
        
        <mesh geometry={nodes.luz.geometry} material={materials.luz} position={[0, 0, -3.13]} rotation={[Math.PI / 2, 0, 0]} />
        
        <group position={[0, -1.35, -1.837]}>
          <mesh geometry={nodes.Plane026.geometry} material={materials.cardboard} />
          <mesh geometry={nodes.Plane026_1.geometry} material={materials['comedor.001']} />
        </group>

        {/* 🏺 Clicker: Vaso figura Malinche - Maromero */}
        <group position={[-1.876, -1.35, -3.229]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh 
            geometry={nodes.Plane025.geometry} 
            material={materials['Material.010']} 
            onClick={(e) => {
              e.stopPropagation();
              Motor.solicitarCargaExcel(4, 'objetos_externos', 'loteria', setStatusCarga, setPiezaSeleccionada, setModalActivo);
            }}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
          />
          <mesh geometry={nodes.Plane025_1.geometry} material={materials['Material.011']} />        
        </group>
        
        {/* 👼 Clicker: Ángel arrodillado */}
        <group position={[0.109, 0.8, -4.39]} rotation={[1.55, -0.178, -0.013]} scale={0.447}>
          <mesh 
            geometry={nodes.Plane027.geometry} 
            material={materials['Material.012']} 
            onClick={(e) => {
              e.stopPropagation();
              Motor.solicitarCargaExcel(5, 'objetos_externos', 'ficha', setStatusCarga, setPiezaSeleccionada, setModalActivo);
            }}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
          />
          <mesh geometry={nodes.Plane027_1.geometry} material={materials['Material.009']} />
        </group>
      </group>
       
      {/* 🎯 MUEBLE DE LA VITRINA 3D (Estructura de Blender) */}
      <mesh 
        geometry={nodes.vitrina_frontal.geometry} 
        material={materials['Material.003']} 
        position={[-0.063, 0.578, -4.418]} 
        rotation={[Math.PI / 2, 0, 0]} 
        scale={[1.051, 1.473, 1.473]} 
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      />
      <group position={[-0.066, 0.544, -4.483]} rotation={[Math.PI / 2, 0, 0]} scale={[1.451, 1.473, 1.8]}>
        <mesh geometry={nodes.Plane004.geometry} material={materials['Material.004']} />
        <mesh geometry={nodes.Plane004_1.geometry} material={materials['Material.006']} />
        <mesh geometry={nodes.Plane004_2.geometry} material={materials['Material.008']} />
      </group>
      <mesh geometry={nodes.fondo.geometry} material={materials['Material.013']} position={[-0.06, 0.544, -4.53]} rotation={[Math.PI / 2, 0, 0]} scale={[1.162, 1.628, 1.628]} />

      {/* =========================================================================
          🚀 INVENTARIO EN 3D REAL: Los objetos salvados aparecen colocados en el estante
         ========================================================================= */}
      {(() => {
        const loader = new THREE.TextureLoader();
        
        return inventario.map((item, index) => {
          const columna = index % COLUMNAS_MAX;
          const fila = Math.floor(index / COLUMNAS_MAX);

          const posX = X_INICIAL + (columna * ESPACIADO_X);
          const posY = Y_INICIAL + (fila * ESPACIADO_Y);

          // 🚀 CORREGIDO: Usamos la función estática para resolver la ruta real de /images/
          const datosMapeados = obtenerRecursoPieza(item.origen, item.id, item);
          const texturaObjeto = loader.load(datosMapeados.imagen);

          return (
            <group 
              key={item.key} 
              position={[posX, posY, Z_FIJO]}
              onClick={(e) => {
                e.stopPropagation();
                // 🚀 INTERACTIVIDAD DIRECTA EN 3D: Abre la información guardada al dar clic a la pieza real del diorama
                const visorDestino = (item.origen === 'objetos_externos' && item.id === 4) || (item.origen === 'inah_museos') ? 'loteria' : 'ficha';
                Motor.solicitarCargaExcel(item.id, item.origen, visorDestino, setStatusCarga, setPiezaSeleccionada, setModalActivo);
              }}
              onPointerOver={handlePointerOver}
              onPointerOut={handlePointerOut}
            >
              {/* Plano frontal con la fotografía arqueológica del objeto */}
              <mesh>
                <planeGeometry args={[0.38, 0.38]} />
                <meshBasicMaterial map={texturaObjeto} transparent={true} side={THREE.DoubleSide} />
              </mesh>

              {/* Soporte rústico de cartón troquelado */}
              <mesh position={[0, 0, -0.01]}>
                <planeGeometry args={[0.42, 0.42]} />
                <meshStandardMaterial color="#cbb4a1" roughness={0.8} metalness={0.1} />
              </mesh>
            </group>
          );
        });
      })()}

    </group>
  )
}

useGLTF.preload('/models/CasaEscenario.glb')