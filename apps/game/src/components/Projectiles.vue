<script setup lang="ts">
import { useLoop } from "@tresjs/core";
import { gameState, playerCombat } from "../store";

let lastTime = performance.now();

useLoop().onBeforeRender(() => {
  const time = performance.now();
  const delta = (time - lastTime) / 1000;
  lastTime = time;

  for (let i = gameState.projectiles.length - 1; i >= 0; i--) {
    const p = gameState.projectiles[i];
    p.life -= delta;

    if (p.life <= 0) {
      gameState.projectiles.splice(i, 1);
      continue;
    }

    p.x += p.vx * delta;
    p.z += p.vz * delta;

    // Collision with enemies
    let hit = false;
    for (const enemy of gameState.enemies) {
      const dx = p.x - enemy.x;
      const dz = p.z - enemy.z;
      const distSq = dx * dx + dz * dz;

      if (distSq < 1.0) {
        // arbitrary hit radius
        enemy.hp -= p.type === "shotgun" ? playerCombat.shotgunDamage : playerCombat.pistolDamage;
        hit = true;
        break;
      }
    }

    // Pistols despawn on hit, shotgun pellets pierce but lose life quickly.
    if (hit && p.type === "pistol") {
      gameState.projectiles.splice(i, 1);
    }
  }
});
</script>

<template>
  <TresGroup>
    <TresMesh v-for="p in gameState.projectiles" :key="p.id" :position="[p.x, 1, p.z]">
      <TresSphereGeometry :args="[p.type === 'shotgun' ? 0.4 : 0.2, 8, 8]" />
      <TresMeshBasicMaterial :color="p.type === 'shotgun' ? '#ffaa00' : '#ffff00'" />
    </TresMesh>
  </TresGroup>
</template>
