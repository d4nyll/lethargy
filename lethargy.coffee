root = exports ? this

class root.Lethargy
  constructor: (range, tolerance) ->
    # console.log range
    @range = if range? then Math.abs range else 5
    @tolerance = if tolerance? then 1 + Math.abs tolerance else 1.1
    @lastUpDeltas = (null for [1..(@range * 2)])
    @lastDownDeltas = (null for [1..(@range * 2)])

  check: (e) ->
    lastDelta = e.originalEvent.wheelDelta
    # console.log "lastDelta: " + lastDelta
    if (lastDelta > 0)
      # scrollUp
      @lastUpDeltas.push(lastDelta)
      @lastUpDeltas.shift()
      return @isInertia(1)
    else
      # scrollDown
      @lastDownDeltas.push(lastDelta)
      @lastDownDeltas.shift()
      return @isInertia(-1)
    false;

  isInertia: (direction) ->
    lastDeltas = if direction == -1 then @lastDownDeltas else @lastUpDeltas
    if Math.abs(lastDeltas[lastDeltas.length - 1]) == 120 || lastDeltas[0] == null
      return false
    lastDeltasOld = lastDeltas.slice(0, @range)
    lastDeltasNew = lastDeltas.slice(@range, (@range * 2))

    oldSum = lastDeltasOld.reduce (t, s) -> t + s
    newSum = lastDeltasNew.reduce (t, s) -> t + s

    oldAverage = oldSum / lastDeltasOld.length
    newAverage = newSum / lastDeltasNew.length
    # console.log "oldAverage: " + oldAverage
    # console.log "newAverage: " + newAverage

    if Math.abs(oldAverage) < Math.abs(newAverage * @tolerance) && (100 < Math.abs(newAverage))
      # console.log newAverage
      false
    else
      true

  showLastUpDeltas: ->
    console.log @lastUpDeltas

  showLastDownDeltas: ->
    console.log @lastDownDeltas
    