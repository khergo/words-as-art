import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { useRef, useState } from "react";
import * as THREE from "three";

const BeerGlass = () => {
  const glassRef = useRef<THREE.Mesh>(null);
  const beerRef = useRef<THREE.Mesh>(null);
  const foamRef = useRef<THREE.Mesh>(null);
  const pouringRef = useRef<THREE.Mesh>(null);
  const [fillLevel, setFillLevel] = useState(0);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Animate fill level
    if (fillLevel < 1) {
      setFillLevel(Math.min(fillLevel + 0.003, 1));
    }

    // Animate pouring stream
    if (pouringRef.current && fillLevel < 1) {
      pouringRef.current.visible = true;
      pouringRef.current.position.y = 1.5 - fillLevel * 0.5;
    } else if (pouringRef.current) {
      pouringRef.current.visible = false;
    }

    // Update beer level
    if (beerRef.current) {
      beerRef.current.scale.y = fillLevel;
      beerRef.current.position.y = -0.8 + (fillLevel * 0.8);
    }

    // Animate foam
    if (foamRef.current && fillLevel > 0.7) {
      foamRef.current.visible = true;
      foamRef.current.scale.y = Math.min((fillLevel - 0.7) * 3, 1);
      foamRef.current.position.y = -0.8 + (fillLevel * 1.6) + 0.1;
      // Gentle bobbing animation
      foamRef.current.position.y += Math.sin(time * 2) * 0.02;
    }

    // Slight glass rotation
    if (glassRef.current) {
      glassRef.current.rotation.y = Math.sin(time * 0.3) * 0.1;
    }
  });

  return (
    <group>
      {/* Glass */}
      <mesh ref={glassRef} position={[0, 0, 0]}>
        <cylinderGeometry args={[0.5, 0.4, 2, 32, 1, true]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.2}
          metalness={0.1}
          roughness={0.1}
          transmission={0.95}
          thickness={0.5}
        />
      </mesh>

      {/* Glass base */}
      <mesh position={[0, -1, 0]}>
        <cylinderGeometry args={[0.45, 0.45, 0.1, 32]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.3}
          metalness={0.2}
          roughness={0.1}
        />
      </mesh>

      {/* Beer liquid */}
      <mesh ref={beerRef} position={[0, -0.8, 0]}>
        <cylinderGeometry args={[0.48, 0.38, 1.6, 32]} />
        <meshPhysicalMaterial
          color="#ffb700"
          transparent
          opacity={0.8}
          metalness={0.3}
          roughness={0.2}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>

      {/* Foam */}
      <mesh ref={foamRef} visible={false} position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.48, 0.48, 0.3, 32]} />
        <meshStandardMaterial color="#fffef0" roughness={0.8} />
      </mesh>

      {/* Pouring stream */}
      <mesh ref={pouringRef} position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 2, 16]} />
        <meshPhysicalMaterial
          color="#ffb700"
          transparent
          opacity={0.6}
          metalness={0.2}
          roughness={0.3}
        />
      </mesh>
    </group>
  );
};

const BeerAnimation = () => {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 4], fov: 50 }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
        <pointLight position={[-5, 5, 5]} intensity={0.5} />
        <BeerGlass />
        <Environment preset="sunset" />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.5}
        />
      </Canvas>
    </div>
  );
};

export default BeerAnimation;
