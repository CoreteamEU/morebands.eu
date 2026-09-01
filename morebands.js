/*
 * Ambient decorations lifted from the app's own start screen
 * (ios/SpriteKit/PaperBackgroundView.swift): a crow that flaps across on two
 * frames, and critters that hop in from one edge and out the other.
 *
 * Everything here is additive. The markup renders complete without it, the
 * animated elements are inert overlays that never take a pointer event, and the
 * whole file bails out when the visitor asks for reduced motion.
 */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reduceMotion.matches) return;

  var rand = function (min, max) {
    return min + Math.random() * (max - min);
  };
  var randInt = function (min, max) {
    return Math.floor(rand(min, max + 1));
  };

  /* Only animate what is actually on screen: a lane scrolled far out of view
     keeps no timers and burns no frames. */
  function onScreen(el, onEnter, onLeave) {
    if (!("IntersectionObserver" in window)) {
      onEnter();
      return;
    }
    new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) onEnter();
          else onLeave();
        });
      },
      { rootMargin: "0px 0px -10% 0px" }
    ).observe(el);
  }

  function place(el, x, y, flipped) {
    el.style.transform =
      "translate3d(" + x + "px," + y + "px,0)" + (flipped ? " scaleX(-1)" : "");
  }

  /* ------------------------------------------------------------- the crow */

  function startCrow(lane) {
    var crow = lane.querySelector(".crow");
    if (!crow) return;

    var flapping = null;
    var visible = false;
    var running = false;
    var timer = null;
    var first = true;

    /* crow00 / crow01 are drawn facing left, so the flip is applied on the
       left-to-right crossing rather than the other way round. */
    function fly() {
      var box = lane.getBoundingClientRect();
      if (!box.width || !box.height) return schedule();

      var toRight = Math.random() < 0.5;
      var size = crow.offsetHeight || 62;
      var span = size * 1.4;
      var startX = toRight ? -span : box.width + span;
      var endX = toRight ? box.width + span : -span;
      var baseY = box.height * rand(0.1, 0.42);
      var amplitude = rand(18, 34);
      var cycles = rand(1.5, 3);
      var phase = rand(0, Math.PI * 2);
      var duration = rand(2600, 3800);
      var began = null;

      running = true;
      crow.style.opacity = "1";
      place(crow, startX, baseY, toRight);

      var frame = 0;
      flapping = window.setInterval(function () {
        frame = 1 - frame;
        crow.src = frame === 0 ? "img/crow00.png" : "img/crow01.png";
      }, 140);

      function step(now) {
        if (began === null) began = now;
        var t = Math.min(1, (now - began) / duration);
        var x = startX + (endX - startX) * t;
        var y = baseY + Math.sin(t * cycles * Math.PI * 2 + phase) * amplitude;
        place(crow, x, y, toRight);
        if (t < 1) {
          window.requestAnimationFrame(step);
          return;
        }
        window.clearInterval(flapping);
        flapping = null;
        crow.style.opacity = "0";
        running = false;
        schedule();
      }
      window.requestAnimationFrame(step);
    }

    function schedule() {
      window.clearTimeout(timer);
      if (!visible) return;
      /* First crossing comes soon, so the page shows it is alive; after that
         it is a rare visitor rather than a loop. */
      var wait = first ? rand(1500, 4000) : rand(9000, 20000);
      first = false;
      timer = window.setTimeout(function () {
        if (visible && !running) fly();
        else schedule();
      }, wait);
    }

    onScreen(
      lane,
      function () {
        if (visible) return;
        visible = true;
        schedule();
      },
      function () {
        visible = false;
        window.clearTimeout(timer);
      }
    );

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) window.clearTimeout(timer);
      else if (visible && !running) schedule();
    });
  }

  /* --------------------------------------------------------- the critters */

  var CRITTERS = {
    pig: { frames: ["img/pig.png"], flips: true },
    piano: { frames: ["img/piano-off.png", "img/piano-on.png"], flips: false }
  };

  function startCritter(lane) {
    var critter = lane.querySelector(".critter");
    var spec = CRITTERS[lane.getAttribute("data-critter")];
    if (!critter || !spec) return;

    spec.frames.forEach(function (src) {
      var pre = new Image();
      pre.src = src;
    });

    var visible = false;
    var running = false;
    var timer = null;
    var first = true;

    function setFrame(index) {
      critter.src = spec.frames[Math.min(index, spec.frames.length - 1)];
    }

    /* One hop: a parabola for the arc, the airborne frame while off the
       ground, the landed frame on touchdown. */
    function hop(fromX, toX, groundY, lift, flipped, done) {
      var duration = rand(620, 780);
      var began = null;
      setFrame(0);

      function step(now) {
        if (began === null) began = now;
        var t = Math.min(1, (now - began) / duration);
        var x = fromX + (toX - fromX) * t;
        var y = groundY - lift * 4 * t * (1 - t);
        place(critter, x, y, flipped);
        if (t < 1) {
          window.requestAnimationFrame(step);
        } else {
          setFrame(1);
          done();
        }
      }
      window.requestAnimationFrame(step);
    }

    function cross() {
      var box = lane.getBoundingClientRect();
      if (!box.width || !box.height) return schedule();

      var height = critter.offsetHeight || 84;
      var width = critter.offsetWidth || height * 1.3;
      var enterLeft = Math.random() < 0.5;
      var exitLeft = Math.random() < 0.5;
      var offLeft = -width;
      var offRight = box.width + width;
      var groundY = box.height - height;
      var lift = height * rand(0.4, 0.65);
      var hops = randInt(4, 7);
      var stepWidth = box.width / (hops + 1);
      var direction = enterLeft ? 1 : -1;

      running = true;
      var x = enterLeft ? offLeft : offRight;
      /* `flips` is false for the front-facing critter, which has no left or
         right to get wrong. */
      var flipped = spec.flips && !enterLeft;
      place(critter, x, groundY, flipped);
      setFrame(1);
      critter.style.opacity = "1";

      var index = 0;
      (function next() {
        if (index >= hops) {
          critter.style.opacity = "0";
          running = false;
          schedule();
          return;
        }
        var last = index === hops - 1;
        var target = last
          ? exitLeft
            ? offLeft
            : offRight
          : x + direction * stepWidth * rand(0.6, 1);
        flipped = spec.flips ? target < x : false;
        index += 1;
        hop(x, target, groundY, lift, flipped, function () {
          x = target;
          window.setTimeout(next, rand(90, 220));
        });
      })();
    }

    function schedule() {
      window.clearTimeout(timer);
      if (!visible) return;
      var wait = first ? rand(700, 1800) : rand(14000, 32000);
      first = false;
      timer = window.setTimeout(function () {
        if (visible && !running) cross();
        else schedule();
      }, wait);
    }

    onScreen(
      lane,
      function () {
        if (visible) return;
        visible = true;
        schedule();
      },
      function () {
        visible = false;
        window.clearTimeout(timer);
      }
    );

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) window.clearTimeout(timer);
      else if (visible && !running) schedule();
    });
  }

  /* ------------------------------------------------------- scroll reveals */

  function startReveals() {
    if (!("IntersectionObserver" in window)) return;

    var targets = document.querySelectorAll(
      ".section-heading, .mode, .genre, .privacy-grid li, .android-status," +
        " .android-note, .story-copy, .story-photo, .parent-points div, .final-cta"
    );
    if (!targets.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("reveal-in");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.06 }
    );

    Array.prototype.forEach.call(targets, function (el, i) {
      /* Already-visible content is never hidden — only what is still below the
         fold gets the reveal, so the first screen paints in one go. */
      if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;
      el.classList.add("reveal");
      el.style.transitionDelay = (i % 4) * 70 + "ms";
      observer.observe(el);
    });
  }

  function init() {
    Array.prototype.forEach.call(
      document.querySelectorAll("[data-crow-lane]"),
      startCrow
    );
    Array.prototype.forEach.call(
      document.querySelectorAll("[data-critter-lane]"),
      startCritter
    );
    startReveals();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
