root = exports ? this

class root.Lethargy
  constructor: (range, tolerance) ->
    # console.log range
    @range = if range? then Math.abs range else 5
    @tolerance = if tolerance? then 1 + Math.abs tolerance else 1.1
    @lastUpDeltas = (0 for [1..(@range * 2)])
    @lastDownDeltas = (0 for [1..(@range * 2)])

  check: (e) ->
    lastDelta = e.originalEvent.wheelDelta
    # console.log "lastDelta: " + lastDelta
    if (lastDelta > 0)
      # scrollUp
      @lastUpDeltas.push(lastDelta)
      @lastUpDeltas.shift()
      temp = @isInertia(1)
      # console.log "inertia: " + temp
      return @isInertia(1)
    else
      # scrollDown
      @lastDownDeltas.push(lastDelta)
      @lastDownDeltas.shift()
      temp = @isInertia(-1)
      # console.log "inertia: " + temp
      return @isInertia(-1)
    false;

  isInertia: (direction) ->
    lastDeltas = if direction == -1 then @lastDownDeltas else @lastUpDeltas
    lastDeltasOld = lastDeltas.slice(0, @range)
    lastDeltasNew = lastDeltas.slice(@range, (@range * 2))

    oldSum = lastDeltasOld.reduce (t, s) -> t + s
    newSum = lastDeltasNew.reduce (t, s) -> t + s

    oldAverage = oldSum / lastDeltasOld.length
    newAverage = newSum / lastDeltasNew.length
    # console.log "oldAverage: " + oldAverage
    # console.log "newAverage: " + newAverage

    if (oldAverage * direction) < (newAverage * direction * @tolerance) && (Math.abs(oldAverage) > 100)
      # console.log newAverage
      false
    else
      true

  showLastUpDeltas: ->
    console.log @lastUpDeltas

  showLastDownDeltas: ->
    console.log @lastDownDeltas
    