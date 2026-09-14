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

  # 场景四 · 厨房做早餐
  "bread:1F35E"        "egg:1F95A"         "milk:1F95B"       "pan:1F373"
  "plate:1F37D"        "spoon:1F944"       "bowl:1F963"       "honey:1F36F"

  # 场景五 · 卧室收玩具
  # blocks（1F9F1）画出来是一堵红砖墙，不是儿童积木，所以改为手绘
  # （src/components/HandDrawn.tsx 的 Blocks），这里不收。
  "book:1F4D6"         "car:1F697"         "robot:1F916"
  "puzzle:1F9E9"       "bed:1F6CF"         "drum:1F941"       "crayon:1F58D"

  # 场景六 · 起居室给狗洗澡
  "bathtub:1F6C1"      "shower:1F6BF"      "soap:1F9FC"       "sponge:1F9FD"
  # comb（1FAE5）在 OpenMoji 里抓回来的是"未知码点"占位图（虚线圆脸），不是梳子，
  # 所以不收。洗澡场景靠 soap / sponge / shower / bucket 已经够用。
  "bone:1F9B4"         "duck:1F986"        "bucket:1FAA3"
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
