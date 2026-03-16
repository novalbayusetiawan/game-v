<script setup lang="ts">
import { useLoop } from "@tresjs/core";
import { playerPosition, playerStats, skillsState, gameState } from "../store";

// Spawn enemies over time
setInterval(() => {
  if (gameState.enemies.length < 15) {
    // Spawn away from player
    const angle = Math.random() * Math.PI * 2;
    const distance = 15 + Math.random() * 10;
    gameState.enemies.push({
      id: gameState.nextProjectileId++, // reuse id counter for simple uniqueness
      x: playerPosition.x + Math.cos(angle) * distance,
      y: 1, // Same height as player
      z: playerPosition.z + Math.sin(angle) * distance,
      speed: 0.015 + Math.random() * 0.02, // Zombies are slower than player (was 0.03)
      hp: 15,
      maxHp: 15,
      state: "idle",
      targetX: 0,
      targetZ: 0,
    });
  }
}, 2000);

useLoop().onBeforeRender(() => {
  for (let i = gameState.enemies.length - 1; i >= 0; i--) {
    const enemy = gameState.enemies[i];
    if (enemy.hp <= 0) {
      gameState.enemies.splice(i, 1); // Remove dead enemies
      playerStats.scrap += 5; // Reward
      continue;
    }

    const dx = playerPosition.x - enemy.x;
    const dz = playerPosition.z - enemy.z;
    const distPlayer = Math.sqrt(dx * dx + dz * dz);

    const aggroRadius = 15;

    if (distPlayer < aggroRadius) {
      enemy.state = "chase";
    } else if (distPlayer > aggroRadius * 1.5) {
      enemy.state = "idle";
    }

    if (enemy.state === "chase") {
      if (distPlayer > 0.6) {
        // Move towards player
        enemy.x += (dx / distPlayer) * enemy.speed;
        enemy.z += (dz / distPlayer) * enemy.speed;
      } else {
        // Hit player
        if (!skillsState.phaseShift.isActive) {
          playerStats.health -= 0.1; // Simple drain while touching
          if (playerStats.health < 0) playerStats.health = 0;
        }
      }
    } else {
      // Idle: random wandering
      if (Math.random() < 0.01) {
        enemy.targetX = enemy.x + (Math.random() - 0.5) * 5;
        enemy.targetZ = enemy.z + (Math.random() - 0.5) * 5;
      }
      const tdx = enemy.targetX - enemy.x;
      const tdz = enemy.targetZ - enemy.z;
      const tLen = Math.sqrt(tdx * tdx + tdz * tdz);
      if (tLen > 0.1) {
        enemy.x += (tdx / tLen) * enemy.speed * 0.5;
        enemy.z += (tdz / tLen) * enemy.speed * 0.5;
      }
    }

    // Checking if Kunai hit them (simple proximity damage)
    if (skillsState.hiraishin.isKunaiActive) {
      const kx = skillsState.hiraishin.kunaiPosition.x - enemy.x;
      const kz = skillsState.hiraishin.kunaiPosition.z - enemy.z;
      const distKunai = Math.sqrt(kx * kx + kz * kz);
      if (distKunai < 1.5) {
        enemy.hp -= 0.5; // Burn damage
      }
    }
  }
});
</script>

<template>
  <TresGroup>
    <!-- Enemy Groups -> Meshes + Health Bars -->
    <TresGroup
      v-for="enemy in gameState.enemies"
      :key="enemy.id"
      :position="[enemy.x, enemy.y, enemy.z]"
    >
      <TresMesh cast-shadow>
        <TresBoxGeometry :args="[0.8, 1.8, 0.8]" />
        <TresMeshStandardMaterial color="#8b0000" />
      </TresMesh>

      <!-- Health bar, only show if damaged -->
      <TresMesh
        v-if="enemy.hp < enemy.maxHp"
        :position="[0, 1.2, 0]"
        :rotation="[-Math.PI / 4, 0, 0]"
      >
        <!-- Full width = 1.0, scaled by hp percentage -->
        <TresPlaneGeometry :args="[(enemy.hp / enemy.maxHp) * 1.0, 0.15]" />
        <TresMeshBasicMaterial color="#ff0000" :depthTest="false" />
      </TresMesh>
    </TresGroup>
  </TresGroup>
</template>
