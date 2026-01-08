
import { Talent, GameEvent, Ending, TalentType } from './types';

// --- 天赋 (TALENTS) - 岛主特供版 ---
export const TALENTS: Talent[] = [
  { id: 'T01', name: '老司机', type: TalentType.SURVIVAL, rarity: 'RARE', description: '早年开过大巴车。驾驶技术一流，且能消化任何路边摊（吃垃圾不扣理智）。' },
  { id: 'T02', name: '资源大亨', type: TalentType.RESOURCE, rarity: 'LEGENDARY', description: '手里握着岛上的能源命脉。初始资金翻倍 (¥600w)，但更容易被“北方大国”盯上（曝光度+20%）。' },
  { id: 'T03', name: '电视狂人', type: TalentType.SOCIAL, rarity: 'COMMON', description: '每天必须上电视演讲4小时。直播类事件理智恢复翻倍，但时间消耗+1h。' },
  { id: 'T04', name: '神秘签证', type: TalentType.SPECIAL, rarity: 'LEGENDARY', description: '在东方某个雪国和沙漠古国有铁哥们。特定外交事件可以直接通关。' },
  { id: 'T05', name: '舞厅之王', type: TalentType.SKILL, rarity: 'COMMON', description: '不管发生什么，先跳一段舞。理智上限+20，由于身法灵活，逃跑成功率提升。' },
  { id: 'T06', name: '小鸟通灵', type: TalentType.SPECIAL, rarity: 'RARE', description: '声称能听懂小鸟说话（前任岛主显灵）。遇到“神秘/自然”事件时有特殊选项。' },
  { id: 'T07', name: '嘴炮王者', type: TalentType.SOCIAL, rarity: 'RARE', description: '只要骂“金发老头”就能涨粉丝。选择“硬刚”类选项时，理智大幅恢复，但曝光度激增。' },
  { id: 'T11', name: '替身使者', type: TalentType.SURVIVAL, rarity: 'LEGENDARY', description: '你有三个长得一样的替身。可以抵挡一次必死结局（风险100%时触发逃生）。' },
  { id: 'T13', name: '印钞机', type: TalentType.RESOURCE, rarity: 'COMMON', description: '没钱了就印！每回合自动获得¥10w，但通货膨胀导致所有商品价格+50%。' },
];

// --- 事件库 (EVENTS) - 岛主别跑版 ---
export const EVENTS: GameEvent[] = [
  // --- 热点事件：专机被扣 ---
  {
    id: 'EVENT_PLANE',
    title: '专机去哪了',
    description: '你的私人专机在邻国维护时，突然被北方大国的特工“合法没收”了！听说是一个金发老头亲自下的令。',
    tags: ['SKY', 'DANGER', 'CITY'],
    choices: [
      {
        text: '痛骂金发老头',
        type: 'AGGRESSIVE',
        effect: (s) => ({ risk: s.risk + 15, sanity: s.sanity + 20, time: s.time - 1 }),
        resultText: '你在电视上骂了两个小时。虽然没飞机了，但岛民们觉得你很酷！',
      },
      {
        text: '买架新的 ($80w)',
        type: 'NORMAL',
        moneyReq: 800000,
        effect: (s) => ({ money: s.money - 800000, time: s.time - 2 }),
        resultText: '你动用私房钱买了一架二手客机。希望能飞到目的地。',
      },
      {
        text: '[老司机] 开大巴走',
        type: 'TALENT',
        talentReq: 'T01', 
        effect: (s) => ({ risk: Math.max(0, s.risk - 10), sanity: s.sanity + 10, time: s.time - 3 }),
        resultText: '重操旧业！你亲自驾驶大巴车穿越丛林，不仅省钱，还赢得了吃瓜群众的欢呼。',
      }
    ]
  },
  // --- 热点事件：火星人约架 ---
  {
    id: 'EVENT_ELON',
    title: '火星人的挑战',
    description: '那个造火箭的科技狂人“M先生”在 404 平台上发了一张你骑驴的P图，并向你发起“角斗场格斗挑战”。',
    tags: ['DIGITAL', 'SOCIAL', 'SCAM'],
    choices: [
      {
        text: '接受挑战！',
        type: 'AGGRESSIVE',
        effect: (s) => ({ risk: s.risk + 25, sanity: s.sanity + 15, time: s.time - 1 }),
        resultText: '你回复：“地点随你挑！”虽然你根本没打算去，但这波流量赢麻了。',
      },
      {
        text: '全网封杀',
        type: 'SAFE',
        effect: (s) => ({ sanity: Math.min(100, s.sanity + 10), risk: Math.max(0, s.risk - 5), time: s.time - 1 }),
        resultText: '眼不见为净。你下令全岛封锁该平台。世界清静了。',
      },
      {
        text: '[资源] 收购平台',
        type: 'TALENT',
        talentReq: 'T02',
        effect: (s) => ({ money: s.money - 1000000, risk: s.risk + 30, time: s.time - 2 }),
        resultText: '你出价收购 404 平台。虽然资金被冻结了没买成，但M先生被你的“钞能力”吓了一跳。',
      }
    ]
  },
  // --- 热点事件：大停电 ---
  {
    id: 'EVENT_BLACKOUT',
    title: '全岛大停电',
    description: '整个首府陷入一片漆黑。反对者说是基建老化，你的幕僚说是北方大国发动的“电磁战”。',
    tags: ['DARK', 'CITY', 'MYSTERY'],
    choices: [
      {
        text: '是蜥蜴人干的',
        type: 'NORMAL',
        effect: (s) => ({ sanity: s.sanity - 10, risk: s.risk + 5, time: s.time - 1 }),
        resultText: '你再次声称是“经过基因改造的蜥蜴”咬断了电缆。大家看你的眼神像看傻子。',
      },
      {
        text: '趁黑转移',
        type: 'STEALTH',
        effect: (s) => ({ risk: Math.max(0, s.risk - 20), time: s.time - 2 }),
        resultText: '没有监控，没有路灯。这是逃跑的完美时机。',
      },
      {
        text: '[小鸟] 召唤雷电',
        type: 'TALENT',
        talentReq: 'T06',
        effect: (s) => ({ sanity: 100, time: s.time - 1 }),
        resultText: '你对着天空祈祷。居然真的打雷了！虽然电没来，但粉丝们把你当成了神。',
      }
    ]
  },
  // --- 热点事件：通货膨胀 ---
  {
    id: 'EVENT_INFLATION',
    title: '天价卷饼',
    description: '你饿了，想买个路边摊的卷饼。老板说：“不要岛币，只要美元或者黄金。”',
    tags: ['FOOD', 'CITY', 'RESOURCE'],
    choices: [
      {
        text: '付一车钞票',
        type: 'NORMAL',
        moneyReq: 10000, // 这里的钱其实贬值了
        effect: (s) => ({ money: s.money - 50000, time: s.time - 0.5 }), // 实际扣更多
        resultText: '你用推车推了一吨纸币给老板。老板勉强收下了，说只能买半个。',
      },
      {
        text: '直接征用',
        type: 'AGGRESSIVE',
        effect: (s) => ({ risk: s.risk + 10, sanity: s.sanity + 10, time: s.time - 0.5 }),
        resultText: '“这是为了岛屿的未来！”你吃得很香，但周围的围观群众握紧了拳头。',
      },
      {
        text: '[资源] 拿油换饼',
        type: 'TALENT',
        talentReq: 'T02',
        effect: (s) => ({ money: s.money + 5000, time: s.time - 0.5 }), // 反而回本一点
        resultText: '你倒了一桶原油给老板。在黑市上，这可是硬通货。',
      }
    ]
  },
  // --- 链式事件：悬赏令 ---
  {
    id: 'CHAIN_WANTED_01',
    title: '千万悬赏',
    description: '北方大国刚刚宣布：悬赏 1500 万抓捕你！你的保镖看你的眼神开始变得奇怪了。',
    tags: ['DANGER', 'HUMAN', 'CITY'],
    condition: (s) => !s.flags['bodyguard_check'],
    choices: [
      {
        text: '给保镖涨工资 ($20w)',
        type: 'SAFE',
        moneyReq: 200000,
        setFlag: 'bodyguard_check',
        effect: (s) => ({ money: s.money - 200000, risk: Math.max(0, s.risk - 10), time: s.time - 1 }),
        resultText: '有钱能使鬼推磨。保镖发誓效忠于你（只要美元还值钱）。',
      },
      {
        text: '先下手为强',
        type: 'AGGRESSIVE',
        setFlag: 'bodyguard_check',
        effect: (s) => ({ risk: s.risk + 10, sanity: s.sanity - 10, time: s.time - 1 }),
        resultText: '你解雇了所有人，换成了你老家的亲戚。虽然不专业，但至少不贪钱。',
      },
      {
        text: '反向悬赏金发老头',
        type: 'TALENT',
        talentReq: 'T07', // 嘴炮王者
        effect: (s) => ({ risk: s.risk + 30, sanity: s.sanity + 20, time: s.time - 1 }),
        resultText: '你宣布悬赏 20 头骆驼抓捕北方大统领。国际社会笑疯了，但你的铁粉很嗨。',
      }
    ]
  },
  // --- 事件：丛林密道 ---
  {
    id: 'EVENT_JUNGLE',
    title: '边境密道',
    description: '通往邻国的边境被封锁了，只有一条以前帮派留下的丛林密道。',
    tags: ['SURVIVAL', 'NATURE', 'STEALTH'],
    choices: [
      {
        text: '钻过去',
        type: 'STEALTH',
        effect: (s) => ({ time: s.time - 5, sanity: s.sanity - 15, risk: Math.max(0, s.risk - 20) }),
        resultText: '全是蚊子和泥巴！你弄丢了一只鞋，但成功绕过了无人机。',
      },
      {
        text: '[舞王] 灵活走位',
        type: 'TALENT',
        talentReq: 'T05',
        effect: (s) => ({ time: s.time - 3, sanity: s.sanity + 5 }),
        resultText: '你像跳舞一样避开了地雷和沼泽。甚至还和一只美洲豹合了影。',
      },
      {
        text: '我不走，我要空调',
        type: 'NORMAL',
        effect: (s) => ({ time: s.time - 1, risk: s.risk + 10 }),
        resultText: '你在边境的小屋吹空调。卫星很快就拍到了你的热成像。',
      }
    ]
  },
  // --- 事件：黑客攻击 ---
  {
    id: 'EVENT_CYBER',
    title: '岛民投票系统',
    description: '反对者黑入了系统，屏幕上的支持率数字正在疯狂跳动。如果结果出来是你输了，守卫队可能会倒戈。',
    tags: ['DIGITAL', 'CITY', 'DANGER'],
    choices: [
      {
        text: '拔网线！',
        type: 'AGGRESSIVE',
        effect: (s) => ({ risk: s.risk + 20, sanity: s.sanity + 10, time: s.time - 1 }),
        resultText: '物理断网是最安全的。现在你宣布获得了 108% 的支持率。',
      },
      {
        text: '请东方专家 ($10w)',
        type: 'NORMAL',
        moneyReq: 100000,
        effect: (s) => ({ money: s.money - 100000, risk: Math.max(0, s.risk - 10), time: s.time - 2 }),
        resultText: '专家来了，喝了两瓶伏特加，敲了几下键盘。数据显示你大获全胜。',
      },
      {
        text: '[神秘签证] 呼叫大哥',
        type: 'TALENT',
        talentReq: 'T04',
        effect: (s) => ({ risk: 0, sanity: 100, time: s.time - 1 }),
        resultText: '大哥发话了。没人敢动你。系统瞬间恢复“正常”。',
      }
    ]
  },
    // --- 事件：黑衣特工 ---
  {
    id: 'EVENT_CIA',
    title: '卖热狗的特工',
    description: '那个卖热狗的小贩看起来太壮了，而且他的耳机线漏出来了。绝对是黑衣人特工。',
    tags: ['HUMAN', 'DANGER', 'CITY'],
    choices: [
      {
        text: '买个热狗吃',
        type: 'NORMAL',
        effect: (s) => ({ sanity: s.sanity - 20, time: s.time - 0.5 }),
        resultText: '味道不错，就是有点像泻药。你在厕所蹲了半小时。',
      },
      {
        text: '当场抓捕',
        type: 'AGGRESSIVE',
        effect: (s) => ({ risk: s.risk + 20, money: s.money + 50000, time: s.time - 1 }),
        resultText: '搜出了护照和武器！你把他当成了谈判筹码，勒索了对方一笔钱。',
      },
      {
        text: '[舞王] 邀请跳舞',
        type: 'TALENT',
        talentReq: 'T05',
        effect: (s) => ({ risk: Math.max(0, s.risk - 10), sanity: s.sanity + 20 }),
        resultText: '特工懵了。他被迫和你跳了一支舞，甚至忘记了拔枪。尴尬化解了。',
      }
    ]
  }
];

// --- 结局 (ENDINGS) ---
export const ENDINGS: Ending[] = [
  {
    id: 'E_EXTRADITION',
    title: '穿上橙色囚服',
    description: '还是没跑掉。你在北方的联邦监狱里醒来，隔壁住着几个大毒枭。金发老头在404平台上说：“抓到了！Huge success！”',
    condition: (s) => s.risk >= 100
  },
  {
    id: 'E_COUP',
    title: '直升机上的推落',
    description: '你的手下背叛了你。理智归零的你，在最后一刻还在对着空气发表演讲。',
    condition: (s) => s.sanity <= 0
  },
  {
    id: 'E_BROKE',
    title: '街头卖艺',
    description: '岛屿破产了，你也破产了。你在邻国街头卖玉米饼，甚至没钱买回家的车票。',
    condition: (s) => s.money < 0
  },
  {
    id: 'E_RUSSIA',
    title: '雪国郊外的晚上',
    description: '在最后时刻，一架神秘的运输机接走了你。你在东方雪国的别墅里度过余生，虽然冷，但很安全。',
    condition: (s) => s.time <= 0 && s.risk < 80 && s.money > 1000000
  },
  {
    id: 'E_WIN',
    title: '永远的岛主',
    description: '72小时过去了，他们还是没能抓到你。你在阳台上挥手，底下的岛民高呼万岁。哪怕只是暂时的胜利。',
    condition: (s) => s.time <= 0
  }
];
