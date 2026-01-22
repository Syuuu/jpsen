export type PhraseTone = "casual" | "polite" | "soft";
export type PhraseLevel = "easy" | "mid";

export type Phrase = {
  id: string;
  jp: string;
  cn: string;
  kana?: string;
  tags: string[];
  tone: PhraseTone;
  level: PhraseLevel;
  slots?: { key: string; examples: string[] }[];
  dialogue?: { a: string; b: string };
  dialogueCn?: { a: string; b: string };
  notes?: string;
};

const basePhrases: Phrase[] = [
  {
    id: "p001",
    jp: "今日ちょっと早めに上がってもいい？",
    cn: "今天可以稍微早一点下班吗？",
    kana: "きょう ちょっと はやめに あがっても いい？",
    tags: ["上班", "请求"],
    tone: "casual",
    level: "easy",
    dialogue: { a: "今日ちょっと早めに上がってもいい？", b: "うん、終わったら大丈夫だよ。" }
  },
  {
    id: "p002",
    jp: "あとでメッセージ送るね。",
    cn: "我等会儿给你发消息。",
    kana: "あとで めっせーじ おくるね",
    tags: ["朋友聊天"],
    tone: "casual",
    level: "easy"
  },
  {
    id: "p003",
    jp: "それ、今じゃなくても大丈夫？",
    cn: "那个，不是现在也可以吗？",
    tags: ["确认", "朋友聊天"],
    tone: "soft",
    level: "easy"
  },
  {
    id: "p004",
    jp: "すみません、レジはどこですか？",
    cn: "不好意思，收银台在哪里？",
    kana: "すみません れじは どこですか",
    tags: ["便利店"],
    tone: "polite",
    level: "easy"
  },
  {
    id: "p005",
    jp: "これ、温めてもらえますか？",
    cn: "这个可以帮我加热吗？",
    tags: ["便利店", "请求"],
    tone: "polite",
    level: "easy"
  },
  {
    id: "p006",
    jp: "今ちょっと手が離せないんだ。",
    cn: "我现在有点忙不开手。",
    tags: ["上班", "朋友聊天"],
    tone: "casual",
    level: "easy"
  },
  {
    id: "p007",
    jp: "それ、後回しでもいい？",
    cn: "那个可以先放一放吗？",
    tags: ["上班", "请求"],
    tone: "soft",
    level: "easy"
  },
  {
    id: "p008",
    jp: "ごめん、今日の飲み会は行けない。",
    cn: "抱歉，今天的聚会去不了。",
    tags: ["拒绝", "朋友聊天"],
    tone: "casual",
    level: "easy"
  },
  {
    id: "p009",
    jp: "今日は体調があまり良くなくて。",
    cn: "今天身体不太舒服。",
    tags: ["拒绝", "上班"],
    tone: "polite",
    level: "easy"
  },
  {
    id: "p010",
    jp: "また今度にしよう。",
    cn: "下次再说吧。",
    tags: ["拒绝", "朋友聊天"],
    tone: "casual",
    level: "easy"
  },
  {
    id: "p011",
    jp: "今、どこにいる？",
    cn: "你现在在哪？",
    tags: ["朋友聊天"],
    tone: "casual",
    level: "easy"
  },
  {
    id: "p012",
    jp: "駅に着いたら連絡して。",
    cn: "到车站了联系我。",
    tags: ["电车", "朋友聊天"],
    tone: "casual",
    level: "easy"
  },
  {
    id: "p013",
    jp: "電車、ちょっと遅れてるみたい。",
    cn: "电车好像有点晚点。",
    tags: ["电车"],
    tone: "casual",
    level: "easy"
  },
  {
    id: "p014",
    jp: "この近くでおすすめのご飯ある？",
    cn: "这附近有推荐的吃饭地方吗？",
    tags: ["旅行", "朋友聊天"],
    tone: "casual",
    level: "easy"
  },
  {
    id: "p015",
    jp: "ちょっと静かな場所に移ろうか。",
    cn: "要不要换个安静点的地方？",
    tags: ["朋友聊天"],
    tone: "soft",
    level: "easy"
  },
  {
    id: "p016",
    jp: "すみません、写真お願いできますか？",
    cn: "不好意思，可以帮忙拍照吗？",
    tags: ["旅行", "请求"],
    tone: "polite",
    level: "easy"
  },
  {
    id: "p017",
    jp: "これ、サイズ違いありますか？",
    cn: "这个有其他尺码吗？",
    tags: ["购物"],
    tone: "polite",
    level: "easy"
  },
  {
    id: "p018",
    jp: "試着してもいいですか？",
    cn: "可以试穿吗？",
    tags: ["购物"],
    tone: "polite",
    level: "easy"
  },
  {
    id: "p019",
    jp: "これ、迷ってるんだよね。",
    cn: "这个我在犹豫。",
    tags: ["购物", "朋友聊天"],
    tone: "casual",
    level: "easy"
  },
  {
    id: "p020",
    jp: "あと5分だけ待って！",
    cn: "再等我5分钟！",
    tags: ["朋友聊天"],
    tone: "casual",
    level: "easy"
  },
  {
    id: "p021",
    jp: "もしよかったら一緒にどう？",
    cn: "如果方便的话要不要一起？",
    tags: ["朋友聊天", "邀请"],
    tone: "soft",
    level: "easy"
  },
  {
    id: "p022",
    jp: "今日は早めに休みます。",
    cn: "今天我会早点休息。",
    tags: ["上班", "礼貌"],
    tone: "polite",
    level: "easy"
  },
  {
    id: "p023",
    jp: "ちょっと相談してもいい？",
    cn: "可以稍微商量一下吗？",
    tags: ["上班", "朋友聊天"],
    tone: "soft",
    level: "easy"
  },
  {
    id: "p024",
    jp: "その件、明日までにまとめます。",
    cn: "那件事我会在明天前整理好。",
    tags: ["上班"],
    tone: "polite",
    level: "mid"
  },
  {
    id: "p025",
    jp: "ちょっと確認させてもらってもいいですか？",
    cn: "可以让我确认一下吗？",
    tags: ["上班", "请求"],
    tone: "polite",
    level: "mid"
  },
  {
    id: "p026",
    jp: "今の言い方、きつかったかも。",
    cn: "刚刚那样说可能有点重。",
    tags: ["道歉", "朋友聊天"],
    tone: "soft",
    level: "mid"
  },
  {
    id: "p027",
    jp: "気にさせちゃってごめん。",
    cn: "让你担心了，对不起。",
    tags: ["道歉", "朋友聊天"],
    tone: "soft",
    level: "easy"
  },
  {
    id: "p028",
    jp: "急に頼んでごめんね。",
    cn: "突然拜托你，不好意思。",
    tags: ["道歉", "请求"],
    tone: "soft",
    level: "easy"
  },
  {
    id: "p029",
    jp: "その日は予定が入っちゃってて。",
    cn: "那天已经有安排了。",
    tags: ["拒绝", "朋友聊天"],
    tone: "soft",
    level: "mid"
  },
  {
    id: "p030",
    jp: "また落ち着いたら連絡するね。",
    cn: "等我忙完再联系你。",
    tags: ["朋友聊天"],
    tone: "soft",
    level: "mid"
  },
  {
    id: "p031",
    jp: "ちょっとだけ聞きたいことがあるんだけど。",
    cn: "有点想问你的事情。",
    tags: ["朋友聊天"],
    tone: "soft",
    level: "mid"
  },
  {
    id: "p032",
    jp: "それ、今度詳しく教えて。",
    cn: "那个下次详细告诉我。",
    tags: ["朋友聊天"],
    tone: "casual",
    level: "easy"
  },
  {
    id: "p033",
    jp: "ここ、空いてますか？",
    cn: "这里有人坐吗？",
    tags: ["电车", "旅行"],
    tone: "polite",
    level: "easy"
  },
  {
    id: "p034",
    jp: "すみません、もう一回言ってもらえますか？",
    cn: "不好意思，可以再说一遍吗？",
    tags: ["请求", "朋友聊天"],
    tone: "polite",
    level: "easy"
  },
  {
    id: "p035",
    jp: "今はちょっと難しいかも。",
    cn: "现在可能有点难。",
    tags: ["拒绝", "朋友聊天"],
    tone: "soft",
    level: "easy"
  },
  {
    id: "p036",
    jp: "今度はこっちで会おう。",
    cn: "下次在这边见吧。",
    tags: ["朋友聊天"],
    tone: "casual",
    level: "easy"
  },
  {
    id: "p037",
    jp: "予定、ずれても大丈夫？",
    cn: "行程晚一点也可以吗？",
    tags: ["朋友聊天", "确认"],
    tone: "soft",
    level: "mid"
  },
  {
    id: "p038",
    jp: "今日は静かに過ごしたい気分。",
    cn: "今天想安静地待着。",
    tags: ["朋友聊天"],
    tone: "soft",
    level: "mid"
  },
  {
    id: "p039",
    jp: "急ぎじゃないから、落ち着いたらでいいよ。",
    cn: "不急，等你方便的时候就好。",
    tags: ["朋友聊天", "体贴"],
    tone: "soft",
    level: "mid"
  },
  {
    id: "p040",
    jp: "そのままで十分かわいいよ。",
    cn: "那样就已经很可爱了。",
    tags: ["朋友聊天", "夸奖"],
    tone: "soft",
    level: "easy"
  },
  {
    id: "p041",
    jp: "今日は混んでるから、別の店にしよう。",
    cn: "今天很挤，换一家吧。",
    tags: ["朋友聊天", "外出"],
    tone: "casual",
    level: "easy"
  },
  {
    id: "p042",
    jp: "その話、あとでゆっくり聞かせて。",
    cn: "那件事等会儿慢慢跟我说。",
    tags: ["朋友聊天"],
    tone: "soft",
    level: "mid"
  },
  {
    id: "p043",
    jp: "今日のミーティング、何時からでしたっけ？",
    cn: "今天的会议是几点来着？",
    tags: ["上班"],
    tone: "polite",
    level: "easy"
  },
  {
    id: "p044",
    jp: "その資料、共有してもらえると助かります。",
    cn: "能帮忙共享一下资料就太好了。",
    tags: ["上班", "请求"],
    tone: "polite",
    level: "mid"
  },
  {
    id: "p045",
    jp: "今週はちょっとバタバタしてて。",
    cn: "这周有点忙乱。",
    tags: ["上班", "朋友聊天"],
    tone: "casual",
    level: "mid"
  },
  {
    id: "p046",
    jp: "この辺で一旦区切ろうか。",
    cn: "先在这里告一段落吧。",
    tags: ["上班", "提案"],
    tone: "soft",
    level: "mid"
  },
  {
    id: "p047",
    jp: "今日は早めに失礼します。",
    cn: "我今天先走了。",
    tags: ["上班", "礼貌"],
    tone: "polite",
    level: "easy"
  },
  {
    id: "p048",
    jp: "今度、時間あるときに教えて。",
    cn: "下次有空的时候告诉我。",
    tags: ["朋友聊天"],
    tone: "soft",
    level: "easy"
  },
  {
    id: "p049",
    jp: "それ、めっちゃいいね。",
    cn: "那个超棒。",
    tags: ["朋友聊天", "夸奖"],
    tone: "casual",
    level: "easy"
  },
  {
    id: "p050",
    jp: "ちょっと風に当たりたい。",
    cn: "想稍微吹吹风。",
    tags: ["朋友聊天", "外出"],
    tone: "casual",
    level: "mid"
  },
  {
    id: "p051",
    jp: "この辺、初めてなんだ。",
    cn: "我第一次来这附近。",
    tags: ["旅行", "朋友聊天"],
    tone: "casual",
    level: "easy"
  },
  {
    id: "p052",
    jp: "駅までの道、合ってる？",
    cn: "去车站的路走对了吗？",
    tags: ["电车", "旅行"],
    tone: "casual",
    level: "easy"
  },
  {
    id: "p053",
    jp: "次の駅で降りればいいんだよね？",
    cn: "我在下一站下车就行吧？",
    tags: ["电车", "确认"],
    tone: "soft",
    level: "easy"
  },
  {
    id: "p054",
    jp: "この電車、快速だから気をつけて。",
    cn: "这趟车是快速车，要注意。",
    tags: ["电车"],
    tone: "casual",
    level: "mid"
  },
  {
    id: "p055",
    jp: "今から向かうところ。",
    cn: "我现在正在过去的路上。",
    tags: ["朋友聊天"],
    tone: "casual",
    level: "easy"
  },
  {
    id: "p056",
    jp: "それ、どういう意味？",
    cn: "那个是什么意思？",
    tags: ["朋友聊天"],
    tone: "casual",
    level: "easy"
  },
  {
    id: "p057",
    jp: "もう少しだけ待ってもらえる？",
    cn: "可以再等我一会儿吗？",
    tags: ["朋友聊天", "请求"],
    tone: "soft",
    level: "easy"
  },
  {
    id: "p058",
    jp: "それ、今度一緒にやろう。",
    cn: "那个下次一起做吧。",
    tags: ["朋友聊天", "邀请"],
    tone: "casual",
    level: "easy"
  },
  {
    id: "p059",
    jp: "今日はちょっと気分転換したい。",
    cn: "今天想换换心情。",
    tags: ["朋友聊天"],
    tone: "soft",
    level: "mid"
  },
  {
    id: "p060",
    jp: "その件、後で電話してもいい？",
    cn: "那件事我之后打电话可以吗？",
    tags: ["朋友聊天", "确认"],
    tone: "soft",
    level: "mid"
  },
  {
    id: "p061",
    jp: "明日のテスト、範囲どこまで？",
    cn: "明天的考试范围到哪里？",
    tags: ["学校", "考试"],
    tone: "casual",
    level: "easy",
    dialogue: {
      a: "明日のテスト、範囲どこまで？",
      b: "教科書の三章までだよ。"
    }
  },
  {
    id: "p062",
    jp: "授業のあとで図書館に寄らない？",
    cn: "下课后要不要去图书馆？",
    tags: ["学校", "邀请"],
    tone: "soft",
    level: "easy",
    dialogue: {
      a: "授業のあとで図書館に寄らない？",
      b: "いいね、レポート進めよう。"
    }
  },
  {
    id: "p063",
    jp: "この問題、どう解けばいい？",
    cn: "这道题该怎么解？",
    tags: ["学校", "作业"],
    tone: "soft",
    level: "mid",
    dialogue: {
      a: "この問題、どう解けばいい？",
      b: "まず公式を当てはめてみよう。"
    }
  },
  {
    id: "p064",
    jp: "レポートの締め切り、延びたって聞いた。",
    cn: "听说报告的截止日期延后了。",
    tags: ["学校", "作业"],
    tone: "casual",
    level: "mid",
    dialogue: {
      a: "レポートの締め切り、延びたって聞いた。",
      b: "うん、来週の金曜までになったよ。"
    }
  },
  {
    id: "p065",
    jp: "部活の見学、今日行ってみる？",
    cn: "今天要不要去社团参观？",
    tags: ["学校", "社团"],
    tone: "casual",
    level: "easy",
    dialogue: {
      a: "部活の見学、今日行ってみる？",
      b: "行く！雰囲気を見てみたい。"
    }
  },
  {
    id: "p066",
    jp: "席、こっち空いてるよ。",
    cn: "这边的座位空着哦。",
    tags: ["学校", "课堂"],
    tone: "casual",
    level: "easy",
    dialogue: {
      a: "席、こっち空いてるよ。",
      b: "ありがとう、隣いい？"
    }
  },
  {
    id: "p067",
    jp: "先生に質問してもいいかな。",
    cn: "我可以问老师问题吗？",
    tags: ["学校", "课堂"],
    tone: "soft",
    level: "easy",
    dialogue: {
      a: "先生に質問してもいいかな。",
      b: "今のうちに聞いておこう。"
    }
  },
  {
    id: "p068",
    jp: "このサークル、活動は週何回？",
    cn: "这个社团每周活动几次？",
    tags: ["学校", "社团"],
    tone: "casual",
    level: "mid",
    dialogue: {
      a: "このサークル、活動は週何回？",
      b: "だいたい週2回くらいだよ。"
    }
  },
  {
    id: "p069",
    jp: "今日の課題、提出した？",
    cn: "今天的作业交了吗？",
    tags: ["学校", "作业"],
    tone: "casual",
    level: "easy",
    dialogue: {
      a: "今日の課題、提出した？",
      b: "さっきオンラインで出したよ。"
    }
  },
  {
    id: "p070",
    jp: "試験が終わったら、一緒にご飯行こう。",
    cn: "考试结束后一起去吃饭吧。",
    tags: ["学校", "朋友聊天"],
    tone: "soft",
    level: "easy",
    dialogue: {
      a: "試験が終わったら、一緒にご飯行こう。",
      b: "賛成！頑張ろう。"
    }
  }
];

const dialogueFallbacks: Record<PhraseTone, string> = {
  casual: "うん、いいよ。",
  polite: "はい、わかりました。",
  soft: "うん、大丈夫だよ。"
};

const dialogueCnFallbacks: Record<PhraseTone, string> = {
  casual: "嗯，可以啊。",
  polite: "好的，我明白了。",
  soft: "嗯，没问题。"
};

export const phrases: Phrase[] = basePhrases.map((phrase) => {
  const dialogue = phrase.dialogue ?? {
    a: phrase.jp,
    b: dialogueFallbacks[phrase.tone]
  };
  const dialogueCn = phrase.dialogueCn ?? {
    a: phrase.cn,
    b: dialogueCnFallbacks[phrase.tone]
  };
  return {
    ...phrase,
    dialogue,
    dialogueCn
  };
});

export const allTags = Array.from(new Set(phrases.flatMap((phrase) => phrase.tags))).sort();
