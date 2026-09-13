# 小熊英语小屋 · 录音脚本

本文件由 `scripts/extract-lines.ts` 从内容层生成，**不要手改**——改台词请改 `src/content/*.ts` 再重跑脚本。

全片共 **162** 处需要发声，去重后只需录 **132** 句。（同一句话在多处复用的只录一次，见下面「共用台词」。）

## 怎么录

- **一句一个文件**，文件名照下表，放进 `public/audio/`
- 格式 `.mp3`，单声道，44.1kHz 就够；音量统一，句子前后各留约 0.2 秒静音
- 语速比平常慢一点，但**不要一个词一个词地蹦**——孩子要听到的是自然句子的节奏
- 全程同一个人、同一支麦、同一个房间。换音色比音质差更让孩子出戏
- 念的对象是一个 5 岁孩子，不是摄像机。可以笑，可以停顿

**最要紧的一条**：这不是在播报正确答案。
支架三（`fallback`）是小熊自己把话说完，语气里不能有一丝「你没说对」——
孩子说不出来的那一刻，正是最容易被吓退的一刻。

## 录完之后

```bash
# 1. 音频放进 public/audio/
# 2. 生成 manifest（模板已经按文件名填好）
cp public/audio/manifest.template.json public/audio/manifest.json
# 3. 校验：哪些还没录、哪些录了但内容层已经改了
node scripts/verify-audio.ts
```

`manifest.json` 里没有的句子会自动回落到浏览器 TTS，所以**可以分批录**——先录一个场景也能立刻听到效果。

## 共用台词（跨场景复用，各录一次）

| 文件名 | 台词 | 语气 | 出现在 |
|---|---|---|---|
| `start-like-this.mp3` | **Start like this.** | 像要一起说出来那样，带点引导 | 小熊准备野餐·b1_food·追问1<br>小熊准备野餐·b2_cup_blanket<br>小熊准备野餐·b3_sequence<br>…共 18 处 |
| `we-need-a.mp3` | **We need a ...** | 只念句首，尾音悬着等她接 | 小熊准备野餐·b2_cup_blanket<br>小熊的衣服出了问题·b4_too_small·追问1 |
| `start-with-this-word.mp3` | **Start with this word.** | 像要一起说出来那样，带点引导 | 小熊准备野餐·b2_cup_blanket·追问1<br>小熊准备野餐·b3_sequence·追问1<br>小熊准备野餐·b4_rain·追问1<br>…共 6 处 |
| `because.mp3` | **Because ...** | 只念句首，尾音悬着等她接 | 小熊准备野餐·b2_cup_blanket·追问1<br>小熊的衣服出了问题·b5_alternative·追问1 |
| `because-it-is.mp3` | **Because it is ...** | 只念句首，尾音悬着等她接 | 小熊准备野餐·b4_rain·追问1<br>小熊的衣服出了问题·b2_why |

## 小熊准备野餐

> 帮小熊把野餐篮装好，再想想下雨要带什么

### 整场

| 文件名 | 台词 | 语气 |
|---|---|---|
| `hello-i-am-going-on-a.mp3` | **Hello! I am going on a picnic today. Will you help me get ready?** | 热情、邀请，像朋友来敲门 |

### b1_food — My basket is empty. What should we bring to eat?

| 文件名 | 台词 | 语气 |
|---|---|---|
| `my-basket-is-empty-what-should.mp3` | **My basket is empty. What should we bring to eat?** | 好奇、真的在问，不是考她 |
| `you-can-say-lets-take-the.mp3` | **You can say: Let's take the apple.** | 放慢、清楚，示范给她听 |
| `yummy-thank-you.mp3` | **Yummy! Thank you.** | 高兴但不夸张，别像游戏音效 |
| `look-at-the-food-what-should.mp3` | **Look at the food. What should we bring?** | 耐心，换个说法再问一次，不能有一丝责备 |
| `you-can-start-like-this.mp3` | **You can start like this.** | 像要一起说出来那样，带点引导 |
| `lets-take-the.mp3` | **Let's take the ...** | 只念句首，尾音悬着等她接 |
| `lets-take-the-apple-tap-the.mp3` | **Let's take the apple. Tap the food you like!** | 轻松地自己说完，不要有"你没说对"的意味 |
| `good-can-you-say-it-in.mp3` | **Good! Can you say it in a big sentence? Let's take the ...** | 好奇、真的在问，不是考她 |
| `lets-take-it-into-the-basket.mp3` | **Let's take it! Into the basket it goes.** | 高兴但不夸张，别像游戏音效 |
| `try-with-me-lets-take-the.mp3` | **Try with me. Let's take the ... what?** | 耐心，换个说法再问一次，不能有一丝责备 |
| `lets-take-the-apple-your-turn.mp3` | **Let's take the apple. Your turn next time!** | 轻松地自己说完，不要有"你没说对"的意味 |

### b2_cup_blanket — We have food. Is there anything else we need?

| 文件名 | 台词 | 语气 |
|---|---|---|
| `we-have-food-is-there-anything.mp3` | **We have food. Is there anything else we need?** | 好奇、真的在问，不是考她 |
| `into-the-basket.mp3` | **Into the basket!** | 高兴但不夸张，别像游戏音效 |
| `look-what-else-do-we-need.mp3` | **Look. What else do we need for a picnic?** | 耐心，换个说法再问一次，不能有一丝责备 |
| `we-need-a-cup-and-a.mp3` | **We need a cup and a blanket. Tap one!** | 轻松地自己说完，不要有"你没说对"的意味 |
| `nice-why-do-we-need-it.mp3` | **Nice. Why do we need it?** | 好奇、真的在问，不是考她 |
| `thats-a-very-good-reason.mp3` | **That's a very good reason!** | 高兴但不夸张，别像游戏音效 |
| `why-do-we-need-it-tell.mp3` | **Why do we need it? Tell me.** | 耐心，换个说法再问一次，不能有一丝责备 |
| `because-we-are-thirsty-good-thinking.mp3` | **Because we are thirsty. Good thinking!** | 轻松地自己说完，不要有"你没说对"的意味 |

### b3_sequence — The apple is dirty. What do we do first, and then what?

| 文件名 | 台词 | 语气 |
|---|---|---|
| `the-apple-is-dirty-what-do.mp3` | **The apple is dirty. What do we do first, and then what?** | 好奇、真的在问，不是考她 |
| `first-we-wash-the-apple-then.mp3` | **First we wash the apple, then we put it in the basket.** | 放慢、清楚，示范给她听 |
| `clean-and-packed-our-basket-is.mp3` | **Clean and packed! Our basket is ready.** | 高兴但不夸张，别像游戏音效 |
| `first-the-water-then-the-basket.mp3` | **First the water, then the basket. Can you tell me?** | 耐心，换个说法再问一次，不能有一丝责备 |
| `first-we.mp3` | **First we ...** | 只念句首，尾音悬着等她接 |
| `and-then-what-happens-next.mp3` | **And then? What happens next?** | 好奇、真的在问，不是考她 |
| `you-told-me-the-whole-order.mp3` | **You told me the whole order. Well done!** | 高兴但不夸张，别像游戏音效 |
| `what-comes-after-washing.mp3` | **What comes after washing?** | 耐心，换个说法再问一次，不能有一丝责备 |
| `then-we.mp3` | **Then we ...** | 只念句首，尾音悬着等她接 |
| `then-we-put-it-in-the.mp3` | **Then we put it in the basket!** | 轻松地自己说完，不要有"你没说对"的意味 |

### b4_rain — Oh no! Look at the sky. It is raining! What do we need now?

| 文件名 | 台词 | 语气 |
|---|---|---|
| `oh-no-look-at-the-sky.mp3` | **Oh no! Look at the sky. It is raining! What do we need now?** | 好奇、真的在问，不是考她 |
| `got-it-now-we-are-ready.mp3` | **Got it! Now we are ready for the rain.** | 高兴但不夸张，别像游戏音效 |
| `it-is-raining-what-keeps-us.mp3` | **It is raining. What keeps us dry?** | 耐心，换个说法再问一次，不能有一丝责备 |
| `we-need-an.mp3` | **We need an ...** | 只念句首，尾音悬着等她接 |
| `we-need-an-umbrella-tap-it.mp3` | **We need an umbrella. Tap it!** | 轻松地自己说完，不要有"你没说对"的意味 |
| `why-do-we-need-an-umbrella.mp3` | **Why do we need an umbrella?** | 好奇、真的在问，不是考她 |
| `exactly-because-it-is-raining.mp3` | **Exactly! Because it is raining.** | 高兴但不夸张，别像游戏音效 |
| `listen-can-you-hear-the-rain.mp3` | **Listen. Can you hear the rain? Why do we need it?** | 耐心，换个说法再问一次，不能有一丝责备 |
| `because-it-is-raining.mp3` | **Because it is raining!** | 轻松地自己说完，不要有"你没说对"的意味 |

### b5_retell — We are ready! Can you tell me what is in our basket?

| 文件名 | 台词 | 语气 |
|---|---|---|
| `we-are-ready-can-you-tell.mp3` | **We are ready! Can you tell me what is in our basket?** | 好奇、真的在问，不是考她 |
| `you-remembered-everything.mp3` | **You remembered everything!** | 高兴但不夸张，别像游戏音效 |
| `look-in-the-basket-what-can.mp3` | **Look in the basket. What can you see?** | 耐心，换个说法再问一次，不能有一丝责备 |
| `we-have.mp3` | **We have ...** | 只念句首，尾音悬着等她接 |
| `we-have-an-apple-a-cup.mp3` | **We have an apple, a cup, a blanket and an umbrella!** | 轻松地自己说完，不要有"你没说对"的意味 |

### 整场

| 文件名 | 台词 | 语气 |
|---|---|---|
| `what-a-wonderful-picnic-thank-you.mp3` | **What a wonderful picnic! Thank you for helping me. You talked so much today!** | 满足、由衷地谢谢她 |

## 小熊的衣服出了问题

> 看看天气，帮小熊挑一身合适的衣服

### 整场

| 文件名 | 台词 | 语气 |
|---|---|---|
| `good-morning-i-want-to-go.mp3` | **Good morning! I want to go outside. But what should I wear today?** | 热情、邀请，像朋友来敲门 |

### b1_weather_pick — Look out the window. It is rainy today. What are you going to wear?

| 文件名 | 台词 | 语气 |
|---|---|---|
| `look-out-the-window-it-is.mp3` | **Look out the window. It is rainy today. What are you going to wear?** | 好奇、真的在问，不是考她 |
| `you-can-say-i-am-going.mp3` | **You can say: I am going to wear the coat.** | 放慢、清楚，示范给她听 |
| `good-idea.mp3` | **Good idea!** | 高兴但不夸张，别像游戏音效 |
| `listen-to-the-rain-which-clothes.mp3` | **Listen to the rain. Which clothes keep us dry?** | 耐心，换个说法再问一次，不能有一丝责备 |
| `i-am-going-to-wear.mp3` | **I am going to wear ...** | 只念句首，尾音悬着等她接 |
| `i-am-going-to-wear-the.mp3` | **I am going to wear the coat. Tap the clothes!** | 轻松地自己说完，不要有"你没说对"的意味 |
| `say-it-in-a-big-sentence.mp3` | **Say it in a big sentence. I am going to wear ...** | 好奇、真的在问，不是考她 |
| `a-good-choice-for-a-rainy.mp3` | **A good choice for a rainy day!** | 高兴但不夸张，别像游戏音效 |
| `what-are-you-going-to-wear.mp3` | **What are you going to wear?** | 耐心，换个说法再问一次，不能有一丝责备 |
| `i-am-going-to-wear-the-2.mp3` | **I am going to wear the coat!** | 轻松地自己说完，不要有"你没说对"的意味 |

### b2_why — Why is the coat a good choice today?

| 文件名 | 台词 | 语气 |
|---|---|---|
| `why-is-the-coat-a-good.mp3` | **Why is the coat a good choice today?** | 好奇、真的在问，不是考她 |
| `that-is-right-the-coat-keeps.mp3` | **That is right. The coat keeps me dry.** | 高兴但不夸张，别像游戏音效 |
| `look-at-the-sky-how-is.mp3` | **Look at the sky. How is the weather?** | 耐心，换个说法再问一次，不能有一丝责备 |
| `because-it-is-rainy-the-coat.mp3` | **Because it is rainy! The coat keeps me dry.** | 轻松地自己说完，不要有"你没说对"的意味 |

### b3_try_on — Can I try it on now? Ask me nicely and I will put it on.

| 文件名 | 台词 | 语气 |
|---|---|---|
| `can-i-try-it-on-now.mp3` | **Can I try it on now? Ask me nicely and I will put it on.** | 好奇、真的在问，不是考她 |
| `here-i-go-look-at-me.mp3` | **Here I go... look at me!** | 高兴但不夸张，别像游戏音效 |
| `ask-me-to-try-it-on.mp3` | **Ask me to try it on.** | 耐心，换个说法再问一次，不能有一丝责备 |
| `can-i-try-it.mp3` | **Can I try it ...** | 只念句首，尾音悬着等她接 |
| `can-i-try-it-on-please.mp3` | **Can I try it on, please? Let me try!** | 轻松地自己说完，不要有"你没说对"的意味 |

### b4_too_small — Oh! Something is wrong. Look at the coat on me. How does it feel?

| 文件名 | 台词 | 语气 |
|---|---|---|
| `oh-something-is-wrong-look-at.mp3` | **Oh! Something is wrong. Look at the coat on me. How does it feel?** | 好奇、真的在问，不是考她 |
| `you-can-say-this-one-is.mp3` | **You can say: This one is too small.** | 放慢、清楚，示范给她听 |
| `you-noticed-it-really-is-too.mp3` | **You noticed! It really is too small.** | 高兴但不夸张，别像游戏音效 |
| `look-it-does-not-fit-is.mp3` | **Look, it does not fit. Is it too big or too small?** | 耐心，换个说法再问一次，不能有一丝责备 |
| `this-one-is-too.mp3` | **This one is too ...** | 只念句首，尾音悬着等她接 |
| `this-one-is-too-small.mp3` | **This one is too small!** | 轻松地自己说完，不要有"你没说对"的意味 |
| `you-are-right-so-what-should.mp3` | **You are right. So what should we do?** | 好奇、真的在问，不是考她 |
| `good-thinking-let-us-find-another.mp3` | **Good thinking! Let us find another one.** | 高兴但不夸张，别像游戏音效 |
| `the-coat-is-too-small-what.mp3` | **The coat is too small. What can we do?** | 耐心，换个说法再问一次，不能有一丝责备 |
| `we-need-a-bigger-one.mp3` | **We need a bigger one!** | 轻松地自己说完，不要有"你没说对"的意味 |

### b5_alternative — Here are my other clothes. What else can I wear in the rain?

| 文件名 | 台词 | 语气 |
|---|---|---|
| `here-are-my-other-clothes-what.mp3` | **Here are my other clothes. What else can I wear in the rain?** | 好奇、真的在问，不是考她 |
| `perfect-now-i-am-ready-to.mp3` | **Perfect! Now I am ready to go outside.** | 高兴但不夸张，别像游戏音效 |
| `look-at-all-my-clothes-which.mp3` | **Look at all my clothes. Which one is good for rain?** | 耐心，换个说法再问一次，不能有一丝责备 |
| `you-can-wear.mp3` | **You can wear ...** | 只念句首，尾音悬着等她接 |
| `you-can-wear-the-boots.mp3` | **You can wear the boots!** | 轻松地自己说完，不要有"你没说对"的意味 |
| `why-that-one.mp3` | **Why that one?** | 好奇、真的在问，不是考她 |
| `you-explained-it-so-well.mp3` | **You explained it so well!** | 高兴但不夸张，别像游戏音效 |
| `tell-me-why.mp3` | **Tell me why.** | 耐心，换个说法再问一次，不能有一丝责备 |
| `because-it-is-raining-outside.mp3` | **Because it is raining outside!** | 轻松地自己说完，不要有"你没说对"的意味 |

### 整场

| 文件名 | 台词 | 语气 |
|---|---|---|
| `now-i-am-dry-and-warm.mp3` | **Now I am dry and warm. You helped me choose. Thank you, my friend!** | 满足、由衷地谢谢她 |

## 球去了哪里

> 跟着线索找到小球，再把找的过程讲给小熊听

### 整场

| 文件名 | 台词 | 语气 |
|---|---|---|
| `oh-no-i-was-playing-with.mp3` | **Oh no! I was playing with my ball and now it is gone. Where did the ball go?** | 热情、邀请，像朋友来敲门 |

### b1_guess — I heard a bump over there. Where do you think the ball is?

| 文件名 | 台词 | 语气 |
|---|---|---|
| `i-heard-a-bump-over-there.mp3` | **I heard a bump over there. Where do you think the ball is?** | 好奇、真的在问，不是考她 |
| `you-can-say-i-think-it.mp3` | **You can say: I think it is under the chair.** | 放慢、清楚，示范给她听 |
| `let-us-look-under-the-chair.mp3` | **Let us look under the chair!** | 高兴但不夸张，别像游戏音效 |
| `listen-again-the-sound-came-from.mp3` | **Listen again. The sound came from over here.** | 耐心，换个说法再问一次，不能有一丝责备 |
| `i-think-it-is.mp3` | **I think it is ...** | 只念句首，尾音悬着等她接 |
| `i-think-it-is-under-the.mp3` | **I think it is under the chair. Tap the chair!** | 轻松地自己说完，不要有"你没说对"的意味 |
| `tell-me-the-whole-sentence-i.mp3` | **Tell me the whole sentence. I think it is ...** | 好奇、真的在问，不是考她 |
| `let-us-go-and-look.mp3` | **Let us go and look!** | 高兴但不夸张，别像游戏音效 |
| `where-is-it-under-behind-in.mp3` | **Where is it? Under? Behind? In?** | 耐心，换个说法再问一次，不能有一丝责备 |
| `i-think-it-is-under-the-2.mp3` | **I think it is under the chair!** | 轻松地自己说完，不要有"你没说对"的意味 |

### b2_rolled — It rolled away! Look, now it is somewhere new. Where is the ball now?

| 文件名 | 台词 | 语气 |
|---|---|---|
| `it-rolled-away-look-now-it.mp3` | **It rolled away! Look, now it is somewhere new. Where is the ball now?** | 好奇、真的在问，不是考她 |
| `yes-behind-the-sofa.mp3` | **Yes! Behind the sofa.** | 高兴但不夸张，别像游戏音效 |
| `look-at-the-sofa-is-the.mp3` | **Look at the sofa. Is the ball in front or behind?** | 耐心，换个说法再问一次，不能有一丝责备 |
| `it-is-behind-the.mp3` | **It is behind the ...** | 只念句首，尾音悬着等她接 |
| `it-is-behind-the-sofa.mp3` | **It is behind the sofa!** | 轻松地自己说完，不要有"你没说对"的意味 |
| `where-was-it-before-it-was.mp3` | **Where was it before? It was ... but now it is ...** | 好奇、真的在问，不是考她 |
| `you-told-me-before-and-now.mp3` | **You told me before and now. That is a big sentence!** | 高兴但不夸张，别像游戏音效 |
| `first-the-chair-now-the-sofa.mp3` | **First the chair. Now the sofa. Can you say both?** | 耐心，换个说法再问一次，不能有一丝责备 |
| `it-was-under-the-chair-but.mp3` | **It was under the chair, but now ...** | 只念句首，尾音悬着等她接 |
| `it-was-under-the-chair-but-2.mp3` | **It was under the chair, but now it is behind the sofa.** | 轻松地自己说完，不要有"你没说对"的意味 |

### b3_predict — The dog is running with my ball! Where will it go next?

| 文件名 | 台词 | 语气 |
|---|---|---|
| `the-dog-is-running-with-my.mp3` | **The dog is running with my ball! Where will it go next?** | 好奇、真的在问，不是考她 |
| `good-guess-let-us-follow-the.mp3` | **Good guess! Let us follow the dog.** | 高兴但不夸张，别像游戏音效 |
| `look-where-the-dog-is-going.mp3` | **Look where the dog is going. Guess!** | 耐心，换个说法再问一次，不能有一丝责备 |
| `maybe-it-is.mp3` | **Maybe it is ...** | 只念句首，尾音悬着等她接 |
| `maybe-it-will-go-in-the.mp3` | **Maybe it will go in the box!** | 轻松地自己说完，不要有"你没说对"的意味 |

### b4_found — There it is! Can you tell me where you found my ball?

| 文件名 | 台词 | 语气 |
|---|---|---|
| `there-it-is-can-you-tell.mp3` | **There it is! Can you tell me where you found my ball?** | 好奇、真的在问，不是考她 |
| `my-ball-thank-you-so-much.mp3` | **My ball! Thank you so much!** | 高兴但不夸张，别像游戏音效 |
| `look-inside-where-is-it.mp3` | **Look inside. Where is it?** | 耐心，换个说法再问一次，不能有一丝责备 |
| `i-found-it-in-the.mp3` | **I found it in the ...** | 只念句首，尾音悬着等她接 |
| `i-found-it-in-the-box.mp3` | **I found it in the box!** | 轻松地自己说完，不要有"你没说对"的意味 |

### b5_retell — Now tell me the whole story. How did we find the ball? First ... then ...

| 文件名 | 台词 | 语气 |
|---|---|---|
| `now-tell-me-the-whole-story.mp3` | **Now tell me the whole story. How did we find the ball? First ... then ...** | 好奇、真的在问，不是考她 |
| `first-it-was-under-the-chair.mp3` | **First it was under the chair. Then it went behind the sofa. Then the dog put it in the box.** | 放慢、清楚，示范给她听 |
| `what-a-story-you-said-so.mp3` | **What a story! You said so many sentences.** | 高兴但不夸张，别像游戏音效 |
| `look-at-the-pictures-the-chair.mp3` | **Look at the pictures. The chair, the sofa, the box.** | 耐心，换个说法再问一次，不能有一丝责备 |
| `first-it-was-under-the.mp3` | **First it was under the ...** | 只念句首，尾音悬着等她接 |
| `and-then-what-did-the-dog.mp3` | **And then? What did the dog do?** | 好奇、真的在问，不是考她 |
| `you-told-the-whole-story-by.mp3` | **You told the whole story by yourself!** | 高兴但不夸张，别像游戏音效 |
| `what-did-the-dog-do-with.mp3` | **What did the dog do with the ball?** | 耐心，换个说法再问一次，不能有一丝责备 |
| `then-the-dog.mp3` | **Then the dog ...** | 只念句首，尾音悬着等她接 |
| `then-the-dog-put-it-in.mp3` | **Then the dog put it in the box!** | 轻松地自己说完，不要有"你没说对"的意味 |

### 整场

| 文件名 | 台词 | 语气 |
|---|---|---|
| `you-found-it-and-you-told.mp3` | **You found it! And you told me the whole story. You are a great helper!** | 满足、由衷地谢谢她 |

---

### 角色一览

| 角色 | 含义 | 语气 |
|---|---|---|
| `opening` | 开场白 | 热情、邀请，像朋友来敲门 |
| `closing` | 收尾白 | 满足、由衷地谢谢她 |
| `prompt` | 提问 | 好奇、真的在问，不是考她 |
| `teacherModel` | 示范 | 放慢、清楚，示范给她听 |
| `success` | 做到了 | 高兴但不夸张，别像游戏音效 |
| `support1` | 支架一·换个说法再问 | 耐心，换个说法再问一次，不能有一丝责备 |
| `support2` | 支架二·引出句首 | 像要一起说出来那样，带点引导 |
| `starter` | 支架二·句首本身 | 只念句首，尾音悬着等她接 |
| `fallback` | 支架三·完整示范 | 轻松地自己说完，不要有"你没说对"的意味 |
