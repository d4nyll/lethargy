class Lethargy {
  constructor(stability, sensitivity, tolerance, delay) {

    const DEFAULT_STABILITY = 8;
    const DEFAULT_SENSITIVITY = 100;
    const DEFAULT_TOLERANCE = 1.1;
    const DEFAULT_DELAY = 150;

    // Stability is how many records to use to calculate the average
    this.stability = stability !== null ? Math.abs(stability) : DEFAULT_STABILITY;

    // The wheelDelta threshold. If an event has a wheelDelta below this value, it will not register
    this.sensitivity = sensitivity !== null ? 1 + Math.abs(sensitivity) : DEFAULT_SENSITIVITY;

    // How much the old rolling average have to differ
    // from the new rolling average for it to be deemed significant
    this.tolerance = tolerance !== null ? 1 + Math.abs(tolerance) : DEFAULT_TOLERANCE;

    // Threshold for the amount of time between mousewheel events for them to be deemed separate
    this.delay = delay !== null ? delay : DEFAULT_DELAY;

    // Used internally and should not be manipulated
    this.lastUpDeltas = new Array(this.stability * 2).fill(null);
    this.lastDownDeltas = new Array(this.stability * 2).fill(null);
    this.deltasTimestamp = new Array(this.stability * 2).fill(null);
  }

  static extractWheelDelta(event) {
    // Standardise wheelDelta values for different browsers
    if (event.wheelDelta !== null) {
      return event.wheelDelta;
    } else if (event.deltaY !== null) {
      return event.deltaY * -40;
    } else if ((event.detail !== null) || (event.detail === 0)) {
      return event.detail * -40;
    }
  }

  // Checks whether the mousewheel event is an intent
  // TODO: Change the method name to handleEvent
  check(event) {
    // Use jQuery's e.originalEvent if available
    const lastDelta = extractWheelDelta(event.originalEvent || event);

    // Add the new event timestamp to deltasTimestamp array, and remove the oldest entry
    this.deltasTimestamp.push(Date.now());
    this.deltasTimestamp.shift();

    // If lastDelta is positive, it means the user scrolled up
    if (lastDelta > 0) {
      this.lastUpDeltas.push(lastDelta);
      this.lastUpDeltas.shift();
      return this.isInertia(1);
    // Otherwise, the user scrolled down
    } else {
      this.lastDownDeltas.push(lastDelta);
      this.lastDownDeltas.shift();
      return this.isInertia(-1);
    }
  }

  // Checks if the event is an inertial scroll event, if not, return 1 or -1 depending on the direction
  // TODO: Change the name of the method, as it currently implies a boolean return value
  isInertia(direction) {
    // Get the relevant last*Delta array
    const lastDeltas = direction === -1 ? this.lastDownDeltas : this.lastUpDeltas;

    // If the array is not filled up yet, we cannot compare averages
    // so assume the scroll event to be intentional
    if (lastDeltas[0] === null) {
      return direction;
    }

    // If the last mousewheel occurred within the specified delay of the penultimate one,
    // and their values are the same. We will assume that this is a trackpad
    // with a constant profile and will return false
    if (((this.deltasTimestamp[(this.stability * 2) - 2] + this.delay) > Date.now())
        && (lastDeltas[0] === lastDeltas[(this.stability * 2) - 1])) {
      return false;
    }

    // Check to see if the new rolling average (based on the last half of the lastDeltas array)
    // is significantly higher than the old rolling average. If so return direction, else false
    const lastDeltasOld = lastDeltas.slice(0, this.stability);
    const lastDeltasNew = lastDeltas.slice(this.stability, (this.stability * 2));

    const oldSum = lastDeltasOld.reduce((t, s) => t + s);
    const newSum = lastDeltasNew.reduce((t, s) => t + s);

    const oldAverage = oldSum / lastDeltasOld.length;
    const newAverage = newSum / lastDeltasNew.length;

    if ((Math.abs(oldAverage) < Math.abs(newAverage * this.tolerance))
        && (this.sensitivity < Math.abs(newAverage))) {
      return direction;
    } else {
      return false;
    }
  }

  showLastUpDeltas() {
    return this.lastUpDeltas;
  }

  showLastDownDeltas() {
    return this.lastDownDeltas;
  }
}
