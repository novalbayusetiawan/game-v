<script setup lang="ts">
import { shallowRef, computed } from "vue";
import { useLoop, useTresContext } from "@tresjs/core";
import { TextureLoader, NearestFilter, SRGBColorSpace, DoubleSide } from "three";
import type { Enemy } from "../store";

const props = defineProps<{
  enemy: Enemy;
}>();

const charTexLoader = new TextureLoader();

// Mapping for variants and animation segments
const animConfig: Record<string, number> = {
  idle: 6,
  walk: 8,
  run: 8,
  attack: 6,
};

const textures = new Map<string, any>();

function getTexture(variant: string, state: string) {
  const key = `${variant}-${state}`;
  if (textures.has(key)) return textures.get(key);

  const fileName =
    state === "attack" ? "Attack_1.png" : state.charAt(0).toUpperCase() + state.slice(1) + ".png";
  const map = charTexLoader.load(`/assets/${variant}/${fileName}`);
  map.colorSpace = SRGBColorSpace;
  map.magFilter = NearestFilter;
  map.minFilter = NearestFilter;

  const frames = animConfig[state] || 6;
  map.repeat.set(1 / frames, 1);

  textures.set(key, { map, frames });
  return { map, frames };
}

const spriteRef = shallowRef();
const { camera } = useTresContext();

useLoop().onBeforeRender(() => {
  if (!spriteRef.value) return;
  const mesh = spriteRef.value;

  const { map, frames } = getTexture(props.enemy.variant, props.enemy.animState);

  // Animation update
  const fps = props.enemy.animState === "run" ? 12 : 8;
  const time = performance.now();
  const frame = Math.floor(time / (1000 / fps)) % frames;

  map.offset.x = frame / frames;
  map.offset.y = 0;

  // Face camera
  if (camera?.activeCamera?.value) {
    mesh.quaternion.copy(camera.activeCamera.value.quaternion);
  }

  // Flip scale based on facing direction
  mesh.scale.x = props.enemy.isFacingRight ? Math.abs(mesh.scale.x) : -Math.abs(mesh.scale.x);
});

const currentTexture = computed(() => {
  const { map } = getTexture(props.enemy.variant, props.enemy.animState);
  return map;
});
</script>

<template>
  <TresMesh ref="spriteRef">
    <TresPlaneGeometry :args="[2, 2]" />
    <TresMeshStandardMaterial
      :map="currentTexture"
      :transparent="true"
      :alphaTest="0.1"
      :side="DoubleSide"
    />
  </TresMesh>
</template>
