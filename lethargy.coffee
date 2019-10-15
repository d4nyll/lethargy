umd = (root, factory, exportsName) ->
	if typeof define is 'function' and define.amd
		define([], () ->
    root[exportsName] = factory
  )
	else if typeof module is 'object' && module.exports
		module.exports = factory
	else
		root[exportsName]= factory

class Lethargy
  constructor: (stability, sensitivity, tolerance) ->
    @stability = if stability? then Math.abs stability else 8
    @sensitivity = if sensitivity? then 1 + Math.abs sensitivity else 100
    @tolerance = if tolerance? then 1 + Math.abs tolerance else 1.1
    @lastUpDeltas = (null for [1..(@stability * 2)])
    @lastDownDeltas = (null for [1..(@stability * 2)])
    @deltasTimestamp = (null for [1..(@stability * 2)])

  check: (e) ->
    lastDelta
    if e.originalEvent.wheelDelta?
      lastDelta = e.originalEvent.wheelDelta
    else if e.originalEvent.deltaY?
      lastDelta = e.originalEvent.deltaY * -40
    else if (e.originalEvent.detail? or e.originalEvent.detail == 0)
      lastDelta = e.originalEvent.detail * -40

    @deltasTimestamp.push(Date.now())
    @deltasTimestamp.shift()

    if (lastDelta > 0)
      @lastUpDeltas.push(lastDelta)
      @lastUpDeltas.shift()
      return @isInertia(1)
    else
      @lastDownDeltas.push(lastDelta)
      @lastDownDeltas.shift()
      return @isInertia(-1)
    false;

  isInertia: (direction) ->
    lastDeltas = if direction == -1 then @lastDownDeltas else @lastUpDeltas
    if lastDeltas[0] == null
      return direction
    if @deltasTimestamp[(this.stability * 2) - 2] + 150 > Date.now() and lastDeltas[0] == lastDeltas[(@stability * 2) - 1]
      return false
    lastDeltasOld = lastDeltas.slice(0, @stability)
    lastDeltasNew = lastDeltas.slice(@stability, (@stability * 2))

    oldSum = lastDeltasOld.reduce (t, s) -> t + s
    newSum = lastDeltasNew.reduce (t, s) -> t + s

    oldAverage = oldSum / lastDeltasOld.length
    newAverage = newSum / lastDeltasNew.length

    if Math.abs(oldAverage) < Math.abs(newAverage * @tolerance) && (@sensitivity < Math.abs(newAverage))
      direction
    else
      false

  showLastUpDeltas: ->
    return @lastUpDeltas

  showLastDownDeltas: ->
    return @lastDownDeltas

umd window || this, Lethargy, 'Lethargy'
