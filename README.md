# 小熊英语小屋

面向 5 岁、非英语母语儿童的**无文字** Web 英语口语应用。孩子听懂故事、操作物品、
帮小熊解决问题，反复用英语完成任务。

实现自《小熊英语小屋：儿童英语口语应用设计规划》。

```bash
pnpm install
pnpm dev        # http://localhost:5173
pnpm build
pnpm test       # vitest
```

> 麦克风需要 **HTTPS 或 localhost**。语音识别目前只有 Chrome / Edge 稳定支持；
> 其他浏览器会自动降级成点选模式，故事照样能完整玩完。

## 三条贯穿全局的规约

这三条不是风格偏好，是会决定代码长什么样的约束。改动前先读一遍。

**1. 孩子端一个英文字都不能出现。** 目标用户可能还不能独立阅读英文句子，
所以打在屏幕上的英文对她没有帮助，只会变成给大人看的装饰。
故事信息一律走角色动作、物品变化、声音和镜头节奏；句首支架是**播出来**的，
顺序提示是**图片卡 + 序号点**。唯一有文字的地方是开场闸门和家长端——它们是给大人看的。
连"家长"那颗按钮都不能写字，所以它是个无字图标 + 长按。

**2. 故事必须能继续，没有死胡同。** 识别失败、麦克风被拒、浏览器不支持、
孩子一言不发——每一条路径最后都通向下一拍。没有红叉、没有扣分、没有发音排名。
支架升到第三级会播完整示范并允许点击继续。

**3. 语言目标只写在内容层。** `src/content/*.ts` 之外不出现任何英文台词或判定规则。
将来把浏览器识别换成云端识别，要改的只有 `src/speech/recognition.ts`。

## 目录

```
src/
  app/          StartGate（音频解锁 + 权限说明）/ HomeScreen / StoryScreen / ParentReport
  content/      types.ts + 三个场景。所有英文台词、意图、支架都在这里
  speech/       recognition（只管录音状态）/ synthesis（录音优先，TTS 兜底）
                intentMatcher（三档判定，不做发音评分）
  state/        useBeatMachine（互动节点状态机）/ progress（localStorage）/ report
  components/   Bear（手绘角色）/ Backdrop / StoryStage / SpeechButton / SupportPrompt
                AdventureMap / HandDrawn（无 emoji 对应的道具与贴纸）
  assets/objects/   OpenMoji 素材（CC BY-SA 4.0，见该目录下 LICENSE.md）
```

## 互动节点状态机

每个节点走设计文档 §6 的流程，实现在 `src/state/useBeatMachine.ts`：

```
scene_intro → teacher_model → child_observe → child_invite → listening
→ intent_match → success_or_followup → support_1 → support_2 → fallback → scene_continue
```

`Beat` 和 `FollowUp` 在机器内部归一成同一种「一问」结构，所以追问可以任意嵌套，
而流程代码只认一种形状。

**难度递进**只在孩子**没到最高档**时触发：说了关键词 → 追问要完整句；
说了完整句 → 追问要原因。已经说到 challenge 档就直接推进故事——
不要在孩子做得最好的那一次还追加要求。

**三级支架**：换个说法重问并让正确物品轻轻跳 → 播句首 + 出图片顺序卡 →
播完整示范并允许点击继续。

## 意图匹配

`src/speech/intentMatcher.ts`。第一版不做发音评分，只回答一个问题：
孩子刚才说的话够不够推动故事？

- 接受关键词、短句、轻微语法错误、口音偏差、**中英混说**（归一化保留 CJK）
- 词形宽容：`rain` 命中 `raining`，`cookie` 命中 `cookies`
- 遍历识别器的全部候选，取命中档位最高的那条——浏览器对儿童声音的首选经常是错的
- **不用 `confidence` 做门限**。识别器对儿童声音的置信度天然偏低，
  拿它当对错判据等于惩罚目标用户；它只作为参考随结果带出去

内容层有一条不变量由测试守着：**每个意图的示范句、每条 fallback 的完整示范，
都必须能被它自己的意图表命中**。否则会出现"小熊示范了一句，孩子照着说，
系统还是判没听懂"。

## 语音：预生成音频 + 浏览器 TTS 兜底

孩子听到的每一句都是**预生成的音频文件**，浏览器自带 TTS 只在缺文件时兜底。

这不是为了音质。浏览器 TTS 的音色**由用户设备决定**——Mac 上是 Samantha、
Windows 上是 Zira、安卓上又是别的，语速和断句都不一样。预生成把音色、语速、
节奏钉死在构建产物里，孩子每次听到的小熊都是同一只（设计文档 §8.2）。
**代码一行都不用改**——`src/speech/synthesis.ts` 优先找音频，找不到才回落 TTS。

```bash
pnpm audio:extract   # 台词总览 → public/audio/LINES.md
pnpm audio:generate  # 生成音频 + 写 manifest（OpenRouter，约 $0.8 / 全量）
pnpm audio:verify    # 还差哪些？哪些生成了但已失效？
```

音频由 OpenRouter 的 `openai/gpt-audio` 生成，需要 `OPENROUTER_API_KEY`
（环境变量，或 `~/.dsh/.credentials.yaml` 的 `refs` 下）。**可以分批生成**：
manifest 里没有的句子自动走浏览器 TTS，做一个场景就能立刻听到效果。

每句台词按它在故事里的**角色**分配语气——提问要好奇，支架三不能有一丝责备。
语气表在 `scripts/audio-lines.ts` 的 `ROLE_TONE`，它会进 TTS 的系统提示词，
是真的会改变音频的参数，不是注释。

### 三个实测结论（改这部分之前先读）

都反直觉，所以写在这里而不只是埋在注释里：

1. **提示词结构决定成败。** 拿 6 句问句对比：直接把台词丢给模型让它照读
   **1/6**；包进 `<line>` 标签并强调「这不是在问你」**0/6**（反而更差）；
   把 user 轮写成「给台本配音」的指令 **6/6**。差别在于台词是否还处在
   「轮到你说话」的位置——前两种里 `Why do we need an umbrella?` 会被
   **回答**，而不是念出来。
2. **`gpt-audio-mini` 比 `gpt-audio` 贵 10 倍。** 同一句 5 词台词：
   full 用 72 token（$0.0041），mini 用满 16384 token 撞上限（$0.0394）。
   单价便宜但会跑飞。默认用 full。
3. **光核对文本不够。** 那次跑飞里模型回报的 transcript 是对的，音频却有
   16384 个 token。所以除了逐字校对，还有**时长合理性检查**和 `max_tokens` 闸。

### 校验查四件事，第三件最要紧

| 报告项 | 后果 |
|---|---|
| 还没生成 | 走浏览器 TTS，是进度不是错误 |
| manifest 指向的文件不存在 | 404 后静默回落 TTS |
| **manifest 里的台词内容层已经没有了** | **改了台词，旧音频再也播不到，那句悄悄变回浏览器 TTS** |
| 生成了但 manifest 没引用 | 白生成了，代码不会去找 |

第三项是唯一只能靠耳朵发现的失败，所以值得专门查。改过 `src/content/*.ts`
之后重跑 `pnpm audio:extract && pnpm audio:generate`——生成脚本会顺手删掉台词
已变更的旧音频。CI 里用 `node scripts/verify-audio.ts --strict`：「还没生成」
不算错，只有上表后三项会让它退出码 1。

## 家长端

首页右上角的小人图标**长按**约 1 秒打开。

报告记的是**语言任务**，不是识别成功率：七项行为观察直接对应设计文档 §13 的
第一版验证指标，所以家长看到的进展和团队要验证的是同一件事。
没有分数、没有正确率、没有与他人对比——产品里根本没有"错"这个状态。

## 已知边界

- 语音识别只在 Chrome / Edge 稳定；Safari / iOS 需要逐一实测
- 儿童声音和环境噪音会明显降低识别率，这是第一版接受的代价
- 不承诺离线识别和精确发音评分
- 进度存在 localStorage，换浏览器或清缓存即丢失；暂不支持多孩子档案
