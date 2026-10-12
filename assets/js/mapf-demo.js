/* Illustrative schedules, not GreyOrange's planner or production architecture. */
(function (root, factory) {
  'use strict';
  var engine = factory();
  if (typeof module === 'object' && module.exports) module.exports = engine;
  if (root.document) engine.mount(root.document);
}(typeof window === 'undefined' ? globalThis : window, function () {
  'use strict';
  var COLS = 13, ROWS = 9;
  var colors = ['#18533e', '#a05c13', '#45609a', '#8d4562'];
  function same(a, b) { return a[0] === b[0] && a[1] === b[1]; }
  function key(p) { return p[0] + ',' + p[1]; }
  function walkable(p, layout) {
    if (layout === 'deadlock') return (p[1] === 4 && p[0] >= 2 && p[0] <= 10) || same(p, [4, 3]);
    if (layout === 'congestion') return ((p[1] === 2 || p[1] === 6) && p[0] >= 1 && p[0] <= 4)
      || (p[0] === 4 && p[1] >= 2 && p[1] <= 6)
      || (p[1] === 4 && p[0] >= 4 && p[0] <= 9)
      || (p[0] === 9 && p[1] >= 2 && p[1] <= 6)
      || ([2, 3, 5, 6].includes(p[1]) && p[0] >= 9 && p[0] <= 11);
    if (p[0] < 0 || p[0] >= COLS || p[1] < 0 || p[1] >= ROWS) return false;
    return !([1, 2, 6, 7].includes(p[1]) && [1, 2, 4, 5, 7, 8, 10, 11].includes(p[0]));
  }
  function at(path, tick) { return path[Math.min(tick, path.length - 1)]; }
  function row(from, to, y) {
    var result = [], direction = from <= to ? 1 : -1;
    for (var x = from; direction > 0 ? x <= to : x >= to; x += direction) result.push([x, y]);
    return result;
  }

  // At a merge, admit one request per cell. Waiting comes only from conflicts.
  // Fixed agent priority is illustrative, not a throughput or fairness guarantee.
  function queueSchedules(paths) {
    var indices = paths.map(function () { return 0; });
    var schedules = paths.map(function (path) { return [path[0]]; });
    for (var t = 1; t < 120; t++) {
      var current = paths.map(function (path, i) { return path[indices[i]]; });
      var moving = paths.map(function (path, i) {
        if (indices[i] === path.length - 1) return false;
        return true;
      });
      // Iteration is needed when one rejection forces a following agent to wait too.
      var changed = true;
      while (changed) {
        changed = false;
        for (var i = 0; i < paths.length; i++) {
          if (!moving[i]) continue;
          var nextI = paths[i][indices[i] + 1];
          for (var j = 0; j < paths.length; j++) {
            if (i === j) continue;
            var nextJ = moving[j] ? paths[j][indices[j] + 1] : current[j];
            var vertex = same(nextI, nextJ) && (!moving[j] || i > j);
            var swap = moving[j] && same(nextI, current[j]) && same(nextJ, current[i]);
            if (vertex || swap) { moving[i] = false; changed = true; break; }
          }
        }
      }
      indices.forEach(function (index, i) {
        if (moving[i]) indices[i]++;
        schedules[i].push(paths[i][indices[i]]);
      });
      if (indices.every(function (index, i) { return index === paths[i].length - 1; })) return schedules;
    }
    throw new Error('Illustrative queue did not finish.');
  }

  // Prioritized space-time search reserves cells and rejects opposing edge swaps.
  // A small educational example; no claim of optimality or congestion-free operation.
  function plan(starts, goals) {
    var schedules = [];
    starts.forEach(function (start, index) {
      var goal = goals[index];
      var queue = [{ p: start, t: 0, parent: -1 }], cursor = 0;
      var seen = new Set([key(start) + ',0']), found = -1;
      while (cursor < queue.length) {
        var state = queue[cursor];
        if (same(state.p, goal)) {
          var goalSafe = schedules.every(function (path) {
            for (var future = state.t; future <= 80; future++) if (same(at(path, future), goal)) return false;
            return true;
          });
          if (goalSafe) { found = cursor; break; }
        }
        if (state.t < 80) {
          var candidates = [[state.p[0] + 1, state.p[1]], [state.p[0], state.p[1] + 1],
            [state.p[0] - 1, state.p[1]], [state.p[0], state.p[1] - 1], state.p];
          candidates.sort(function (a, b) {
            return Math.abs(a[0] - goal[0]) + Math.abs(a[1] - goal[1]) - Math.abs(b[0] - goal[0]) - Math.abs(b[1] - goal[1]);
          });
          candidates.forEach(function (next) {
            var nextT = state.t + 1, stateKey = key(next) + ',' + nextT;
            if (!walkable(next) || seen.has(stateKey)) return;
            var blocked = schedules.some(function (path) {
              return same(at(path, nextT), next) || (same(at(path, state.t), next) && same(at(path, nextT), state.p));
            });
            if (!blocked) { seen.add(stateKey); queue.push({ p: next, t: nextT, parent: cursor }); }
          });
        }
        cursor++;
      }
      if (found < 0) throw new Error('No illustrative coordinated route found.');
      var path = [];
      while (found >= 0) { path.push(queue[found].p); found = queue[found].parent; }
      schedules.push(path.reverse());
    });
    return schedules;
  }

  function buildScenarios() {
    var congestionPaths = [
      row(2, 4, 2).concat([[4, 3]], row(4, 9, 4), [[9, 3]], row(9, 11, 2)),
      row(1, 4, 2).concat([[4, 3]], row(4, 9, 4), row(9, 11, 3)),
      row(2, 4, 6).concat([[4, 5]], row(4, 9, 4), [[9, 5]], row(9, 11, 6)),
      row(1, 4, 6).concat([[4, 5]], row(4, 9, 4), row(9, 11, 5))
    ];
    var deadlockPaths = [row(4, 6, 4), row(9, 7, 4)];
    var scenarios = {
      congestion: {
        schedules: queueSchedules(congestionPaths), goals: congestionPaths.map(function (path) { return path[path.length - 1]; }),
        layout: 'congestion', routes: congestionPaths,
        explanation: 'Two incoming lanes merge into one shared aisle. Only one robot can enter the merge cell per step. When both lanes arrive together, some robots wait and a queue forms upstream. The robots ahead keep moving, and the queue eventually clears.',
        end: 'The queue cleared and all four robots reached their goals. The delay came from competing for the same merge cell.'
      },
      deadlock: {
        schedules: deadlockPaths, goals: [[10, 4], [2, 4]], layout: 'deadlock',
        explanation: 'A wants to go right; B wants to go left. In this single-lane aisle, each requests the cell occupied by the other. Their forward-only policy makes both wait. A coordinated backoff can break this circular wait.',
        end: 'Deadlock: A waits for B’s cell, and B waits for A’s cell. Waiting longer will not help. Choose Resolve deadlock to let A yield.'
      },
      deadlockResolved: {
        layout: 'deadlock', goals: [[10, 4], [2, 4]],
        schedules: [
          [[6, 4], [5, 4], [4, 4], [4, 3], [4, 3], [4, 3], [4, 3], [4, 3]].concat(row(4, 10, 4)),
          [[7, 4], [7, 4], [7, 4], [7, 4]].concat(row(6, 2, 4))
        ],
        end: 'Deadlock resolved: A yielded into the passing bay, B passed, then A continued. Both robots reached their goals.'
      },
      coordinated: {
        schedules: plan([[0, 4], [12, 4], [6, 0], [6, 8]], [[12, 4], [0, 4], [6, 8], [6, 0]]),
        goals: [[12, 4], [0, 4], [6, 8], [6, 0]],
        explanation: 'Plan space and time together. These agents reserve cells, wait when needed, and use alternate aisles to avoid conflicts. The routes are checked for cell conflicts and head-on swaps.',
        end: 'All agents reached their goals using coordinated paths.'
      }
    };
    Object.keys(scenarios).forEach(function (name) {
      var scenario = scenarios[name];
      scenario.duration = scenario.duration || Math.max.apply(null, scenario.schedules.map(function (path) { return path.length - 1; }));
      validate(scenario.schedules, scenario.layout);
    });
    return scenarios;
  }

  // Describe the next scheduled move; an arrived robot is not a queued robot.
  function trafficState(scenario, tick) {
    var state = { waiting: [], moving: [], arrived: [] };
    scenario.schedules.forEach(function (path, i) {
      var current = at(path, tick), next = at(path, tick + 1);
      var category = same(current, scenario.goals[i]) ? 'arrived' : same(current, next) ? 'waiting' : 'moving';
      state[category].push(String.fromCharCode(65 + i));
    });
    return state;
  }

  function validate(paths, layout) {
    var end = Math.max.apply(null, paths.map(function (path) { return path.length; }));
    for (var t = 0; t < end; t++) {
      paths.forEach(function (path, i) {
        var p = at(path, t);
        if (!walkable(p, layout)) throw new Error('Path crosses a shelf or boundary.');
        if (t && Math.abs(p[0] - at(path, t - 1)[0]) + Math.abs(p[1] - at(path, t - 1)[1]) > 1) throw new Error('Path jumps cells.');
        for (var j = i + 1; j < paths.length; j++) {
          if (same(p, at(paths[j], t))) throw new Error('Vertex conflict.');
          if (t && same(p, at(paths[j], t - 1)) && same(at(path, t - 1), at(paths[j], t))) throw new Error('Edge swap.');
        }
      });
    }
    return true;
  }

  function mount(document) {
    var canvas = document.getElementById('warehouse-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    var scenarios = buildScenarios();
    var container = document.getElementById('mapf-demo');
    var play = document.getElementById('demo-play'), step = document.getElementById('demo-step');
    var reset = document.getElementById('demo-reset'), status = document.getElementById('demo-status');
    var explanation = document.getElementById('demo-explanation');
    var guide = document.getElementById('deadlock-guide');
    var resolve = document.getElementById('demo-resolve');
    var congestionGuide = document.getElementById('congestion-guide');
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    var name = 'coordinated', tick = 0, elapsed = 0, running = false, lastTime = null, frame = null;
    var recovering = false;
    var cell = 60;
    canvas.hidden = false;
    container.querySelector('.demo-fallback').hidden = true;
    container.querySelector('.demo-controls').hidden = false;
    container.querySelector('.demo-legend').hidden = false;

    function activeScenario() { return scenarios[recovering ? 'deadlockResolved' : name]; }
    function interval() { return name === 'deadlock' ? 700 : name === 'congestion' ? 800 : 450; }
    function center(p) { return [(p[0] + .5 - (name === 'deadlock' ? 1 : 0)) * cell, (p[1] + .5 - (name === 'deadlock' ? 2 : 0)) * cell]; }
    function phase() {
      if (!recovering) return tick >= scenarios.deadlock.duration ? 'blocked' : 'approaching';
      if (tick >= activeScenario().duration) return 'resolved';
      return tick < 3 ? 'yielding' : tick < 8 ? 'passing' : 'resuming';
    }
    function updateGuide() {
      if (!guide) return;
      guide.hidden = name !== 'deadlock';
      if (guide.hidden) return;
      var state = phase();
      if (guide.dataset.phase === state && guide.dataset.motion === String(reduced.matches)) return;
      var messages = {
        approaching: 'Two robots approach from opposite directions. The aisle is only one cell wide.',
        blocked: 'A needs B’s cell. B needs A’s cell. Both wait for the other to move first. That circular wait is the deadlock.',
        yielding: 'The coordinator asks A to back up and enter the passing bay. B waits until the aisle is clear.',
        passing: 'A waits in the passing bay while B moves past. The circular wait is broken.',
        resuming: 'B is clear of the bay. A can re-enter the aisle and continue to its goal.',
        resolved: 'Both robots reached their goals. One robot yielding created room for the other to pass.'
      };
      guide.dataset.phase = state;
      guide.dataset.motion = String(reduced.matches);
      document.getElementById('deadlock-story').textContent = messages[state];
      canvas.setAttribute('aria-label', 'Illustrative deadlock walkthrough. ' + messages[state]);
      var stage = state === 'approaching' ? 'approach' : state === 'blocked' ? 'blocked' : 'resolve';
      guide.querySelectorAll('[data-deadlock-stage]').forEach(function (item) {
        if (item.dataset.deadlockStage === stage) item.setAttribute('aria-current', 'step');
        else item.removeAttribute('aria-current');
      });
      resolve.disabled = state !== 'blocked';
      resolve.textContent = state === 'resolved' ? 'Deadlock resolved' : recovering ? 'Recovery in progress' : 'Resolve deadlock';
      document.getElementById('deadlock-action-hint').textContent = reduced.matches
        ? 'Use Advance or Step to follow each move. Reset starts the example again.'
        : state === 'approaching' ? 'Press Play or Step to see the robots meet.'
          : state === 'blocked' ? 'Try a coordinated recovery: A backs up into the bay so B can pass.'
            : state === 'resolved' ? 'Reset to see the standstill again.' : 'Pause or Step to inspect the recovery.';
    }
    function updateCongestion() {
      if (!congestionGuide) return;
      congestionGuide.hidden = name !== 'congestion';
      if (congestionGuide.hidden || congestionGuide.dataset.tick === String(tick)) return;
      var scenario = activeScenario(), traffic = trafficState(scenario, tick);
      var queueSeen = scenario.schedules.some(function (path) {
        return path.slice(1, tick + 1).some(function (p, t) { return same(p, path[t]); });
      });
      var upstream = scenario.schedules.some(function (path) {
        var p = at(path, tick);
        return p[0] <= 4 && p[1] !== 4;
      });
      var state = traffic.arrived.length === scenario.schedules.length ? 'arrived'
        : traffic.waiting.length ? 'queued' : !queueSeen ? 'approaching' : upstream ? 'draining' : 'flowing';
      var message = state === 'queued'
        ? traffic.waiting.join(' and ') + ' wait upstream while ' + traffic.moving.join(' and ') + ' keep moving. Two incoming lanes are competing for one merge cell.'
        : state === 'arrived' ? 'All four robots arrived. The queue caused a delay, but the fleet kept making progress.'
          : state === 'draining' ? 'The queue is draining. Robots take turns at the merge while those ahead continue down the shared aisle.'
            : state === 'flowing' ? 'All robots have passed the merge. They continue toward their separate goals.'
            : 'Robots approach from two lanes. They will need to take turns entering the shared aisle.';
      congestionGuide.dataset.tick = String(tick);
      congestionGuide.dataset.phase = state;
      document.getElementById('congestion-story').textContent = message;
      congestionGuide.querySelectorAll('[data-traffic-count]').forEach(function (item) {
        item.textContent = String(traffic[item.dataset.trafficCount].length);
      });
      canvas.setAttribute('aria-label', 'Illustrative congestion example. ' + message
        + ' Next step: ' + traffic.moving.length + ' moving, ' + traffic.waiting.length + ' waiting; ' + traffic.arrived.length + ' arrived.');
    }
    function paint(position) {
      var scenario = activeScenario(), focused = name === 'deadlock';
      var congestion = name === 'congestion', constrained = focused || congestion;
      var height = focused ? 355 : 540;
      if (canvas.height !== height) canvas.height = height;
      canvas.style.aspectRatio = '780 / ' + height;
      cell = focused ? 780 / 11 : 60;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#f8f5ed'; ctx.fillRect(0, 0, 780, height);
      if (!constrained) { ctx.fillStyle = 'rgba(194,132,41,.10)'; ctx.fillRect(6 * cell, 0, cell, height); }
      if (congestion) { ctx.fillStyle = 'rgba(194,132,41,.12)'; ctx.fillRect(4 * cell, 4 * cell, 6 * cell, cell); }
      ctx.strokeStyle = 'rgba(84,91,76,.13)'; ctx.lineWidth = 1;
      for (var x = 0; x <= (focused ? 11 : COLS); x++) { ctx.beginPath(); ctx.moveTo(x * cell, 0); ctx.lineTo(x * cell, height); ctx.stroke(); }
      for (var y = 0; y <= (focused ? 5 : ROWS); y++) { ctx.beginPath(); ctx.moveTo(0, y * cell); ctx.lineTo(780, y * cell); ctx.stroke(); }
      for (var sx = focused ? 1 : 0; sx < (focused ? 12 : COLS); sx++) for (var sy = focused ? 2 : 0; sy < (focused ? 7 : ROWS); sy++) {
        if (walkable([sx, sy], scenario.layout)) continue;
        if (constrained) {
          var wall = center([sx, sy]);
          ctx.fillStyle = '#dfe1d6'; ctx.fillRect(wall[0] - cell / 2 + 2, wall[1] - cell / 2 + 2, cell - 4, cell - 4);
          continue;
        }
        ctx.fillStyle = 'rgba(57,75,49,.035)'; ctx.fillRect(sx * cell + 5, sy * cell + 5, 50, 50);
        ctx.strokeStyle = 'rgba(57,65,52,.45)'; ctx.strokeRect(sx * cell + 5, sy * cell + 5, 50, 50);
        ctx.strokeStyle = 'rgba(57,65,52,.19)';
        for (var shelf = 15; shelf < 50; shelf += 10) {
          ctx.beginPath(); ctx.moveTo(sx * cell + 8, sy * cell + shelf); ctx.lineTo(sx * cell + 52, sy * cell + shelf); ctx.stroke();
        }
      }
      if (focused) {
        var bay = center([4, 3]);
        ctx.fillStyle = '#e4ede3'; ctx.fillRect(bay[0] - cell / 2 + 3, bay[1] - cell / 2 + 3, cell - 6, cell - 6);
        ctx.strokeStyle = '#184c39'; ctx.lineWidth = 2; ctx.setLineDash([5, 4]);
        ctx.strokeRect(bay[0] - cell / 2 + 3, bay[1] - cell / 2 + 3, cell - 6, cell - 6); ctx.setLineDash([]);
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#184c39'; ctx.font = '600 19px "DM Sans", sans-serif';
        ctx.fillText('Passing bay', bay[0], 39);
        ctx.fillText('Single-lane aisle', 555, 39);
      }
      if (congestion) {
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#184c39'; ctx.font = '600 21px "DM Sans", sans-serif';
        ctx.fillText('Two lanes merge into one aisle', 390, 35);
        ctx.fillStyle = '#855011'; ctx.font = '600 18px "DM Sans", sans-serif';
        ctx.fillText('Merge', 270, 95);
        ctx.beginPath(); ctx.moveTo(270, 113); ctx.lineTo(270, 223); ctx.strokeStyle = '#a05c13'; ctx.lineWidth = 2; ctx.setLineDash([4, 4]); ctx.stroke(); ctx.setLineDash([]);
        ctx.strokeStyle = '#a05c13'; ctx.lineWidth = 3; ctx.strokeRect(4 * cell + 4, 4 * cell + 4, cell - 8, cell - 8);
        ctx.fillText('Shared aisle', 435, 345);
      }
      scenario.schedules.forEach(function (path, i) {
        var planned = focused && !recovering ? row(path[0][0], scenario.goals[i][0], 4) : path;
        ctx.beginPath(); ctx.strokeStyle = colors[i]; ctx.globalAlpha = .38; ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
        planned.forEach(function (p, index) { var c = center(p); if (index === 0) ctx.moveTo(c[0], c[1]); else ctx.lineTo(c[0], c[1]); });
        ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
        var goal = center(scenario.goals[i]);
        ctx.strokeStyle = colors[i]; ctx.lineWidth = 2; ctx.strokeRect(goal[0] - 13, goal[1] - 13, 26, 26);
        ctx.font = '600 12px "DM Sans", sans-serif'; ctx.fillStyle = colors[i]; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(String.fromCharCode(65 + i), goal[0], goal[1]);
      });
      scenario.schedules.forEach(function (path, i) {
        var from = at(path, Math.floor(position)), to = at(path, Math.min(Math.floor(position) + 1, scenario.duration));
        var part = position - Math.floor(position), point = center([from[0] + (to[0] - from[0]) * part, from[1] + (to[1] - from[1]) * part]);
        ctx.beginPath(); ctx.arc(point[0], point[1], constrained ? 20 : 14, 0, 2 * Math.PI); ctx.fillStyle = colors[i]; ctx.fill();
        ctx.strokeStyle = '#f8f5ed'; ctx.lineWidth = 3; ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.font = '700 ' + (constrained ? 20 : 15) + 'px "DM Sans", sans-serif'; ctx.fillText(String.fromCharCode(65 + i), point[0], point[1]);
        if (congestion && !same(from, scenario.goals[i]) && same(from, to)) {
          ctx.strokeStyle = '#a05c13'; ctx.lineWidth = 3; ctx.strokeRect(point[0] - cell / 2 + 4, point[1] - cell / 2 + 4, cell - 8, cell - 8);
        }
      });
      if (focused && !recovering && position >= scenarios.deadlock.duration) {
        scenario.schedules.forEach(function (path, i) {
          var occupied = center(at(path, tick)), other = center(at(scenario.schedules[1 - i], tick));
          ctx.strokeStyle = '#9b3e2e'; ctx.lineWidth = 3;
          ctx.strokeRect(occupied[0] - cell / 2 + 4, occupied[1] - cell / 2 + 4, cell - 8, cell - 8);
          var direction = i === 0 ? 1 : -1, offset = i === 0 ? -26 : 26;
          var endX = other[0] - direction * 20, arrowY = occupied[1] + offset;
          ctx.beginPath(); ctx.moveTo(occupied[0], arrowY); ctx.lineTo(endX, arrowY);
          ctx.lineTo(endX - direction * 8, arrowY - 5); ctx.moveTo(endX, arrowY); ctx.lineTo(endX - direction * 8, arrowY + 5); ctx.stroke();
        });
        ctx.fillStyle = '#9b3e2e'; ctx.font = '700 22px "DM Sans", sans-serif';
        ctx.fillText('A waits for B. B waits for A.', 390, 294);
      }
      canvas.dataset.tick = String(Math.floor(position));
      canvas.dataset.scenario = name;
      canvas.dataset.phase = focused ? phase() : '';
      updateGuide();
      updateCongestion();
      if (congestion) canvas.dataset.phase = congestionGuide.dataset.phase;
    }
    function buttons() {
      play.querySelector('span').textContent = reduced.matches ? 'Advance' : running ? 'Pause' : tick >= activeScenario().duration ? 'Replay' : 'Play';
      play.querySelector('i').className = 'fa ' + (running ? 'fa-pause' : 'fa-play');
      step.disabled = running || tick >= activeScenario().duration;
      play.disabled = reduced.matches && tick >= activeScenario().duration;
    }
    function stop() {
      running = false; lastTime = null;
      if (frame !== null) window.cancelAnimationFrame(frame);
      frame = null;
      buttons();
    }
    function announce(prefix) {
      var scenario = activeScenario();
      status.textContent = tick >= scenario.duration ? scenario.end : prefix + ' Step ' + tick + ' of ' + scenario.duration + '. Squares mark goals; filled circles mark agents.';
    }
    function resetState() {
      stop(); recovering = false; tick = 0; elapsed = 0;
      if (guide) delete guide.dataset.phase;
      if (congestionGuide) delete congestionGuide.dataset.tick;
      paint(0); buttons(); announce('Ready.');
    }
    function advance() {
      if (tick >= activeScenario().duration) return;
      tick++; elapsed = tick * interval(); paint(tick); buttons();
      announce(name === 'congestion' ? document.getElementById('congestion-story').textContent : 'Advanced.');
    }
    function animate(timestamp) {
      if (!running) return;
      if (lastTime !== null) elapsed += Math.min(timestamp - lastTime, 100);
      lastTime = timestamp;
      var progress = Math.min(elapsed / interval(), activeScenario().duration);
      var previousTick = tick;
      var previousTrafficPhase = congestionGuide && congestionGuide.dataset.phase;
      tick = Math.floor(progress); paint(progress);
      if (progress >= activeScenario().duration) { stop(); announce('Finished.'); }
      else {
        if (name === 'deadlock' && tick !== previousTick && [3, 8].includes(tick)) announce(document.getElementById('deadlock-story').textContent);
        if (name === 'congestion' && previousTrafficPhase !== congestionGuide.dataset.phase) announce(document.getElementById('congestion-story').textContent);
        frame = window.requestAnimationFrame(animate);
      }
    }
    container.querySelectorAll('button[data-scenario]').forEach(function (button) {
      button.addEventListener('click', function () {
        name = button.dataset.scenario;
        container.querySelectorAll('button[data-scenario]').forEach(function (other) { other.setAttribute('aria-pressed', String(other === button)); });
        explanation.textContent = scenarios[name].explanation;
        container.querySelectorAll('.demo-legend > span').forEach(function (agent, index) {
          agent.hidden = index >= scenarios[name].schedules.length;
        });
        canvas.setAttribute('aria-label', 'Illustrative ' + name + ' scenario. ' + scenarios[name].explanation);
        resetState();
      });
    });
    play.addEventListener('click', function () {
      if (reduced.matches) { advance(); return; }
      if (running) { stop(); announce('Paused.'); return; }
      if (tick >= activeScenario().duration) resetState();
      running = true; buttons(); status.textContent = 'Playing the ' + name + ' example. Pause or reset at any time.';
      frame = window.requestAnimationFrame(animate);
    });
    if (resolve) resolve.addEventListener('click', function () {
      if (name !== 'deadlock' || recovering || tick < scenarios.deadlock.duration) return;
      stop(); recovering = true; tick = 0; elapsed = 0; paint(0); buttons(); announce('A is yielding into the passing bay.');
      if (!reduced.matches) { running = true; buttons(); frame = window.requestAnimationFrame(animate); }
    });
    step.addEventListener('click', advance);
    reset.addEventListener('click', resetState);
    reduced.addEventListener('change', function () { stop(); paint(tick); elapsed = tick * interval(); buttons(); announce('Paused.'); });
    document.addEventListener('visibilitychange', function () { if (document.hidden && running) { stop(); announce('Paused.'); } });
    explanation.textContent = scenarios[name].explanation;
    resetState();
  }
  return { buildScenarios: buildScenarios, validate: validate, walkable: walkable, trafficState: trafficState, at: at, mount: mount };
}));
