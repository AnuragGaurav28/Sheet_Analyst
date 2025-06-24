
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html, Text } from "@react-three/drei";
import { useState, useEffect } from "react";

const BAR_COLORS = ["#3b82f6", "#10b981", "#ec4899"]; // Blue, Green, Pink

function Bar({ x, height, labelY, color }) {
  const [currentHeight, setCurrentHeight] = useState(0);

  useEffect(() => {
    let frame;
    const animate = () => {
      setCurrentHeight((prev) => {
        const newHeight = prev + (height - prev) * 0.1;
        if (Math.abs(newHeight - height) < 0.01) return height;
        frame = requestAnimationFrame(animate);
        return newHeight;
      });
    };
    animate();
    return () => cancelAnimationFrame(frame);
  }, [height]);

  return (
    <mesh position={[x, currentHeight / 2, 0]}>
      <boxGeometry args={[0.6, currentHeight, 0.6]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.95}
        roughness={0.2}
        metalness={0.4}
      />
      <Html position={[0, currentHeight / 2 + 0.6, 0]} center>
        <div className="text-xs font-semibold text-white bg-black/60 px-2 py-1 rounded shadow-md">
          {labelY}
        </div>
      </Html>
    </mesh>
  );
}

export default function ThreeDBarChart({ data, xKey, yKey }) {
  const spacing = 1.2;
  const heightScale = 0.1;
  const maxHeight = Math.max(...data.map((d) => Number(d[yKey]) || 0)) * heightScale;

  return (
    <div className="h-[500px] rounded-lg shadow-lg overflow-hidden">
      <Canvas camera={{ position: [0, maxHeight + 5, 15], fov: 45 }}>
        {/* Lights */}
        <ambientLight intensity={0.9} />
        <directionalLight position={[10, 10, 10]} intensity={1.2} castShadow />

        {/* Controls */}
        <OrbitControls enablePan={false} />

        {/* Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[10, 0, 0]}>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#f9fafb" />
        </mesh>

        {/* Visible Grid */}
        <gridHelper args={[20, 10, "#94a3b8", "#94a3b8"]} />

        {/* Bars */}
        {data.map((item, i) => (
          <Bar
            key={i}
            x={i * spacing}
            height={Number(item[yKey]) * heightScale}
            labelY={item[yKey]}
            color={BAR_COLORS[i % BAR_COLORS.length]}
          />
        ))}

        {/* X-Axis Labels */}
        {data.map((item, i) => (
          <Text
            key={i}
            position={[i * spacing, -0.6, 0]}
            fontSize={0.35}
            color="black"
            anchorX="center"
            anchorY="top"
          >
            {item[xKey]}
          </Text>
        ))}
      </Canvas>
    </div>
  );
}
