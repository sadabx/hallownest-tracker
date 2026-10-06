"""Match wiki Mapshot red location marks to the clean Hallownest map.

Requires Python packages opencv-python-headless and numpy. Only red-marked
Mapshots with a SIFT/RANSAC match confidence of at least 20 inliers are kept.
"""
import json
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
BASE_MAP = ROOT / "public/assets/maps/hallownest-clean.webp"
MAPSHOTS = ROOT / "public/assets/wiki-location-maps"
MANIFEST = ROOT / "src/data/wiki-location-pages.json"
OUTPUT = ROOT / "src/data/wiki-map-points.json"
MIN_INLIERS = 20

pages = json.loads(MANIFEST.read_text())
base = cv2.imread(str(BASE_MAP), cv2.IMREAD_GRAYSCALE)
if base is None:
    raise SystemExit(f"Could not read map: {BASE_MAP}")
sift = cv2.SIFT_create(nfeatures=8000)
base_keypoints, base_descriptors = sift.detectAndCompute(base, None)
matcher = cv2.FlannBasedMatcher(dict(algorithm=1, trees=5), dict(checks=100))
points = {}

for maps in pages.values():
    for mapshot in maps:
        path = MAPSHOTS / mapshot["file"]
        image = cv2.imread(str(path))
        if image is None:
            continue

        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
        red = cv2.inRange(hsv, (0, 100, 100), (12, 255, 255))
        red |= cv2.inRange(hsv, (168, 100, 100), (180, 255, 255))
        count, _, stats, centers = cv2.connectedComponentsWithStats(red)
        candidates = []
        for index in range(1, count):
            width = stats[index, cv2.CC_STAT_WIDTH]
            height = stats[index, cv2.CC_STAT_HEIGHT]
            area = stats[index, cv2.CC_STAT_AREA]
            if area > 25 and 0.65 < width / max(1, height) < 1.5:
                candidates.append((stats[index], centers[index]))
        if not candidates:
            continue
        marker_stats, marker_center = max(candidates, key=lambda candidate: candidate[0][cv2.CC_STAT_AREA])

        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        keypoints, descriptors = sift.detectAndCompute(gray, None)
        if descriptors is None:
            continue
        pairs = matcher.knnMatch(descriptors, base_descriptors, k=2)
        good = [first for first, second in pairs if first.distance < 0.72 * second.distance]
        if len(good) < 10:
            continue

        source = np.float32([keypoints[match.queryIdx].pt for match in good]).reshape(-1, 1, 2)
        target = np.float32([base_keypoints[match.trainIdx].pt for match in good]).reshape(-1, 1, 2)
        transform, inlier_mask = cv2.findHomography(source, target, cv2.RANSAC, 4.0)
        inliers = int(inlier_mask.sum()) if inlier_mask is not None else 0
        if transform is None or inliers < MIN_INLIERS:
            continue

        point = cv2.perspectiveTransform(np.float32([[marker_center]]), transform)[0][0]
        x, y = float(point[0]), float(point[1])
        if 0 <= x < base.shape[1] and 0 <= y < base.shape[0]:
            points[mapshot["file"]] = {
                "x": round(x, 1),
                "y": round(y, 1),
                "confidence": inliers,
            }

OUTPUT.write_text(json.dumps(points, indent=2) + "\n")
print(f"Wrote {len(points)} verified marked locations to {OUTPUT.relative_to(ROOT)}")
