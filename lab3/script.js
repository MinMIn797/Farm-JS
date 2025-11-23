const gridSize = 10;
const grid = document.getElementById("grid");
const seedSelect = document.getElementById("seed");
let currentTool = null;

document.getElementById("shovel").onclick = () => currentTool = "shovel";
document.getElementById("bucket").onclick = () => currentTool = "bucket";
seedSelect.onchange = () => currentTool = seedSelect.value;

class Cell {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.type = "soil"; // "soil" or "water"
    this.moisture = 0;
    this.plant = null;

    this.element = document.createElement("div");
    this.element.className = "cell";
    this.element.onclick = () => this.interact();
    grid.appendChild(this.element);
    this.updateVisual();
  }

  interact() {
    if (currentTool === "shovel") {
      this.type = "soil";
      this.moisture = 0;
      this.plant = null;
      this.element.innerHTML = "";
    } else if (currentTool === "bucket") {
      this.type = "water";
      this.moisture = 10;
    } else if (["swamp", "potato", "cactus"].includes(currentTool)) {
      if (!this.plant && this.type === "soil") {
        this.plant = PlantFactory.create(currentTool, this);
        this.element.appendChild(this.plant.image);
      }
    }
    updateMoistureAll();
    this.updateVisual();
  }

  updateVisual() {
    if (this.type === "water") {
      this.element.style.backgroundColor = "#3399ff";
    } else {
      const colorValue = 255 - this.moisture * 20;
      this.element.style.backgroundColor = `rgb(${colorValue}, ${colorValue * 0.8}, 50)`;
    }
  }

  distanceTo(other) {
    return Math.abs(this.x - other.x) + Math.abs(this.y - other.y);
  }
}

class Plant {
  constructor(cell, name, minMoisture, maxMoisture, imgSrc) {
    this.cell = cell;
    this.name = name;
    this.minMoisture = minMoisture;
    this.maxMoisture = maxMoisture;
    this.growth = 0;

    this.image = document.createElement("img");
    this.image.src = imgSrc;
    this.update();
  }

  update() {
    const m = this.cell.moisture;
    if (m < this.minMoisture || m > this.maxMoisture) {
      this.image.style.opacity = 0.3;
    } else {
      this.growth++;
      this.image.style.opacity = 1;
    }
  }
}

class SwampPlant extends Plant {
  constructor(cell) {
    super(cell, "Болотник", 6, 10, "images/bolotnik.png");
  }
}

class PotatoPlant extends Plant {
  constructor(cell) {
    super(cell, "Картошка", 3, 7, "images/kartoshka.png");
  }
}

class CactusPlant extends Plant {
  constructor(cell) {
    super(cell, "Кактус", 0, 3, "images/kaktus.png");
  }
}

const PlantFactory = {
  create(type, cell) {
    switch (type) {
      case "swamp": return new SwampPlant(cell);
      case "potato": return new PotatoPlant(cell);
      case "cactus": return new CactusPlant(cell);
    }
  }
};

const cells = [];

function updateMoistureAll() {
  for (let cell of cells) {
    if (cell.type === "soil") {
      let moisture = 0;
      for (let other of cells) {
        if (other.type === "water") {
          const dist = cell.distanceTo(other);
          if (dist <= 3) moisture += 3 - dist;
        }
      }
      cell.moisture = Math.min(10, moisture);
      cell.updateVisual();
      if (cell.plant) cell.plant.update();
    }
  }
}

for (let y = 0; y < gridSize; y++) {
  for (let x = 0; x < gridSize; x++) {
    cells.push(new Cell(x, y));
  }
}