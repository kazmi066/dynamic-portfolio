export type CursorShape = "arrow" | "cross" | "ibeam";

export type TaskKind = "frame" | "card" | "type";

export interface Cursor {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  color: string;
  shape: CursorShape;
  press: number;
  speed: number;
  force: number;
  spin: number;
  curl: number;
  orbit: number;
  follow: boolean;
  leaving: boolean;
  task: Task | null;
  gen: Gen | null;
  idleFor: number;
  worked: boolean;
}

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Task {
  id: string;
  el: HTMLElement;
  kind: TaskKind;
  x: number;
  y: number;
  w: number;
  h: number;
  radius: number;
  state: "wait" | "active" | "done";
  draw: Box | null;
  showProxy: boolean;
  showSelection: boolean;
  handles: boolean;
  progress: number;
  lines: number;
  caret: { x: number; y: number; h: number; color: string } | null;
  visibleFor: number;
  groupId: number;
  groupIndex: number;
  homeX: number;
  homeY: number;
  homeW: number;
  homeH: number;
  tx: number;
  ty: number;
}

type Gen = Generator<void, void, number>;

const COLORS = [
  "#F24E1E",
  "#A259FF",
  "#1ABCFE",
  "#0ACF83",
  "#FF7262",
  "#FFC700",
  "#9747FF",
  "#E8467C",
  "#14AE5C",
  "#0D99FF",
  "#FF8A00",
  "#00B5CE",
];

const SEED = 12;
const KEEP = 7;
const MAX_BUILD = 24;
const MAX_FLOCK = 32;

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export class SwarmEngine {
  cursors: Cursor[] = [];
  tasks: Task[] = [];
  started = false;
  flocking = false;
  time = 0;
  tempo = 1.7;
  pageWidth = 0;
  pageHeight = 0;
  scrollY = 0;
  viewHeight = 800;
  viewWidth = 1280;

  private nextId = 0;
  private frontier = 0;
  private velocity = 0;
  private lastScroll = 0;
  private spawnCooldown = 0;
  private groupOpened = new Map<number, { at: number; gap: number }>();
  private pointer: { x: number; y: number } | null = null;
  private lastPointer: { x: number; y: number } | null = null;
  private travel = { x: 0, y: 0 };
  private onMove = (event: PointerEvent) => {
    this.pointer = { x: event.clientX, y: event.clientY };
  };
  private onLeave = () => {
    this.pointer = null;
    this.lastPointer = null;
  };

  constructor() {
    document.documentElement.dataset.swarmLive = "1";
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    this.readViewport();
    this.collect();
    this.seed();
    window.addEventListener("pointermove", this.onMove);
    window.addEventListener("pointerleave", this.onLeave);
  }

  destroy() {
    window.removeEventListener("pointermove", this.onMove);
    window.removeEventListener("pointerleave", this.onLeave);
    for (const cursor of this.cursors) cursor.gen?.return();
    for (const task of this.tasks) this.clearShift(task);
  }

  step(dt: number) {
    dt = Math.min(dt, 0.05);
    if (dt <= 0) return;
    this.time += dt;
    this.readViewport();
    this.pageWidth = document.documentElement.scrollWidth;
    this.pageHeight = document.documentElement.scrollHeight;

    const delta = Math.abs(this.scrollY - this.lastScroll) / dt;
    this.lastScroll = this.scrollY;
    this.velocity = Math.max(
      this.velocity * Math.exp(-dt * 1.2),
      this.velocity * 0.7 + delta * 0.3
    );

    if (!this.started && (this.time > 1.2 || this.scrollY > 8)) this.begin();
    if (this.started) {
      this.frontier = Math.max(this.frontier, this.viewBottom + 90);
    }

    this.refreshWaiting(dt);

    if (this.flocking) {
      this.spawnFlock(dt);
      this.follow(dt, this.cursors);
      return;
    }

    if (!this.started) {
      const touched = this.follow(
        dt,
        this.cursors,
        this.viewport(0.5, 0.46),
        0.72
      );
      if (touched) this.begin();
      return;
    }

    const waiting = this.available();
    this.tempo = clamp(
      1.15 + this.velocity / 1100 + waiting.length / Math.max(1, this.cursors.length) * 0.35,
      1.15,
      3.4
    );

    this.spawnCooldown -= dt;
    const busy = this.cursors.filter((cursor) => cursor.task).length;
    const present = this.cursors.filter((cursor) => !cursor.leaving).length;
    const targetCount = clamp(
      6 + Math.floor(this.velocity / 90) + Math.floor(waiting.length / 4),
      6,
      MAX_BUILD
    );
    if (
      present < targetCount &&
      waiting.length > present - busy &&
      this.spawnCooldown <= 0
    ) {
      const point = this.edgePoint();
      this.cursors.push(this.makeCursor(point.x, point.y));
      this.spawnCooldown = 0.045;
    }

    const pool = this.available();
    for (const cursor of this.cursors) {
      if (cursor.task || cursor.leaving || cursor.follow) continue;
      const task = this.pick(cursor, pool);
      if (!task) continue;
      pool.splice(pool.indexOf(task), 1);
      task.state = "active";
      this.openGroup(task);
      if (task.groupId >= 0) {
        const active = this.tasks.filter(
          (item) => item.groupId === task.groupId && item.state === "active"
        ).length;
        if (active >= 2) {
          for (let index = pool.length - 1; index >= 0; index -= 1) {
            if (pool[index].groupId === task.groupId) pool.splice(index, 1);
          }
        }
      }
      cursor.task = task;
      cursor.worked = true;
      cursor.idleFor = 0;
      cursor.gen?.return();
      cursor.gen =
        task.kind === "type" ? this.typeText(cursor, task) : this.drawBox(cursor, task);
    }

    for (const cursor of [...this.cursors]) {
      if (cursor.follow) continue;
      cursor.press = Math.max(0, cursor.press - dt * 6);
      if (!cursor.task && !cursor.leaving) {
        cursor.idleFor += dt;
        if (!cursor.gen && cursor.idleFor > 0.08) {
          const alive = this.cursors.filter((item) => !item.leaving).length;
          if (cursor.idleFor > 2.5 && alive > KEEP) {
            cursor.leaving = true;
            cursor.gen = this.leave(cursor);
          } else {
            cursor.gen = this.idle(cursor);
          }
        }
      }

      if (!cursor.gen) continue;
      const previousX = cursor.x;
      const previousY = cursor.y;
      let finished = false;
      try {
        finished = cursor.gen.next(dt).done ?? false;
      } catch (error) {
        console.error(error);
        finished = true;
        if (cursor.task) {
          this.clearShift(cursor.task);
          cursor.task.el.dataset.built = "1";
        }
      }
      cursor.vx = (cursor.x - previousX) / dt;
      cursor.vy = (cursor.y - previousY) / dt;
      this.aim(cursor, dt);
      if (!finished) continue;

      if (cursor.task) {
        const task = cursor.task;
        task.state = "done";
        task.showProxy = false;
        task.showSelection = false;
        task.draw = null;
        task.caret = null;
        this.clearShift(task);
        if (!task.el.dataset.built) task.el.dataset.built = "1";
        cursor.task = null;
        cursor.shape = "arrow";
      }
      cursor.gen = null;
      if (cursor.leaving) {
        const index = this.cursors.indexOf(cursor);
        if (index >= 0) this.cursors.splice(index, 1);
      }
    }

    if (this.tasks.length > 0 && this.tasks.every((task) => task.state === "done")) {
      for (const cursor of this.cursors) {
        if (cursor.task || cursor.follow) continue;
        cursor.follow = true;
        cursor.leaving = false;
        cursor.gen?.return();
        cursor.gen = null;
        cursor.shape = "arrow";
      }
      if (this.cursors.every((cursor) => cursor.follow)) this.flocking = true;
    }
  }

  private begin() {
    if (this.started) return;
    this.started = true;
    this.frontier = this.viewBottom + 90;
    for (const cursor of this.cursors) {
      cursor.follow = false;
      cursor.gen?.return();
      cursor.gen = null;
    }
  }

  private get viewTop() {
    return this.scrollY;
  }

  private get viewBottom() {
    return this.scrollY + this.viewHeight;
  }

  private readViewport() {
    this.scrollY = window.scrollY;
    this.viewHeight = window.innerHeight;
    this.viewWidth = window.innerWidth;
  }

  private viewport(xRatio: number, yRatio: number) {
    return {
      x: this.viewWidth * xRatio + window.scrollX,
      y: this.scrollY + this.viewHeight * yRatio,
    };
  }

  private pagePointer() {
    if (!this.pointer) return null;
    return {
      x: this.pointer.x + window.scrollX,
      y: this.pointer.y + this.scrollY,
    };
  }

  private edgePoint() {
    const band = this.contentBand();
    const fromLeft = Math.random() < 0.5;
    return {
      x: fromLeft ? band.left - 28 : band.right + 28,
      y: this.scrollY + rand(0.2, 0.8) * this.viewHeight,
    };
  }

  private collect() {
    const nodes = document.querySelectorAll<HTMLElement>("[data-swarm]");
    nodes.forEach((el, index) => {
      const kind = el.dataset.swarm;
      if (kind !== "frame" && kind !== "card" && kind !== "type") return;
      el.removeAttribute("data-built");
      el.style.removeProperty("--swarm-p");
      delete el.dataset.reveal;
      const task: Task = {
        id: `${index}`,
        el,
        kind,
        x: 0,
        y: 0,
        w: 0,
        h: 0,
        radius: 0,
        state: "wait",
        draw: null,
        showProxy: false,
        showSelection: false,
        handles: kind !== "type",
        progress: 0,
        lines: 1,
        caret: null,
        visibleFor: 0,
        groupId: -1,
        groupIndex: 0,
        homeX: 0,
        homeY: 0,
        homeW: 0,
        homeH: 0,
        tx: 0,
        ty: 0,
      };
      this.measure(task, true);
      this.tasks.push(task);
    });
    this.assignGroups();
  }

  private assignGroups() {
    const groups = new Map<HTMLElement, Task[]>();
    for (const task of this.tasks) {
      const parent = task.el.parentElement;
      if (!parent) continue;
      const list = groups.get(parent) || [];
      list.push(task);
      groups.set(parent, list);
    }
    let id = 0;
    for (const members of groups.values()) {
      if (members.length < 2) continue;
      const groupId = id++;
      members.forEach((task, index) => {
        task.groupId = groupId;
        task.groupIndex = index;
      });
    }
  }

  private staggerGap() {
    return clamp(0.52 - this.velocity / 3500, 0.24, 0.52);
  }

  private leadOf(groupId: number) {
    let above: Task | null = null;
    for (const task of this.tasks) {
      if (task.groupId !== groupId || task.state !== "wait") continue;
      if (task.y > this.frontier || task.w <= 1 || task.h <= 1) continue;
      const inView = task.y < this.viewBottom && task.y + task.h > this.viewTop - 40;
      if (inView) return task;
      if (!above) above = task;
    }
    return above;
  }

  private groupReady(task: Task) {
    if (task.groupId < 0) return true;
    const opened = this.groupOpened.get(task.groupId);
    if (!opened) return task === this.leadOf(task.groupId);
    if (this.time < opened.at + task.groupIndex * opened.gap) return false;
    const active = this.tasks.filter(
      (item) => item.groupId === task.groupId && item.state === "active"
    ).length;
    return active < 2;
  }

  private openGroup(task: Task) {
    if (task.groupId < 0 || this.groupOpened.has(task.groupId)) return;
    const gap = this.staggerGap();
    this.groupOpened.set(task.groupId, {
      at: this.time - task.groupIndex * gap,
      gap,
    });
  }

  private measure(task: Task, readRadius = false) {
    const rect = task.el.getBoundingClientRect();
    task.x = rect.left + window.scrollX;
    task.y = rect.top + window.scrollY;
    task.w = rect.width;
    task.h = rect.height;
    if (readRadius) {
      const radius = parseFloat(getComputedStyle(task.el).borderRadius) || 0;
      task.radius = Math.max(0, Math.min(radius, task.w / 2, task.h / 2));
    }
  }

  private refreshWaiting(dt: number) {
    for (const task of this.tasks) {
      if (task.state !== "wait") continue;
      this.measure(task);
      const inView = task.y < this.viewBottom && task.y + task.h > this.viewTop;
      task.visibleFor = inView ? task.visibleFor + dt : 0;
      if (task.w < 1 || task.h < 1 || task.visibleFor > 8) {
        task.state = "done";
        task.el.dataset.built = "1";
      }
    }
  }

  private available() {
    return this.tasks.filter(
      (task) =>
        task.state === "wait" &&
        task.y <= this.frontier &&
        task.w > 1 &&
        task.h > 1 &&
        this.groupReady(task)
    );
  }

  private pick(cursor: Cursor, tasks: Task[]) {
    let best: Task | null = null;
    let bestScore = Infinity;
    const top = this.viewTop - 40;
    const bottom = this.viewBottom;
    for (const task of tasks) {
      const band = task.y >= top && task.y <= bottom ? 0 : task.y < top ? 1 : 2;
      const distance = band === 1 ? top - task.y : task.y;
      const score =
        band * 1_000_000 +
        task.groupIndex * 4000 +
        distance * 0.6 +
        Math.abs(task.y - cursor.y) * 0.4;
      if (score < bestScore) {
        bestScore = score;
        best = task;
      }
    }
    return best;
  }

  private seed() {
    const center = this.viewport(0.5, 0.46);
    for (let index = 0; index < SEED; index += 1) {
      const angle = (index / SEED) * Math.PI * 2;
      const cursor = this.makeCursor(
        center.x + Math.cos(angle) * 150,
        center.y + Math.sin(angle) * 86
      );
      cursor.follow = true;
      this.cursors.push(cursor);
    }
  }

  private makeCursor(x: number, y: number): Cursor {
    const fast = Math.random() < 0.25;
    const id = this.nextId++;
    return {
      id,
      x,
      y,
      vx: 0,
      vy: 0,
      angle: 0,
      color: COLORS[id % COLORS.length],
      shape: "arrow",
      press: 0,
      speed: fast ? rand(1000, 1500) : rand(320, 760),
      force: fast ? rand(3500, 6000) : rand(700, 1800),
      spin: fast ? rand(2.2, 3.4) : rand(0.8, 1.8),
      curl: rand(-1, 1),
      orbit: rand(70, 170),
      follow: false,
      leaving: false,
      task: null,
      gen: null,
      idleFor: 0,
      worked: false,
    };
  }

  private spawnFlock(dt: number) {
    this.spawnCooldown -= dt;
    if (this.cursors.length >= MAX_FLOCK || this.spawnCooldown > 0) return;
    const point = this.edgePoint();
    const cursor = this.makeCursor(point.x, point.y);
    cursor.follow = true;
    this.cursors.push(cursor);
    this.spawnCooldown = 0.05;
  }

  private follow(
    dt: number,
    group: Cursor[],
    override?: { x: number; y: number },
    scale = 1
  ) {
    const target = override ?? this.flockTarget();
    const mouse = this.pagePointer();
    if (mouse && this.lastPointer && dt > 0) {
      const blend = Math.min(1, dt * 18);
      this.travel.x +=
        ((mouse.x - this.lastPointer.x) / dt - this.travel.x) * blend;
      this.travel.y +=
        ((mouse.y - this.lastPointer.y) / dt - this.travel.y) * blend;
    }
    this.lastPointer = mouse;

    const orbitBase = 135 * scale * (1 + 0.18 * Math.sin(this.time * 0.55));
    const spinSign = Math.tanh(Math.cos(this.time * 0.11) * 3);
    const desired = group.map((cursor) => {
      const dx = cursor.x - target.x;
      const dy = cursor.y - target.y;
      const dist = Math.hypot(dx, dy) || 0.01;
      const nx = dx / dist;
      const ny = dy / dist;
      const heading = Math.atan2(dy, dx);
      const radius =
        orbitBase * (1 + 0.3 * Math.sin(3 * heading + this.time * 0.7)) +
        (cursor.orbit - 120) * 0.55 * scale;
      const tangent = 300 * (0.7 + cursor.spin * 0.2) * spinSign;
      const radial = clamp((radius - dist) * 4, -2600, 1400);
      const spill = clamp((dist - radius) / 600, 0, 1);
      return {
        x: -ny * tangent + nx * radial - ny * cursor.curl * 400 * spill,
        y: nx * tangent + ny * radial + nx * cursor.curl * 400 * spill,
      };
    });

    for (let index = 0; index < group.length; index += 1) {
      const cursor = group[index];
      let ax = desired[index].x;
      let ay = desired[index].y;
      let alignX = 0;
      let alignY = 0;
      let weight = 0;
      for (let other = 0; other < group.length; other += 1) {
        if (other === index) continue;
        const mate = group[other];
        const dist = Math.hypot(mate.x - cursor.x, mate.y - cursor.y);
        if (dist > 90) continue;
        const influence = 1 - dist / 90;
        alignX += mate.vx * influence;
        alignY += mate.vy * influence;
        weight += influence;
      }
      if (weight > 0) {
        ax = ax * 0.7 + (alignX / weight) * 0.3;
        ay = ay * 0.7 + (alignY / weight) * 0.3;
      }
      const outside = Math.max(
        0,
        Math.hypot(cursor.x - target.x, cursor.y - target.y) - 180 * scale
      );
      const maxSpeed = cursor.speed * (1.3 + Math.min(3.2, outside / 90));
      const magnitude = Math.hypot(ax, ay);
      if (magnitude > maxSpeed) {
        ax *= maxSpeed / magnitude;
        ay *= maxSpeed / magnitude;
      }
      let forceX = (ax - cursor.vx) * 6;
      let forceY = (ay - cursor.vy) * 6;
      const maxForce = cursor.force * (1.4 + Math.min(5, outside / 50));
      const force = Math.hypot(forceX, forceY);
      if (force > maxForce) {
        forceX *= maxForce / force;
        forceY *= maxForce / force;
      }
      cursor.vx += forceX * dt;
      cursor.vy += forceY * dt;
      cursor.x += cursor.vx * dt;
      cursor.y += cursor.vy * dt;
    }

    let touched = false;
    if (mouse) {
      for (const cursor of group) {
        const dx = cursor.x - mouse.x;
        const dy = cursor.y - mouse.y;
        const dist = Math.hypot(dx, dy) || 0.01;
        if (dist >= 48) continue;
        touched = true;
        const nx = dx / dist;
        const ny = dy / dist;
        cursor.x = mouse.x + nx * 48;
        cursor.y = mouse.y + ny * 48;
        const approach =
          (cursor.vx - this.travel.x) * nx + (cursor.vy - this.travel.y) * ny;
        if (approach < 0) {
          cursor.vx -= nx * approach * 1.6;
          cursor.vy -= ny * approach * 1.6;
        }
        cursor.vx += nx * 260;
        cursor.vy += ny * 260;
      }
    }

    for (const cursor of group) {
      cursor.press = Math.max(0, cursor.press - dt * 6);
      this.aim(cursor, dt);
    }
    return touched;
  }

  private flockTarget() {
    const band = this.contentBand();
    const mouse = this.pagePointer();
    const t = this.time;
    const rawX = mouse
      ? mouse.x
      : band.left + (band.right - band.left) * (0.5 + 0.22 * Math.sin(t * 0.37));
    const rawY = mouse
      ? mouse.y
      : this.scrollY + this.viewHeight * (0.5 + 0.18 * Math.sin(t * 0.53 + 1));
    return {
      x: clamp(rawX, band.left + 16, band.right - 16),
      y: rawY,
    };
  }

  private aim(cursor: Cursor, dt: number) {
    if (cursor.shape === "cross" || cursor.shape === "ibeam") {
      cursor.angle += (0 - cursor.angle) * Math.min(1, dt * 12);
      return;
    }
    const speed = Math.hypot(cursor.vx, cursor.vy);
    if (speed < 36) {
      cursor.angle =
        Math.abs(cursor.angle) < 0.5 ? 0 : cursor.angle * (1 - Math.min(1, dt * 8));
      return;
    }
    const target = (Math.atan2(cursor.vy, cursor.vx) * 180) / Math.PI + 128;
    const delta = (((target - cursor.angle + 540) % 360) + 360) % 360 - 180;
    cursor.angle += delta * Math.min(1, dt * 8);
  }

  private *wait(seconds: number): Gen {
    let elapsed = 0;
    while (elapsed < seconds) elapsed += (yield) * this.tempo;
  }

  private *moveTo(
    cursor: Cursor,
    dest: { x: number; y: number } | (() => { x: number; y: number }),
    options: {
      speed?: number;
      drag?: boolean;
      bend?: number;
      onStep?: () => void;
    } = {}
  ): Gen {
    const point = () => (typeof dest === "function" ? dest() : dest);
    const originX = cursor.x;
    const originY = cursor.y;
    const first = point();
    const distance = Math.hypot(first.x - originX, first.y - originY);
    if (distance < 0.6) {
      cursor.x = first.x;
      cursor.y = first.y;
      options.onStep?.();
      return;
    }
    const duration =
      clamp(0.12 + Math.sqrt(distance) * 0.021, 0.14, 0.9) / (options.speed ?? 1);
    const bend =
      (options.bend ?? (Math.random() < 0.5 ? -1 : 1) * rand(0.04, 0.14)) *
      Math.min(distance, 600);
    let elapsed = 0;
    while (elapsed < duration) {
      elapsed += (yield) * this.tempo;
      const progress = Math.min(1, elapsed / duration);
      const eased =
        options.drag || progress < 0.15 ? easeInOut(progress) : easeOut(progress);
      const next = point();
      const dx = next.x - originX;
      const dy = next.y - originY;
      const length = Math.hypot(dx, dy) || 1;
      const offset = Math.sin(Math.PI * eased) * bend;
      cursor.x = originX + dx * eased + (-dy / length) * offset;
      cursor.y = originY + dy * eased + (dx / length) * offset;
      options.onStep?.();
    }
    const end = point();
    cursor.x = end.x;
    cursor.y = end.y;
    options.onStep?.();
  }

  private *drawBox(cursor: Cursor, task: Task): Gen {
    this.measure(task, true);
    const origin = { x: task.x, y: task.y };
    const end = { x: task.x + task.w, y: task.y + task.h };
    cursor.shape = "cross";
    yield* this.moveTo(cursor, origin);
    cursor.press = 1;
    task.showProxy = true;
    task.showSelection = true;
    task.draw = { ...origin, w: 0, h: 0 };
    try {
      yield* this.moveTo(cursor, end, {
        speed: 0.62,
        drag: true,
        bend: 0,
        onStep: () => {
          const width = cursor.x - origin.x;
          const height = cursor.y - origin.y;
          task.draw = {
            x: width < 0 ? cursor.x : origin.x,
            y: height < 0 ? cursor.y : origin.y,
            w: Math.abs(width),
            h: Math.abs(height),
          };
        },
      });
      task.draw = { x: origin.x, y: origin.y, w: task.w, h: task.h };
      cursor.shape = "arrow";
      yield* this.wait(rand(0.2, 0.34));
      task.el.dataset.built = "1";
      yield* this.wait(0.28);
      task.showProxy = false;
      yield* this.wait(0.42);
      task.showSelection = false;
      task.draw = null;
    } finally {
      task.showProxy = false;
      task.showSelection = false;
    }
  }

  private wantsSettle(task: Task, text: string, vertical: boolean) {
    if (task.kind !== "type" || !text) return false;
    const flag = (task.el.dataset.swarmSettle || "").toLowerCase();
    if (flag === "0" || flag === "off") return false;
    if (flag === "1" || flag === "on") return true;
    if (/^H[1-6]$/.test(task.el.tagName)) return true;
    return !vertical && text.length <= 64;
  }

  private draftOffset(task: Task) {
    const want = rand(46, 58);
    const viewRight = task.homeX - window.scrollX + (task.homeW || task.w);
    const room = this.viewWidth - 16 - viewRight;
    return {
      tx: Math.min(want, Math.max(24, room)),
      ty: rand(-4, 6),
    };
  }

  private applyShift(task: Task, tx: number, ty: number) {
    task.tx = tx;
    task.ty = ty;
    task.el.dataset.swarmShift = "1";
    task.el.style.transform = `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px)`;
    task.x = task.homeX + tx;
    task.y = task.homeY + ty;
  }

  private clearShift(task: Task) {
    if (task.el.dataset.swarmShift !== "1") return;
    delete task.el.dataset.swarmShift;
    task.el.style.transform = "";
    task.tx = 0;
    task.ty = 0;
    if (task.homeW) {
      task.x = task.homeX;
      task.y = task.homeY;
    }
  }

  private finishType(task: Task) {
    this.clearShift(task);
    task.el.dataset.built = "1";
    task.el.style.removeProperty("--swarm-p");
    task.el.style.clipPath = "";
    delete task.el.dataset.reveal;
  }

  private *placeBack(cursor: Cursor, task: Task): Gen {
    const fromX = task.tx;
    const fromY = task.ty;
    cursor.shape = "arrow";
    yield* this.moveTo(
      cursor,
      {
        x: task.x + Math.min(24, Math.max(8, task.w * 0.18)),
        y: task.y + task.h * 0.58,
      },
      { bend: 0.05, speed: 0.85 }
    );
    const duration = clamp(0.38 + Math.hypot(fromX, fromY) / 520, 0.42, 0.72);
    let elapsed = 0;
    let prev = 0;
    while (elapsed < duration) {
      elapsed += (yield) * this.tempo;
      const progress = easeInOut(Math.min(1, elapsed / duration));
      this.applyShift(task, fromX * (1 - progress), fromY * (1 - progress));
      cursor.x += (prev - progress) * fromX;
      cursor.y += (prev - progress) * fromY;
      cursor.press = 1;
      prev = progress;
    }
    this.clearShift(task);
    cursor.press = 0;
  }

  private *typeText(cursor: Cursor, task: Task): Gen {
    this.measure(task, true);
    const text = (task.el.innerText || "").replace(/\s+/g, " ").trim();
    const vertical = task.h > 42;
    task.el.dataset.reveal = vertical ? "y" : "x";
    if (!vertical) this.measure(task);
    this.prepareLines(task);
    task.homeX = task.x;
    task.homeY = task.y;
    task.homeW = task.w;
    task.homeH = task.h;
    const settle = this.wantsSettle(task, text, vertical);
    if (settle) {
      const draft = this.draftOffset(task);
      this.applyShift(task, draft.tx, draft.ty);
    }
    let placed = false;
    try {
      task.el.style.setProperty("--swarm-p", "0");
      cursor.shape = "arrow";
      yield* this.moveTo(cursor, {
        x: task.x + 2,
        y: task.y + Math.min(task.h - 4, this.lineHeight(task) * 0.75),
      });
      cursor.press = 1;
      cursor.shape = "ibeam";
      task.showSelection = true;
      if (!text) {
        this.finishType(task);
        placed = true;
        task.showSelection = false;
        cursor.shape = "arrow";
        return;
      }
      const count = text.length;
      for (let index = 1; index <= count; index += 1) {
        task.progress = index / count;
        this.applyTypeClip(task, vertical);
        this.placeCaret(cursor, task, vertical);
        let delay = count > 90 ? rand(0.004, 0.01) : rand(0.012, 0.032);
        if (text[index - 1] === " ") delay += rand(0, 0.018);
        if (Math.random() < 0.02) delay += rand(0.05, 0.14);
        yield* this.wait(delay);
      }
      task.el.style.setProperty("--swarm-p", "1");
      task.el.style.clipPath = "";
      cursor.shape = "arrow";
      task.caret = null;
      if (settle) {
        yield* this.wait(0.06);
        yield* this.placeBack(cursor, task);
      }
      task.showSelection = false;
      yield* this.wait(0.05);
      this.finishType(task);
      placed = true;
    } finally {
      if (!placed) this.clearShift(task);
    }
  }

  private lineHeight(task: Task) {
    return task.h / Math.max(1, task.lines);
  }

  private prepareLines(task: Task) {
    const style = getComputedStyle(task.el);
    const fontSize = parseFloat(style.fontSize) || 14;
    const parsed = parseFloat(style.lineHeight);
    const lineHeight = Number.isFinite(parsed) ? parsed : fontSize * 1.45;
    task.lines = Math.max(1, Math.round(task.h / lineHeight));
  }

  private typeMark(task: Task) {
    const lines = Math.max(1, task.lines);
    const pos = Math.min(lines, task.progress * lines);
    const line = Math.min(lines - 1, Math.floor(Math.min(pos, lines - 0.0001)));
    const across = Math.min(1, Math.max(0, pos - line));
    return { lines, line, across };
  }

  private applyTypeClip(task: Task, vertical: boolean) {
    if (!vertical) {
      task.el.style.clipPath = "";
      task.el.style.setProperty("--swarm-p", task.progress.toFixed(4));
      return;
    }
    const { lines, line, across } = this.typeMark(task);
    const top = (line / lines) * 100;
    const bottom = ((line + 1) / lines) * 100;
    const x = across * 100;
    task.el.style.clipPath = `polygon(0 0, 100% 0, 100% ${top}%, ${x}% ${top}%, ${x}% ${bottom}%, 0 ${bottom}%)`;
  }

  private placeCaret(cursor: Cursor, task: Task, vertical: boolean) {
    if (vertical) {
      const { line, across } = this.typeMark(task);
      const lineHeight = this.lineHeight(task);
      task.caret = {
        x: task.x + Math.min(task.w - 2, Math.max(0, task.w * across)),
        y: task.y + line * lineHeight + 1,
        h: Math.max(12, lineHeight - 3),
        color: cursor.color,
      };
    } else {
      task.caret = {
        x: task.x + task.w * task.progress,
        y: task.y + task.h * 0.16,
        h: Math.max(10, task.h * 0.68),
        color: cursor.color,
      };
    }
    cursor.x = task.caret.x + 8;
    cursor.y = task.caret.y + task.caret.h * 0.65;
  }

  private contentBand() {
    const placed = this.tasks.filter((task) => task.w > 8);
    if (placed.length === 0) {
      const mid = this.viewWidth / 2;
      return { left: mid - 280, right: mid + 280 };
    }
    const leftOf = (task: Task) => (task.homeW ? task.homeX : task.x);
    const widthOf = (task: Task) => (task.homeW ? task.homeW : task.w);
    return {
      left: Math.min(...placed.map(leftOf)),
      right: Math.max(...placed.map((task) => leftOf(task) + widthOf(task))),
    };
  }

  private *idle(cursor: Cursor): Gen {
    const band = this.contentBand();
    const x = rand(band.left + 24, Math.max(band.left + 48, band.right - 24));
    const yRatio = rand(0.18, 0.82);
    yield* this.moveTo(
      cursor,
      () => ({
        x,
        y: this.scrollY + yRatio * this.viewHeight,
      }),
      { speed: 0.5 }
    );
  }

  private *leave(cursor: Cursor): Gen {
    const band = this.contentBand();
    const toRight = cursor.x > (band.left + band.right) / 2;
    yield* this.moveTo(
      cursor,
      () => ({
        x: toRight ? band.right + 48 : band.left - 48,
        y: cursor.y,
      }),
      { speed: 0.85 }
    );
  }
}
