// Initial Setup
const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Variables
const mouse = {
  x: innerWidth / 2,
  y: innerHeight / 2
};

const colors = ['#2185C5', '#7ECEFD', '#FFF6E5', '#FF7F66'];

// Event Listeners
addEventListener('mousemove', event => {
  mouse.x = event.clientX;
  mouse.y = event.clientY;
});

addEventListener('resize', () => {
  canvas.width = innerWidth;
  canvas.height = innerHeight;

  init();
});

// Utility Functions
function randomIntFromRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomColor(colors) {
  return colors[Math.floor(Math.random() * colors.length)];
}

function distance(x1, y1, x2, y2) {
  const xDist = x2 - x1;
  const yDist = y2 - y1;

  return Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));
}

function rotate(velocity, angle) {
  const rotatedVelocity = {
    x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
    y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle)
  };
  return rotatedVelocity;
}

function resolveCollision(particle, otherParticle) {
  const xVelocityDiff = particle.velocity.x - otherParticle.velocity.x;
  const yVelocityDiff = particle.velocity.y - otherParticle.velocity.y;

  const xDist = otherParticle.x - particle.x;
  const yDist = otherParticle.y - particle.y;

  if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {
    const angle = -Math.atan2(
      otherParticle.y - particle.y,
      otherParticle.x - particle.x
    );
    const m1 = particle.mass;
    const m2 = otherParticle.mass;

    const u1 = rotate(particle.velocity, angle);
    const u2 = rotate(otherParticle.velocity, angle);

    const v1 = {
      x: u1.x * (m1 - m2) / (m1 + m2) + u2.x * 2 * m2 / (m1 + m2),
      y: u1.y
    };
    const v2 = {
      x: u2.x * (m2 - m1) / (m1 + m2) + u1.x * 2 * m2 / (m1 + m2),
      y: u2.y
    };

    const vFinal1 = rotate(v1, -angle);
    const vFinal2 = rotate(v2, -angle);

    particle.velocity.x = vFinal1.x;
    particle.velocity.y = vFinal1.y;

    otherParticle.velocity.x = vFinal2.x;
    otherParticle.velocity.y = vFinal2.y;
  }
}

// Objects
function Particle(x, y, radius, color) {
  this.x = x;
  this.y = y;
  this.mass = 1;
  this.colorOpacity = 0;
  this.velocity = {
    x: randomIntFromRange(-1, 1),
    y: randomIntFromRange(-1, 1)
  };
  this.radius = radius;
  this.color = color;
}

Particle.prototype.update = function(particles) {
  this.draw();

  particles.forEach(particle => {
    if (particle === this) return;
    if (
      distance(this.x, this.y, particle.x, particle.y) -
        this.radius -
        particle.radius <
      0
    ) {
      resolveCollision(this, particle);
    }
  });

  // mouse collision
  if (distance(this.x, this.y, mouse.x, mouse.y) - this.radius < 0) {
    if (this.colorOpacity !== 1) {
      this.colorOpacity += 0.5;
    }
    c.fillStyle = this.color.replace(',1)', ',' + this.colorOpacity + ')');
    c.fill();
  } else {
    if (this.colorOpacity !== 0) {
      this.colorOpacity -= 0.5;
    }
    c.fillStyle = this.color.replace(',1)', ',' + this.colorOpacity + ')');
    c.fill();
  }

  this.x += this.velocity.x;
  this.y += this.velocity.y;

  if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
    this.velocity.x *= -1;
  }
  if (this.y + this.radius > canvas.height || this.y - this.radius < 0) {
    this.velocity.y *= -1;
  }
};

Particle.prototype.draw = function() {
  c.beginPath();
  c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
  c.strokeStyle = this.color;
  c.stroke();
  c.closePath();
};

// Implementation
let particles;
function init() {
  particles = [];

  for (let i = 0; i < 100; i++) {
    const radius = randomIntFromRange(20, 50);
    const color = `rgba(${~~(Math.random() * 256)},${~~(
      Math.random() * 256
    )},${~~(Math.random() * 256)},1)`;
    let x = randomIntFromRange(radius, canvas.width - radius);
    let y = randomIntFromRange(radius, canvas.height - radius);

    if (i > 0) {
      for (let j = 0; j < particles.length; j++) {
        if (
          distance(x, y, particles[j].x, particles[j].y) -
            radius -
            particles[j].radius <
          0
        ) {
          x = randomIntFromRange(radius, canvas.width - radius);
          y = randomIntFromRange(radius, canvas.height - radius);
          j = -1;
        }
      }
    }

    particles.push(new Particle(x, y, radius, color));
  }
}

// Animation Loop
function animate() {
  requestAnimationFrame(animate);
  c.clearRect(0, 0, canvas.width, canvas.height);

  // c.fillText('HTML CANVAS BOILERPLATE', mouse.x, mouse.y)
  particles.forEach((particle, index, particles) => {
    particle.update(particles);
  });
}

init();
animate();
