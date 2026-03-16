<script setup lang="ts">
import { computed } from "vue";
import { playerStats, skillsState, playerCombat } from "../store";

const health = computed(() => playerStats.health);
const scrap = computed(() => playerStats.scrap);
const magic = computed(() => playerStats.magic);
const weapon = computed(() => playerCombat.weapon);

const skills = computed(() => [
  {
    name: "Hiraishin (Teleport)",
    key: "Space",
    cooldown: skillsState.hiraishin.cooldown,
    maxCooldown: skillsState.hiraishin.maxCooldown,
  },
  {
    name: "Phase Shift",
    key: "Shift",
    cooldown: skillsState.phaseShift.cooldown,
    maxCooldown: skillsState.phaseShift.maxCooldown,
  },
]);
</script>

<template>
  <div class="ui-overlay pointer-events-none">
    <!-- Top Bar -->
    <div class="top-bar">
      <div class="health-container">
        <div class="health-bar">
          <div class="health-fill" :style="{ width: `${health}%` }"></div>
        </div>
        <span class="health-text">{{ health }} / 100 HP</span>
      </div>

      <div class="resources">
        <div class="resource scrap">⚙️ Scrap: {{ scrap }}</div>
        <div class="resource magic">✨ Magic: {{ magic }}</div>
        <div class="resource magic">
          🔫 Wpn: {{ weapon }} (Dmg:
          {{ weapon === "pistol" ? playerCombat.pistolDamage : playerCombat.shotgunDamage }})
        </div>
        <div class="resource magic">👟 Spd: {{ playerStats.speed.toFixed(2) }}</div>
      </div>
    </div>

    <!-- Bottom Bar (Skills) -->
    <div class="bottom-bar">
      <div v-for="skill in skills" :key="skill.name" class="skill-box">
        <div class="skill-key">[{{ skill.key }}]</div>
        <div class="skill-name">{{ skill.name }}</div>
        <div v-if="skill.cooldown > 0" class="cooldown-overlay">
          {{ skill.cooldown.toFixed(1) }}s
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ui-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 10;
  pointer-events: none; /* Let clicks pass through to the 3D canvas */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px;
  box-sizing: border-box;
  font-family: "Inter", sans-serif;
  color: white;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.health-container {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.health-bar {
  width: 200px;
  height: 20px;
  background-color: rgba(0, 0, 0, 0.5);
  border: 2px solid #333;
  border-radius: 10px;
  overflow: hidden;
}

.health-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff416c 0%, #ff4b2b 100%);
  transition: width 0.2s;
}

.health-text {
  font-size: 14px;
  font-weight: bold;
}

.resources {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: rgba(0, 0, 0, 0.6);
  padding: 10px 15px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.resource {
  font-size: 16px;
  font-weight: bold;
}

.bottom-bar {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.skill-box {
  width: 100px;
  height: 100px;
  background: rgba(30, 30, 40, 0.8);
  border: 2px solid rgba(0, 255, 204, 0.5);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  box-shadow: 0 0 15px rgba(0, 255, 204, 0.2);
}

.skill-key {
  position: absolute;
  top: 5px;
  right: 5px;
  font-size: 12px;
  font-weight: bold;
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 6px;
  border-radius: 4px;
}

.skill-name {
  font-size: 12px;
  text-align: center;
  margin-top: 10px;
  font-weight: bold;
}

.cooldown-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  font-weight: bold;
  color: #ff416c;
}
</style>
