class Matrix extends Array {
  constructor(height, width) {
    super();
    if (height) {
      for (let y = 0; y < height; y++) {
        this[y] = [];
        if (width) {
          for (let x = 0; x < width; x++) {
            this[y][x] = 0;
          }
        }
      }
    }
  }
}

export class FireMatrix {
  /**
   *
   * @param {number} height
   * @param {number} width
   * @param {number} force
   */
  constructor(height, width, force) {
    /**
     * @type {number}
     */
    this._width = width;
    /**
     * @type {number}
     */
    this._height = height;
    /**
     * @type {number}
     */
    this._force = force;
    /**
     * @type {Matrix}
     */
    this._matrix = new Matrix(height, width);
    /**
     * @type {number}
     */
    this._frequency = width / 2;
    /**
     * @type {number}
     */
    this._wind = 0;
    /**
     * @type {number}
     */
    this._loss = 2;
  }

  get wind() {
    return this._wind;
  }

  /**
   * @param {number} newWind
   */
  set wind(newWind) {
    this._wind = newWind;
  }

  get loss() {
    return this._loss;
  }

  /**
   * @param {number} newLoss
   */
  set loss(newLoss) {
    if (newLoss < 2) {
      throw Error("loss must not be less than 2");
    }
    this._loss = newLoss;
  }

  /**
   * @param {number} newFrequency
   */
  set frequency(newFrequency) {
    if (newFrequency < 0) {
      throw Error("frequency must not be less than 0");
    }
    this._frequency = newFrequency;
    this.normalizeForce();
  }

  get frequency() {
    return this._frequency;
  }

  /**
   * @param {number} force
   */
  set force(newForce) {
    if (newForce < 0) {
      throw Error("force must not be less than 0");
    }
    this._force = newForce;
    this.normalizeForce();
  }

  get force() {
    return this._force;
  }

  get width() {
    return this._width;
  }

  get height() {
    return this._height;
  }

  normalizeForce() {
    let limiter = this._frequency;
    if (this._frequency >= this._width) {
      limiter = -1;
    }
    this._matrix[this._height - 1] = this._matrix[this._height - 1].map(() => {
      if (limiter < this._frequency) {
        limiter += 1;
        return 0;
      } else {
        limiter = 0;
        return this._force;
      }
    });
  }

  setForceIn(y, x) {
    const randomValue = this._force - Math.floor(Math.random() * this._loss);
    this._matrix[y][x] = randomValue;
  }

  setSize(height, width) {
    const tempMatrix = new Matrix(height, width);
    this._matrix = tempMatrix.map((line, indexLine) => {
      if (this._height > indexLine) {
        return line.map((item, indexColumn) => {
          if (this._width > indexColumn) {
            return this._matrix[indexLine][indexColumn];
          }
          return item;
        });
      }
      return line;
    });
    this._height = height;
    this._width = width;
    this.normalizeForce();
  }

  calc() {
    this._matrix.forEach((line, y) => {
      line.forEach((_, x) => {
        if (y + 1 < this._height) {
          const newValue = this._matrix[y + 1][x];
          const randomValue = newValue - Math.floor(Math.random() * this._loss);
          let windResult = x + this._wind;
          let heightResult = y;
          if (windResult >= this._width) {
            windResult = this._width - windResult;
          } else if (windResult < 0) {
            windResult = this._width + windResult;
          }
          if (heightResult <= this._height) {
            this._matrix[heightResult][windResult] =
              randomValue >= 0 ? randomValue : 0;
          }
        }
      });
    });
  }
}
