<script setup lang="ts">
import { shallowRef, watch, computed } from "vue";
import { useLoop, useTresContext } from "@tresjs/core";
import { useMagicKeys } from "@vueuse/core";
import { TextureLoader, NearestFilter, SRGBColorSpace, DoubleSide } from "three";
import { playerPosition, skillsState, gameState, playerCombat, playerStats } from "../store";

const charTexLoader = new TextureLoader();

const animTextures: Record<string, { map: any; frames: number }> = {
  idle: { map: charTexLoader.load("/assets/Shinobi/Idle.png"), frames: 6 },
  run: { map: charTexLoader.load("/assets/Shinobi/Run.png"), frames: 8 },
  attack: { map: charTexLoader.load("/assets/Shinobi/Attack_1.png"), frames: 6 },
};

// Configure textures
Object.values(animTextures).forEach(({ map, frames }) => {
  map.colorSpace = SRGBColorSpace;
  map.magFilter = NearestFilter;
  map.minFilter = NearestFilter;
  map.repeat.set(1 / frames, 1);
});

const currentAnim = shallowRef("idle");
const activeTexture = computed(() => animTextures[currentAnim.value].map);
const currentFrames = computed(() => animTextures[currentAnim.value].frames);

let isFacingRight = true;

const playerRef = shallowRef();
const { w, a, s, d, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, space, shift, digit1, digit2 } =
  useMagicKeys();
const { camera } = useTresContext();

let lastTime = performance.now();

// Tracking last movement direction for kunai throw
let lastDirX = 0;
let lastDirZ = -1;

watch(digit1, (v) => {
  if (v) playerCombat.weapon = "pistol";
});
watch(digit2, (v) => {
  if (v) playerCombat.weapon = "shotgun";
});

// Watch space bar for Hiraishin
watch(space, (pressed) => {
  if (pressed) {
    if (!skillsState.hiraishin.isKunaiActive && skillsState.hiraishin.cooldown <= 0) {
      // Throw kunai in the direction player is facing
      skillsState.hiraishin.isKunaiActive = true;
      skillsState.hiraishin.kunaiPosition.x = playerPosition.x;
      skillsState.hiraishin.kunaiPosition.y = 1;
      skillsState.hiraishin.kunaiPosition.z = playerPosition.z;

      const speed = 0.5;
      skillsState.hiraishin.kunaiVelocity.x = lastDirX * speed;
      skillsState.hiraishin.kunaiVelocity.y = 0;
      skillsState.hiraishin.kunaiVelocity.z = lastDirZ * speed;
    } else if (skillsState.hiraishin.isKunaiActive) {
      // Teleport to kunai
      if (playerRef.value) {
        playerRef.value.position.x = skillsState.hiraishin.kunaiPosition.x;
        playerRef.value.position.z = skillsState.hiraishin.kunaiPosition.z;
      }
      skillsState.hiraishin.isKunaiActive = false;
      skillsState.hiraishin.cooldown = skillsState.hiraishin.maxCooldown;
    }
  }
});

// Watch shift for Phase Shift (Dash)
watch(shift, (pressed) => {
  if (pressed && skillsState.phaseShift.cooldown <= 0) {
    skillsState.phaseShift.isActive = true;
    skillsState.phaseShift.timeRemaining = skillsState.phaseShift.duration;
    skillsState.phaseShift.cooldown = skillsState.phaseShift.maxCooldown;
  }
});

useLoop().onBeforeRender(() => {
  const time = performance.now();
  const delta = (time - lastTime) / 1000;
  lastTime = time;

  if (!playerRef.value) return;
  const mesh = playerRef.value;

  // Update cooldowns & timers
  if (skillsState.hiraishin.cooldown > 0) {
    skillsState.hiraishin.cooldown -= delta;
  }
  if (skillsState.phaseShift.cooldown > 0) {
    skillsState.phaseShift.cooldown -= delta;
  }
  if (skillsState.phaseShift.isActive) {
    skillsState.phaseShift.timeRemaining -= delta;
    if (skillsState.phaseShift.timeRemaining <= 0) {
      skillsState.phaseShift.isActive = false;
    }
  }

  // Speed logic
  const speed = skillsState.phaseShift.isActive ? playerStats.speed * 2.5 : playerStats.speed;

  let dx = 0;
  let dz = 0;

  if (w.value || ArrowUp.value) dz -= speed;
  if (s.value || ArrowDown.value) dz += speed;
  if (a.value || ArrowLeft.value) dx -= speed;
  if (d.value || ArrowRight.value) dx += speed;

  // Normalize diagonal movement
  if (dx !== 0 && dz !== 0) {
    const length = Math.sqrt(dx * dx + dz * dz);
    dx = (dx / length) * speed;
    dz = (dz / length) * speed;
  }

  // Track direction for kunai and sprites
  if (dx !== 0 || dz !== 0) {
    const length = Math.sqrt(dx * dx + dz * dz);
    lastDirX = dx / length;
    lastDirZ = dz / length;

    if (dx > 0) isFacingRight = true;
    else if (dx < 0) isFacingRight = false;

    currentAnim.value = "run";
  } else if (playerCombat.isAiming) {
    currentAnim.value = "attack";
  } else {
    currentAnim.value = "idle";
  }

  // Animation calculation
  const fps = currentAnim.value === "run" && skillsState.phaseShift.isActive ? 16 : 10;
  const frames = currentFrames.value;
  const frame = Math.floor(time / (1000 / fps)) % frames;

  activeTexture.value.offset.x = frame / frames;
  activeTexture.value.offset.y = 0;

  // Collisions against buildings
  let collidedX = false;
  let collidedZ = false;
  const playerSize = 1; // player bounding box is 1x1

  for (const b of gameState.buildings) {
    const hw = b.width / 2 + playerSize / 2;
    const hd = b.depth / 2 + playerSize / 2;

    // Check X collision alone
    if (Math.abs(mesh.position.x + dx - b.x) < hw && Math.abs(mesh.position.z - b.z) < hd) {
      collidedX = true;
    }
    // Check Z collision alone
    if (Math.abs(mesh.position.x - b.x) < hw && Math.abs(mesh.position.z + dz - b.z) < hd) {
      collidedZ = true;
    }
    if (collidedX && collidedZ) break;
  }

  if (!collidedX) mesh.position.x += dx;
  if (!collidedZ) mesh.position.z += dz;

  // Shoot logic (Manual shoot via aimTarget)
  if (
    playerCombat.isAiming &&
    time - playerCombat.lastShot > (playerCombat.weapon === "pistol" ? 300 : 800)
  ) {
    playerCombat.lastShot = time;

    const edx = playerCombat.aimTarget.x - mesh.position.x;
    const edz = playerCombat.aimTarget.z - mesh.position.z;
    const len = Math.sqrt(edx * edx + edz * edz) || 1;
    const vx = edx / len;
    const vz = edz / len;

    if (playerCombat.weapon === "pistol") {
      gameState.projectiles.push({
        id: gameState.nextProjectileId++,
        x: mesh.position.x,
        z: mesh.position.z,
        vx: vx * 15,
        vz: vz * 15,
        type: "pistol",
        life: 2,
      });
    } else {
      // Shotgun - 3 spread
      for (let j = -1; j <= 1; j++) {
        const spreadAngle = j * 0.2;
        const svx = vx * Math.cos(spreadAngle) - vz * Math.sin(spreadAngle);
        const svz = vx * Math.sin(spreadAngle) + vz * Math.cos(spreadAngle);
        gameState.projectiles.push({
          id: gameState.nextProjectileId++,
          x: mesh.position.x,
          z: mesh.position.z,
          vx: svx * 12,
          vz: svz * 12,
          type: "shotgun",
          life: 0.5, // short range
        });
      }
    }
  }

  // Global state update
  playerPosition.x = mesh.position.x;
  playerPosition.y = mesh.position.y;
  playerPosition.z = mesh.position.z;

  // Update Camera (Isometric Follow) & Billboard facing
  if (camera?.activeCamera?.value) {
    // Smoother following can be done here, but tight follow is fine for now
    camera.activeCamera.value.position.x = mesh.position.x;
    camera.activeCamera.value.position.z = mesh.position.z + 15;
    camera.activeCamera.value.position.y = 15;
    camera.activeCamera.value.lookAt(mesh.position.x, 0, mesh.position.z);

    // Make plane exactly face the camera
    mesh.quaternion.copy(camera.activeCamera.value.quaternion);
  }

  // Flip sprite based on direction
  // The plane has a default orientation. We flip its scale.x if moving left
  mesh.scale.x = isFacingRight ? Math.abs(mesh.scale.x) : -Math.abs(mesh.scale.x);
});

const playerOpacity = computed(() => (skillsState.phaseShift.isActive ? 0.3 : 1));
</script>

<template>
  <TresMesh ref="playerRef" :position="[0, 1, 0]" cast-shadow>
    <TresPlaneGeometry :args="[2, 3]" />
    <TresMeshStandardMaterial
      :map="activeTexture"
      :transparent="true"
      :opacity="playerOpacity"
      :alphaTest="0.1"
      :side="DoubleSide"
    />
  </TresMesh>
</template>
