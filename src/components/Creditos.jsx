import React, { useState } from 'react';
import './Creditos.css'; // Asegúrate de que la ruta a tu CSS sea la correcta aquí

export default function Creditos({ alVolver }) {
  // Inicializamos estrictamente en 'seccion-1'
  const [seccionActiva, setSeccionActiva] = useState('seccion-1');

  const conmutarSeccion = (targetId) => {
    setSeccionActiva(targetId);
    console.log(`🎬 Transición de créditos hacia: ${targetId}`);
  };

  return (
    <div className="container-creditos"style={{ position: 'relative', zIndex: 99999 }}>
      {/* --- Título de Sección --- */}
      
      <div className="titulo-contenedor-creditos">
        <img src="../../public/images/img7.png" alt="Textura Título" className="textura-irregular-creditos" />
        <h1 className="titulo-texto-creditos">Créditos</h1>
      </div>

      {/* --- Contenedor de la Sobresección --- */}
      <div className="sobreseccion-creditos">
        <div className="seccion-interna-creditos">
          
          {/* SECCIÓN 1 */}
          <div className={`bloque-indexado-creditos ${seccionActiva === 'seccion-1' ? 'activo' : ''}`} id="seccion-1">
            <div className="col-contenido-creditos">
              <h2 className="subtitulo-creditos">Sección 1 - Maquetación</h2>
              <ul className="lista-creditos">
                <li><span>▸</span>Massiel L. Ballesteros</li>
                <li><span>▸</span>Jessica Aline Ramírez Cortés</li>
                <li><span>▸</span>Nahomi Ruiz</li>
              </ul>
            </div>
            <div className="col-boton-creditos">
              <button 
                className="btn-scroll-creditos" 
                onClick={() => conmutarSeccion('seccion-2')}
                title="Ir a Sección 2"
              >
                ↓
              </button>
            </div>
          </div>

          {/* SECCIÓN 2 */}
          <div className={`bloque-indexado-creditos ${seccionActiva === 'seccion-2' ? 'activo' : ''}`} id="seccion-2">
            <div className="col-contenido-creditos">
              <ul className="lista-creditos">
                <li><span>▸</span>Daniel Galindo</li>
                <li><span>▸</span>Xavier Capetillo</li>
                <li><span>▸</span>Mateo Pineda Calderon</li>
                <li><span>▸</span>Maria dolores Markwalder</li>
                <li><span>▸</span>Carolina Herrera</li>
              </ul>
            </div>
            <div className="col-boton-creditos">
              <button 
                className="btn-scroll-creditos" 
                onClick={() => conmutarSeccion('seccion-3')}
                title="Ir a Sección 3"
              >
                ↓
              </button>
            </div>
          </div>

          {/* SECCIÓN 3 */}
          <div className={`bloque-indexado-creditos ${seccionActiva === 'seccion-3' ? 'activo' : ''}`} id="seccion-3">
            <div className="col-contenido-creditos">
              <h2 className="subtitulo-creditos">Sección 2 - Frontend y Backend</h2>
              <ul className="lista-creditos">
                <li><span>▸</span>Elias Oziel Sanchez</li>
                <li><span>▸</span>Diego Martinez Melendez</li>
                <li><span>▸</span>Ricardo Uriel Hernández Tiburcio</li>
              </ul>
            </div>
            <div className="col-boton-creditos">
              <button 
                className="btn-scroll-creditos" 
                onClick={() => conmutarSeccion('seccion-4')}
                title="Ir a Sección 4"
              >
                ↓
              </button>
            </div>
          </div>

          {/* SECCIÓN 4 */}
          <div className={`bloque-indexado-creditos ${seccionActiva === 'seccion-4' ? 'activo' : ''}`} id="seccion-4">
            <div className="col-contenido-creditos">
              <h2 className="subtitulo-creditos">Sección 3 - Equipo de Diseño</h2>
              <ul className="lista-creditos">
                <li><span>▸</span>Andrea</li>
                <li><span>▸</span>Luis</li>
              </ul>
            </div>
            <div className="col-boton-creditos">
              <button 
                className="btn-scroll-creditos btn-retorno-creditos" 
                onClick={alVolver} // Usa la prop que viene de App.jsx para regresar
                title="Volver al inicio"
              >
                ↑
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}