import { describe, expect, it } from 'vitest';

import { getShotZoneRunBreakdown, SHOT_ZONE_GEOMETRY, shotZoneAngleToWagonWheel } from '../shotAreaUtils';

/** Broadcast wagon wheel: clockwise degrees from straight down. */
function wagonUnitVector(angleDeg) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: Math.sin(rad), y: Math.cos(rad) };
}

/** Stats / scoring picker: standard polar degrees from center (SVG y-down). */
function zoneUnitVector(angleDeg) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: Math.cos(rad), y: Math.sin(rad) };
}

describe('shotZoneAngleToWagonWheel', () => {
  it('maps deep_cover to the same screen quadrant as the stats wagon wheel', () => {
    const zoneAngle = SHOT_ZONE_GEOMETRY.deep_cover.position.angleDeg;
    const wagonAngle = shotZoneAngleToWagonWheel(zoneAngle);
    const zone = zoneUnitVector(zoneAngle);
    const wagon = wagonUnitVector(wagonAngle);

    expect(zone.x).toBeGreaterThan(0);
    expect(zone.y).toBeGreaterThan(0);
    expect(wagon.x).toBeGreaterThan(0);
    expect(wagon.y).toBeGreaterThan(0);
    expect(wagon.x).toBeCloseTo(zone.x, 1);
    expect(wagon.y).toBeCloseTo(zone.y, 1);
  });

  it('maps long_on to the same screen quadrant as the stats wagon wheel', () => {
    const zoneAngle = SHOT_ZONE_GEOMETRY.long_on.position.angleDeg;
    const wagonAngle = shotZoneAngleToWagonWheel(zoneAngle);
    const zone = zoneUnitVector(zoneAngle);
    const wagon = wagonUnitVector(wagonAngle);

    expect(zone.x).toBeLessThan(0);
    expect(zone.y).toBeGreaterThan(0);
    expect(wagon.x).toBeLessThan(0);
    expect(wagon.y).toBeGreaterThan(0);
    expect(wagon.x).toBeCloseTo(zone.x, 1);
    expect(wagon.y).toBeCloseTo(zone.y, 1);
  });
});

describe('getShotZoneRunBreakdown', () => {
  it('groups runs by shot position zone, not off/leg side', () => {
    const balls = [
      { type: 'runs', shotDirection: 'square_leg', runs: 2 },
      { type: 'runs', shotDirection: 'deep_point', runs: 6 },
      { type: 'runs', shotDirection: 'third_man', runs: 4 },
    ];

    expect(getShotZoneRunBreakdown(balls)).toEqual([
      { id: 'deep_point', label: 'DEEP POINT', runs: 6, pct: 50 },
      { id: 'third_man', label: 'THIRD MAN', runs: 4, pct: 33 },
      { id: 'square_leg', label: 'SQUARE LEG', runs: 2, pct: 17 },
    ]);
  });

  it('accepts shot_position from raw ball payloads', () => {
    const balls = [{ type: 'runs', shot_position: 'deep_fine_leg', runs: 4 }];
    expect(getShotZoneRunBreakdown(balls)).toEqual([{ id: 'deep_fine_leg', label: 'DEEP FINE LEG', runs: 4, pct: 100 }]);
  });
});
