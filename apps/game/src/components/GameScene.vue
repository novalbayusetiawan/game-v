<script setup lang="ts">
import { TresCanvas } from "@tresjs/core";
import { BasicShadowMap, SRGBColorSpace, NoToneMapping } from "three";
import Player from "./Player.vue";
import GameUI from "./GameUI.vue";
import Environment from "./Environment.vue";
import Kunai from "./Kunai.vue";
import Enemies from "./Enemies.vue";
import Projectiles from "./Projectiles.vue";
import { playerCombat } from "../store";

const gl = {
  clearColor: "#1a1a2e",
  shadows: true,
  alpha: false,
  shadowMapType: BasicShadowMap,
  outputColorSpace: SRGBColorSpace,
  toneMapping: NoToneMapping,
};

function updateAim(event: any) {
  if (event?.point) {
    playerCombat.aimTarget.x = event.point.x;
    playerCombat.aimTarget.z = event.point.z;
  }
}

function onPointerDown(event: any) {
  playerCombat.isAiming = true;
  updateAim(event);
}

function onPointerMove(event: any) {
  if (playerCombat.isAiming) {
    updateAim(event);
  }
}

function onPointerUp() {
  playerCombat.isAiming = false;
}
</script>

<template>
  <div class="game-container">
    <GameUI />
    <TresCanvas v-bind="gl">
      <TresPerspectiveCamera :position="[0, 15, 15]" :look-at="[0, 0, 0]" />

      <!-- Lighting -->
      <TresAmbientLight :intensity="0.5" />
      <TresDirectionalLight :position="[5, 10, 5]" :intensity="1" cast-shadow />

      <!-- Player Character -->
      <Player />

      <!-- Kunai Teleport Beacon -->
      <Kunai />

      <!-- Player Projectiles -->
      <Projectiles />

      <!-- Enemies -->
      <Enemies />

      <!-- Procedural Environment -->
      <Environment />

      <!-- Ground plane -->
      <TresMesh
        :rotation="[-Math.PI / 2, 0, 0]"
        receive-shadow
        @pointerdown="onPointerDown"
        @pointerup="onPointerUp"
        @pointermove="onPointerMove"
      >
        <TresPlaneGeometry :args="[500, 500]" />
        <TresMeshStandardMaterial color="#333333" />
      </TresMesh>
    </TresCanvas>
  </div>
</template>

<style scoped>
.game-container {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden;
  background-color: #000;
}
</style>
