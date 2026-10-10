const test = require('node:test');
const assert = require('node:assert/strict');
const { buildScenarios, validate } = require('../assets/js/mapf-demo.js');
const scenarios = buildScenarios();
const positionAt = (path, t) => path[Math.min(t, path.length - 1)];
const equal = (a, b) => a[0] === b[0] && a[1] === b[1];

for (const [name, scenario] of Object.entries(scenarios)) {
  test(`${name}: all time steps respect the warehouse and avoid collisions`, () => {
    for (let t = 0; t <= scenario.duration; t++) {
      const positions = scenario.schedules.map(path => positionAt(path, t));
      for (let i = 0; i < positions.length; i++) {
        const [x, y] = positions[i];
        assert.ok(x >= 0 && x < 13 && y >= 0 && y < 9, 'inside the warehouse');
        if (scenario.layout === 'deadlock') {
          assert.ok((y === 4 && x >= 2 && x <= 10) || equal(positions[i], [4, 3]), 'inside the single lane or passing bay');
        } else {
          assert.ok(!([1, 2, 6, 7].includes(y) && [1, 2, 4, 5, 7, 8, 10, 11].includes(x)), 'not inside a shelf');
        }
        if (t > 0) {
          const previous = positionAt(scenario.schedules[i], t - 1);
          assert.ok(Math.abs(previous[0] - x) + Math.abs(previous[1] - y) <= 1, 'move one cell or wait');
        }
        for (let j = i + 1; j < positions.length; j++) {
          assert.ok(!equal(positions[i], positions[j]), 'no shared-cell collision');
          if (t > 0) {
            assert.ok(!(equal(positions[i], positionAt(scenario.schedules[j], t - 1)) &&
              equal(positions[j], positionAt(scenario.schedules[i], t - 1))), 'no opposing edge swap');
          }
        }
      }
    }
  });
}

test('congestion has waiting but every agent eventually reaches its own goal', () => {
  const s = scenarios.congestion;
  assert.ok(s.schedules.some(path => path.some((p, t) => t > 0 && equal(p, path[t - 1]))));
  s.schedules.forEach((path, i) => assert.deepEqual(path.at(-1), s.goals[i]));
});

test('deadlock is unresolved: adjacent agents face each other and remain stationary', () => {
  const s = scenarios.deadlock;
  const a = s.schedules[0].at(-1), b = s.schedules[1].at(-1);
  assert.equal(Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]), 1);
  assert.deepEqual([a[0] + 1, a[1]], b, 'A requests the cell occupied by B');
  assert.deepEqual([b[0] - 1, b[1]], a, 'B requests the cell occupied by A');
  s.schedules.forEach((path, i) => {
    assert.notDeepEqual(path.at(-1), s.goals[i]);
    assert.deepEqual(positionAt(path, 8), positionAt(path, 12));
  });
  assert.ok(s.goals[0][0] > a[0] && s.goals[1][0] < b[0], 'opposing destinations');
});

test('deadlock recovery begins at the blocked positions without teleporting', () => {
  scenarios.deadlockResolved.schedules.forEach((path, i) => {
    assert.deepEqual(path[0], scenarios.deadlock.schedules[i].at(-1));
  });
});

test('yielding into the bay allows B to pass before A re-enters the lane', () => {
  const [a, b] = scenarios.deadlockResolved.schedules;
  const enterBay = a.findIndex(p => equal(p, [4, 3]));
  assert.ok(enterBay > 0 && a[1][0] < a[0][0], 'A backs up to the bay');
  const leaveBay = a.findIndex((p, t) => t > enterBay && p[1] === 4);
  assert.ok(leaveBay > enterBay, 'A waits outside the lane');
  assert.ok(positionAt(b, leaveBay)[0] < 4, 'B is clear before A re-enters');
  for (let t = enterBay; t < leaveBay; t++) assert.deepEqual(a[t], [4, 3]);
});

test('deadlock recovery reaches both original goals', () => {
  scenarios.deadlockResolved.schedules.forEach((path, i) => {
    assert.deepEqual(path.at(-1), scenarios.deadlock.goals[i]);
  });
});

test('deadlock validation rejects shortcuts through walls beside the passing bay', () => {
  assert.throws(() => validate([[[4, 3], [5, 3]]], 'deadlock'), /shelf or boundary/);
});

test('coordinated paths resolve opposing routes and all agents arrive', () => {
  const s = scenarios.coordinated;
  s.schedules.forEach((path, i) => assert.deepEqual(path.at(-1), s.goals[i]));
  assert.ok(s.schedules[1].some(p => p[1] !== 4), 'one opposing agent uses a bypass');
});
