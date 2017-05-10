function range(left, right) {
  let range = [];
  const ascending = left < right;
  const end = ascending ? right + 1 : right - 1;
  for (let i = left; ascending ? i < end : i > end; ascending ? i += 1 : i -= 1) {
    range.push(i);
  }
  return range;
}

class Lethargy {
  constructor(stability, sensitivity, tolerance, delay) {
    // Stability is how many records to use to calculate the average
    this.stability = (stability != null) ? Math.abs(stability) : 8;

    // The wheelDelta threshold. If an event has a wheelDelta below this value, it will not register
    this.sensitivity = (sensitivity != null) ? 1 + Math.abs(sensitivity) : 100;

    // How much the old rolling average have to differ
    // from the new rolling average for it to be deemed significant
    this.tolerance = (tolerance != null) ? 1 + Math.abs(tolerance) : 1.1;

    // Threshold for the amount of time between mousewheel events for them to be deemed separate
    this.delay = (delay != null) ? delay : 150;

    // Used internally and should not be manipulated
    this.lastUpDeltas = (range(1, (this.stability * 2)).map(() => null));
    this.lastDownDeltas = (range(1, (this.stability * 2)).map(() => null));
    this.deltasTimestamp = (range(1, (this.stability * 2)).map(() => null));
  }

  // Checks whether the mousewheel event is an intent
  check(event) {
    // Use jQuery's e.originalEvent if available
    let lastDelta;
    const e = event.originalEvent || event;

    // Standardise wheelDelta values for different browsers
    if (e.wheelDelta != null) {
      lastDelta = e.wheelDelta;
    } else if (e.deltaY != null) {
      lastDelta = e.deltaY * -40;
    } else if ((e.detail != null) || (e.detail === 0)) {
      lastDelta = e.detail * -40;
    }

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
    return false;
  }

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
