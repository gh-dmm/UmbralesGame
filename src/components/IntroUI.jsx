// components/IntroUI.jsx
import React from 'react';
import Creditos from './Creditos.jsx';
import { useNavigate } from 'react-router-dom';

export const IntroUI = ({ onStart, isTransitioning , onVerCreditos}) => {
  const navigate = useNavigate()
  return (
   
    <div className={`ui-container ${isTransitioning ? 'transition-exit' : ''}`}>
      
      <img id="fondo" className="capa" src="images/IMG_2252.png" alt="Fondo" />
      <img id="deco-tl" className="capa" src="images/IMG_2254.png" alt="" />
      <img id="deco-tr" className="capa" src="images/IMG_2255.png" alt="" />
      <img id="deco-bl" className="capa" src="images/IMG_2256.png" alt="" />
      <img id="deco-br" className="capa" src="images/IMG_2257.png" alt="" />
      <img id="deco-left" className="capa" src="images/IMG_2258.png" alt="" />
      <img id="deco-bottom" className="capa" src="images/IMG_2259.png" alt="" />
      <img id="titulo" className="capa" src="images/IMG_2266.png" alt="Umbrales" />

      <img 
        src="images/IMG_2284.png" 
        alt="Inicio" 
        className="boton-independiente" 
        id="btn-inicio" 
        onClick={onStart}
      />

      <img src="images/IMG_2285.png" alt="Créditos" className="boton-independiente" id="btn-creditos" onClick={onVerCreditos}/>
      <img src="images/IMG_2283.png" alt="Información" className="boton-independiente" id="btn-info" />
      
    </div>
  );
};