// App.jsx
import { Canvas, useThree } from "@react-three/fiber";
import { Loader } from "@react-three/drei";
import { Suspense, useState, useEffect } from "react";
import { Experience } from "./components/Experience";
import { Model as Calaco } from "./components/models/Calaco";
import { IntroUI } from "./components/IntroUI";

import Creditos from "./components/Creditos.jsx"; 
import { useLocation, useNavigate } from "react-router-dom"; 

// 🚀 IMPORTAMOS EL OVERLAY DE POPUPS DESDE TU ARCHIVO DE LA CASA
import VistaLlamadas from "./components/models/CasaEscenario.jsx"; 

function IntroCamera() {
  const { camera, scene } = useThree();

  useEffect(() => {
    camera.position.set(0, 1.5, 6);
    camera.lookAt(0, 0, 0);
    camera.scale.set(1, 1, 1);
    camera.updateProjectionMatrix();

    scene.background = null;
    scene.environment = null;
  }, [camera, scene]);

  return null;
}

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [scene, setScene] = useState(() => {
    return location.pathname === "/creditos" ? "creditos" : "intro";
  });

  // 🟦 ESTADOS GLOBALES DE LA VITRINA Y POPUPS COMPARTIDOS PARA VITE
  const [inventario, setInventario] = useState([]);
  const [piezaSeleccionada, setPiezaSeleccionada] = useState(null);
  const [modalActivo, setModalActivo] = useState(null); 
  const [statusCarga, setStatusCarga] = useState('');
  const [chatHistorial, setChatHistorial] = useState([]);
  const [textoAporte, setTextoAporte] = useState('');

  // Sincronizar la ruta del navegador con el estado de la escena 3D
  useEffect(() => {
    if (location.pathname === "/creditos") {
      setScene("creditos");
    } else if (location.pathname === "/") {
      setScene("intro"); 
    }
  }, [location.pathname]);

  const handleStart = () => {
    setScene("transition");
    setTimeout(() => {
      setScene("museo");
    }, 1200);
  };

  const handleBack = () => {
    navigate("/"); 
    setScene("intro");
  };

  const irACreditos = () => {
    navigate("/creditos");
    setScene("creditos");
  };

  return (
    <>
      <Loader />
      <div id="escenario" style={{ position: 'relative', width: '100vw', height: '100vh' }}>

        {/* REGLA 1: Solo renderizamos IntroUI si estamos en intro o transition */}
        {scene === "intro" && (
          <IntroUI isTransitioning={false} onStart={handleStart} onVerCreditos={irACreditos} />
        )}
        {scene === "transition" && (
          <IntroUI isTransitioning={true} onStart={handleStart} onVerCreditos={irACreditos}/>
        )}

        {/* REGLA 2: Sección de créditos rústica fuera del Canvas */}
        {scene === "creditos" && (
          <Creditos alVolver={handleBack} />
        )}

        {/* Renderizamos el Canvas 3D SOLO si no estamos en la sección de créditos */}
        {scene !== "creditos" && (
          <Canvas
            shadows
            className="canvas-container"
            style={{ pointerEvents: scene === "museo" ? "auto" : "none" }}
            camera={{
              position: [0, 1.5, 6],
              fov: 30
            }}
          >
            {(scene === "intro" || scene === "transition") && <IntroCamera />}

            {scene === "museo" && (
              <color attach="background" args={["#111"]} />
            )}

            <Suspense fallback={null}>
              {(scene === "intro" || scene === "transition") && (
                <group>
                  <ambientLight intensity={1.5} />
                  <directionalLight position={[5, 10, 5]} intensity={2} />
                  <Calaco
                    isTransitioning={scene === "transition"}
                    position={[-1.2, -1.5, 0]}
                  />
                </group>
              )}

              {scene === "museo" && (
                /* 🚀 PASAMOS LOS SETTERS DE CONTROL DESDE APP HASTA EXPERIENCE DE FORMA LIMPIA */
                <Experience 
                  setStatusCarga={setStatusCarga}
                  setPiezaSeleccionada={setPiezaSeleccionada}
                  setModalActivo={setModalActivo}
                  inventario={inventario}
                />
              )}
            </Suspense>
          </Canvas>
        )}

        {/* 🚀 CAPA DE POPUPS ACTIVA: Solo se monta si entramos a las salas del museo o mapa */}
        {scene === "museo" && (
          <VistaLlamadas 
            inventario={inventario} setInventario={setInventario}
            piezaSeleccionada={piezaSeleccionada} setPiezaSeleccionada={setPiezaSeleccionada}
            modalActivo={modalActivo} setModalActivo={setModalActivo}
            statusCarga={statusCarga} setStatusCarga={setStatusCarga}
            chatHistorial={chatHistorial} setChatHistorial={setChatHistorial}
            textoAporte={textoAporte} setTextoAporte={setTextoAporte}
          />
        )}
      </div>

      {scene === "museo" && (
        <button
          onClick={handleBack}
          style={{ position: "fixed", top: "20px", left: "20px", zIndex: 1000 }}
        >
          Volver al Inicio
        </button>
      )}
    </>
  );
}

export default App;