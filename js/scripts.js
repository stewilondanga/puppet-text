var navigate = (function() {
  $('.dd').toggle();
  $('.dd_btn').click(function() {
    var dataName = $(this).attr('data-name');
    $('.dd').hide();
    $('.' + dataName).toggle();
  });
})();

"use strict"; {
  const txt = 'EXPANDED';
  let viscosity = 0.005;
  let stiffness = 0.99;
  class Point {
    constructor(i, x, y) {
      this.c = null;
      this.x0 = x;
      this.y0 = y;
      this.x = x + Math.sin(i) * 100;
      this.y = y + Math.cos(i) * 100;
      this.vx = 0.0;
      this.vy = 0.0;
      this.a = 0.0;
      this.s = 0.0;
      this.p0 = this;
      this.p1 = this;
      this.t = 0;
    }
    texture(c, color) {
      this.c = document.createElement("canvas");
      const ctx = this.c.getContext("2d");
      this.c.width = this.c.height = 400;
      ctx.font = "500px Arial Black, Arial";
      ctx.fillStyle = color;
      ctx.textAlign = "center";
      ctx.fillText(c, 200, 385);
    }
    drawSegment() {
      ctx.beginPath();
      ctx.strokeStyle = "#666";
      ctx.moveTo(this.p0.x, this.p0.y);
      ctx.lineTo(this.x, this.y);
      ctx.lineTo(this.p1.x, this.p1.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(this.x, this.y, 3, 0, 2 * Math.PI);
      ctx.stroke();
    }
    draw() {
      const fx = (this.x0 - this.x) * viscosity;
      const fy = (this.y0 - this.y) * viscosity;
      this.vx *= stiffness;
      this.vy *= stiffness;
      this.vx += fx;
      this.vy += fy;
      this.x += this.vx;
      this.y += this.vy;
      if (this.c !== null) {
        ctx.beginPath();
        ctx.save();
        ctx.translate(this.x, this.y);
        const dy = this.p1.x - this.p0.x;
        const dx = this.p1.y - this.p0.y;
        this.a = Math.atan2(dx, dy);
        this.s = Math.sqrt(dy * dy + dx * dx) / 2;
        ctx.rotate(this.a);
        ctx.drawImage(this.c, -this.s * 0.5, -this.s * 0.5, this.s, this.s);
        ctx.restore();
      }
    }
  }
  const points = [];
  const canvas = {
    init() {
      this.elem = document.querySelector("canvas");
      this.resize();
      window.addEventListener("resize", () => this.resize(), false);
      return this.elem.getContext("2d");
    },
    resize() {
      this.width = this.elem.width = this.elem.offsetWidth;
      this.height = this.elem.height = this.elem.offsetHeight;
      let x = 0;
      const sx = this.width / (txt.length + 1);
      for (const p of points) {
        p.x0 = x;
        p.y0 = canvas.height / 2;
        x += sx;
      }
    }
  };
  const ctx = canvas.init();
  ctx.imageSmoothingEnabled = true;
  const pointer = {
    x: 0,
    y: 0,
    dx: 0,
    dy: 0,
    drag: null,
    over: null,
    down(e, touch) {
      this.move(e, touch);
      if (this.over) {
        this.dx = this.x - this.over.x;
        this.dy = this.y - this.over.y;
        this.drag = this.over;
        canvas.elem.style.cursor = "move";
      }
    },
    up(e, touch) {
      this.drag = null;
      canvas.elem.style.cursor = "default";
    },
    move(e, touch) {
      const pointer = touch ? e.targetTouches[0] : e;
      this.x = pointer.clientX;
      this.y = pointer.clientY;
      this.over = null;
      if (this.drag === null) {
        for (const p of points) {
          const dx = this.x - p.x;
          const dy = this.y - p.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < p.s * 0.5) {
            canvas.elem.style.cursor = "pointer";
            this.over = p;
            break;
          } else {
            canvas.elem.style.cursor = "default";
          }
        }
      }
    },
    init() {
      window.addEventListener("mousedown", e => this.down(e, false), false);
      window.addEventListener("touchstart", e => this.down(e, true), false);
      window.addEventListener("mousemove", e => this.move(e, false), false);
      canvas.elem.addEventListener("touchmove", e => this.move(e, true), false);
      window.addEventListener("mouseup", e => this.up(e, false), false);
      window.addEventListener("touchend", e => this.up(e, true), false);
    }
  }; {
    let x = 0;
    const sx = canvas.width / (txt.length + 1);
    for (let i = 0; i < txt.length + 2; i++) {
      points.push(new Point(i, x, canvas.height / 2));
      x += sx;
    }
    for (let i = 1; i < txt.length + 1; i++) {
      const p = points[i];
      p.p0 = points[i - 1];
      p.p1 = points[i + 1];
      p.s = sx;
      p.texture(txt.charAt(i - 1), i === 5 ? "#f80" : "#fff");
    }
    // spring button
    const radios = document.spring.radios;
    for (const radio of radios) {
      radio.addEventListener('change', e => {
        if (e.currentTarget.value === "on") {
          viscosity = 0.005;
          stiffness = 0.99;
        } else {
          viscosity = 0.0;
          stiffness = 0.0;
        }
      }, false);
    }
  }
  const run = () => {
    requestAnimationFrame(run);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of points) {
      if (pointer.drag === p) {
        p.x = pointer.x - pointer.dx;
        p.y = pointer.y - pointer.dy;
      }
      p.draw();
    }
    for (const p of points) {
      p.drawSegment();
    }
  }
  pointer.init();
  run();
}
