#!/usr/bin/env bash
# 拉取 OpenMoji 物品素材（CC BY-SA 4.0，见 src/assets/objects/LICENSE.md）。
# 只有物品用外部素材；小熊角色是手绘 SVG（src/components/Bear.tsx）。
set -euo pipefail
BASE="https://raw.githubusercontent.com/hfg-gmuend/openmoji/master/color/svg"
OUT="$(dirname "$0")/../src/assets/objects"

declare -a MAP=(
  "apple:1F34E"        "banana:1F34C"      "grapes:1F347"     "strawberry:1F353"
  "sandwich:1F96A"     "cookie:1F36A"      "juice:1F9C3"      "cup:1F964"
  "basket:1F9FA"       "umbrella:2602"     "ball:26BD"        "teddy:1F9F8"
  "sun:2600"           "rain:1F327"        "snow:1F328"       "cloud:2601"
  "tshirt:1F455"       "coat:1F9E5"        "boots:1F462"      "hat:1F9E2"
  "shorts:1FA73"       "scarf:1F9E3"       "sunglasses:1F576" "socks:1F9E6"
  "chair:1FA91"        "box:1F4E6"         "tree:1F333"       "dog:1F415"
  "couch:1F6CB"        "door:1F6AA"        "window:1FA9F"     "flower:1F337"
)

for entry in "${MAP[@]}"; do
  name="${entry%%:*}"; code="${entry##*:}"
  if [ -s "$OUT/$name.svg" ]; then echo "skip $name"; continue; fi
  if curl -fsSL --max-time 20 "$BASE/$code.svg" -o "$OUT/$name.svg"; then
    echo "ok   $name ($code)"
  else
    echo "FAIL $name ($code)" >&2; rm -f "$OUT/$name.svg"
  fi
done
