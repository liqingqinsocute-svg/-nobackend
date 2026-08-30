'use client';

import { useMemo, useState } from 'react';
import { geoGraticule10, geoNaturalEarth1, geoPath } from 'd3-geo';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import type { GeometryCollection, Topology } from 'topojson-specification';
import { feature } from 'topojson-client';
import worldData from 'world-atlas/countries-50m.json';
import {
  Activity, ArrowDown, ArrowRight, Bell, BookOpenCheck, Building2, Check,
  ChevronRight, CircleAlert, Database, Download, FileCheck2, Fingerprint,
  Globe2, Handshake, Landmark, Network, Scale, SearchCheck,
  ShieldAlert, Sparkles, Target, TimerReset, TrendingUp, Workflow,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { cn } from '@/lib/utils';
import {
  associationViews, companies, countryZh, profiles,
  type CountryProfile, type Sector,
} from '@/lib/compliance-data';
import { validatedSourceData } from '@/lib/validated-source-data';

type CountryProperties = { name?: string };
type Tone = 'red' | 'amber' | 'purple';
type MapLayer = 'enterprise' | 'total' | 'coercive' | 'economic' | 'social' | 'uncertainty' | 'events';

const topology = worldData as unknown as Topology<{
  countries: GeometryCollection<CountryProperties>;
}>;
const countries = feature(
  topology,
  topology.objects.countries,
) as unknown as FeatureCollection<Geometry, CountryProperties>;
const projection = geoNaturalEarth1().fitExtent([[18, 18], [942, 500]], { type: 'Sphere' });
const mapPath = geoPath(projection);
const graticulePath = mapPath(geoGraticule10());

const navItems = [
  { code: '00', label: '企业总览', target: 'overview' },
  { code: '01', label: '数据与逻辑', target: 'logic' },
  { code: '02', label: '关联分析', target: 'association' },
  { code: '03', label: '服务与行动', target: 'services' },
];

const impactEvents = [
  {
    id: 'ai',
    title: '高风险AI系统监管进入实施准备期',
    nodes: ['议题与媒体关注', '立法技术标准', '主管机构指引', '产品分类与登记', '上线节奏与客户合同'],
    impact: '产品上线可能延后 4—8 周，需提前完成分类、文档与责任主体安排。',
  },
  {
    id: 'supply',
    title: '供应链尽调从制度要求转向证据核验',
    nodes: ['NGO与行业关注', '尽调义务生效', '监管抽查与诉讼', '供应商补证整改', '交付与融资成本'],
    impact: '若二三级供应商无法提供来源证据，可能影响订单交付、客户审计与银行融资。',
  },
  {
    id: 'trade',
    title: '贸易救济向补贴、产能与原产地联动',
    nodes: ['产业竞争压力', '调查立案', '问卷与现场核查', '关税与承诺措施', '定价与市场策略'],
    impact: '调查期间即可产生保证金、律师费和客户观望，需同步准备数据口径与替代市场。',
  },
];

const governmentServices = [
  { id: 'consult', icon: Landmark, title: '驻外经商机构咨询', text: '获取目的地政策解释、主管机构和本地专业资源线索。' },
  { id: 'rights', icon: Scale, title: '海外权益保护支持', text: '对歧视性执法、突发查扣和重大经营障碍建立升级通道。' },
  { id: 'guide', icon: BookOpenCheck, title: '国别合规指引', text: '按国家、行业和业务场景获取准入、税务、数据与用工清单。' },
  { id: 'association', icon: Handshake, title: '商协会协同服务', text: '连接行业预警、集体应对、培训与可信本地服务机构。' },
];

const methodologyDimensions = [
  { code: '①', title: '强制型监管压力', text: '规则限制、分领域规制、执行处罚、执行渗漏反向修正', layer: 'coercive' as MapLayer, color: '#ffc24b', measured: true },
  { code: '②', title: '经济杠杆型压力', text: '制度性合规负担、环境税费与市场化约束工具', layer: 'economic' as MapLayer, color: '#eff24e', measured: true },
  { code: '③', title: '社会非正式压力', text: '媒体与社会监督实际压力、媒体环境开放度', layer: 'social' as MapLayer, color: '#d36bff', measured: true },
  { code: '④', title: '政策不确定性', text: '执行一致性、政策与政治延续性', layer: 'uncertainty' as MapLayer, color: '#4be8e4', measured: true },
  { code: '⑤', title: '域外适用范围', text: '域外法律条文设计、跨境执法与制裁实践', layer: 'total' as MapLayer, color: '#7897ff', measured: false },
  { code: '⑥', title: '市场结果反馈', text: 'FDI、市场进入与经营结果的反馈校验', layer: 'total' as MapLayer, color: '#7bdba9', measured: false },
];

const eventIndustryToSector: Record<string, Sector> = {
  互联网: 'internet',
  新能源: 'energy',
  AI半导体: 'ai',
  生物医药: 'biomed',
  高端制造: 'advanced',
  其他: 'services',
};

const layerPalettes: Record<MapLayer, { code: string; label: string; colors: [string, string, string, string, string]; note: string }> = {
  enterprise: { code: 'R', label: '企业适用风险', colors: ['#2b252c', '#61323b', '#a33a48', '#dd3648', '#ff4054'], note: '情境测算：目的地压力 × 行业暴露 × 事件信号' },
  total: { code: 'T', label: '监管压力总指数', colors: ['#342322', '#69342f', '#a84438', '#db503e', '#ff684c'], note: '四维完整样本：①②③各30% + ④10%' },
  coercive: { code: '①', label: '强制型监管', colors: ['#32261b', '#654323', '#a76a27', '#df912e', '#ffc24b'], note: '规则限制、分领域规制、执行处罚与执行渗漏修正' },
  economic: { code: '②', label: '经济杠杆', colors: ['#2d2b18', '#5d5b20', '#92962b', '#c5c936', '#eff24e'], note: '制度性合规负担与环境经济工具' },
  social: { code: '③', label: '社会非正式压力', colors: ['#271f35', '#4b3068', '#75409c', '#a34ed0', '#d36bff'], note: '媒体、社会监督与媒体环境开放度' },
  uncertainty: { code: '④', label: '政策不确定性', colors: ['#152d33', '#1e5862', '#278892', '#34b7bd', '#4be8e4'], note: '执行一致性与政治延续性' },
  events: { code: 'E', label: '中企事件密度', colors: ['#2f1b2b', '#652451', '#a72f7f', '#dd3cac', '#ff57cd'], note: '206起事件按监管国聚合并进行平方根归一化' },
};

function hashScore(name: string) {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) % 997;
  return 28 + (hash % 40);
}

function getPressure(name: string) {
  return validatedSourceData.countryPressure[name as keyof typeof validatedSourceData.countryPressure];
}

function getLayerScore(name: string, layer: MapLayer, sector: Sector): number | null {
  const record = getPressure(name);
  const events = validatedSourceData.eventCountByCountry[name as keyof typeof validatedSourceData.eventCountByCountry] ?? 0;
  if (layer === 'events') return events > 0 ? Math.round(Math.sqrt(events / 113) * 1000) / 10 : 0;
  if (!record) return null;
  if (layer === 'total') return record.core && record.total !== null ? record.total : null;
  if (layer === 'coercive') return record.coercive;
  if (layer === 'economic') return record.economic;
  if (layer === 'social') return record.social;
  if (layer === 'uncertainty') return record.uncertainty;
  const dimensionValues: Array<number | null> = [record.coercive, record.economic, record.social, record.uncertainty];
  const available = dimensionValues.filter((value): value is number => value !== null);
  if (!available.length) return null;
  const pressure = record.core && record.total !== null ? record.total : available.reduce((sum, value) => sum + value, 0) / available.length;
  const sectorExposure: Record<Sector, number> = {
    internet: 88,
    energy: 82,
    ai: 92,
    biomed: 83,
    advanced: 85,
    services: 66,
  };
  const eventSignal = Math.sqrt(events / 113) * 100;
  return Math.round(Math.min(96, pressure * .55 + sectorExposure[sector] * .35 + eventSignal * .1) * 10) / 10;
}

function riskColor(score: number | null, layer: MapLayer = 'enterprise') {
  if (score === null) return '#252831';
  const colors = layerPalettes[layer].colors;
  if (score >= 82) return colors[4];
  if (score >= 70) return colors[3];
  if (score >= 56) return colors[2];
  if (score >= 42) return colors[1];
  return colors[0];
}

function formatLayerValue(name: string, layer: MapLayer, sector: Sector) {
  if (layer === 'events') {
    const count = validatedSourceData.eventCountByCountry[name as keyof typeof validatedSourceData.eventCountByCountry] ?? 0;
    return `${count} 起`;
  }
  const score = getLayerScore(name, layer, sector);
  return score === null ? '数据不足' : score.toFixed(1);
}

function displayName(name: string) {
  return profiles[name]?.zh ?? countryZh[name] ?? name;
}

function fallbackProfile(name: string): CountryProfile {
  return {
    name,
    zh: displayName(name),
    code: 'GLB',
    base: hashScore(name),
    delta: '待验证',
    trend: 1,
    focus: '跨境经营基础义务',
    view: '该市场当前仅有国家基线样例，具体结论需结合企业业务连接点和最新证据核验。',
    impact: '可能影响市场准入、交易安排和本地运营，建议先完成适用性筛查。',
  };
}

function SectionTitle({ eyebrow, title, note }: { eyebrow: string; title: string; note?: string }) {
  return (
    <div>
      <div className="flex items-center gap-2 font-mono text-[9px] tracking-[0.2em] text-[#76545c]">
        <span className="h-px w-5 bg-[#ff4255]" />{eyebrow}
      </div>
      <h2 className="mt-1.5 text-sm font-semibold tracking-[0.04em] text-white">{title}</h2>
      {note && <p className="mt-1 text-[10px] leading-4 text-[#6d717d]">{note}</p>}
    </div>
  );
}

function ToneDot({ tone }: { tone: Tone }) {
  return <span className={cn(
    'size-1.5 shrink-0 rounded-full',
    tone === 'red' && 'bg-[#ff4357] shadow-[0_0_9px_#ff4357]',
    tone === 'amber' && 'bg-[#ff9d44] shadow-[0_0_9px_#ff9d44]',
    tone === 'purple' && 'bg-[#b866ff] shadow-[0_0_9px_#b866ff]',
  )} />;
}

function downloadActionPlan(profile: CountryProfile, company: typeof companies[Sector], score: number) {
  const body = [
    '企业出海合规行动清单（演示）',
    `企业画像：${company.company}`,
    `目标市场：${profile.zh}`,
    `产品与业务：${company.product}`,
    `企业服务优先级 R：${score}/100`,
    '',
    ...company.tasks.map((task, index) => `${index + 1}. ${task.title}｜${task.meta}｜建议期限 ${task.due}`),
    '',
    '方法说明：R为服务排序情境值，由目的地四维压力、行业暴露与中企事件信号组合；国家压力源数据与企业测算分轨展示。',
    `国家与事件数据更新至 ${validatedSourceData.meta.asOf}；本清单不构成法律意见。`,
  ].join('\r\n');
  const url = URL.createObjectURL(new Blob([body], { type: 'text/plain;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `${profile.zh}-${company.label}-合规行动清单.txt`;
  link.click();
  URL.revokeObjectURL(url);
}

export function ComplianceDashboard() {
  const [sector, setSector] = useState<Sector>('internet');
  const [selectedName, setSelectedName] = useState('United States of America');
  const [perspective, setPerspective] = useState<MapLayer>('enterprise');
  const [dimension, setDimension] = useState('all');
  const [hovered, setHovered] = useState<{ name: string; x: number; y: number } | null>(null);
  const [activeRelation, setActiveRelation] = useState('jurisdiction');
  const [activeEvent, setActiveEvent] = useState('ai');
  const [completed, setCompleted] = useState<number[]>([]);
  const [requestedService, setRequestedService] = useState<string | null>(null);
  const [subscribed, setSubscribed] = useState(false);

  const company = companies[sector];
  const profile = profiles[selectedName] ?? fallbackProfile(selectedName);
  const destinationPressure = getLayerScore(selectedName, 'total', sector);
  const servicePriority = Math.min(96, Math.round((getLayerScore(selectedName, 'enterprise', sector) ?? company.exposure) * 0.72 + company.exposure * 0.28));
  const activeLayer = layerPalettes[perspective];
  const relation = associationViews.find((item) => item.id === activeRelation) ?? associationViews[0];
  const event = impactEvents.find((item) => item.id === activeEvent) ?? impactEvents[0];
  const eventYears = [...validatedSourceData.eventSummary.byYear].sort((a, b) => Number(a.name) - Number(b.name));
  const maxYearEvents = Math.max(...eventYears.map((item) => item.value));
  const maxIndustryEvents = Math.max(...validatedSourceData.eventSummary.byIndustry.map((item) => item.value));
  const industryEventCount = validatedSourceData.eventSummary.byIndustry.find((item) => item.name === company.eventIndustry)?.value ?? 0;
  const mapPaths = useMemo(() => countries.features.map((country: Feature<Geometry, CountryProperties>) => ({
    name: country.properties?.name ?? 'Unknown',
    d: mapPath(country) ?? '',
  })), []);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const toggleTask = (index: number) => setCompleted((items) => items.includes(index) ? items.filter((item) => item !== index) : [...items, index]);

  return (
    <main className="data-grid min-h-screen overflow-x-hidden bg-[#07080c] pb-8 text-[#d9dce4]">
      <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#0b0d14]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-[1920px] items-center gap-5 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative grid size-10 shrink-0 place-items-center border border-[#ff4558]/45 bg-[#170e14] font-mono text-xs font-semibold text-white">
              E<span className="text-[#ff4558]">H</span>
              <span className="absolute -right-0.5 -top-0.5 size-1.5 bg-white shadow-[0_0_8px_white]" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-[15px] font-semibold tracking-[0.08em] text-white sm:text-base">企业出海合规风险全景监测平台</h1>
              <p className="mt-0.5 text-[9px] tracking-[0.08em] text-[#5e626d]">GLOBAL ENTERPRISE COMPLIANCE INTELLIGENCE</p>
            </div>
          </div>

          <nav className="ml-auto hidden h-full items-center lg:flex" aria-label="主导航">
            {navItems.map((item, index) => <button key={item.target} type="button" onClick={() => scrollTo(item.target)} className={cn(
              'group relative flex h-full items-center gap-2 px-5 text-xs text-[#777c88] transition-colors hover:text-white',
              index === 0 && 'text-white',
            )}>
              <span className={cn('font-mono text-[8px]', index === 0 ? 'text-[#ff4255]' : 'text-[#4c505b]')}>{item.code}</span>{item.label}
              {index === 0 && <span className="absolute inset-x-4 bottom-0 h-0.5 bg-[#ff4357] shadow-[0_0_10px_#ff4357]" />}
            </button>)}
          </nav>

          <div className="hidden items-center gap-3 border-l border-white/[0.07] pl-5 xl:flex">
            <Activity className="size-4 text-[#38e4d0]" />
            <div><div className="font-mono text-[9px] tracking-[0.18em] text-[#38e4d0]">VALIDATED DATA PIPELINE</div><div className="mt-1 font-mono text-[8px] text-[#555b66]">数据更新至 {validatedSourceData.meta.asOf} · 事实与测算分轨</div></div>
          </div>
        </div>
      </header>

      <section className="border-b border-white/[0.06] bg-[#090b11]">
        <div className="mx-auto flex max-w-[1920px] flex-wrap items-center gap-3 px-4 py-2.5 sm:px-6">
          <div className="mr-1 flex items-center gap-2 text-[10px] font-semibold text-white"><Fingerprint className="size-3.5 text-[#ff4558]" />我的企业情境</div>
          <NativeSelect value={sector} onChange={(e) => setSector(e.target.value as Sector)} size="sm" aria-label="选择行业" className="[&_select]:w-[174px] [&_select]:rounded-none [&_select]:border-white/10 [&_select]:bg-[#11131a] [&_select]:text-[10px] [&_select]:text-[#c5c8d0]">
            <NativeSelectOption value="internet">互联网与数字平台</NativeSelectOption>
            <NativeSelectOption value="energy">新能源与关键矿产</NativeSelectOption>
            <NativeSelectOption value="ai">AI与半导体</NativeSelectOption>
            <NativeSelectOption value="biomed">生物医药与医疗器械</NativeSelectOption>
            <NativeSelectOption value="advanced">高端制造与智能装备</NativeSelectOption>
            <NativeSelectOption value="services">通用制造与跨境服务</NativeSelectOption>
          </NativeSelect>
          <NativeSelect value={selectedName} onChange={(e) => setSelectedName(e.target.value)} size="sm" aria-label="选择目标市场" className="[&_select]:w-[118px] [&_select]:rounded-none [&_select]:border-white/10 [&_select]:bg-[#11131a] [&_select]:text-[10px] [&_select]:text-[#c5c8d0]">
            {Object.values(profiles).map((item) => <NativeSelectOption key={item.name} value={item.name}>{item.zh}</NativeSelectOption>)}
          </NativeSelect>
          <div className="hidden h-7 items-center border border-white/[0.07] bg-[#0d0f15] px-3 text-[9px] text-[#666b76] md:flex">业务：{company.product}</div>
          <div className="ml-auto flex items-center gap-4 text-[9px]">
            <span className="text-[#606571]">事件库匹配 <b className="font-mono text-[#38e4d0]">{industryEventCount}</b> 起 · 已识别</span>
            <span className="font-mono text-white"><b className="mr-1 text-[#ff4b5e]">4</b>项重点风险</span>
            <span className="font-mono text-white"><b className="mr-1 text-[#ff9d44]">3</b>项近期任务</span>
            <span className="hidden font-mono text-white sm:inline"><b className="mr-1 text-[#b866ff]">2</b>个支持入口</span>
          </div>
        </div>
      </section>

      <section id="overview" className="scroll-mt-24">
        <div className="mx-auto grid max-w-[1920px] grid-cols-1 gap-px bg-white/[0.06] p-px xl:grid-cols-[310px_minmax(620px,1fr)_354px]">
          <aside className="bg-[#0a0c11] p-4 xl:min-h-[670px]">
            <div className="flex items-start justify-between"><SectionTitle eyebrow="FOR YOUR BUSINESS" title="与你最相关的风险" note="已根据行业、产品、目标市场和业务连接点排序" /><Badge className="rounded-none border border-[#ff4357]/25 bg-[#271116] font-mono text-[9px] text-[#ff6575]">R PRIORITY</Badge></div>
            <div className="mt-4 space-y-2">
              {company.risks.map((risk, index) => <button key={risk.id} type="button" onClick={() => { setDimension(risk.id); setPerspective('enterprise'); }} className={cn(
                'group w-full border-l-2 border-white/[0.06] bg-[#0d0f15] px-3 py-3 text-left transition-colors hover:bg-[#13151d]',
                dimension === risk.id && 'border-l-[#ff4357] bg-[#171016]',
              )}>
                <div className="flex items-center gap-2"><span className="font-mono text-[8px] text-[#555a65]">0{index + 1}</span><span className="flex-1 text-[11px] font-medium text-[#c7cad1] group-hover:text-white">{risk.title}</span><span className="font-mono text-xs font-semibold" style={{ color: riskColor(risk.score, 'enterprise') }}>{risk.score}</span></div>
                <p className="mt-1.5 pl-5 text-[9px] leading-4 text-[#646975]">{risk.why}</p>
                <div className="mt-2 ml-5 h-0.5 bg-white/[0.05]"><div className="h-full bg-gradient-to-r from-[#7a252f] to-[#ff4255]" style={{ width: `${risk.score}%` }} /></div>
              </button>)}
            </div>

            <div className="mt-5 border-t border-white/[0.07] pt-4">
              <div className="flex items-center justify-between"><span className="font-mono text-[9px] tracking-[0.12em] text-[#5c606b]">WHY THIS ORDER</span><CircleAlert className="size-3.5 text-[#8a5560]" /></div>
              <p className="mt-2 text-[9px] leading-4 text-[#626772]">R为服务排序情境值：目的地压力 × 行业暴露 × 中企事件信号；源数据得分与企业测算严格分轨，不等同于违法概率。</p>
              <div className="mt-3 grid grid-cols-4 gap-1">{[['A', '适用'], ['T', '压力'], ['X', '暴露'], ['E', '事件']].map(([code, label], index) => <div key={code} className="border border-white/[0.06] bg-[#0d0f15] py-2 text-center"><div className="font-mono text-[11px] text-[#ff5b6b]">{[86, destinationPressure?.toFixed(1) ?? 'NA', company.exposure, validatedSourceData.eventCountByCountry[selectedName as keyof typeof validatedSourceData.eventCountByCountry] ?? 0][index]}</div><div className="mt-0.5 text-[8px] text-[#555b66]">{code} {label}</div></div>)}</div>
            </div>
          </aside>

          <div className="relative min-h-[670px] overflow-hidden bg-[#08090d]">
            <div className="absolute inset-x-0 top-0 z-10 flex h-[66px] items-center justify-between border-b border-white/[0.06] bg-[#090a0f]/90 px-5 backdrop-blur-sm">
              <div><SectionTitle eyebrow="MY TARGET MARKETS" title="我的目标市场风险分布" note={`${company.label} · ${profile.zh}已选中 · 点击地图切换市场`} /></div>
              <div className="hidden items-center gap-2 sm:flex"><span className="border px-1.5 py-0.5 font-mono text-[8px]" style={{ color: activeLayer.colors[4], borderColor: `${activeLayer.colors[4]}55`, backgroundColor: `${activeLayer.colors[4]}12` }}>{activeLayer.code} LAYER</span><div className="flex items-center gap-1.5 text-[8px] text-[#666b75]"><span>低</span>{activeLayer.colors.map((color) => <i key={color} className="h-1.5 w-7" style={{ backgroundColor: color }} />)}<span>高</span></div></div>
            </div>
            <div className="absolute inset-x-0 top-[66px] z-10 flex flex-wrap items-center gap-1 border-b border-white/[0.04] bg-[#08090d]/85 px-5 py-2">
              {(['enterprise', 'total', 'coercive', 'economic', 'social', 'uncertainty', 'events'] as MapLayer[]).map((item) => <Button key={item} size="sm" variant="ghost" onClick={() => setPerspective(item)} className={cn('h-7 rounded-none px-2 text-[9px] text-[#5f646e] hover:bg-white/[0.05] hover:text-white', perspective === item && 'border bg-white/[0.035]')} style={perspective === item ? { color: layerPalettes[item].colors[4], borderColor: `${layerPalettes[item].colors[4]}55`, boxShadow: `inset 0 -1px 0 ${layerPalettes[item].colors[4]}` } : undefined}>
                <span className="mr-1 font-mono" style={{ color: layerPalettes[item].colors[4] }}>{layerPalettes[item].code}</span>{layerPalettes[item].label}
              </Button>)}
              <span className="ml-auto hidden text-[8px] text-[#5d626d] md:inline">{activeLayer.note}</span>
            </div>

            <div className="map-scan top-[118px]" style={{ background: `linear-gradient(90deg, transparent, ${activeLayer.colors[4]}, transparent)`, boxShadow: `0 0 18px ${activeLayer.colors[4]}88` }} />
            <div className="absolute inset-x-0 bottom-0 top-[104px]" onMouseLeave={() => setHovered(null)}>
              <svg viewBox="0 0 960 520" aria-label="全球企业出海合规热力地图" className="h-full w-full">
                <defs><radialGradient id="ocean" cx="50%" cy="48%" r="58%"><stop offset="0%" stopColor="#2b1016" stopOpacity=".5" /><stop offset="100%" stopColor="#08090d" stopOpacity="0" /></radialGradient><filter id="redGlow"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
                <path d={mapPath({ type: 'Sphere' }) ?? ''} fill="url(#ocean)" stroke="#2a1b21" strokeWidth="0.8" />
                {graticulePath && <path d={graticulePath} fill="none" stroke="#3a242b" strokeWidth="0.32" opacity="0.45" />}
                {mapPaths.map((country) => {
                  const score = getLayerScore(country.name, perspective, sector);
                  const selected = country.name === selectedName;
                  return <path key={country.name} d={country.d} fill={riskColor(score, perspective)} fillOpacity={selected ? 1 : 0.72} stroke={selected ? '#ffffff' : '#111218'} strokeWidth={selected ? 1.5 : 0.55} className="cursor-pointer transition-all duration-200 hover:fill-opacity-100" onClick={() => setSelectedName(country.name)} onMouseMove={(e) => {
                    const box = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
                    if (box) setHovered({ name: country.name, x: e.clientX - box.left, y: e.clientY - box.top });
                  }} />;
                })}
                {[{ x: 205, y: 195 }, { x: 482, y: 176 }, { x: 690, y: 235 }, { x: 735, y: 295 }, { x: 812, y: 360 }].map((point, index) => <g key={point.x} filter="url(#redGlow)" pointerEvents="none"><circle className="pulse-ring" cx={point.x} cy={point.y} r="5" fill="none" stroke={activeLayer.colors[4]} strokeWidth="1" style={{ animationDelay: `${index * 0.36}s` }} /><circle cx={point.x} cy={point.y} r="2.2" fill={activeLayer.colors[4]} /></g>)}
              </svg>
              {hovered && <div className="pointer-events-none absolute z-20 min-w-36 border bg-[#0a0b10]/95 px-2.5 py-2 shadow-[0_12px_40px_#000]" style={{ left: hovered.x + 12, top: hovered.y - 10, borderColor: `${activeLayer.colors[4]}55` }}><div className="text-[10px] text-white">{displayName(hovered.name)}</div><div className="mt-1 flex justify-between gap-4 font-mono text-[9px] text-[#6f737d]"><span>{activeLayer.code} · {activeLayer.label}</span><span style={{ color: activeLayer.colors[4] }}>{formatLayerValue(hovered.name, perspective, sector)}</span></div>{getPressure(hovered.name) && <div className="mt-1 text-[8px] text-[#555b66]">覆盖 {getPressure(hovered.name).coverage}/4 维{getPressure(hovered.name).core ? ' · 核心可比样本' : ' · 总指数不参与排名'}</div>}</div>}

              <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center gap-2 border border-white/[0.07] bg-[#090a0f]/90 px-3 py-2 backdrop-blur-md">
                <span className="mr-1 text-[9px] text-[#5b606a]">重点市场</span>
                {Object.values(profiles).slice(0, 5).map((item) => <button key={item.name} type="button" onClick={() => setSelectedName(item.name)} className="border border-white/[0.06] px-2 py-1 font-mono text-[9px] text-[#777c86] hover:text-white" style={selectedName === item.name ? { color: activeLayer.colors[4], borderColor: `${activeLayer.colors[4]}66`, backgroundColor: `${activeLayer.colors[4]}14` } : undefined}>{item.zh} {formatLayerValue(item.name, perspective, sector)}</button>)}
                <span className="ml-auto flex items-center gap-1 text-[8px] text-[#555b66]"><i className="size-2 bg-[#252831]" />数据不足</span>
              </div>
            </div>
          </div>

          <aside className="bg-[#0a0c11] p-4 xl:min-h-[670px]">
            <div className="border border-[#ff4357]/25 bg-gradient-to-br from-[#1d0e13] to-[#0c0d12] p-4">
              <div className="flex items-center justify-between"><span className="font-mono text-[9px] tracking-[0.16em] text-[#7e545c]">YOUR SERVICE PRIORITY</span><Target className="size-4 text-[#ff4b5e]" /></div>
              <div className="mt-3 flex items-end gap-3"><span className="font-mono text-5xl font-semibold leading-none text-white">{servicePriority}</span><span className="mb-1 text-xs text-[#ff4f61]">高优先级</span></div>
              <div className="mt-3 flex items-center justify-between text-[9px] text-[#696e78]"><span>{profile.zh} · {company.label}</span><span className="font-mono">R / 100</span></div>
              <div className="mt-2 h-1 bg-white/[0.06]"><div className="h-full bg-gradient-to-r from-[#7d252f] to-[#ff4255] shadow-[0_0_12px_#ff425566]" style={{ width: `${servicePriority}%` }} /></div>
            </div>

            <div className="mt-4 flex items-center justify-between"><SectionTitle eyebrow="NEXT 30 DAYS" title="你现在要做的三件事" /><span className="font-mono text-[9px] text-[#ff9d44]">{completed.length}/3 DONE</span></div>
            <div className="mt-3 space-y-2">
              {company.tasks.map((task, index) => <button key={task.title} type="button" onClick={() => toggleTask(index)} className={cn('flex w-full items-start gap-3 border border-white/[0.06] bg-[#0d0f15] p-3 text-left transition-colors hover:bg-[#14161d]', completed.includes(index) && 'opacity-55')}>
                <span className={cn('mt-0.5 grid size-5 shrink-0 place-items-center border', completed.includes(index) ? 'border-[#38d3af]/40 bg-[#0d2822] text-[#38d3af]' : 'border-white/10 text-[#5b606a]')}>{completed.includes(index) ? <Check className="size-3" /> : <span className="font-mono text-[8px]">0{index + 1}</span>}</span>
                <span className="min-w-0 flex-1"><span className="flex items-center gap-2 text-[11px] text-[#d0d2d8]"><ToneDot tone={task.tone as Tone} />{task.title}</span><span className="mt-1 block pl-3.5 text-[9px] text-[#5f646e]">{task.meta}</span></span>
                <span className="font-mono text-[9px] text-[#ff9d44]">{task.due}</span>
              </button>)}
            </div>

            <div className="mt-4 border-t border-white/[0.07] pt-4">
              <div className="flex items-center justify-between"><span className="text-[11px] font-semibold text-white">政府端支持</span><span className="font-mono text-[8px] text-[#5d626d]">SERVICE ACCESS</span></div>
              <button type="button" onClick={() => scrollTo('services')} className="mt-2 flex w-full items-center gap-3 border border-[#b866ff]/20 bg-[#160f20] px-3 py-3 text-left hover:bg-[#1e132b]"><Landmark className="size-4 text-[#be75ff]" /><span className="flex-1"><span className="block text-[10px] text-white">查看驻外经商机构与权益保护入口</span><span className="mt-1 block text-[8px] text-[#6f6377]">按目标市场匹配可用公共服务</span></span><ChevronRight className="size-3.5 text-[#8f5bae]" /></button>
            </div>
            <Button onClick={() => downloadActionPlan(profile, company, servicePriority)} className="mt-3 h-9 w-full rounded-none bg-[#f3f4f7] text-[10px] font-semibold text-[#0b0c10] hover:bg-white"><Download className="size-3.5" />下载我的行动清单</Button>
          </aside>
        </div>
      </section>

      <section className="border-y border-white/[0.06] bg-[#090a0f]">
        <div className="mx-auto grid max-w-[1920px] gap-px bg-white/[0.06] sm:grid-cols-2 xl:grid-cols-4">
          {[
            { code: '01', title: '国家监管压力', value: validatedSourceData.meta.countryCount, sub: `${validatedSourceData.meta.core4Count}个四维完整样本`, status: '①②③④' },
            { code: '02', title: '中企合规事件', value: validatedSourceData.meta.eventCount, sub: `${validatedSourceData.meta.confirmedEvents}条已确认 · ${validatedSourceData.meta.candidateEvents}条候选`, status: '逐案证据' },
            { code: '03', title: '监管主体', value: validatedSourceData.meta.regulatorCount, sub: '处罚、禁令、调查与诉讼', status: '机构图谱' },
            { code: '04', title: '企业健康度指标', value: validatedSourceData.meta.healthIndicatorCount, sub: '治理A + 法域B · 证据链评分', status: '0/3/5/8/10' },
          ].map((item) => <div key={item.code} className="bg-[#090a0f] px-5 py-4"><div className="flex items-center gap-2"><span className="font-mono text-[8px] text-[#ff4c5e]">{item.code}</span><span className="text-[11px] font-semibold text-white">{item.title}</span><span className="ml-auto border border-white/[0.07] px-1.5 py-0.5 text-[8px] text-[#646975]">{item.status}</span></div><div className="mt-3 flex items-end justify-between"><span className="font-mono text-2xl text-[#e7e8ec]">{item.value}</span><span className="text-[9px] text-[#595e68]">{item.sub}</span></div></div>)}
        </div>
      </section>

      <section id="logic" className="scroll-mt-24 mx-auto max-w-[1920px] px-3 py-6 sm:px-5">
        <div className="flex flex-wrap items-end justify-between gap-3"><SectionTitle eyebrow="DATA × LOGIC × SERVICE" title="从数据证据到企业行动的完整逻辑" note="四类数据进入三层主体，经跨境关联和分轨计算形成服务处置；每一步保留来源、版本和置信度。" /><div className="flex items-center gap-2 font-mono text-[8px] text-[#585d67]"><Database className="size-3.5 text-[#ff4357]" />采集 · 去重 · 版本化 · 证据核验</div></div>

        <div className="mt-4 grid gap-2 lg:grid-cols-3">
          {[
            { code: 'L1', title: '中国企业层｜被服务对象', icon: Building2, lines: ['集团、境外子公司与关联主体', '产品、技术、数据与供应链', '收入、资产、订单及人员暴露', '合规控制与整改准备度'] },
            { code: 'L2', title: '出海目的地层｜经营场景', icon: Globe2, lines: ['国家、区域组织与地方市场', '行业准入和市场限制', '本地监管与司法救济', '社会、劳工和经营安全'] },
            { code: 'L3', title: '外部监管层｜压力来源', icon: Scale, lines: ['立法、行政监管、法院与社会主体', '四项已测算压力维度', '域外适用与市场结果作为扩展层', '政策、法律、执法与救济阶段'] },
          ].map((layer) => { const Icon = layer.icon; return <div key={layer.code} className="panel-corners border border-white/[0.07] bg-[#0b0d13] p-4"><div className="flex items-center gap-3"><span className="grid size-8 place-items-center border border-[#ff4357]/25 bg-[#1d0f14] font-mono text-[9px] text-[#ff5d6d]">{layer.code}</span><Icon className="size-4 text-[#9a515d]" /><h3 className="text-xs font-semibold text-white">{layer.title}</h3></div><div className="mt-4 grid gap-2">{layer.lines.map((line) => <div key={line} className="flex items-center gap-2 text-[9px] text-[#696e78]"><span className="size-1 bg-[#ff4357]/70" />{line}</div>)}</div></div>; })}
        </div>

        <div className="mx-auto flex w-[92%] justify-center"><ArrowDown className="my-2 size-4 text-[#ff4357]" /></div>
        <div className="border border-[#b866ff]/20 bg-gradient-to-r from-[#150e1c] via-[#1b1022] to-[#150e1c] px-4 py-4 text-center">
          <div className="font-mono text-[8px] tracking-[0.18em] text-[#8b5aa7]">L4 · CROSS-BORDER MATCHING LAYER</div><h3 className="mt-1 text-sm font-semibold text-white">把“规则”准确匹配到“企业业务”</h3><div className="mt-3 flex flex-wrap justify-center gap-2">{associationViews.map((item) => <button key={item.id} type="button" onClick={() => { setActiveRelation(item.id); scrollTo('association'); }} className="border border-[#b866ff]/16 bg-[#110d16] px-3 py-1.5 text-[9px] text-[#806b8b] hover:border-[#b866ff]/40 hover:text-white">◇ {item.label}</button>)}</div>
        </div>
        <div className="mx-auto flex w-[92%] justify-center"><ArrowDown className="my-2 size-4 text-[#ff4357]" /></div>

        <div className="grid gap-2 md:grid-cols-5">
          {[
            ['T', '目的地总压力', '①②③各30% + ④10%', '#ff684c'],
            ['E', '中企事件证据', '206起事件 · 按监管国聚合', '#ff57cd'],
            ['R', '企业适用风险', '压力 × 暴露 × 事件信号', '#ff4054'],
            ['Q', '数据质量', '完整度、来源与核验状态', '#4be8e4'],
            ['A', '服务处置', '预警、诊断、指引与任务闭环', '#d36bff'],
          ].map(([code, title, text, color]) => <div key={code} className="border border-white/[0.07] bg-[#0b0d13] p-3"><div className="flex items-center gap-2"><span className="font-mono text-xl" style={{ color }}>{code}</span><div><div className="text-[10px] font-semibold text-white">{title}</div><div className="mt-0.5 text-[8px] text-[#5b606a]">{text}</div></div></div></div>)}
        </div>

        <div className="mt-4 border border-white/[0.07] bg-[#0b0d13] p-4">
          <div className="flex flex-wrap items-center justify-between gap-2"><SectionTitle eyebrow="ACADEMIC FRAMEWORK" title="四项已测算维度 + 两项理论扩展维度" /><span className="text-[8px] text-[#555a64]">基于规制工具“强制—激励—劝导”框架，并将政策不可预测性单列</span></div>
          <div className="mt-4 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">{methodologyDimensions.map((item) => <button key={item.code} type="button" disabled={!item.measured} onClick={() => { setPerspective(item.layer); scrollTo('overview'); }} className={cn('group border border-white/[0.06] bg-[#0e1016] p-3 text-left hover:border-white/20', !item.measured && 'cursor-default opacity-55')}><div className="flex items-center justify-between"><span className="font-mono text-lg" style={{ color: item.color }}>{item.code}</span><span className="border border-white/[0.07] px-1.5 py-0.5 text-[8px] text-[#626772]">{item.measured ? '已测算' : '扩展预留'}</span></div><div className="mt-2 text-[10px] font-semibold text-white">{item.title}</div><div className="mt-1.5 text-[8px] leading-4 text-[#666b75]">{item.text}</div></button>)}</div>
          <div className="mt-3 border-l-2 border-[#4be8e4]/60 bg-[#0b1719] px-3 py-2 text-[8px] leading-4 text-[#6d8487]">总指数仅对四维完整的 {validatedSourceData.meta.core4Count} 个国家/地区计算和排名；其余 {validatedSourceData.meta.countryCount - validatedSourceData.meta.core4Count} 个样本在总指数层显示为灰色，避免缺失维度被重新加权而造成误判。</div>
        </div>
      </section>

      <section className="border-y border-white/[0.06] bg-[#090a0f] py-6">
        <div className="mx-auto max-w-[1920px] px-3 sm:px-5">
          <div className="flex flex-wrap items-end justify-between gap-3"><SectionTitle eyebrow="EVIDENCE OVERVIEW" title="206起中企合规事件：从事实分布识别高频风险" note="事件记录与国家压力指数分开建模；用于验证监管落点、识别行业与领域集中度，不把相关性解释为监管动机。" /><div className="flex gap-2 font-mono text-[8px]"><span className="border border-[#38d3c0]/20 bg-[#0b1a19] px-2 py-1 text-[#38d3c0]">CONFIRMED {validatedSourceData.meta.confirmedEvents}</span><span className="border border-[#ff9d44]/20 bg-[#1b130d] px-2 py-1 text-[#ff9d44]">CANDIDATE {validatedSourceData.meta.candidateEvents}</span></div></div>
          <div className="mt-4 grid gap-3 xl:grid-cols-[1.05fr_.9fr_1.05fr]">
            <div className="panel-corners border border-white/[0.07] bg-[#0b0d13] p-4">
              <div className="flex items-center justify-between"><h3 className="text-[11px] font-semibold text-white">年度事件密度</h3><span className="font-mono text-[8px] text-[#5b606a]">2020—2026</span></div>
              <div className="mt-5 flex h-40 items-end gap-2">{eventYears.map((item) => <div key={item.name} className="flex h-full flex-1 flex-col justify-end gap-2"><span className="text-center font-mono text-[9px] text-[#ff6978]">{item.value}</span><div className="relative bg-[#2a161d]" style={{ height: `${Math.max(8, item.value / maxYearEvents * 100)}%` }}><div className="absolute inset-0 bg-gradient-to-t from-[#7b2330] to-[#ff4357] opacity-85" /></div><span className="text-center font-mono text-[8px] text-[#5d626d]">{item.name}</span></div>)}</div>
              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/[0.06] pt-3"><div><div className="font-mono text-lg text-white">{(validatedSourceData.meta.penaltyAmountUsd / 1e8).toFixed(1)}亿</div><div className="text-[8px] text-[#5d626d]">已记录美元金额</div></div><div><div className="font-mono text-lg text-[#ff596a]">{validatedSourceData.meta.severeEventCount}</div><div className="text-[8px] text-[#5d626d]">严重度4—5</div></div><div><div className="font-mono text-lg text-[#ff9d44]">{validatedSourceData.meta.pendingEventCount}</div><div className="text-[8px] text-[#5d626d]">调查/诉讼/待确认</div></div></div>
            </div>

            <div className="panel-corners border border-white/[0.07] bg-[#0b0d13] p-4">
              <div className="flex items-center justify-between"><h3 className="text-[11px] font-semibold text-white">行业事件分布</h3><span className="font-mono text-[8px] text-[#5b606a]">N = {validatedSourceData.meta.eventCount}</span></div>
              <div className="mt-4 space-y-2">{validatedSourceData.eventSummary.byIndustry.map((item, index) => { const mappedSector = eventIndustryToSector[item.name]; const active = company.eventIndustry === item.name; return <button key={item.name} type="button" aria-label={`选择${item.name}行业`} disabled={!mappedSector} onClick={() => mappedSector && setSector(mappedSector)} className={cn('block w-full border-l-2 border-transparent px-2 py-1.5 text-left transition-colors hover:bg-white/[0.025]', active && 'border-[#ff57cd] bg-[#1b101a]')}><div className="flex items-center justify-between text-[9px]"><span className={active ? 'text-white' : 'text-[#8b8f98]'}>{String(index + 1).padStart(2, '0')} · {item.name}</span><span className="font-mono text-white">{item.value}</span></div><div className="mt-1.5 h-1 bg-white/[0.05]"><div className="h-full bg-gradient-to-r from-[#74304d] to-[#ff57cd]" style={{ width: `${item.value / maxIndustryEvents * 100}%` }} /></div></button>; })}</div>
            </div>

            <div className="panel-corners border border-white/[0.07] bg-[#0b0d13] p-4">
              <div className="flex items-center justify-between"><h3 className="text-[11px] font-semibold text-white">企业合规健康度诊断</h3><span className="font-mono text-[8px] text-[#4be8e4]">{validatedSourceData.meta.healthIndicatorCount} INDICATORS</span></div>
              <p className="mt-2 text-[8px] leading-4 text-[#5f646e]">治理能力A与法域合规B共同构成证据化诊断；每项指标使用0/3/5/8/10级评分，并要求制度、记录和执行证据。</p>
              <div className="mt-3 grid grid-cols-3 gap-1.5">{validatedSourceData.healthDomains.map((item) => <div key={item.code} className="border border-white/[0.06] bg-[#0e1016] p-2"><div className="flex items-center justify-between"><span className="font-mono text-[9px] text-[#4be8e4]">{item.code}</span><span className="font-mono text-[10px] text-white">{item.count}</span></div><div className="mt-1 text-[8px] leading-3 text-[#666b75]">{item.name}</div></div>)}</div>
              <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-3 text-[8px]"><span className="text-[#5f646e]">A1—A6 治理与运营</span><ArrowRight className="size-3 text-[#b866ff]" /><span className="text-[#5f646e]">B1中国端 · B2目的地 · B3域外端</span></div>
            </div>
          </div>
        </div>
      </section>

      <section id="association" className="scroll-mt-24 border-y border-white/[0.06] bg-[#090a0f] py-6">
        <div className="mx-auto grid max-w-[1920px] gap-3 px-3 sm:px-5 xl:grid-cols-[1.2fr_.8fr]">
          <div className="panel-corners border border-white/[0.07] bg-[#0b0d13] p-4 sm:p-5">
            <SectionTitle eyebrow="DATA RELATIONSHIP" title="数据关联交互：这条规则为什么与你有关" note="选择连接点，查看企业数据如何与目的地和监管规则建立可解释关系。" />
            <div className="mt-4 grid gap-2 md:grid-cols-[190px_1fr]">
              <div className="space-y-1.5">{associationViews.map((item) => <button key={item.id} type="button" onClick={() => setActiveRelation(item.id)} className={cn('flex w-full items-center gap-2 border border-white/[0.06] bg-[#0e1016] px-3 py-2.5 text-left text-[9px] text-[#6b707a] hover:text-white', activeRelation === item.id && 'border-[#b866ff]/35 bg-[#181020] text-white')}><Network className={cn('size-3.5', activeRelation === item.id ? 'text-[#bf76ff]' : 'text-[#555a64]')} /><span className="flex-1">{item.label}</span><ChevronRight className="size-3" /></button>)}</div>
              <div className="relative min-h-[250px] overflow-hidden border border-white/[0.06] bg-[#090a0f] p-4">
                <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(#6e3c4a_1px,transparent_1px),linear-gradient(90deg,#6e3c4a_1px,transparent_1px)] [background-size:28px_28px]" />
                <div className="relative grid h-full grid-cols-[1fr_auto_1fr] items-center gap-3">
                  <div className="border border-[#ff4357]/22 bg-[#1a0f14]/90 p-3"><div className="font-mono text-[8px] text-[#8b5059]">ENTERPRISE NODE</div><div className="mt-2 text-[11px] font-semibold text-white">{company.company}</div><div className="mt-1 text-[9px] leading-4 text-[#686d77]">{company.product}</div></div>
                  <div className="flex w-24 items-center"><span className="h-px flex-1 bg-gradient-to-r from-[#ff4357] to-[#b866ff]" /><span className="flow-dot size-2 rounded-full bg-white shadow-[0_0_10px_white]" /><ArrowRight className="size-3.5 text-[#b866ff]" /></div>
                  <div className="border border-[#b866ff]/22 bg-[#150f1b]/90 p-3"><div className="font-mono text-[8px] text-[#80599a]">RULE NODE</div><div className="mt-2 text-[11px] font-semibold text-white">{profile.zh} · {profile.focus}</div><div className="mt-1 text-[9px] leading-4 text-[#686d77]">{relation.detail}</div></div>
                </div>
                <div className="relative mt-3 flex items-center justify-between border-t border-white/[0.06] pt-3"><span className="text-[9px] text-[#606570]">匹配结果</span><span className="font-mono text-[10px] text-[#c67cff]">{relation.result}</span></div>
              </div>
            </div>
          </div>

          <div className="panel-corners border border-white/[0.07] bg-[#0b0d13] p-4 sm:p-5">
            <div className="flex items-start justify-between"><SectionTitle eyebrow="ANALYST VIEW" title="研判观点：企业应该如何理解" /><Sparkles className="size-4 text-[#ff9d44]" /></div>
            <div className="mt-4 border-l-2 border-[#ff4357] bg-[#130f14] px-4 py-3"><div className="text-[9px] text-[#81525b]">核心判断</div><p className="mt-1 text-[12px] font-medium leading-5 text-white">{profile.view}</p></div>
            <div className="mt-3 grid grid-cols-2 gap-2"><div className="border border-white/[0.06] bg-[#0e1016] p-3"><div className="text-[9px] text-[#5d626c]">企业影响</div><p className="mt-1 text-[9px] leading-4 text-[#8a8e97]">{profile.impact}</p></div><div className="border border-white/[0.06] bg-[#0e1016] p-3"><div className="text-[9px] text-[#5d626c]">已收录中企事件</div><div className="mt-1 font-mono text-xl text-[#ff596a]">{validatedSourceData.eventCountByCountry[selectedName as keyof typeof validatedSourceData.eventCountByCountry] ?? 0} 起</div><p className="mt-1 text-[8px] leading-3 text-[#565b65]">按监管国聚合；事件样本不代表全部执法活动</p></div></div>
            <div className="mt-3 border-t border-white/[0.07] pt-3"><div className="flex items-center justify-between text-[9px]"><span className="text-[#626772]">国家维度覆盖 Q</span><span className="font-mono text-[#38d3c0]">{getPressure(selectedName)?.coverage ?? 0}/4 · {getPressure(selectedName)?.core ? '核心可比样本' : '仅分维度展示'}</span></div><div className="mt-2 h-1 bg-white/[0.06]"><div className="h-full bg-gradient-to-r from-[#6d2b36] via-[#ff4357] to-[#38d3c0]" style={{ width: `${(getPressure(selectedName)?.coverage ?? 0) * 25}%` }} /></div></div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1920px] px-3 py-6 sm:px-5">
        <SectionTitle eyebrow="IMPACT TRANSMISSION" title="影响如何传导到企业经营" note="从议题信号到规则落地，再到产品、供应链和合同，展示可验证的传导链；文本相似不单独作为因果证据。" />
        <div className="mt-4 flex flex-wrap gap-2">{impactEvents.map((item) => <button key={item.id} type="button" onClick={() => setActiveEvent(item.id)} className={cn('border border-white/[0.07] bg-[#0d0f15] px-3 py-2 text-[9px] text-[#686d77] hover:text-white', activeEvent === item.id && 'border-[#ff4357]/35 bg-[#1d1015] text-[#ff6978]')}>{item.title}</button>)}</div>
        <div className="mt-3 overflow-x-auto border border-white/[0.07] bg-[#0b0d13] p-5">
          <div className="flex min-w-[880px] items-center">{event.nodes.map((node, index) => <div key={node} className="contents"><div className="relative min-w-0 flex-1 border border-white/[0.07] bg-[#0e1016] p-3"><span className="font-mono text-[8px] text-[#ff4e60]">0{index + 1}</span><div className="mt-2 text-[10px] text-[#c7cad1]">{node}</div><span className="absolute bottom-0 left-0 h-px bg-[#ff4357]" style={{ width: `${22 + index * 16}%` }} /></div>{index < event.nodes.length - 1 && <div className="flex w-10 items-center"><span className="h-px flex-1 bg-[#6e2e38]" /><ArrowRight className="size-3 text-[#ff4357]" /></div>}</div>)}</div>
          <div className="mt-4 flex items-start gap-3 border border-[#ff9d44]/16 bg-[#1b130d] px-4 py-3"><TrendingUp className="mt-0.5 size-4 shrink-0 text-[#ff9d44]" /><div><div className="text-[9px] text-[#8b6844]">对企业的可见影响</div><p className="mt-1 text-[10px] leading-4 text-[#c8b9a9]">{event.impact}</p></div></div>
        </div>
      </section>

      <section id="services" className="scroll-mt-24 border-y border-white/[0.06] bg-[#090a0f] py-6">
        <div className="mx-auto grid max-w-[1920px] gap-3 px-3 sm:px-5 xl:grid-cols-[1fr_1fr]">
          <div className="panel-corners border border-white/[0.07] bg-[#0b0d13] p-4 sm:p-5">
            <SectionTitle eyebrow="GOVERNMENT SUPPORT" title="政府端服务支持" note={`系统已按${profile.zh}和${company.label}匹配可用服务，企业可从预警直接进入咨询与权益保护。`} />
            <div className="mt-4 grid gap-2 sm:grid-cols-2">{governmentServices.map((service) => { const Icon = service.icon; const active = requestedService === service.id; return <div key={service.id} className={cn('border border-white/[0.07] bg-[#0e1016] p-3', active && 'border-[#38d3c0]/30 bg-[#0b1a19]')}><div className="flex items-center gap-2"><Icon className={cn('size-4', active ? 'text-[#38d3c0]' : 'text-[#b866ff]')} /><h3 className="text-[10px] font-semibold text-white">{service.title}</h3></div><p className="mt-2 min-h-8 text-[9px] leading-4 text-[#666b75]">{service.text}</p><button type="button" onClick={() => setRequestedService(active ? null : service.id)} className={cn('mt-3 flex w-full items-center justify-center gap-1 border border-white/[0.07] py-1.5 text-[9px] text-[#747983] hover:text-white', active && 'border-[#38d3c0]/25 text-[#38d3c0]')} >{active ? <><Check className="size-3" />已加入服务单</> : <>申请支持<ChevronRight className="size-3" /></>}</button></div>; })}</div>
          </div>

          <div className="panel-corners border border-white/[0.07] bg-[#0b0d13] p-4 sm:p-5">
            <SectionTitle eyebrow="ENTERPRISE PLAYBOOK" title="企业建议：7 / 30 / 90天行动计划" note="先守红线和法定期限，再补证据与控制，最后调整组织、产品和供应链。" />
            <div className="mt-4 space-y-2">{[
              { day: '7D', title: '红线核验', text: '完成制裁、禁令、最终用户与法定期限筛查；确认是否需要暂停交易或升级决策。', icon: ShieldAlert, color: '#ff4357' },
              { day: '30D', title: '证据补齐', text: '完成适用性清单、数据流图、供应商穿透与产品技术文档，明确责任人与截止日。', icon: FileCheck2, color: '#ff9d44' },
              { day: '90D', title: '体系调整', text: '把高频规则嵌入产品、合同、采购、数据与海外运营流程，并用事件回溯检验控制效果。', icon: Workflow, color: '#b866ff' },
            ].map((plan) => { const Icon = plan.icon; return <div key={plan.day} className="grid grid-cols-[54px_1fr] border border-white/[0.07] bg-[#0e1016]"><div className="grid place-items-center border-r border-white/[0.07] font-mono text-sm" style={{ color: plan.color }}>{plan.day}</div><div className="p-3"><div className="flex items-center gap-2"><Icon className="size-3.5" style={{ color: plan.color }} /><span className="text-[10px] font-semibold text-white">{plan.title}</span></div><p className="mt-1 text-[9px] leading-4 text-[#666b75]">{plan.text}</p></div></div>; })}</div>
            <div className="mt-3 flex gap-2"><Button onClick={() => downloadActionPlan(profile, company, servicePriority)} className="h-8 flex-1 rounded-none bg-[#f3f4f7] text-[9px] font-semibold text-[#0b0c10] hover:bg-white"><Download className="size-3.5" />导出任务清单</Button><Button variant="outline" onClick={() => setSubscribed((value) => !value)} className={cn('h-8 flex-1 rounded-none border-[#b866ff]/20 bg-[#160f20] text-[9px] text-[#c88aff] hover:bg-[#21152d] hover:text-white', subscribed && 'border-[#38d3c0]/25 bg-[#0b1a19] text-[#38d3c0]')}><Bell className="size-3.5" />{subscribed ? '已订阅预警' : '订阅预警'}</Button></div>
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-[1920px] flex-wrap items-center justify-between gap-3 px-5 py-4 text-[8px] text-[#4e535d]">
        <span>企业适用风险用于监测、解释与服务排序，不构成违法概率、监管动机判断或法律意见</span>
        <span className="flex items-center gap-2 font-mono"><SearchCheck className="size-3 text-[#ff4357]" />证据可追溯<ChevronRight className="size-3" />规则可解释<ChevronRight className="size-3" />任务可执行<TimerReset className="ml-2 size-3 text-[#38d3c0]" />处置结果回写模型</span>
      </footer>
    </main>
  );
}
