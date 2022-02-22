import { FireMatrix } from "./Matrix.js";

/**
 * @type {FireMatrix}
 */
let matrix,
  /**
   * @type {number}
   */
  height,
  /**
   * @type {number}
   */
  newHeight,
  /**
   * @type {number}
   */
  width,
  /**
   * @type {number}
   */
  newWidth,
  /**
   * @type {number}
   */
  force,
  /**
   * @type {number}
   */
  newForce,
  /**
   * @type {number}
   */
  frequency,
  /**
   * @type {number}
   */
  newFrequency,
  /**
   * @type {number}
   */
  wind,
  /**
   * @type {number}
   */
  loss,
  /**
   * @type {MouseLocation | null}
   */
  mouseLocation;

const fireColorsPalette = [
  { r: 7, g: 7, b: 7 },
  { r: 31, g: 7, b: 7 },
  { r: 47, g: 15, b: 7 },
  { r: 71, g: 15, b: 7 },
  { r: 87, g: 23, b: 7 },
  { r: 103, g: 31, b: 7 },
  { r: 119, g: 31, b: 7 },
  { r: 143, g: 39, b: 7 },
  { r: 159, g: 47, b: 7 },
  { r: 175, g: 63, b: 7 },
  { r: 191, g: 71, b: 7 },
  { r: 199, g: 71, b: 7 },
  { r: 223, g: 79, b: 7 },
  { r: 223, g: 87, b: 7 },
  { r: 223, g: 87, b: 7 },
  { r: 215, g: 95, b: 7 },
  { r: 215, g: 95, b: 7 },
  { r: 215, g: 103, b: 15 },
  { r: 207, g: 111, b: 15 },
  { r: 207, g: 119, b: 15 },
  { r: 207, g: 127, b: 15 },
  { r: 207, g: 135, b: 23 },
  { r: 199, g: 135, b: 23 },
  { r: 199, g: 143, b: 23 },
  { r: 199, g: 151, b: 31 },
  { r: 191, g: 159, b: 31 },
  { r: 191, g: 159, b: 31 },
  { r: 191, g: 167, b: 39 },
  { r: 191, g: 167, b: 39 },
  { r: 191, g: 175, b: 47 },
  { r: 183, g: 175, b: 47 },
  { r: 183, g: 183, b: 47 },
  { r: 183, g: 183, b: 55 },
  { r: 207, g: 207, b: 111 },
  { r: 223, g: 223, b: 159 },
  { r: 239, g: 239, b: 199 },
  { r: 255, g: 255, b: 255 },
];

/**
 * @type {HTMLCanvasElement}
 */
const canvas = document.querySelector("canvas#fireDOOM");
const ctx = canvas.getContext("2d");
/**
 * formulario de atualização de dados
 * @type {HTMLFormElement}
 */
const form = document.querySelector("form");

window.onload = () => {
  initInputs();
  initCanvas();
  initMatrix();
  initInterval();
};

form.onchange = (e) => {
  e.preventDefault();
  setVarByInput(e.target);
};

canvas.onmousemove = (e) => {
  if (e.buttons) {
    handleSetMouseLocation(e);
  } else {
    handleUnsetMouseLocation();
  }
};

canvas.onmouseout = () => {
  matrix.normalizeForce();
  handleUnsetMouseLocation();
};

canvas.onmousedown = handleSetMouseLocation;

canvas.onmouseup = () => {
  matrix.normalizeForce();
  handleUnsetMouseLocation();
};

const fields = {
  /**
   * @param {HTMLInputElement} input
   */
  force(input) {
    const value = parseInt(input.value);
    force = value;
    setSliderAndValue(input, {
      numberValue: value,
      sliderValue: value,
    });
  },
  /**
   * @param {HTMLInputElement} input
   */
  scale(input) {
    const value = parseInt(input.value);
    height = value;
    width = value;
    setSliderAndValue(input, {
      numberValue: value,
      sliderValue: value,
    });
  },
  /**
   * @param {HTMLInputElement} input
   */
  frequency(input) {
    const value = parseInt(input.value);
    let type = "slider";
    const newValues = calcSliderValueAndValue(value, 100 / width, type);
    frequency = -newValues.numberValue + width;
    if (newValues.numberValue !== value) {
      newValues.numberValue = value;
    }
    setSliderAndValue(input, newValues);
  },
  /**
   * @param {HTMLInputElement} input
   */
  wind(input) {
    const value = parseInt(input.value);
    wind = value;
    setSliderAndValue(input, {
      numberValue: value,
      sliderValue: value,
    });
  },
  /**
   * @param {HTMLInputElement} input
   */
  loss(input) {
    const value = parseInt(input.value);
    loss = value;
    setSliderAndValue(input, {
      numberValue: value,
      sliderValue: value,
    });
  },
};

function initInterval() {
  setInterval(() => {
    if (width !== matrix.width || height !== matrix.height) {
      matrix.setSize(height, width);
      setCanvas(width, height);
    }
    if (force !== matrix.force) {
      matrix.force = force;
    }
    if (frequency !== matrix.frequency) {
      matrix.frequency = frequency;
    }
    if (wind !== matrix.wind) {
      matrix.wind = wind;
    }
    if (loss !== matrix.loss) {
      matrix.loss = loss;
    }
    matrix.calc();
    if (mouseLocation) {
      matrix.normalizeForce();
      setMouseLocationInMatrix(mouseLocation, matrix);
    }
    renderMatrix(matrix._matrix);
  }, 45.4545);
}

/**
 * @param {number} x
 * @param {number} y
 */
function MouseLocation(x, y) {
  this.X = x;
  this.Y = y;
}

/**
 * função que define o mouseLocation
 * @param {MouseEvent} e
 */
function handleSetMouseLocation(e) {
  const scale = height / 100 / 3;
  mouseLocation = new MouseLocation(
    parseInt(e.offsetX * scale),
    parseInt(e.offsetY * scale)
  );
}

function handleUnsetMouseLocation() {
  mouseLocation = null;
}

/**
 * calcula o resultado do valor que equivale ao slider e vice-versa
 * @param {number} value
 * @param {numbe} calcValue
 * @param {"slider"|"value"} type
 * @returns {{sliderValue: number, numberValue: number}}
 */
function calcSliderValueAndValue(value, calcValue, type) {
  let sliderValue, numberValue;
  if (type === "slider") {
    sliderValue = value;
    numberValue = parseInt(value / calcValue);
  } else if (type === "value") {
    sliderValue = parseInt(value * calcValue);
    numberValue = value;
  }
  return { numberValue, sliderValue };
}

/**
 * define os valores do slider e input numerico do campo especificado
 * @param {HTMLInputElement} input
 * @param {{numberValue: number, sliderValue: number}} newValues
 */
function setSliderAndValue(input, { sliderValue, numberValue }) {
  const form = input.form;
  /**
   * @type {HTMLInputElement}
   */
  const sliderInput = form.querySelector(`input#${input.name}Slider`);
  sliderInput.value = sliderValue;
  /**
   * @type {HTMLInputElement}
   */
  const numberInput = form.querySelector(`input#${input.name}Value`);
  numberInput.value = numberValue;
}

/**
 * retorna a matrix com a força calculada diante da localização do mouse
 * @param {MouseLocation} mouseLocation
 * @param {FireMatrix} matrix
 */
function setMouseLocationInMatrix(mouseLocation, matrix) {
  matrix.setForceIn(mouseLocation.Y, mouseLocation.X);
  if (mouseLocation.Y > 0) {
    matrix.setForceIn(mouseLocation.Y - 1, mouseLocation.X);
  }
  if (mouseLocation.Y < matrix.height - 1) {
    matrix.setForceIn(mouseLocation.Y + 1, mouseLocation.X);
  }
  if (mouseLocation.X > 0) {
    matrix.setForceIn(mouseLocation.Y, mouseLocation.X - 1);
  }
  if (mouseLocation.X < matrix.width) {
    matrix.setForceIn(mouseLocation.Y, mouseLocation.X + 1);
  }
  return matrix;
}

function initMatrix() {
  matrix = new FireMatrix(height, width, force);
}

function initCanvas() {
  setCanvas(width, height);
}

function initInputs() {
  const inputs = form.querySelectorAll("input");
  const length = inputs.length;
  for (let i = 0; i < length; i++) {
    const input = inputs[i];
    setVarByInput(input);
  }
}

/**
 * defini o tamanho do canvas
 * @param {number} width
 * @param {number} height
 */
function setCanvas(width, height) {
  canvas.width = width;
  canvas.height = height;
}

/**
 * @param {HTMLInputElement} input
 */
function setVarByInput(input) {
  const field = input.name;
  if (field in fields) {
    fields[field](input, form);
  }
}

/**
 * renderiza os valores da matrix no canvas
 * @param {Array<Array<number>>} matrix
 */
function renderMatrix(matrix) {
  ctx.clearRect(0, 0, 100, 100);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const item = matrix[y][x];
      if (item) {
        const rgb = fireColorsPalette[item];
        ctx.fillStyle = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }
}
