
import { Talent, GameEvent, Ending, TalentType } from './types';

// --- 天赋 (TALENTS) - V2.0 现实主义版 ---
export const TALENTS: Talent[] = [
  // 核心生存
  { id: 'T01', name: '铁胃', type: TalentType.SURVIVAL, rarity: 'RARE', description: '在丛林能吃青蛙，在贫民窟能吃过期罐头。食物类事件回血翻倍，免疫中毒。' },
  { id: 'T02', name: '瑞士户口', type: TalentType.RESOURCE, rarity: 'LEGENDARY', description: '初始资金 $500w。虽然账户常被冻结，但瘦死的骆驼比马大。' },
  { id: 'T03', name: '网红体质', type: TalentType.SOCIAL, rarity: 'COMMON', description: '发推特效果翻倍。在这个流量为王的时代，黑红也是红。' },
  { id: 'T04', name: '地堡建筑师', type: TalentType.SKILL, rarity: 'RARE', description: '在地堡 (Route C) 中，理智消耗减半，且能发现隐藏的物资。' },
  
  // 策略与技能
  { id: 'T05', name: '老实人', type: TalentType.SOCIAL, rarity: 'COMMON', description: '容易被诈骗(金钱损失+20%)，但在经过检查站/盘问时，通过率大幅提升。' },
  { id: 'T06', name: '黑客帝国', type: TalentType.SKILL, rarity: 'LEGENDARY', description: '精通加密货币和网络战。解锁所有“电子/网络”事件的隐藏选项。' },
  { id: 'T07', name: '时间管理', type: TalentType.TIME, rarity: 'RARE', description: '所有消耗时间的事件，时间消耗减少 0.5h。逃亡也要讲效率。' },
  { id: 'T08', name: '甚至连号', type: TalentType.SOCIAL, rarity: 'COMMON', description: '你的电话号码太尊贵。诈骗短信会变成送钱事件，但容易被定位。' },
  
  // 特殊
  { id: 'T09', name: '被迫害妄想', type: TalentType.SKILL, rarity: 'COMMON', description: '基础曝光度+10%，但能提前看见选项的风险值 (Risk)。' },
  { id: 'T10', name: '前特种兵', type: TalentType.SKILL, rarity: 'RARE', description: '战斗/突围事件必定成功，且不扣健康值。' },
  { id: 'T11', name: '演说家', type: TalentType.SOCIAL, rarity: 'LEGENDARY', description: '只要理智尚存，你就能忽悠任何人。社交类事件收益翻倍。' },
  { id: 'T12', name: '冷血动物', type: TalentType.SPECIAL, rarity: 'RARE', description: '无论发生什么悲剧，理智都不会扣除超过 5 点。' },
];

// --- 事件库 (EVENTS) - V2.0 ---
export const EVENTS: GameEvent[] = [
  // ================= FALLBACK: 兜底事件 (防止白屏) =================
  {
    id: 'U01_HUNGRY',
    title: '漫长的等待',
    description: '暂时没有突发状况。你躲在角落里，肚子开始咕咕叫。时间的流逝让你感到焦虑。',
    tags: ['SURVIVAL', 'TIME'],
    priority: 0, 
    repeatable: true, // 关键：允许重复触发
    choices: [
      {
        text: '原地休息',
        type: 'SAFE',
        healthCost: -2, // 回血
        sanityCost: 2,
        effect: (s) => ({ time: s.time - 1, health: s.health + 2, sanity: s.sanity - 2 }),
        resultText: '你闭目养神了一会儿。体力恢复了些许，但焦虑感加重了。',
      },
      {
        text: '翻看旧照片',
        type: 'NORMAL',
        effect: (s) => ({ time: s.time - 1, sanity: s.sanity + 5 }),
        resultText: '你看着以前阅兵的照片，那是你逝去的青春。',
      }
    ]
  },

  // ================= ACT 1: 起源 (The Beginning) =================
  {
    id: 'E100_START',
    title: '最后72小时',
    description: '警报拉响，总统府乱作一团。办公桌上只有三样东西能带走，这决定了你的逃亡路线。',
    tags: ['CITY', 'DANGER'],
    priority: 100,
    condition: (s) => s.time === 72,
    choices: [
      {
        text: '防弹奔驰车钥匙',
        type: 'AGGRESSIVE',
        setRoute: 'A',
        effect: (s) => ({ time: s.time - 1, risk: 20 }),
        resultText: '你选择了【Route A: 贫民窟之王】。目标：利用民意和黑帮，在混乱中隐身。',
      },
      {
        text: '旧军靴和砍刀',
        type: 'STEALTH',
        healthCost: 5,
        setRoute: 'B',
        effect: (s) => ({ time: s.time - 1, health: s.health - 5 }),
        resultText: '你选择了【Route B: 丛林法则】。目标：穿越达里恩地堑，活得像个野兽。',
      },
      {
        text: '核手提箱',
        type: 'SPECIAL',
        sanityCost: 10,
        setRoute: 'C',
        effect: (s) => ({ time: s.time - 1, sanity: s.sanity - 10 }),
        resultText: '你选择了【Route C: 地堡暴君】。目标：死守地下掩体，等待不存在的援军。',
      }
    ]
  },

  // ================= GLOBAL: 全局通用 (The World Against You) =================
  {
    id: 'G01_MUSK',
    title: '马斯克的嘲讽',
    description: '埃隆·马斯克在X上发了一张你被PS成小丑的表情包，配文“DOGE coin is more stable than his regime”（狗狗币都比他的政权稳）。',
    tags: ['DIGITAL', 'SOCIAL'],
    choices: [
      {
        text: '对喷',
        type: 'AGGRESSIVE',
        effect: (s) => ({ risk: s.risk + 10, fans: s.fans + 50000, time: s.time - 1 }),
        resultText: '你回了一句脏话。虽然暴露了IP，但你的粉丝数暴涨。黑红也是红。',
      },
      {
        text: '默默拉黑',
        type: 'SAFE',
        sanityCost: 5,
        effect: (s) => ({ sanity: s.sanity - 5, time: s.time - 0.5 }),
        resultText: '你关掉了屏幕。这一刻，你感到了前所未有的孤独。',
      }
    ]
  },
  {
    id: 'G02_DEEPFAKE',
    title: 'AI 换脸诈骗',
    description: '你在TikTok上刷到了“自己”的直播。AI生成的你在镜头前哭着推销“流亡者”牌洗发水。居然有三万人下单。',
    tags: ['DIGITAL', 'SCAM'],
    choices: [
      {
        text: '这也行？我也卖！',
        type: 'NORMAL',
        sanityCost: 5,
        effect: (s) => ({ money: s.money + 50000, risk: s.risk + 15, sanity: s.sanity - 5 }),
        resultText: '你加入了带货行列。真假美猴王同时在线，观众直呼过瘾。',
      },
      {
        text: '感到存在主义危机',
        type: 'SAFE',
        sanityCost: 10,
        effect: (s) => ({ sanity: s.sanity - 10, risk: Math.max(0, s.risk - 5) }),
        resultText: '如果是AI在替我坐牢就好了。你陷入了沉思。',
      }
    ]
  },
  {
    id: 'G03_KFC',
    title: '疯狂星期四',
    description: '今天是周四。路边垃圾桶上的广告单写着：“V我50，助你复国”。你曾是这个国家的特许经营权拥有者。',
    tags: ['FOOD', 'CITY'],
    choices: [
      {
        text: '想吃，买不起',
        type: 'NORMAL',
        healthCost: 5,
        sanityCost: 5,
        effect: (s) => ({ sanity: s.sanity - 5, health: s.health - 5 }),
        resultText: '你连个蛋挞都买不起。饥饿感让你更加清醒地认识到了阶级跌落。',
      },
      {
        text: '[铁胃] 翻垃圾桶',
        type: 'TALENT',
        talentReq: 'T01',
        effect: (s) => ({ health: s.health + 10, sanity: s.sanity + 5 }),
        resultText: '你找到半个全家桶。虽然凉了，但这是你三天来吃得最好的一顿。',
      }
    ]
  },
  {
    id: 'G05_STARLINK',
    title: '星链过境',
    description: '抬头看夜空，一串星链卫星像幽灵火车一样划过。你知道它们正在扫描地面的热源信号。',
    tags: ['SKY', 'DANGER'],
    choices: [
      {
        text: '泼灭篝火',
        type: 'STEALTH',
        healthCost: 5,
        effect: (s) => ({ health: s.health - 5, risk: Math.max(0, s.risk - 10) }),
        resultText: '寒冷刺骨，但至少你从热成像上消失了。',
      },
      {
        text: '竖中指',
        type: 'AGGRESSIVE',
        effect: (s) => ({ sanity: s.sanity + 5, risk: s.risk + 5 }),
        resultText: '虽然卫星看不见，但你心里爽多了。',
      }
    ]
  },

  // ================= ROUTE A: 贫民窟之王 (Barrio) =================
  {
    id: 'A02_CAR_MOD',
    title: '非法改装',
    description: '贫民窟的机械师要把你的防弹奔驰拆了卖废铁。你不得不答应让他把车顶的机枪改成烤肉架，以此换取保护。',
    tags: ['MECH', 'CITY'],
    route: 'A',
    choices: [
      {
        text: '同意改装',
        type: 'NORMAL',
        effect: (s) => ({ money: s.money + 20000, risk: Math.max(0, s.risk - 10) }),
        resultText: '这辆曾经象征权力的车，现在变成了全城最火的流动烧烤摊。',
      },
      {
        text: '我是总统！',
        type: 'AGGRESSIVE',
        healthCost: 20,
        effect: (s) => ({ health: s.health - 20, risk: s.risk + 20 }),
        resultText: '机械师给了你一扳手。“这里只有废铁，没有总统。”',
      }
    ]
  },
  {
    id: 'A03_YOUTUBER',
    title: '网红打卡点',
    description: '几个不怕死的欧美 YouTuber 溜进贫民窟做直播，标题是“寻找传说中的大胡子”。',
    tags: ['DIGITAL', 'DANGER'],
    route: 'A',
    choices: [
      {
        text: '躲进下水道',
        type: 'STEALTH',
        healthCost: 5,
        sanityCost: 10,
        effect: (s) => ({ health: s.health - 5, sanity: s.sanity - 10, risk: Math.max(0, s.risk - 10) }),
        resultText: '你和老鼠大眼瞪小眼。外面传来主播兴奋的声音：“家人们，刷游艇我进去看看！”',
      },
      {
        text: '收费合影',
        type: 'NORMAL',
        effect: (s) => ({ money: s.money + 5000, risk: s.risk + 30, fans: s.fans + 10000 }),
        resultText: '你戴上墨镜收了5000刀。直播间炸了，CIA的定位也锁定了这里。',
      }
    ]
  },
  {
    id: 'A04_GANG',
    title: '帮派谈判',
    description: '当地帮派老大“疯狗”找到了你。他表示如果你能把他列入未来的“特赦名单”，他就帮你搞定今晚的巡逻队。',
    tags: ['HUMAN', 'DANGER'],
    route: 'A',
    choices: [
      {
        text: '成交',
        type: 'AGGRESSIVE',
        effect: (s) => ({ fans: s.fans - 5000, risk: Math.max(0, s.risk - 20), karma: s.karma - 20 }),
        resultText: '你出卖了正义（虽然你也没多少），换来了今晚的平安。',
      },
      {
        text: '拒绝',
        type: 'NORMAL',
        healthCost: 20,
        effect: (s) => ({ health: s.health - 20, sanity: s.sanity + 10 }),
        resultText: '你被打了一顿，但守住了底线。虽然底线不能当饭吃。',
      }
    ]
  },

  // ================= ROUTE B: 丛林法则 (Jungle) =================
  {
    id: 'B01_COYOTE',
    title: '蛇头的涨价',
    description: '带路的蛇头把烟头弹在地上：“现在你是VIP客户，得加钱。你的人头比毒品值钱多了。”',
    tags: ['HUMAN', 'MONEY'],
    route: 'B',
    choices: [
      {
        text: '支付加价 ($50w)',
        type: 'NORMAL',
        moneyReq: 500000,
        effect: (s) => ({ money: s.money - 500000, time: s.time - 1 }),
        resultText: '你支付了这笔巨款。这也是一种通货膨胀。',
      },
      {
        text: '[特种兵] 物理讲价',
        type: 'TALENT',
        talentReq: 'T10',
        effect: (s) => ({ money: s.money + 10000, risk: s.risk - 5 }),
        resultText: '你夺过他的枪，不仅免了单，还反向打劫了他身上的现金。',
      }
    ]
  },
  {
    id: 'B02_MUD',
    title: '达里恩的泥沼',
    description: '你陷进了齐腰深的泥沼。如果以前，会有十个保镖趴在地上给你当桥。现在，你只能抓住一根看起来像毒蛇的树枝。',
    tags: ['SURVIVAL', 'NATURE'],
    route: 'B',
    choices: [
      {
        text: '挣扎爬出',
        type: 'NORMAL',
        healthCost: 15,
        effect: (s) => ({ health: s.health - 15, time: s.time - 2 }),
        resultText: '你像只泥猴一样爬了出来。你的一只意大利定制皮鞋永远留在了那里。',
      },
      {
        text: '呼叫随行难民',
        type: 'SOCIAL',
        moneyReq: 5000,
        effect: (s) => ({ money: s.money - 5000, fans: s.fans - 100 }),
        resultText: '你花钱雇人把你拉了出来。他们看你的眼神充满了鄙视。',
      }
    ]
  },
  {
    id: 'B04_FOOD',
    title: '丛林野味',
    description: '干粮吃完了。你抓到一只色彩斑斓的青蛙。根据贝爷的节目，这玩意儿去掉头应该能吃。',
    tags: ['FOOD', 'NATURE'],
    route: 'B',
    choices: [
      {
        text: '生吃',
        type: 'NORMAL',
        healthCost: 20,
        sanityCost: 10,
        effect: (s) => ({ health: s.health - 20, sanity: s.sanity - 10 }),
        resultText: '你吃下去了，然后开始呕吐。你的视野变成了紫色，看见了过世的奶奶。',
      },
      {
        text: '[铁胃] 嘎嘣脆',
        type: 'TALENT',
        talentReq: 'T01',
        healthCost: -10,
        effect: (s) => ({ health: s.health + 10, sanity: s.sanity + 5 }),
        resultText: '鸡肉味，嘎嘣脆。蛋白质是牛肉的五倍。',
      }
    ]
  },

  // ================= ROUTE C: 地堡暴君 (Bunker) =================
  {
    id: 'C02_PIZZA',
    title: '最后的披萨',
    description: '你试图点外卖送到秘密基地门口。外卖小哥接单了，但他同时也把坐标卖给了CIA。',
    tags: ['FOOD', 'DANGER'],
    route: 'C',
    choices: [
      {
        text: '出去拿外卖',
        type: 'AGGRESSIVE',
        healthCost: -10,
        effect: (s) => ({ risk: s.risk + 30, health: s.health + 10 }),
        resultText: '你拿到了披萨，五分钟后，战斧导弹的外卖也到了。基地防御受损。',
      },
      {
        text: '取消订单',
        type: 'SAFE',
        healthCost: 5,
        sanityCost: 10,
        effect: (s) => ({ sanity: s.sanity - 10, health: s.health - 5 }),
        resultText: '你饿着肚子听着肚子叫。这是最安全的饿肚子。',
      }
    ]
  },
  {
    id: 'C04_LOYALTY',
    title: '将军的加薪要求',
    description: '卫队队长进来敬了个礼，说兄弟们士气低落，要求用美元结算工资，而且要现结。',
    tags: ['MONEY', 'HUMAN'],
    route: 'C',
    choices: [
      {
        text: '给钱 ($50w)',
        type: 'NORMAL',
        moneyReq: 500000,
        effect: (s) => ({ money: s.money - 500000, risk: Math.max(0, s.risk - 10) }),
        resultText: '有钱能使鬼推磨。他敬礼的姿势标准多了。',
      },
      {
        text: '谈理想',
        type: 'AGGRESSIVE',
        healthCost: 20,
        effect: (s) => ({ risk: s.risk + 20, health: s.health - 20 }),
        resultText: '“理想不能当饭吃。”他朝天花板开了一枪。你吓得尿了裤子。',
      }
    ]
  },

  // ================= LOW SANITY (理智 < 30) =================
  {
    id: 'S02_MIRROR',
    title: '镜子里的陌生人',
    description: '你照镜子，镜子里的人没有胡子，穿着橙色囚服，正在纽约的监狱里吃三明治。',
    tags: ['DARK'],
    condition: (s) => s.sanity < 30,
    priority: 80,
    repeatable: true,
    choices: [
      {
        text: '砸碎镜子',
        type: 'AGGRESSIVE',
        healthCost: 5,
        effect: (s) => ({ health: s.health - 5, sanity: s.sanity + 5 }),
        resultText: '手被划破了，但那个囚犯消失了。',
      },
      {
        text: '问他好不好吃',
        type: 'NORMAL',
        sanityCost: 10,
        effect: (s) => ({ sanity: s.sanity - 10 }),
        resultText: '他笑了笑，递给你半个三明治。你伸手去拿，撞到了玻璃。',
      }
    ]
  },
];

// --- 结局 (ENDINGS) - V2.0 ---
export const ENDINGS: Ending[] = [
  // 失败结局
  {
    id: 'E_DEAD',
    title: '历史的尘埃',
    description: '你倒在了泥泞里。没有葬礼，没有国旗。只有路透社的一条简讯：“突发：前总统被确认身亡。”两分钟后，这条新闻被一条“猫咪跳舞”的视频顶下去了。',
    condition: (s) => s.health <= 0
  },
  {
    id: 'E_EXTRADITION',
    title: '引渡专机',
    description: '你被戴上了头套。你闻到了熟悉的航空燃油味。空姐甜美的声音响起：“欢迎乘坐美联航，本次航班直飞纽约南区法院。”',
    condition: (s) => s.risk >= 100
  },
  {
    id: 'E_INSANE',
    title: '疯人院演讲',
    description: '理智归零。你坐在路边对着空气发表演讲。警察甚至没给你戴手铐，只是温柔地给你披上了毛毯，送你去了该去的地方。',
    condition: (s) => s.sanity <= 0
  },
  {
    id: 'E_BROKE',
    title: '街头乞丐',
    description: '没钱了。昔日的独裁者，如今在哥伦比亚街头卖玉米饼。路人纷纷投来同情的硬币，你居然觉得比当总统轻松。',
    condition: (s) => s.money < 0
  },

  // 成功结局
  {
    id: 'E_SUNRISE',
    title: '海岛日出',
    description: '小船靠岸了。这个岛在地图上不存在。你拿出仅剩的金条扔给船夫。太阳升起，你不再是总统，你是岛主。你活下来了。',
    condition: (s) => s.time <= 0 && s.route === 'B'
  },
  {
    id: 'E_URBAN_LEGEND',
    title: '都市传说',
    description: '没人见过他。有人说他在贫民窟当了教父，有人说他整容成了韩流明星。警方翻遍了全城，连一根胡子都没找到。',
    condition: (s) => s.time <= 0 && s.route === 'A'
  },
  {
    id: 'E_BUNKER_KING',
    title: '地底之王',
    description: '72小时过去了，他们没能攻破你的大门。你坐在堆满罐头的王座上，虽然只有老鼠是你的臣民，但你依然是王。',
    condition: (s) => s.time <= 0 && s.route === 'C'
  },
  {
    id: 'E_SURVIVE',
    title: '侥幸逃脱',
    description: '虽然很狼狈，鞋子跑丢了，私房钱也没了，但你熬过了最后的72小时。自由的空气真甜美。',
    condition: (s) => s.time <= 0
  }
];
