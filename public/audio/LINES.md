# 小熊英语小屋 · 台词总览

本文件由 `scripts/extract-lines.ts` 从内容层生成，**不要手改**——改台词请改 `src/content/*.ts` 再重跑脚本。

全片共 **425** 处发声，按文本去重后是 **341** 句独立台词。（同一句话在多处复用的只生成一份音频，见下面「共用台词」。）

## 这份文档怎么用

- **审内容**：三个场景的英文台词按故事顺序摊平在这里，便于整体判断语言难度
- **看语气**：「语气」一列会进 TTS 的系统提示词，真的决定音频听起来什么样，不是注释
- **对文件名**：音频文件名由台词文本派生，与 `manifest.json` 的取值一一对应

**其中最要紧的一条语气**：支架三（`fallback`）是小熊自己把话说完，
语气里不能有一丝「你没说对」——孩子说不出来的那一刻，正是最容易被吓退的一刻。

## 生成音频

```bash
node scripts/generate-audio.ts              # 生成还缺的
node scripts/generate-audio.ts --voice coral --force   # 换音色重做
node scripts/verify-audio.ts               # 复核覆盖率与失效条目
```

`manifest.json` 里没有的句子会自动回落到浏览器 TTS，所以**可以分批生成**——先做一个场景也能立刻听到效果。

## 共用台词（跨场景复用，各生成一份）

| 文件名 | 台词 | 语气 | 出现在 |
|---|---|---|---|
| `you-can-start-like-this.mp3` | **You can start like this.** | 像要一起说出来那样，带点引导 | 小熊准备野餐·b1_food<br>小熊做早餐·b1_choose_food<br>小熊收玩具·b1_what_you_see<br>…共 6 处 |
| `start-like-this.mp3` | **Start like this.** | 像要一起说出来那样，带点引导 | 小熊准备野餐·b1_food·追问1<br>小熊准备野餐·b2_cup_blanket<br>小熊准备野餐·b3_sequence<br>…共 43 处 |
| `we-need-a.mp3` | **We need a ...** | 只念句首，尾音悬着等她接 | 小熊准备野餐·b2_cup_blanket<br>小熊的衣服出了问题·b4_too_small·追问1<br>小熊做早餐·b2_choose_tool |
| `nice-why-do-we-need-it.mp3` | **Nice. Why do we need it?** | 好奇、真的在问，不是考她 | 小熊准备野餐·b2_cup_blanket·追问1<br>小熊做早餐·b2_choose_tool·追问1 |
| `why-do-we-need-it-tell.mp3` | **Why do we need it? Tell me.** | 耐心，换个说法再问一次，不能有一丝责备 | 小熊准备野餐·b2_cup_blanket·追问1<br>小熊做早餐·b2_choose_tool·追问1 |
| `start-with-this-word.mp3` | **Start with this word.** | 像要一起说出来那样，带点引导 | 小熊准备野餐·b2_cup_blanket·追问1<br>小熊准备野餐·b3_sequence·追问1<br>小熊准备野餐·b4_rain·追问1<br>…共 16 处 |
| `because.mp3` | **Because ...** | 只念句首，尾音悬着等她接 | 小熊准备野餐·b2_cup_blanket·追问1<br>小熊的衣服出了问题·b5_alternative·追问1<br>小熊去超市·b3_which_one·追问1 |
| `first-we.mp3` | **First we ...** | 只念句首，尾音悬着等她接 | 小熊准备野餐·b3_sequence<br>小熊做早餐·b3_sequence |
| `and-then-what-happens-next.mp3` | **And then? What happens next?** | 好奇、真的在问，不是考她 | 小熊准备野餐·b3_sequence·追问1<br>小熊做早餐·b3_sequence·追问1 |
| `you-told-me-the-whole-order.mp3` | **You told me the whole order. Well done!** | 高兴但不夸张，别像游戏音效 | 小熊准备野餐·b3_sequence·追问1<br>小熊做早餐·b3_sequence·追问1 |
| `then-we.mp3` | **Then we ...** | 只念句首，尾音悬着等她接 | 小熊准备野餐·b3_sequence·追问1<br>小熊做早餐·b3_sequence·追问1 |
| `because-it-is.mp3` | **Because it is ...** | 只念句首，尾音悬着等她接 | 小熊准备野餐·b4_rain·追问1<br>小熊的衣服出了问题·b2_why |
| `why-do-i-need-it.mp3` | **Why do I need it?** | 好奇、真的在问，不是考她 | 小熊做早餐·b4_missing·追问1<br>小熊去超市·b4_forgot·追问1 |
| `i-can-see-a.mp3` | **I can see a ...** | 只念句首，尾音悬着等她接 | 小熊收玩具·b1_what_you_see<br>小熊逛动物园·b1_what_animal |

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
| `thats-a-very-good-reason.mp3` | **That's a very good reason!** | 高兴但不夸张，别像游戏音效 |
| `because-we-are-thirsty-good-thinking.mp3` | **Because we are thirsty. Good thinking!** | 轻松地自己说完，不要有"你没说对"的意味 |

### b3_sequence — The apple is dirty. What do we do first, and then what?

| 文件名 | 台词 | 语气 |
|---|---|---|
| `the-apple-is-dirty-what-do.mp3` | **The apple is dirty. What do we do first, and then what?** | 好奇、真的在问，不是考她 |
| `first-we-wash-the-apple-then.mp3` | **First we wash the apple, then we put it in the basket.** | 放慢、清楚，示范给她听 |
| `clean-and-packed-our-basket-is.mp3` | **Clean and packed! Our basket is ready.** | 高兴但不夸张，别像游戏音效 |
| `first-the-water-then-the-basket.mp3` | **First the water, then the basket. Can you tell me?** | 耐心，换个说法再问一次，不能有一丝责备 |
| `what-comes-after-washing.mp3` | **What comes after washing?** | 耐心，换个说法再问一次，不能有一丝责备 |
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

## 小熊做早餐

> 和小熊一起煎蛋、烤面包，把做早餐的顺序讲出来

### 整场

| 文件名 | 台词 | 语气 |
|---|---|---|
| `good-morning-i-am-so-hungry.mp3` | **Good morning! I am so hungry. Will you help me make breakfast?** | 热情、邀请，像朋友来敲门 |

### b1_choose_food — My kitchen is full of food. What should we eat for breakfast?

| 文件名 | 台词 | 语气 |
|---|---|---|
| `my-kitchen-is-full-of-food.mp3` | **My kitchen is full of food. What should we eat for breakfast?** | 好奇、真的在问，不是考她 |
| `you-can-say-lets-eat-the.mp3` | **You can say: Let's eat the egg.** | 放慢、清楚，示范给她听 |
| `yummy-good-choice.mp3` | **Yummy! Good choice.** | 高兴但不夸张，别像游戏音效 |
| `look-at-the-food-what-do.mp3` | **Look at the food. What do you want for breakfast?** | 耐心，换个说法再问一次，不能有一丝责备 |
| `lets-eat-the.mp3` | **Let's eat the ...** | 只念句首，尾音悬着等她接 |
| `lets-eat-the-egg-tap-the.mp3` | **Let's eat the egg. Tap the food you like!** | 轻松地自己说完，不要有"你没说对"的意味 |
| `good-can-you-say-it-in-2.mp3` | **Good! Can you say it in a big sentence? Let's eat the ...** | 好奇、真的在问，不是考她 |
| `lets-eat-it-i-will-get.mp3` | **Let's eat it! I will get the pan.** | 高兴但不夸张，别像游戏音效 |
| `try-with-me-lets-eat-the.mp3` | **Try with me. Let's eat the ... what?** | 耐心，换个说法再问一次，不能有一丝责备 |
| `lets-eat-the-egg-your-turn.mp3` | **Let's eat the egg. Your turn next time!** | 轻松地自己说完，不要有"你没说对"的意味 |

### b2_choose_tool — I cannot cook the egg with my paws! What do we need?

| 文件名 | 台词 | 语气 |
|---|---|---|
| `i-cannot-cook-the-egg-with.mp3` | **I cannot cook the egg with my paws! What do we need?** | 好奇、真的在问，不是考她 |
| `here-comes-the-pan.mp3` | **Here comes the pan!** | 高兴但不夸张，别像游戏音效 |
| `look-what-do-we-cook-the.mp3` | **Look. What do we cook the egg in?** | 耐心，换个说法再问一次，不能有一丝责备 |
| `we-need-a-pan-tap-it.mp3` | **We need a pan. Tap it!** | 轻松地自己说完，不要有"你没说对"的意味 |
| `that-is-exactly-right.mp3` | **That is exactly right!** | 高兴但不夸张，别像游戏音效 |
| `because-we.mp3` | **Because we ...** | 只念句首，尾音悬着等她接 |
| `because-we-cook-the-egg-good.mp3` | **Because we cook the egg. Good thinking!** | 轻松地自己说完，不要有"你没说对"的意味 |

### b3_sequence — The pan is hot and the egg is cold. What do we do first, and then what?

| 文件名 | 台词 | 语气 |
|---|---|---|
| `the-pan-is-hot-and-the.mp3` | **The pan is hot and the egg is cold. What do we do first, and then what?** | 好奇、真的在问，不是考她 |
| `first-we-cook-the-egg-then.mp3` | **First we cook the egg, then we put it on the plate.** | 放慢、清楚，示范给她听 |
| `it-smells-so-good-the-egg.mp3` | **It smells so good! The egg is ready.** | 高兴但不夸张，别像游戏音效 |
| `first-the-pan-then-the-plate.mp3` | **First the pan, then the plate. Can you tell me?** | 耐心，换个说法再问一次，不能有一丝责备 |
| `what-comes-after-cooking.mp3` | **What comes after cooking?** | 耐心，换个说法再问一次，不能有一丝责备 |
| `then-we-put-it-on-the.mp3` | **Then we put it on the plate!** | 轻松地自己说完，不要有"你没说对"的意味 |

### b4_missing — Oh! My mouth is very dry. Something is missing. What do I need?

| 文件名 | 台词 | 语气 |
|---|---|---|
| `oh-my-mouth-is-very-dry.mp3` | **Oh! My mouth is very dry. Something is missing. What do I need?** | 好奇、真的在问，不是考她 |
| `glug-glug-that-is-much-better.mp3` | **Glug glug! That is much better.** | 高兴但不夸张，别像游戏音效 |
| `my-mouth-is-dry-what-can.mp3` | **My mouth is dry. What can I drink?** | 耐心，换个说法再问一次，不能有一丝责备 |
| `you-need-some.mp3` | **You need some ...** | 只念句首，尾音悬着等她接 |
| `i-need-some-milk-tap-it.mp3` | **I need some milk. Tap it!** | 轻松地自己说完，不要有"你没说对"的意味 |
| `exactly-because-i-am-thirsty.mp3` | **Exactly! Because I am thirsty.** | 高兴但不夸张，别像游戏音效 |
| `my-mouth-is-dry-why-do.mp3` | **My mouth is dry. Why do I need it?** | 耐心，换个说法再问一次，不能有一丝责备 |
| `because-you-are.mp3` | **Because you are ...** | 只念句首，尾音悬着等她接 |
| `because-i-am-thirsty.mp3` | **Because I am thirsty!** | 轻松地自己说完，不要有"你没说对"的意味 |

### b5_retell — Breakfast is ready! Can you tell me what we made?

| 文件名 | 台词 | 语气 |
|---|---|---|
| `breakfast-is-ready-can-you-tell.mp3` | **Breakfast is ready! Can you tell me what we made?** | 好奇、真的在问，不是考她 |
| `you-remembered-the-whole-breakfast.mp3` | **You remembered the whole breakfast!** | 高兴但不夸张，别像游戏音效 |
| `look-at-the-plate-what-can.mp3` | **Look at the plate. What can you see?** | 耐心，换个说法再问一次，不能有一丝责备 |
| `we-made.mp3` | **We made ...** | 只念句首，尾音悬着等她接 |
| `we-made-an-egg-some-bread.mp3` | **We made an egg, some bread and a cup of milk!** | 轻松地自己说完，不要有"你没说对"的意味 |

### 整场

| 文件名 | 台词 | 语气 |
|---|---|---|
| `breakfast-is-ready-thank-you-for.mp3` | **Breakfast is ready! Thank you for cooking with me. You said so many words today!** | 满足、由衷地谢谢她 |

## 小熊收玩具

> 房间乱成一团，告诉小熊每样东西该放到哪里去

### 整场

| 文件名 | 台词 | 语气 |
|---|---|---|
| `oh-dear-look-at-my-room.mp3` | **Oh dear. Look at my room! Everything is on the floor. Can you help me tidy up?** | 热情、邀请，像朋友来敲门 |

### b1_what_you_see — My room is such a mess. What can you see on the floor?

| 文件名 | 台词 | 语气 |
|---|---|---|
| `my-room-is-such-a-mess.mp3` | **My room is such a mess. What can you see on the floor?** | 好奇、真的在问，不是考她 |
| `you-can-say-i-can-see.mp3` | **You can say: I can see a car.** | 放慢、清楚，示范给她听 |
| `you-are-right-what-a-mess.mp3` | **You are right. What a mess!** | 高兴但不夸张，别像游戏音效 |
| `look-at-the-floor-what-is.mp3` | **Look at the floor. What is there?** | 耐心，换个说法再问一次，不能有一丝责备 |
| `i-can-see-a-car-some.mp3` | **I can see a car, some blocks and a book. Tap one!** | 轻松地自己说完，不要有"你没说对"的意味 |
| `good-can-you-tell-me-one.mp3` | **Good! Can you tell me one more thing you see?** | 好奇、真的在问，不是考她 |
| `you-found-them-all.mp3` | **You found them all!** | 高兴但不夸张，别像游戏音效 |
| `look-again-what-else-is-on.mp3` | **Look again. What else is on the floor?** | 耐心，换个说法再问一次，不能有一丝责备 |
| `i-can-also-see-a.mp3` | **I can also see a ...** | 只念句首，尾音悬着等她接 |
| `i-can-see-a-robot-too.mp3` | **I can see a robot too!** | 轻松地自己说完，不要有"你没说对"的意味 |

### b2_car_in_box — Let us start with the car. Where does the car go?

| 文件名 | 台词 | 语气 |
|---|---|---|
| `let-us-start-with-the-car.mp3` | **Let us start with the car. Where does the car go?** | 好奇、真的在问，不是考她 |
| `you-can-say-put-the-car.mp3` | **You can say: Put the car in the box.** | 放慢、清楚，示范给她听 |
| `in-it-goes-one-toy-away.mp3` | **In it goes! One toy away.** | 高兴但不夸张，别像游戏音效 |
| `the-toy-box-is-open-where.mp3` | **The toy box is open. Where does the car go?** | 耐心，换个说法再问一次，不能有一丝责备 |
| `put-the-car.mp3` | **Put the car ...** | 只念句首，尾音悬着等她接 |
| `put-the-car-in-the-box.mp3` | **Put the car in the box. Tap the box!** | 轻松地自己说完，不要有"你没说对"的意味 |

### b3_book_and_blocks — Now the book. It does not go in the toy box. Where does the book go?

| 文件名 | 台词 | 语气 |
|---|---|---|
| `now-the-book-it-does-not.mp3` | **Now the book. It does not go in the toy box. Where does the book go?** | 好奇、真的在问，不是考她 |
| `you-can-say-put-the-book.mp3` | **You can say: Put the book on the bed.** | 放慢、清楚，示范给她听 |
| `on-the-bed-it-goes-now.mp3` | **On the bed it goes. Now I can read it tonight!** | 高兴但不夸张，别像游戏音效 |
| `a-book-is-not-a-toy.mp3` | **A book is not a toy. Where do we read it?** | 耐心，换个说法再问一次，不能有一丝责备 |
| `put-the-book.mp3` | **Put the book ...** | 只念句首，尾音悬着等她接 |
| `put-the-book-on-the-bed.mp3` | **Put the book on the bed. Tap the bed!** | 轻松地自己说完，不要有"你没说对"的意味 |
| `and-the-blocks-do-they-go.mp3` | **And the blocks? Do they go on the bed too?** | 好奇、真的在问，不是考她 |
| `right-the-blocks-go-in-the.mp3` | **Right! The blocks go in the box, not on the bed.** | 高兴但不夸张，别像游戏音效 |
| `blocks-are-toys-where-do-toys.mp3` | **Blocks are toys. Where do toys go?** | 耐心，换个说法再问一次，不能有一丝责备 |
| `the-blocks-go.mp3` | **The blocks go ...** | 只念句首，尾音悬着等她接 |
| `the-blocks-go-in-the-box.mp3` | **The blocks go in the box!** | 轻松地自己说完，不要有"你没说对"的意味 |

### b4_describe_teddy — Wait! I cannot find my teddy. Can you tell me what my teddy looks like?

| 文件名 | 台词 | 语气 |
|---|---|---|
| `wait-i-cannot-find-my-teddy.mp3` | **Wait! I cannot find my teddy. Can you tell me what my teddy looks like?** | 好奇、真的在问，不是考她 |
| `you-can-say-it-is-small.mp3` | **You can say: It is small and brown.** | 放慢、清楚，示范给她听 |
| `that-is-my-teddy-there-it.mp3` | **That is my teddy! There it is, under the bed!** | 高兴但不夸张，别像游戏音效 |
| `is-it-big-or-small-what.mp3` | **Is it big or small? What colour is it?** | 耐心，换个说法再问一次，不能有一丝责备 |
| `it-is.mp3` | **It is ...** | 只念句首，尾音悬着等她接 |
| `it-is-small-and-brown-let.mp3` | **It is small and brown. Let us look under the bed!** | 轻松地自己说完，不要有"你没说对"的意味 |

### b5_retell — My room is tidy! Can you tell me what we put away?

| 文件名 | 台词 | 语气 |
|---|---|---|
| `my-room-is-tidy-can-you.mp3` | **My room is tidy! Can you tell me what we put away?** | 好奇、真的在问，不是考她 |
| `you-remembered-every-single-one.mp3` | **You remembered every single one!** | 高兴但不夸张，别像游戏音效 |
| `look-around-what-did-we-put.mp3` | **Look around. What did we put away?** | 耐心，换个说法再问一次，不能有一丝责备 |
| `we-put-away.mp3` | **We put away ...** | 只念句首，尾音悬着等她接 |
| `we-put-away-the-car-the.mp3` | **We put away the car, the blocks, the book and my teddy!** | 轻松地自己说完，不要有"你没说对"的意味 |

### 整场

| 文件名 | 台词 | 语气 |
|---|---|---|
| `my-room-is-tidy-now-thank.mp3` | **My room is tidy now! Thank you. You told me where everything goes!** | 满足、由衷地谢谢她 |

## 给小狗洗澡

> 小狗在外面玩得一身泥，帮小熊把他洗干净

### 整场

| 文件名 | 台词 | 语气 |
|---|---|---|
| `look-who-is-back-my-puppy.mp3` | **Look who is back! My puppy played outside and now he is very dirty. Can you help me?** | 热情、邀请，像朋友来敲门 |

### b1_what_we_need — My puppy is covered in mud! What do we need to wash him?

| 文件名 | 台词 | 语气 |
|---|---|---|
| `my-puppy-is-covered-in-mud.mp3` | **My puppy is covered in mud! What do we need to wash him?** | 好奇、真的在问，不是考她 |
| `you-can-say-we-need-the.mp3` | **You can say: We need the bathtub.** | 放慢、清楚，示范给她听 |
| `good-idea-let-us-fill-the.mp3` | **Good idea! Let us fill the bathtub.** | 高兴但不夸张，别像游戏音效 |
| `he-is-so-muddy-what-washes.mp3` | **He is so muddy. What washes the mud away?** | 耐心，换个说法再问一次，不能有一丝责备 |
| `we-need-the.mp3` | **We need the ...** | 只念句首，尾音悬着等她接 |
| `we-need-the-bathtub-and-some.mp3` | **We need the bathtub and some soap. Tap one!** | 轻松地自己说完，不要有"你没说对"的意味 |

### b2_why_wash — My puppy does not want a bath. Why does he need one?

| 文件名 | 台词 | 语气 |
|---|---|---|
| `my-puppy-does-not-want-a.mp3` | **My puppy does not want a bath. Why does he need one?** | 好奇、真的在问，不是考她 |
| `exactly-in-you-go-puppy.mp3` | **Exactly. In you go, puppy!** | 高兴但不夸张，别像游戏音效 |
| `look-at-his-paws-why-does.mp3` | **Look at his paws. Why does he need a bath?** | 耐心，换个说法再问一次，不能有一丝责备 |
| `because-he-is.mp3` | **Because he is ...** | 只念句首，尾音悬着等她接 |
| `because-he-is-dirty.mp3` | **Because he is dirty!** | 轻松地自己说完，不要有"你没说对"的意味 |
| `and-where-did-he-get-so.mp3` | **And where did he get so dirty?** | 好奇、真的在问，不是考她 |
| `that-is-right-outside-in-the.mp3` | **That is right. Outside in the mud!** | 高兴但不夸张，别像游戏音效 |
| `he-was-not-inside-the-house.mp3` | **He was not inside the house. Where was he?** | 耐心，换个说法再问一次，不能有一丝责备 |
| `he-played.mp3` | **He played ...** | 只念句首，尾音悬着等她接 |
| `he-played-outside-in-the-mud.mp3` | **He played outside in the mud!** | 轻松地自己说完，不要有"你没说对"的意味 |

### b3_cheer_him_up — He is still scared of the water. What can we give him to make him happy?

| 文件名 | 台词 | 语气 |
|---|---|---|
| `he-is-still-scared-of-the.mp3` | **He is still scared of the water. What can we give him to make him happy?** | 好奇、真的在问，不是考她 |
| `you-can-say-give-him-the.mp3` | **You can say: Give him the duck.** | 放慢、清楚，示范给她听 |
| `splash-he-jumped-right-in.mp3` | **Splash! He jumped right in.** | 高兴但不夸张，别像游戏音效 |
| `look-which-one-is-a-toy.mp3` | **Look. Which one is a toy he would love?** | 耐心，换个说法再问一次，不能有一丝责备 |
| `give-him-the.mp3` | **Give him the ...** | 只念句首，尾音悬着等她接 |
| `give-him-the-duck-tap-it.mp3` | **Give him the duck. Tap it!** | 轻松地自己说完，不要有"你没说对"的意味 |
| `why-will-that-make-him-happy.mp3` | **Why will that make him happy?** | 好奇、真的在问，不是考她 |
| `you-understand-him-very-well.mp3` | **You understand him very well!** | 高兴但不夸张，别像游戏音效 |
| `what-do-puppies-love-doing.mp3` | **What do puppies love doing?** | 耐心，换个说法再问一次，不能有一丝责备 |
| `because-he-likes.mp3` | **Because he likes ...** | 只念句首，尾音悬着等她接 |
| `because-he-likes-to-play.mp3` | **Because he likes to play!** | 轻松地自己说完，不要有"你没说对"的意味 |

### b4_what_next — He is all clean now, but he is very wet. What do you think he will do next?

| 文件名 | 台词 | 语气 |
|---|---|---|
| `he-is-all-clean-now-but.mp3` | **He is all clean now, but he is very wet. What do you think he will do next?** | 好奇、真的在问，不是考她 |
| `watch-out-here-it-comes.mp3` | **Watch out! Here it comes!** | 高兴但不夸张，别像游戏音效 |
| `a-wet-puppy-always-does-the.mp3` | **A wet puppy always does the same thing. What is it?** | 耐心，换个说法再问一次，不能有一丝责备 |
| `i-think-he-will.mp3` | **I think he will ...** | 只念句首，尾音悬着等她接 |
| `i-think-he-will-shake.mp3` | **I think he will shake!** | 轻松地自己说完，不要有"你没说对"的意味 |
| `oh-no-he-shook-water-everywhere.mp3` | **Oh no, he shook water everywhere! Are we wet now too?** | 好奇、真的在问，不是考她 |
| `we-are-soaking-wet-what-a.mp3` | **We are soaking wet. What a funny puppy!** | 高兴但不夸张，别像游戏音效 |
| `look-at-us-are-we-dry.mp3` | **Look at us. Are we dry or wet?** | 耐心，换个说法再问一次，不能有一丝责备 |
| `yes-we-are.mp3` | **Yes, we are ...** | 只念句首，尾音悬着等她接 |
| `yes-we-are-wet-too.mp3` | **Yes, we are wet too!** | 轻松地自己说完，不要有"你没说对"的意味 |

### b5_retell — My puppy smells lovely now. Can you tell me what we used to wash him?

| 文件名 | 台词 | 语气 |
|---|---|---|
| `my-puppy-smells-lovely-now-can.mp3` | **My puppy smells lovely now. Can you tell me what we used to wash him?** | 好奇、真的在问，不是考她 |
| `you-remembered-every-single-thing.mp3` | **You remembered every single thing!** | 高兴但不夸张，别像游戏音效 |
| `look-around-the-tub-what-did.mp3` | **Look around the tub. What did we use?** | 耐心，换个说法再问一次，不能有一丝责备 |
| `we-used.mp3` | **We used ...** | 只念句首，尾音悬着等她接 |
| `we-used-the-bathtub-the-soap.mp3` | **We used the bathtub, the soap, a sponge and his duck!** | 轻松地自己说完，不要有"你没说对"的意味 |

### 整场

| 文件名 | 台词 | 语气 |
|---|---|---|
| `my-puppy-is-clean-and-happy.mp3` | **My puppy is clean and happy! Thank you for helping me wash him. You said so much today!** | 满足、由衷地谢谢她 |

## 小熊去超市

> 推着购物车，告诉小熊要买哪一样、为什么要它

### 整场

| 文件名 | 台词 | 语气 |
|---|---|---|
| `here-we-are-at-the-shop.mp3` | **Here we are at the shop! I have my cart. Will you help me find what we need?** | 热情、邀请，像朋友来敲门 |

### b1_what_to_buy — So many things here! What should we put in the cart?

| 文件名 | 台词 | 语气 |
|---|---|---|
| `so-many-things-here-what-should.mp3` | **So many things here! What should we put in the cart?** | 好奇、真的在问，不是考她 |
| `you-can-say-lets-get-the.mp3` | **You can say: Let's get the apple.** | 放慢、清楚，示范给她听 |
| `good-choice-in-the-cart.mp3` | **Good choice! In the cart.** | 高兴但不夸张，别像游戏音效 |
| `look-at-the-shelf-what-shall.mp3` | **Look at the shelf. What shall we buy?** | 耐心，换个说法再问一次，不能有一丝责备 |
| `lets-get-the.mp3` | **Let's get the ...** | 只念句首，尾音悬着等她接 |
| `lets-get-the-apple-tap-the.mp3` | **Let's get the apple. Tap the one you want!** | 轻松地自己说完，不要有"你没说对"的意味 |
| `good-say-it-in-a-big.mp3` | **Good! Say it in a big sentence for me. Let's get the ...** | 好奇、真的在问，不是考她 |
| `into-the-cart-it-goes.mp3` | **Into the cart it goes!** | 高兴但不夸张，别像游戏音效 |
| `try-with-me-lets-get-the.mp3` | **Try with me. Let's get the ... what?** | 耐心，换个说法再问一次，不能有一丝责备 |
| `lets-get-the-apple-your-turn.mp3` | **Let's get the apple. Your turn next time!** | 轻松地自己说完，不要有"你没说对"的意味 |

### b2_find_by_colour — I need the red one, but I cannot see it. Which one is red?

| 文件名 | 台词 | 语气 |
|---|---|---|
| `i-need-the-red-one-but.mp3` | **I need the red one, but I cannot see it. Which one is red?** | 好奇、真的在问，不是考她 |
| `that-is-the-one-thank-you.mp3` | **That is the one! Thank you.** | 高兴但不夸张，别像游戏音效 |
| `one-of-them-is-red-like.mp3` | **One of them is red like an apple. Which one?** | 耐心，换个说法再问一次，不能有一丝责备 |
| `the-is-red.mp3` | **The ... is red.** | 只念句首，尾音悬着等她接 |
| `the-tomato-is-red-tap-it.mp3` | **The tomato is red. Tap it!** | 轻松地自己说完，不要有"你没说对"的意味 |
| `clever-and-what-colour-is-the.mp3` | **Clever! And what colour is the carrot?** | 好奇、真的在问，不是考她 |
| `you-know-all-your-colours.mp3` | **You know all your colours!** | 高兴但不夸张，别像游戏音效 |
| `look-at-the-carrot-what-colour.mp3` | **Look at the carrot. What colour is it?** | 耐心，换个说法再问一次，不能有一丝责备 |
| `the-carrot-is.mp3` | **The carrot is ...** | 只念句首，尾音悬着等她接 |
| `the-carrot-is-orange.mp3` | **The carrot is orange!** | 轻松地自己说完，不要有"你没说对"的意味 |

### b3_which_one — We can only take one melon. Do you want the big one or the small one?

| 文件名 | 台词 | 语气 |
|---|---|---|
| `we-can-only-take-one-melon.mp3` | **We can only take one melon. Do you want the big one or the small one?** | 好奇、真的在问，不是考她 |
| `you-can-say-i-want-the.mp3` | **You can say: I want the big one because we are hungry.** | 放慢、清楚，示范给她听 |
| `good-pick-into-the-cart.mp3` | **Good pick! Into the cart.** | 高兴但不夸张，别像游戏音效 |
| `one-is-big-one-is-small.mp3` | **One is big, one is small. Which do you want?** | 耐心，换个说法再问一次，不能有一丝责备 |
| `i-want-the.mp3` | **I want the ...** | 只念句首，尾音悬着等她接 |
| `i-want-the-big-one-tap.mp3` | **I want the big one. Tap the one you like!** | 轻松地自己说完，不要有"你没说对"的意味 |
| `tell-me-why-you-picked-that.mp3` | **Tell me why you picked that one.** | 好奇、真的在问，不是考她 |
| `that-is-a-very-good-reason.mp3` | **That is a very good reason!** | 高兴但不夸张，别像游戏音效 |
| `why-that-one-and-not-the.mp3` | **Why that one and not the other?** | 耐心，换个说法再问一次，不能有一丝责备 |
| `because-we-can-share-it-good.mp3` | **Because we can share it. Good thinking!** | 轻松地自己说完，不要有"你没说对"的意味 |

### b4_forgot — Oh no! The cart is full but I cannot carry it all home. What did I forget?

| 文件名 | 台词 | 语气 |
|---|---|---|
| `oh-no-the-cart-is-full.mp3` | **Oh no! The cart is full but I cannot carry it all home. What did I forget?** | 好奇、真的在问，不是考她 |
| `got-it-now-everything-fits.mp3` | **Got it! Now everything fits.** | 高兴但不夸张，别像游戏音效 |
| `something-to-put-the-shopping-in.mp3` | **Something to put the shopping in. What is it?** | 耐心，换个说法再问一次，不能有一丝责备 |
| `you-need-a.mp3` | **You need a ...** | 只念句首，尾音悬着等她接 |
| `i-need-a-bag-tap-it.mp3` | **I need a bag. Tap it!** | 轻松地自己说完，不要有"你没说对"的意味 |
| `exactly-my-paws-are-full.mp3` | **Exactly! My paws are full.** | 高兴但不夸张，别像游戏音效 |
| `look-at-my-paws-how-will.mp3` | **Look at my paws. How will I carry all this?** | 耐心，换个说法再问一次，不能有一丝责备 |
| `because-you.mp3` | **Because you ...** | 只念句首，尾音悬着等她接 |
| `because-i-have-to-carry-it.mp3` | **Because I have to carry it all home!** | 轻松地自己说完，不要有"你没说对"的意味 |

### b5_retell — Time to go home! Can you tell me what we bought today?

| 文件名 | 台词 | 语气 |
|---|---|---|
| `time-to-go-home-can-you.mp3` | **Time to go home! Can you tell me what we bought today?** | 好奇、真的在问，不是考她 |
| `you-remembered-the-whole-list.mp3` | **You remembered the whole list!** | 高兴但不夸张，别像游戏音效 |
| `look-in-the-bag-what-did.mp3` | **Look in the bag. What did we buy?** | 耐心，换个说法再问一次，不能有一丝责备 |
| `we-bought.mp3` | **We bought ...** | 只念句首，尾音悬着等她接 |
| `we-bought-an-apple-a-tomato.mp3` | **We bought an apple, a tomato and a big melon!** | 轻松地自己说完，不要有"你没说对"的意味 |

### 整场

| 文件名 | 台词 | 语气 |
|---|---|---|
| `our-cart-is-full-thank-you.mp3` | **Our cart is full! Thank you for shopping with me. You told me exactly what to get!** | 满足、由衷地谢谢她 |

## 小熊逛动物园

> 在动物园里认一认这些动物，把它们的样子讲给小熊听

### 整场

| 文件名 | 台词 | 语气 |
|---|---|---|
| `we-are-at-the-zoo-look.mp3` | **We are at the zoo! Look at all the animals. Can you tell me what you see?** | 热情、邀请，像朋友来敲门 |

### b1_what_animal — Wow! Look over there. What animal can you see?

| 文件名 | 台词 | 语气 |
|---|---|---|
| `wow-look-over-there-what-animal.mp3` | **Wow! Look over there. What animal can you see?** | 好奇、真的在问，不是考她 |
| `you-can-say-i-can-see-2.mp3` | **You can say: I can see an elephant.** | 放慢、清楚，示范给她听 |
| `you-found-it-hello-elephant.mp3` | **You found it! Hello, elephant!** | 高兴但不夸张，别像游戏音效 |
| `look-over-there-which-animal-is.mp3` | **Look over there. Which animal is it?** | 耐心，换个说法再问一次，不能有一丝责备 |
| `i-can-see-an-elephant-tap.mp3` | **I can see an elephant. Tap the one you like!** | 轻松地自己说完，不要有"你没说对"的意味 |

### b2_describe_it — Look at the giraffe. What does she look like?

| 文件名 | 台词 | 语气 |
|---|---|---|
| `look-at-the-giraffe-what-does.mp3` | **Look at the giraffe. What does she look like?** | 好奇、真的在问，不是考她 |
| `you-can-say-she-is-very.mp3` | **You can say: She is very tall.** | 放慢、清楚，示范给她听 |
| `that-is-right-she-can-reach.mp3` | **That is right! She can reach the highest leaves.** | 高兴但不夸张，别像游戏音效 |
| `is-she-short-or-tall-look.mp3` | **Is she short or tall? Look at her neck.** | 耐心，换个说法再问一次，不能有一丝责备 |
| `she-is.mp3` | **She is ...** | 只念句首，尾音悬着等她接 |
| `she-is-very-tall-and-she.mp3` | **She is very tall and she has a long neck!** | 轻松地自己说完，不要有"你没说对"的意味 |
| `and-the-zebra-tell-me-about.mp3` | **And the zebra? Tell me about her too.** | 好奇、真的在问，不是考她 |
| `you-described-them-both.mp3` | **You described them both!** | 高兴但不夸张，别像游戏音效 |
| `look-at-her-coat-what-colours.mp3` | **Look at her coat. What colours do you see?** | 耐心，换个说法再问一次，不能有一丝责备 |
| `she-is-black-and-white.mp3` | **She is black and white!** | 轻松地自己说完，不要有"你没说对"的意味 |

### b3_where_is_it — Careful! Where is the snake? I cannot find it.

| 文件名 | 台词 | 语气 |
|---|---|---|
| `careful-where-is-the-snake-i.mp3` | **Careful! Where is the snake? I cannot find it.** | 好奇、真的在问，不是考她 |
| `there-you-are-snake-hiding-in.mp3` | **There you are, snake! Hiding in the shade.** | 高兴但不夸张，别像游戏音效 |
| `look-near-the-tree-is-it.mp3` | **Look near the tree. Is it up high or down low?** | 耐心，换个说法再问一次，不能有一丝责备 |
| `it-is-under-the.mp3` | **It is under the ...** | 只念句首，尾音悬着等她接 |
| `it-is-under-the-tree-tap.mp3` | **It is under the tree. Tap it!** | 轻松地自己说完，不要有"你没说对"的意味 |

### b4_feed_it — The monkey looks hungry. What should we give her?

| 文件名 | 台词 | 语气 |
|---|---|---|
| `the-monkey-looks-hungry-what-should.mp3` | **The monkey looks hungry. What should we give her?** | 好奇、真的在问，不是考她 |
| `you-can-say-give-her-the.mp3` | **You can say: Give her the banana.** | 放慢、清楚，示范给她听 |
| `munch-munch-she-loves-it.mp3` | **Munch munch! She loves it.** | 高兴但不夸张，别像游戏音效 |
| `which-food-is-right-for-a.mp3` | **Which food is right for a monkey?** | 耐心，换个说法再问一次，不能有一丝责备 |
| `give-her-the.mp3` | **Give her the ...** | 只念句首，尾音悬着等她接 |
| `give-her-the-banana-tap-it.mp3` | **Give her the banana. Tap it!** | 轻松地自己说完，不要有"你没说对"的意味 |
| `why-that-one-the-cookie-looks.mp3` | **Why that one? The cookie looks nice too.** | 好奇、真的在问，不是考她 |
| `you-are-right-cookies-are-for.mp3` | **You are right. Cookies are for bears, not monkeys!** | 高兴但不夸张，别像游戏音效 |
| `what-do-monkeys-eat-in-the.mp3` | **What do monkeys eat in the jungle?** | 耐心，换个说法再问一次，不能有一丝责备 |
| `because-monkeys.mp3` | **Because monkeys ...** | 只念句首，尾音悬着等她接 |
| `because-monkeys-love-bananas.mp3` | **Because monkeys love bananas!** | 轻松地自己说完，不要有"你没说对"的意味 |

### b5_retell — The zoo is closing. Can you tell me all the animals we saw today?

| 文件名 | 台词 | 语气 |
|---|---|---|
| `the-zoo-is-closing-can-you.mp3` | **The zoo is closing. Can you tell me all the animals we saw today?** | 好奇、真的在问，不是考她 |
| `you-remembered-every-single-animal.mp3` | **You remembered every single animal!** | 高兴但不夸张，别像游戏音效 |
| `think-back-which-animals-did-we.mp3` | **Think back. Which animals did we meet?** | 耐心，换个说法再问一次，不能有一丝责备 |
| `we-saw.mp3` | **We saw ...** | 只念句首，尾音悬着等她接 |
| `we-saw-an-elephant-a-giraffe.mp3` | **We saw an elephant, a giraffe, a monkey and a zebra!** | 轻松地自己说完，不要有"你没说对"的意味 |

### 整场

| 文件名 | 台词 | 语气 |
|---|---|---|
| `what-a-day-at-the-zoo.mp3` | **What a day at the zoo! Thank you for telling me about every animal. You are a wonderful talker!** | 满足、由衷地谢谢她 |

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
