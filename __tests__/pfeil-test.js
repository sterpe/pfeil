const FILE = '../dist/pfeil.min.js'

jest.dontMock(FILE)

describe([
  '#when()'
].join(' '), function () {
  it('should aggregate an array of fulfilled promises', function () {
    const pfeil = require(FILE)

    let flag = false
    let args

    runs(function () {
      const d1 = pfeil.defer()
      const p1 = d1.promise
      const d2 = pfeil.defer()
      const p2 = d2.promise
      const d3 = pfeil.defer()
      const p3 = d3.promise

      d1.resolve(1)
      d2.resolve(2)
      d3.resolve(3)
      pfeil.when([p1, p2, p3]).then(function () {
        args = Array.prototype.slice.call(arguments)
        flag = true
      })
    })
    waitsFor(function () {
      return flag
    })

    runs(function () {
      expect(args).toEqual([[1, 2, 3]])
    })
  })
  it('should aggregate an array of rejected promises', function () {
    const pfeil = require(FILE)

    let flag = false
    let args

    runs(function () {
      const d1 = pfeil.defer()
      const p1 = d1.promise
      const d2 = pfeil.defer()
      const p2 = d2.promise
      const d3 = pfeil.defer()
      const p3 = d3.promise

      d1.reject(new Error("1"))
      d2.reject(new Error("2"))
      d3.reject(new Error("3"))
      pfeil.when([p1, p2, p3]).then(null, function () {
        args = Array.prototype.slice.call(arguments)
        flag = true
      })
    })
    waitsFor(function () {
      return flag
    })

    runs(function () {
      expect(args).toEqual([new Error("1")])
    })
  })
  it('should aggregate an array of mixed promises', function () {
    const pfeil = require(FILE)

    let flag = false
    let args

    runs(function () {
      const d1 = pfeil.defer()
      const p1 = d1.promise
      const d2 = pfeil.defer()
      const p2 = d2.promise
      const d3 = pfeil.defer()
      const p3 = d3.promise

      d1.resolve(1)
      d2.reject(new Error("2"))
      d3.resolve(3)
      pfeil.when([p1, p2, p3]).then(null, function () {
        args = Array.prototype.slice.call(arguments)
        flag = true
      })
    })
    waitsFor(function () {
      return flag
    })

    runs(function () {
      expect(args).toEqual([new Error("2")])
    })
  })
})
