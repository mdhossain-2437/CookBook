const PREVENT = new Set(['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab']);

export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = new Set();
    this.just = new Set();
    this.mouseDX = 0;
    this.mouseDY = 0;
    this.locked = false;
    this.freeLook = false; // accept mouse deltas without pointer lock (test/demo mode)
    this.onLockChange = null;

    window.addEventListener('keydown', (e) => {
      if (PREVENT.has(e.code)) e.preventDefault();
      if (e.repeat) return;
      this.keys.add(e.code);
      this.just.add(e.code);
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));
    window.addEventListener('blur', () => this.keys.clear());
    window.addEventListener('mousemove', (e) => {
      if (!this.locked && !this.freeLook) return;
      this.mouseDX += e.movementX;
      this.mouseDY += e.movementY;
    });
    canvas.addEventListener('mousedown', (e) => {
      const code = `Mouse${e.button}`;
      this.keys.add(code);
      this.just.add(code);
    });
    window.addEventListener('mouseup', (e) => this.keys.delete(`Mouse${e.button}`));
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    document.addEventListener('pointerlockchange', () => {
      this.locked = document.pointerLockElement === canvas;
      this.onLockChange?.(this.locked);
    });
  }

  down(code) {
    return this.keys.has(code);
  }

  justPressed(code) {
    return this.just.has(code);
  }

  endFrame() {
    this.just.clear();
    this.mouseDX = 0;
    this.mouseDY = 0;
  }

  async lock() {
    try {
      await this.canvas.requestPointerLock?.();
    } catch {
      // Browsers reject when re-locking too quickly after Escape; the next click retries.
    }
  }
}
