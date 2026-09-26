/* LadderMath engine - honest ladder safety math. Pure logic, no DOM. */
(function (root) {
  'use strict';

  var IDEAL_DEG = Math.atan(4) * 180 / Math.PI; /* 4:1 ratio = 75.96 deg */
  var MIN_DEG = 70;   /* shallower and the base can skid out */
  var MAX_DEG = 81;   /* steeper and it can tip backward */
  var REACH_M = 1.7;  /* average person's reach above standing level */
  var STEP_TOP_MARGIN = 0.85;  /* never stand on the top two steps */
  var EXT_TOP_MARGIN = 1.2;    /* never stand on the top three rungs */
  var ROOF_OVERHANG = 1.0;     /* 3 rungs above the roofline for a handhold */

  var STEP_SIZES = [1.2, 1.5, 1.8, 2.1, 2.4, 3.0];
  var EXT_SIZES = [4.4, 5.0, 5.6, 6.2, 7.4, 8.6]; /* extended lengths */

  function num(x, name, min, max) {
    var v = Number(x);
    if (!isFinite(v) || v < min || v > max) throw new Error(name + ' must be between ' + min + ' and ' + max);
    return v;
  }

  function round1(v) { return Math.round(v * 10) / 10; }
  function round2(v) { return Math.round(v * 100) / 100; }

  function angleBand(deg) {
    if (deg < MIN_DEG) return 'too shallow - the base can skid outward';
    if (deg > MAX_DEG) return 'too steep - it can tip backward on you';
    return 'in the safe zone';
  }

  function pickSize(sizes, needed) {
    for (var i = 0; i < sizes.length; i++) if (sizes[i] >= needed) return sizes[i];
    return null;
  }

  /* Check an actual setup: vertical height to contact point, base distance from wall. */
  function checkSetup(input) {
    var contactM = num(input.contactM, 'Contact height', 1, 12);
    var baseM = num(input.baseM, 'Base distance', 0.1, 6);
    var deg = Math.atan(contactM / baseM) * 180 / Math.PI;
    var idealBase = round2(contactM / 4);
    var band = angleBand(deg);
    var verdict = 'Your ladder leans at ' + round1(deg) + ' deg - ' + band + '. ' +
      'For a contact point ' + contactM + ' m up, the base belongs ' + idealBase + ' m out (the 4:1 rule, ' + round1(IDEAL_DEG) + ' deg).';
    if (deg < MIN_DEG) verdict += ' Pull the base in by ' + round2(baseM - idealBase) + ' m.';
    else if (deg > MAX_DEG) verdict += ' Move the base out by ' + round2(idealBase - baseM) + ' m.';
    return {
      deg: round1(deg),
      band: band,
      idealBaseM: idealBase,
      adjustM: round2(Math.abs(baseM - idealBase)),
      verdict: verdict
    };
  }

  /* Recommend a ladder for a target work height (the thing you must touch). */
  function recommend(input) {
    var targetM = num(input.targetM, 'Work height', 1.5, 10);
    var kind = String(input.kind || 'any');
    if (['any', 'step', 'extension'].indexOf(kind) < 0) throw new Error('Pick step, extension or any');
    var roof = !!input.roof;

    var standingM = round2(Math.max(0, targetM - REACH_M));
    var out = { targetM: targetM, standingM: standingM, roof: roof, step: null, extension: null };

    if (kind === 'any' || kind === 'step') {
      var stepNeed = round2(standingM + STEP_TOP_MARGIN);
      var stepSize = pickSize(STEP_SIZES, stepNeed);
      out.step = {
        needM: stepNeed,
        sizeM: stepSize,
        note: stepSize == null ? 'no step ladder reaches this - extension territory'
          : 'a ' + stepSize + ' m step ladder puts your feet at ' + round2(stepSize - STEP_TOP_MARGIN) + ' m'
      };
    }
    if (kind === 'any' || kind === 'extension') {
      var extNeed;
      if (roof) {
        extNeed = round2(targetM + ROOF_OVERHANG);
      } else {
        extNeed = round2(standingM + EXT_TOP_MARGIN);
      }
      var extSize = pickSize(EXT_SIZES, extNeed);
      out.extension = {
        needM: extNeed,
        sizeM: extSize,
        baseOutM: roof ? round2(targetM / 4) : round2((extSize ? Math.min(extSize, extNeed) : extNeed) / 4),
        note: extSize == null ? 'beyond consumer extension ladders - scaffolding or a lift'
          : roof
            ? 'a ' + extSize + ' m extension leaves 3 rungs above the ' + targetM + ' m roofline'
            : 'a ' + extSize + ' m extension puts your feet at ' + round2(extSize - EXT_TOP_MARGIN) + ' m'
      };
    }

    var v = 'To work at ' + targetM + ' m you need to stand about ' + standingM + ' m up (your reach does the last 1.7 m). ';
    if (out.step && out.step.sizeM != null) v += 'Step: ' + out.step.sizeM + ' m. ';
    else if (out.step) v += 'Step: ' + out.step.note + '. ';
    if (out.extension && out.extension.sizeM != null) v += 'Extension: ' + out.extension.sizeM + ' m, base ' + out.extension.baseOutM + ' m out (4:1). ';
    else if (out.extension) v += 'Extension: ' + out.extension.note + '. ';
    if (roof) v += 'Roof work: the ladder must stick 1 m (3 rungs) past the edge or there is nothing to hold stepping off.';
    out.verdict = v;
    return out;
  }

  var api = { checkSetup: checkSetup, recommend: recommend, angleBand: angleBand, IDEAL_DEG: IDEAL_DEG, STEP_SIZES: STEP_SIZES, EXT_SIZES: EXT_SIZES };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.LadderMathEngine = api;
})(typeof window !== 'undefined' ? window : globalThis);
