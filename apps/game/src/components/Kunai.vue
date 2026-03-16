<script setup lang="ts">
import { skillsState } from "../store";
</script>

<template>
  <TresGroup
    v-if="skillsState.hiraishin.isKunaiActive"
    :position="[
      skillsState.hiraishin.kunaiPosition.x,
      skillsState.hiraishin.kunaiPosition.y,
      skillsState.hiraishin.kunaiPosition.z,
    ]"
  >
    <TresMesh cast-shadow>
      <!-- Pointing forwards -->
      <TresCylinderGeometry :args="[0.05, 0.05, 1, 8]" />
      <TresMeshStandardMaterial color="#ff0000" emissive="#ff0000" :emissiveIntensity="1" />
    </TresMesh>
    <TresPointLight color="#ff00ff" :intensity="2" :distance="5" />
  </TresGroup>
</template>
