<script setup lang="ts">
import { gameState } from "../store";

interface EnvironmentObject {
  id: number;
  type: "building" | "tree";
  x: number;
  z: number;
  scaleX: number;
  scaleY: number;
  scaleZ: number;
  color: string;
}

// Simple deterministic pseudo-random generator based on seed (if needed later)
const mapSize = 40;
const objectsCount = 30;
const objects: EnvironmentObject[] = [];

for (let i = 0; i < objectsCount; i++) {
  // Random position between -mapSize/2 and mapSize/2
  const x = (Math.random() - 0.5) * mapSize;
  const z = (Math.random() - 0.5) * mapSize;

  // Keep center slightly clear for player spawn
  if (Math.abs(x) < 3 && Math.abs(z) < 3) continue;

  const isCity = Math.random() > 0.5;

  if (isCity) {
    const scaleX = 2 + Math.random() * 3;
    const scaleY = 3 + Math.random() * 7;
    const scaleZ = 2 + Math.random() * 3;
    objects.push({
      id: i,
      type: "building",
      x,
      z,
      scaleX,
      scaleY,
      scaleZ,
      color: `#${Math.floor(Math.random() * 16777215)
        .toString(16)
        .padEnd(6, "0")}`, // Random hex color
    });
    gameState.buildings.push({ x, z, width: scaleX, depth: scaleZ });
  } else {
    objects.push({
      id: i,
      type: "tree",
      x,
      z,
      scaleX: 1,
      scaleY: 2 + Math.random() * 2, // Trunk height
      scaleZ: 1,
      color: "#4caf50", // Green leaves
    });
  }
}
</script>

<template>
  <TresGroup>
    <template v-for="obj in objects" :key="obj.id">
      <!-- Building -->
      <TresMesh
        v-if="obj.type === 'building'"
        :position="[obj.x, obj.scaleY / 2, obj.z]"
        cast-shadow
        receive-shadow
      >
        <TresBoxGeometry :args="[obj.scaleX, obj.scaleY, obj.scaleZ]" />
        <TresMeshStandardMaterial :color="obj.color" :roughness="0.8" />
      </TresMesh>

      <!-- Tree -->
      <TresGroup v-else-if="obj.type === 'tree'" :position="[obj.x, obj.scaleY / 2, obj.z]">
        <!-- Trunk -->
        <TresMesh cast-shadow receive-shadow>
          <TresCylinderGeometry :args="[0.3, 0.4, obj.scaleY, 8]" />
          <TresMeshStandardMaterial color="#5d4037" />
        </TresMesh>
        <!-- Leaves -->
        <TresMesh :position="[0, obj.scaleY / 2 + 1, 0]" cast-shadow receive-shadow>
          <TresBoxGeometry :args="[2, 2, 2]" />
          <TresMeshStandardMaterial :color="obj.color" />
        </TresMesh>
      </TresGroup>
    </template>
  </TresGroup>
</template>
