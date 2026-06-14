import { CameraControls, Environment, OrbitControls, useGLTF } from "@react-three/drei";
import { useThree, useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { degToRad } from "three/src/math/MathUtils.js";
import * as THREE from "three";
import { Model as Museo } from "./models/Museo.jsx";
import { Model as Galeria } from "./models/Galeria.jsx";
import { Model as Mapa } from "./models/Mapa.jsx"; 
import VistaLlamadas, { Model as CasaEscenario } from "./models/CasaEscenario.jsx"; 

const DEBUG_CAMERA = false;

const DebugCamera = () => {
  const { camera } = useThree();
  const controlsRef = useRef();

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key.toLowerCase() === "p" && controlsRef.current) {
        const pos = camera.position.toArray().map((n) => +n.toFixed(2));
        const target = controlsRef.current.target.toArray().map((n) => +n.toFixed(2));
        console.log("📷 position:", pos);
        console.log("🎯 target:  ", target);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [camera]);

  return <OrbitControls ref={controlsRef} makeDefault />;
};

// 🚀 CORREGIDO: Desestructuramos las props globales que vienen desde App.jsx directamente en el argumentoO
export function Experience({ 
  inventario, 
  setStatusCarga, 
  setPiezaSeleccionada, 
  setModalActivo 
}) {
  const [introFinished, setIntroFinished] = useState(false);
  const [currentScene, setCurrentScene] = useState("museo"); 
  const [showCasa, setShowCasa] = useState(false); 
  
  const museoGroupRef = useRef();
  const galeriaGroupRef = useRef(); 
  const mapaGroupRef = useRef(); 
  const casaGroupRef = useRef(); 
  const cameraControlsRef = useRef();

  // 1️⃣ Animación e introducción de cámaras base
  useEffect(() => {
    if (DEBUG_CAMERA) return;

    const animateIntro = async () => {
      if (!cameraControlsRef.current) return;
      const controls = cameraControlsRef.current;

      if (currentScene === "museo") {
        controls.setLookAt(-1.32, 15.41, 17.54, -0.57, 1.16, -0.6, false);
        controls.smoothTime = 0.8;
        await controls.setLookAt(-0.12, 2.75, 5.09, 0.09, 2.74, -0.68, true);
        controls.smoothTime = 0.6; 
        setIntroFinished(true);
      } 
      else if (currentScene === "galeria") {
        controls.setLookAt(3.94, 4.74, -26.11, 0.5, 3.22, 0.16, false);
        controls.smoothTime = 0.8;
        await controls.setLookAt(-0.22, 4.15, -15.54, -0.24, 4.18, 0.52, true);
        controls.smoothTime = 0.6;
      }
      else if (currentScene === "mapa") {
        controls.setLookAt(0.81, 3.69, -0.25, -0.33, 3.5, 0.23, false);
        controls.smoothTime = 0.9;
        await controls.setLookAt(8, 2.1, -0.15, 0.49, 2.06, -0.09, true);
        controls.smoothTime = 0.6;
      }
      else if (currentScene === "casa") {
        controls.setLookAt(5.95, -4.33, 4.93, 1.59, -3.34, -2.35, false);
        controls.smoothTime = 0.8;
        await controls.setLookAt(-1.06, -2.3, 5.35, -1.01, -2.07, -0.93, true);
        controls.smoothTime = 0.6;
      }
    };

    animateIntro();
  }, [currentScene]);

  // 2️⃣ Animación de encuadre simultáneo a la transición de la mano
  useEffect(() => {
    if (showCasa && cameraControlsRef.current && currentScene === "mapa") {
      cameraControlsRef.current.smoothTime = 1.2; 
      cameraControlsRef.current.setLookAt(0, 2, 5, 0, 1, 0, true);
    }
  }, [showCasa, currentScene]);

  // 3️⃣ 🎯 Animación de aproximación al hacer clic en la vitrina
  const handleVitrinaZoom = async () => {
    if (!cameraControlsRef.current) return;
    cameraControlsRef.current.smoothTime = 0.9;
    await cameraControlsRef.current.setLookAt(0.77, -0.9, 0.12, 0.77, -0.9, 0.11, true);
  };

  const handleEdificioToggle = async (abierto) => {
    if (!cameraControlsRef.current) return;
    const controls = cameraControlsRef.current;

    if (abierto) {
      await controls.setLookAt(-1.09, 1.97, -0.09, -0.86, 1.94, -1.08, true);
    } else {
      await controls.setLookAt(-0.12, 2.75, 5.09, 0.09, 2.74, -0.68, true);
    }
  };

  useFrame((state) => {
    const targetRotY = state.pointer.x * 0.045;
    const targetRotX = -state.pointer.y * 0.01;

    if (introFinished && museoGroupRef.current && currentScene === "museo") {
      museoGroupRef.current.rotation.y = THREE.MathUtils.lerp(museoGroupRef.current.rotation.y, targetRotY, 0.05);
      museoGroupRef.current.rotation.x = THREE.MathUtils.lerp(museoGroupRef.current.rotation.x, targetRotX, 0.05);
    }

    if (galeriaGroupRef.current && currentScene === "galeria") {
      galeriaGroupRef.current.rotation.y = THREE.MathUtils.lerp(galeriaGroupRef.current.rotation.y, targetRotY, 0.05);
      galeriaGroupRef.current.rotation.x = THREE.MathUtils.lerp(galeriaGroupRef.current.rotation.x, targetRotX, 0.05);
    }

    if (mapaGroupRef.current && currentScene === "mapa") {
      mapaGroupRef.current.rotation.y = THREE.MathUtils.lerp(mapaGroupRef.current.rotation.y, targetRotY, 0.05);
      mapaGroupRef.current.rotation.x = THREE.MathUtils.lerp(mapaGroupRef.current.rotation.x, targetRotX, 0.05);
    }

    if (casaGroupRef.current && (currentScene === "casa" || showCasa)) {
      casaGroupRef.current.rotation.y = THREE.MathUtils.lerp(casaGroupRef.current.rotation.y, targetRotY, 0.05);
      casaGroupRef.current.rotation.x = THREE.MathUtils.lerp(casaGroupRef.current.rotation.x, targetRotX, 0.05);
    }
  });

  return (
    <>
      {DEBUG_CAMERA ? (
        <>
          <DebugCamera />
          <axesHelper args={[5]} />
          <gridHelper args={[20, 20]} />
        </>
      ) : (
        <CameraControls
          ref={cameraControlsRef}
          makeDefault
          mouseButtons={{ left: 0, right: 0, wheel: 0, middle: 0 }}
          touches={{ one: 0, two: 0, three: 0 }}
          maxDistance={20}
          minDistance={1}
          minPolarAngle={0}
          maxPolarAngle={degToRad(80)}
        />
      )}

      <Environment preset="dawn" background={currentScene === "museo"} blur={3} />

      {currentScene === "galeria" && <color attach="background" args={["#1e293b"]} />}
      {(currentScene === "mapa" || currentScene === "casa") && <color attach="background" args={["#111111"]} />}

      {/* 🏛️ MUSEO */}
      {currentScene === "museo" && (
        <group ref={museoGroupRef}>
          <Museo 
            position={[0, 0, 0]} 
            scale={0.5} 
            onEdificioToggle={handleEdificioToggle} 
            onFullBlue={() => setCurrentScene("galeria")} 
          />
        </group>
      )}

      {/* 🖼️ GALERÍA */}
      {currentScene === "galeria" && (
        <group ref={galeriaGroupRef}>
          <Galeria 
            position={[0, 0, 0]} 
            rotation={[0, 0, 0]} 
            scale={1} 
            onTransitionComplete={() => setCurrentScene("mapa")} 
          />
        </group>
      )}

      {/* 🗺️ MAPA Y 🏠 CASA ESCENARIO */}
      {(currentScene === "mapa" || currentScene === "casa") && (
        <group>
          {(showCasa || currentScene === "casa") && (
            <group ref={casaGroupRef}>
              {/* 🚀 CORREGIDO: Eliminamos los prefijos 'props.' redundantes que causaban la falla */}
              <CasaEscenario 
                position={[0, -2, -5]} 
                scale={1} 
                onZoomVitrina={handleVitrinaZoom} 
                setStatusCarga={setStatusCarga}
                setPiezaSeleccionada={setPiezaSeleccionada}
                setModalActivo={setModalActivo}
                inventario={inventario}
              />
            </group>
          )}
          
          {currentScene === "mapa" && (
            <group ref={mapaGroupRef}>
              <Mapa 
                position={[0, 0, 0]} 
                scale={1} 
                onReachPoint1={() => setShowCasa(true)} 
                onTransitionEnd={() => setCurrentScene("casa")} 
              />
            </group>
          )}
        </group>
      )}
    </>
  );
};

useGLTF.preload("/models/museo.glb");
useGLTF.preload("/models/galeria.glb");
useGLTF.preload("/models/mapa.glb");
useGLTF.preload("/models/CasaEscenario.glb");