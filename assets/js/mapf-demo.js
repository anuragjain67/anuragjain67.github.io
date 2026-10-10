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
  function walkable(p) {
    if (p[0] < 0 || p[0] >= COLS || p[1] < 0 || p[1] >= ROWS) return false;
    return !([1, 2, 6, 7].includes(p[1]) && [1, 2, 4, 5, 7, 8, 10, 11].includes(p[0]));
  }
  function at(path, tick) { return path[Math.min(tick, path.length - 1)]; }
  function row(from, to, y) {
    var result = [], direction = from <= to ? 1 : -1;
    for (var x = from; direction > 0 ? x <= to : x >= to; x += direction) result.push([x, y]);
    return result;
  }

  // Local requests share a slow bottleneck. Reject conflicts rather than allowing collisions.
  function queueSchedules(paths) {
    var indices = paths.map(function () { return 0; });
    var schedules = paths.map(function (path) { return [path[0]]; });
    for (var t = 1; t < 120; t++) {
      var current = paths.map(function (path, i) { return path[indices[i]]; });
      var moving = paths.map(function (path, i) {
        if (indices[i] === path.length - 1) return false;
        var next = path[indices[i] + 1];
        return !(same(next, [6, 4]) && t % 3 !== 0);
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
    var congestionPaths = [row(0, 12, 4),
      row(0, 3, 3).concat(row(3, 9, 4), row(9, 12, 3)),
      row(0, 3, 5).concat(row(3, 9, 4), row(9, 12, 5)),
      [[3, 0], [3, 1], [3, 2], [3, 3]].concat(row(3, 9, 4), [[9, 3], [9, 2], [9, 1]], row(9, 12, 0))];
    var deadlockPaths = [row(0, 6, 4), row(12, 7, 4)];
    var scenarios = {
      congestion: {
        schedules: queueSchedules(congestionPaths), goals: congestionPaths.map(function (path) { return path[path.length - 1]; }),
        explanation: 'A busy shared aisle creates a queue. In this example, agents make local progress, but access to the bottleneck is slow. Congestion delays movement; it does not necessarily stop it.',
        end: 'All agents arrived, after queuing through the shared aisle.'
      },
      deadlock: {
        schedules: deadlockPaths, goals: [[12, 4], [0, 4]], duration: 12,
        explanation: 'Two agents meet head-on. Each needs the cell occupied by the other, so both stop. This local policy cannot resolve the deadlock, even though a bypass exists.',
        end: 'Deadlock: A and B are still waiting for each other. Neither has reached its goal.'
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
      validate(scenario.schedules);
    });
    return scenarios;
  }

  function validate(paths) {
    var end = Math.max.apply(null, paths.map(function (path) { return path.length; }));
    for (var t = 0; t < end; t++) {
      paths.forEach(function (path, i) {
        var p = at(path, t);
        if (!walkable(p)) throw new Error('Path crosses a shelf or boundary.');
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
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    var name = 'coordinated', tick = 0, elapsed = 0, running = false, lastTime = null, frame = null;
    var cell = 60;
    canvas.hidden = false;
    container.querySelector('.demo-fallback').hidden = true;
    container.querySelector('.demo-controls').hidden = false;
    container.querySelector('.demo-legend').hidden = false;

    function center(p) { return [(p[0] + .5) * cell, (p[1] + .5) * cell]; }
    function paint(position) {
      var scenario = scenarios[name];
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#f8f5ed'; ctx.fillRect(0, 0, 780, 540);
      ctx.fillStyle = 'rgba(194,132,41,.10)'; ctx.fillRect(6 * cell, 0, cell, 540);
      ctx.strokeStyle = 'rgba(84,91,76,.13)'; ctx.lineWidth = 1;
      for (var x = 0; x <= COLS; x++) { ctx.beginPath(); ctx.moveTo(x * cell, 0); ctx.lineTo(x * cell, 540); ctx.stroke(); }
      for (var y = 0; y <= ROWS; y++) { ctx.beginPath(); ctx.moveTo(0, y * cell); ctx.lineTo(780, y * cell); ctx.stroke(); }
      for (var sx = 0; sx < COLS; sx++) for (var sy = 0; sy < ROWS; sy++) {
        if (walkable([sx, sy])) continue;
        ctx.fillStyle = 'rgba(57,75,49,.035)'; ctx.fillRect(sx * cell + 5, sy * cell + 5, 50, 50);
        ctx.strokeStyle = 'rgba(57,65,52,.45)'; ctx.strokeRect(sx * cell + 5, sy * cell + 5, 50, 50);
        ctx.strokeStyle = 'rgba(57,65,52,.19)';
        for (var shelf = 15; shelf < 50; shelf += 10) {
          ctx.beginPath(); ctx.moveTo(sx * cell + 8, sy * cell + shelf); ctx.lineTo(sx * cell + 52, sy * cell + shelf); ctx.stroke();
        }
      }
      scenario.schedules.forEach(function (path, i) {
        var planned = name === 'deadlock' ? row(i === 0 ? 0 : 12, i === 0 ? 12 : 0, 4) : path;
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
        ctx.beginPath(); ctx.arc(point[0], point[1], 14, 0, 2 * Math.PI); ctx.fillStyle = colors[i]; ctx.fill();
        ctx.strokeStyle = '#f8f5ed'; ctx.lineWidth = 3; ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.font = '700 15px "DM Sans", sans-serif'; ctx.fillText(String.fromCharCode(65 + i), point[0], point[1]);
      });
      canvas.dataset.tick = String(Math.floor(position));
      canvas.dataset.scenario = name;
    }
    function buttons() {
      play.querySelector('span').textContent = reduced.matches ? 'Advance' : running ? 'Pause' : tick >= scenarios[name].duration ? 'Replay' : 'Play';
      play.querySelector('i').className = 'fa ' + (running ? 'fa-pause' : 'fa-play');
      step.disabled = running || tick >= scenarios[name].duration;
      play.disabled = reduced.matches && tick >= scenarios[name].duration;
    }
    function stop() {
      running = false; lastTime = null;
      if (frame !== null) window.cancelAnimationFrame(frame);
      frame = null;
      buttons();
    }
    function announce(prefix) {
      status.textContent = tick >= scenarios[name].duration ? scenarios[name].end : prefix + ' Step ' + tick + ' of ' + scenarios[name].duration + '. Squares mark goals; filled circles mark agents.';
    }
    function resetState() { stop(); tick = 0; elapsed = 0; paint(0); buttons(); announce('Ready.'); }
    function advance() {
      if (tick >= scenarios[name].duration) return;
      tick++; elapsed = tick * 450; paint(tick); buttons(); announce('Advanced.');
    }
    function animate(timestamp) {
      if (!running) return;
      if (lastTime !== null) elapsed += Math.min(timestamp - lastTime, 100);
      lastTime = timestamp;
      var progress = Math.min(elapsed / 450, scenarios[name].duration);
      tick = Math.floor(progress); paint(progress);
      if (progress >= scenarios[name].duration) { stop(); announce('Finished.'); }
      else frame = window.requestAnimationFrame(animate);
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
      if (tick >= scenarios[name].duration) resetState();
      running = true; buttons(); status.textContent = 'Playing the ' + name + ' example. Pause or reset at any time.';
      frame = window.requestAnimationFrame(animate);
    });
    step.addEventListener('click', advance);
    reset.addEventListener('click', resetState);
    reduced.addEventListener('change', function () { stop(); paint(tick); elapsed = tick * 450; buttons(); announce('Paused.'); });
    document.addEventListener('visibilitychange', function () { if (document.hidden && running) { stop(); announce('Paused.'); } });
    explanation.textContent = scenarios[name].explanation;
    resetState();
  }
  return { buildScenarios: buildScenarios, validate: validate, walkable: walkable, at: at, mount: mount };
}));
