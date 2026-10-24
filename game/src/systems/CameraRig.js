import * as THREE from 'three';
import { clamp, damp, dampAngle } from '../utils/math.js';
import { raycastColliders } from './Physics.js';

export class CameraRig {
  constructor(camera) {
    this.camera = camera;
    this.yaw = 0;
    this.pitch = 0.3;
    this.idle = 0;
    this.dist = 6;
    this.pos = new THREE.Vector3();
  }

  update(dt, input, target, mode, headingYaw, colliders, speed) {
    const { mouseDX: dx, mouseDY: dy } = input;
    if (dx || dy) {
      this.yaw -= dx * 0.0022;
      this.pitch = clamp(this.pitch + dy * 0.0022, -0.25, 1.2);
      this.idle = 0;
    } else {
      this.idle += dt;
    }
    // GTA-style: after a moment without mouse input the camera settles behind the car.
    if (mode === 'vehicle' && this.idle > 1.2 && Math.abs(speed) > 1) {
      this.yaw = dampAngle(this.yaw, headingYaw + (speed < -2 ? Math.PI : 0), 2.5, dt);
      this.pitch = damp(this.pitch, 0.28, 2, dt);
    }

    const wantDist = mode === 'vehicle' ? 9.5 + Math.min(4, Math.abs(speed) * 0.08) : 5.5;
    const ty = target.y + (mode === 'vehicle' ? 1.2 : 1.5);
    const fx = -Math.sin(this.yaw);
    const fz = -Math.cos(this.yaw);
    const cp = Math.cos(this.pitch);
    const sp = Math.sin(this.pitch);
    const dirX = -fx * cp;
    const dirY = sp;
    const dirZ = -fz * cp;
    const hit = raycastColliders(target.x, ty, target.z, dirX, dirY, dirZ, wantDist, colliders);
    const allowed = Math.max(1.2, hit - 0.4);
    this.dist = allowed < this.dist ? allowed : damp(this.dist, Math.min(wantDist, allowed), 6, dt);

    this.pos.set(target.x + dirX * this.dist, Math.max(target.groundY + 0.5, ty + dirY * this.dist), target.z + dirZ * this.dist);
    this.camera.position.copy(this.pos);
    this.camera.lookAt(target.x, ty, target.z);
    this.camera.fov = damp(this.camera.fov, 62 + 16 * Math.min(1, Math.abs(speed) / 42), 3, dt);
    this.camera.updateProjectionMatrix();
  }
}
