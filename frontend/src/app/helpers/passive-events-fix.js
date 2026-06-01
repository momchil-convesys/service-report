/**
 * This is fix is not currently in use, but may be needed in the future.
 *
 * Fix for browser warning:
 * Added non-passive event listener to a scroll-blocking 'touchstart' event.
 *
 * Code is copied from:
 * https://stackoverflow.com/questions/37721782/what-are-passive-event-listeners
 */

!(function (e) {
  "function" == typeof define && define.amd ? define(e) : e();
})(function () {
  var e,
    t = ["scroll", "wheel", "touchstart", "touchmove"];

  function supportsPassive() {
    var e = !1;
    try {
      var t = Object.defineProperty({}, "passive", {
        get: function () {
          e = !0;
        },
      });
      window.addEventListener("test", null, t);
      window.removeEventListener("test", null, t);
    } catch (e) {}
    return e;
  }

  if (supportsPassive()) {
    var n = EventTarget.prototype.addEventListener;
    e = n;
    EventTarget.prototype.addEventListener = function (n, o, r) {
      var i,
        s = "object" == typeof r && null !== r,
        u = s ? r.capture : r;
      (r = s
        ? (function (e) {
            var t = Object.getOwnPropertyDescriptor(e, "passive");
            return t && !0 !== t.writable && void 0 === t.set ? Object.assign({}, e) : e;
          })(r)
        : {}).passive = void 0 !== (i = r.passive) ? i : -1 !== t.indexOf(n) && !0;
      r.capture = void 0 !== u && u;
      e.call(this, n, o, r);
    };
    EventTarget.prototype.addEventListener._original = e;
  }
});
