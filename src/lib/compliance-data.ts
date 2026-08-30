export type Perspective = 'formal' | 'forward' | 'enterprise' | 'signal';
export type Sector = 'internet' | 'energy' | 'ai' | 'biomed' | 'advanced' | 'services';

export type CountryProfile = {
  name: string;
  zh: string;
  code: string;
  base: number;
  delta: string;
  trend: number;
  focus: string;
  view: string;
  impact: string;
};

export const dimensions = [
  { id: 'market', name: '市场准入与产业政策', short: '准入', score: 72, kind: 'H' },
  { id: 'trade', name: '贸易、海关与救济', short: '贸易', score: 67, kind: 'H' },
  { id: 'security', name: '国家安全与出口管制', short: '国安', score: 86, kind: 'H' },
  { id: 'sanction', name: '制裁、金融、税务与外汇', short: '制裁', score: 78, kind: 'H' },
  { id: 'data', name: '数据、网络与人工智能', short: '数据', score: 82, kind: 'H' },
  { id: 'competition', name: '竞争与消费者保护', short: '竞争', score: 64, kind: 'H' },
  { id: 'product', name: '产品安全与技术标准', short: '产品', score: 59, kind: 'H' },
  { id: 'esg', name: '环境、劳工与人权尽调', short: '尽调', score: 74, kind: 'H' },
  { id: 'ip', name: '知识产权与司法救济', short: '知产', score: 69, kind: 'H' },
  { id: 'content', name: '内容、广告与媒体监管', short: '内容', score: 61, kind: 'H' },
  { id: 'media', name: '媒体与组织关注信号', short: '媒体', score: 76, kind: 'S' },
  { id: 'social', name: '社会与运营安全信号', short: '社会', score: 56, kind: 'S' },
] as const;

export const companies = {
  internet: {
    label: '互联网与数字平台',
    eventIndustry: '互联网',
    company: '中国互联网平台企业（示例）',
    product: '电商 / 社交平台 / 数字内容 / 在线服务',
    exposure: 88,
    tasks: [
      { title: '梳理数据与算法责任清单', meta: '多法域 · 数据和平台治理', due: '7天', tone: 'red' },
      { title: '复核消费者与广告合规', meta: '欧盟 / 美国 · 用户界面', due: '14天', tone: 'amber' },
      { title: '建立内容处置证据链', meta: '投诉、审核与未成年人保护', due: '30天', tone: 'purple' },
    ],
    risks: [
      { id: 'data', title: '数据隐私与跨境传输', score: 93, why: '用户画像、推荐与跨境处理触发多法域义务' },
      { id: 'competition', title: '平台竞争与消费者保护', score: 89, why: '自我优待、暗黑模式和商家规则受到重点审查' },
      { id: 'content', title: '内容、广告与算法责任', score: 84, why: '内容审核、广告透明和未成年人保护责任叠加' },
      { id: 'sanction', title: '支付、制裁与商家准入', score: 78, why: '平台交易链路需持续筛查商家、商品与付款主体' },
    ],
  },
  ai: {
    label: 'AI与半导体',
    eventIndustry: 'AI半导体',
    company: '中国AI与半导体企业（示例）',
    product: '大模型 / 芯片设计 / 算力 / 智能终端',
    exposure: 92,
    tasks: [
      { title: '完成产品参数与管制分类', meta: '美国 / 欧盟 · 芯片与算力', due: '5天', tone: 'red' },
      { title: '核验最终用户和技术来源', meta: '出口管制 · 供应链穿透', due: '10天', tone: 'amber' },
      { title: '完成高风险AI系统分类', meta: '欧盟 · 产品上线前', due: '30天', tone: 'purple' },
    ],
    risks: [
      { id: 'security', title: '出口管制与最终用户', score: 96, why: '芯片性能、算力、模型能力和最终用途可能触发管制' },
      { id: 'market', title: '投资审查与技术准入', score: 91, why: '敏感技术、股权和控制关系受到国家安全审查' },
      { id: 'data', title: 'AI治理与数据跨境', score: 88, why: '训练、推理与用户数据跨越多个法域' },
      { id: 'ip', title: '技术来源与知识产权', score: 82, why: 'EDA、开源组件、训练数据与专利许可均需留证' },
    ],
  },
  energy: {
    label: '新能源与关键矿产',
    eventIndustry: '新能源',
    company: '中国新能源制造企业（示例）',
    product: '电池 / 光伏组件 / 储能系统',
    exposure: 82,
    tasks: [
      { title: '核验原材料可追溯证据', meta: '欧盟 · 供应链尽调', due: '5天', tone: 'red' },
      { title: '复核补贴与原产地口径', meta: '美国 / 欧盟 · 贸易救济', due: '12天', tone: 'amber' },
      { title: '准备碳足迹与电池护照', meta: '产品准入 · ESG', due: '30天', tone: 'purple' },
    ],
    risks: [
      { id: 'trade', title: '反补贴与原产地审查', score: 92, why: '产能、补贴与供应链来源成为调查重点' },
      { id: 'esg', title: '供应链与人权尽调', score: 87, why: '关键矿产来源和供应商证据需穿透验证' },
      { id: 'market', title: '本地化与市场准入', score: 81, why: '采购、本地含量与投资审查要求叠加' },
      { id: 'product', title: '产品安全与碳规则', score: 73, why: '电池护照、回收责任和碳核算进入执行期' },
    ],
  },
  biomed: {
    label: '生物医药与医疗器械',
    eventIndustry: '生物医药',
    company: '中国生物医药企业（示例）',
    product: '创新药 / 原料药 / 医疗器械 / 临床研发',
    exposure: 83,
    tasks: [
      { title: '核验注册许可与GxP差距', meta: 'FDA / EMA · 上市与生产', due: '7天', tone: 'red' },
      { title: '复核临床与健康数据路径', meta: '隐私、伦理与跨境数据', due: '14天', tone: 'amber' },
      { title: '补齐药物警戒和召回机制', meta: '上市后持续合规', due: '30天', tone: 'purple' },
    ],
    risks: [
      { id: 'product', title: '产品注册与质量体系', score: 93, why: '注册、GMP/GCP和上市后监督直接决定市场准入' },
      { id: 'data', title: '临床与健康数据保护', score: 86, why: '敏感健康数据、受试者同意和跨境传输要求严格' },
      { id: 'ip', title: '专利与技术许可', score: 82, why: '专利链接、研发合作和技术许可影响商业化节奏' },
      { id: 'competition', title: '定价、推广与反商业贿赂', score: 78, why: '营销、医生互动和医保定价受到多重监管' },
    ],
  },
  advanced: {
    label: '高端制造与智能装备',
    eventIndustry: '高端制造',
    company: '中国高端制造企业（示例）',
    product: '机器人 / 航空航天 / 工业设备 / 核心零部件',
    exposure: 85,
    tasks: [
      { title: '完成产品与技术管制分类', meta: '双用途物项 · 出口管制', due: '7天', tone: 'red' },
      { title: '复核经销商与最终用户', meta: '多法域 · 交易链路', due: '14天', tone: 'amber' },
      { title: '补齐认证与供应链档案', meta: '产品安全 · 关键零部件', due: '30天', tone: 'purple' },
    ],
    risks: [
      { id: 'security', title: '双用途物项与技术管制', score: 94, why: '机器人、航空航天和精密设备可能涉及敏感用途' },
      { id: 'product', title: '产品认证与技术标准', score: 88, why: '认证版本、网络安全和责任主体影响交付' },
      { id: 'sanction', title: '最终用户与制裁筛查', score: 84, why: '客户、经销商、集成商与最终用途需穿透核验' },
      { id: 'trade', title: '原产地与贸易救济', score: 79, why: '核心零部件来源、补贴和海关归类影响成本' },
    ],
  },
  services: {
    label: '通用制造与跨境服务',
    eventIndustry: '其他',
    company: '中国跨境经营企业（示例）',
    product: '一般商品 / 专业服务 / 海外运营',
    exposure: 66,
    tasks: [
      { title: '核验市场准入与许可', meta: '目的地 · 落地主体', due: '10天', tone: 'red' },
      { title: '复核合同与交易对手', meta: '制裁、税务与付款链路', due: '18天', tone: 'amber' },
      { title: '更新海外用工与数据台账', meta: '目的地运营 · 常规义务', due: '30天', tone: 'purple' },
    ],
    risks: [
      { id: 'market', title: '市场准入与经营许可', score: 79, why: '主体设立、牌照范围和外资限制决定经营边界' },
      { id: 'sanction', title: '交易对手与金融制裁', score: 76, why: '客户、供应商与付款链路需持续筛查' },
      { id: 'trade', title: '关税、海关与税务', score: 71, why: '归类、原产地、常设机构和转让定价影响成本' },
      { id: 'competition', title: '合同、用工与竞争规则', score: 65, why: '渠道安排、劳动关系与消费者责任存在法域差异' },
    ],
  },
} as const;

export const profiles: Record<string, CountryProfile> = {
  'United States of America': { name: 'United States of America', zh: '美国', code: 'USA', base: 88, delta: '+21', trend: 12, focus: '国安审查 / 出口管制 / 制裁', view: '监管重点正从单一主体名单扩展到技术能力、资金与供应链控制关系。', impact: '可能影响融资、采购、云服务、关键设备供应和客户准入。' },
  Germany: { name: 'Germany', zh: '德国', code: 'DEU', base: 73, delta: '+8', trend: 6, focus: '投资审查 / 供应链尽调 / 产品规则', view: '合规重点从文件存在转向证据可验证，供应商信息质量决定企业能否按期履约。', impact: '可能增加认证周期、供应商整改和合同保证成本。' },
  India: { name: 'India', zh: '印度', code: 'IND', base: 79, delta: '+17', trend: 9, focus: '数字监管 / 市场准入 / 本地化', view: '数字业务与制造本地化政策正在形成联动，许可、数据和税务需同时评估。', impact: '可能影响应用上线、数据架构、本地合作伙伴和价格策略。' },
  Singapore: { name: 'Singapore', zh: '新加坡', code: 'SGP', base: 38, delta: '+2', trend: -3, focus: '数据跨境 / 金融合规', view: '整体规则透明度较高，适合作为区域运营节点，但金融和数据责任仍需前置设计。', impact: '主要影响区域总部架构、数据处理协议和金融许可。' },
  Brazil: { name: 'Brazil', zh: '巴西', code: 'BRA', base: 57, delta: '+4', trend: 2, focus: '税务 / 数据保护 / 消费者权益', view: '监管压力更多来自税制复杂度与消费者保护执行，需重视本地运营细节。', impact: '可能影响定价、发票、用户协议和售后流程。' },
  'United Arab Emirates': { name: 'United Arab Emirates', zh: '阿联酋', code: 'ARE', base: 41, delta: '+1', trend: -1, focus: '金融 / 数据本地化 / 区域准入', view: '合作窗口较强，适合作为中东节点；自由区与本土规则边界需要具体核验。', impact: '主要影响落地主体、牌照范围和区域资金安排。' },
};

export const countryZh: Record<string, string> = {
  China: '中国', Japan: '日本', 'South Korea': '韩国', 'United Kingdom': '英国',
  France: '法国', Australia: '澳大利亚', Canada: '加拿大', Mexico: '墨西哥',
  Indonesia: '印度尼西亚', Vietnam: '越南', Thailand: '泰国', Russia: '俄罗斯',
};

export const associationViews = [
  { id: 'ownership', label: '主体与股权', result: '识别 7 个关联主体', detail: '穿透境外子公司、最终受益人与控制关系，匹配投资审查和制裁规则。' },
  { id: 'jurisdiction', label: '法域连接点', result: '触达 5 个法域', detail: '按注册、经营、数据、人员、付款与交付位置判断规则适用性。' },
  { id: 'product', label: '行业与产品', result: '命中 4 项敏感标签', detail: '把行业分类、产品能力和技术参数映射至准入与管制目录。' },
  { id: 'technology', label: '数据与技术来源', result: '发现 3 条跨境链路', detail: '追踪训练数据、源代码、云算力和关键设备的来源与去向。' },
  { id: 'supply', label: '客户与供应链', result: '需核验 12 个节点', detail: '穿透客户、经销商、最终用户及二三级供应商的名单与事件暴露。' },
];

export const sourceGroups = [
  { code: '01', title: '官方规则', sub: '法律 · 草案 · 通报', value: '12,846', status: '版本化' },
  { code: '02', title: '监管执法', sub: '调查 · 处罚 · 禁令', value: '3,428', status: '证据核验' },
  { code: '03', title: '外部信号', sub: '媒体 · NGO · 社会事件', value: '6,190', status: '独立分轨' },
  { code: '04', title: '企业授权数据', sub: '主体 · 产品 · 供应链', value: '218', status: '最小必要' },
];
