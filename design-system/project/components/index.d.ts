// Powerpoint House Style — component props (documentation). All components draw at slide scale: 1 in = 96 px;
// body components fill the Slide body (1203 x 500 px) unless `width`/`height` are given.
import * as React from 'react';

export interface SlideProps { title?: string; subtitle?: string; source?: string; page?: number; tracker?: TrackerProps; dark?: boolean; children?: React.ReactNode }
export declare function Slide(props: SlideProps): React.ReactElement;

export interface TitleSlideProps { title: string; subtitle?: string; date?: string }
export declare function TitleSlide(props: TitleSlideProps): React.ReactElement;

export interface SectionDividerProps { number: string; title: string; page?: number }
export declare function SectionDivider(props: SectionDividerProps): React.ReactElement;

export interface AgendaProps { items: string[]; current?: number; title?: string; page?: number }
export declare function Agenda(props: AgendaProps): React.ReactElement;

export interface ExecSummaryProps { items: { label: string; text: string }[]; highlight?: number; width?: number; height?: number }
export declare function ExecSummary(props: ExecSummaryProps): React.ReactElement;

export interface KeyStatementProps { statement: string; attribution?: string; dark?: boolean; source?: string; page?: number }
export declare function KeyStatement(props: KeyStatementProps): React.ReactElement;

export interface EndSlideProps { title?: string; points?: string[] }
export declare function EndSlide(props: EndSlideProps): React.ReactElement;

export interface ImageTextProps { image: string; alt?: string; title: string; points?: string[]; side?: 'left' | 'right'; source?: string }
export declare function ImageText(props: ImageTextProps): React.ReactElement;

export interface KPIRowProps { items: { value: string; label: string; note?: string }[]; highlight?: number; width?: number; height?: number }
export declare function KPIRow(props: KPIRowProps): React.ReactElement;

export interface ColumnChartProps { categories: string[]; values: number[]; highlight?: number; callout?: { value: string; text: string }; width?: number; height?: number }
export declare function ColumnChart(props: ColumnChartProps): React.ReactElement;

export interface LineChartProps { categories: string[]; series: { name: string; values: number[] }[]; highlight?: number; min?: number; width?: number; height?: number }
export declare function LineChart(props: LineChartProps): React.ReactElement;

export interface BarRankingProps { data: { label: string; value: number }[]; highlightLabel?: string; sort?: boolean; width?: number; height?: number }
export declare function BarRanking(props: BarRankingProps): React.ReactElement;

export interface StackedBar100Props { categories: string[]; series: { name: string; values: number[] }[]; highlight?: number; width?: number; height?: number }
export declare function StackedBar100(props: StackedBar100Props): React.ReactElement;

export interface WaterfallProps { steps: { label: string; value?: number; total?: boolean }[]; width?: number; height?: number }
export declare function Waterfall(props: WaterfallProps): React.ReactElement;

export interface ScatterProps { points: { x: number; y: number; size?: number; label?: string }[]; highlightLabel?: string; xTitle?: string; yTitle?: string; width?: number; height?: number }
export declare function Scatter(props: ScatterProps): React.ReactElement;

export interface ChartCommentaryProps { chart: React.ReactNode; heading?: string; points?: string[]; width?: number; height?: number }
export declare function ChartCommentary(props: ChartCommentaryProps): React.ReactElement;

export interface MatrixProps { rows: string[]; cols: string[]; cells?: string[][]; highlight?: [number, number]; xTitle?: string; yTitle?: string; comment?: string; width?: number; height?: number }
export declare function Matrix(props: MatrixProps): React.ReactElement;

export interface HarveyBallTableProps { criteria: string[]; options: { name: string; scores: (0|1|2|3|4)[] }[]; highlight?: number; width?: number; height?: number }
export declare function HarveyBallTable(props: HarveyBallTableProps): React.ReactElement;

export interface BeforeAfterProps { fromTitle: string; toTitle: string; rows: { from: string; to: string; bold?: boolean }[]; width?: number; height?: number }
export declare function BeforeAfter(props: BeforeAfterProps): React.ReactElement;

export interface ChevronProcessProps { steps: { label: string; text?: string }[]; current?: number; result?: { label: string; text: string }; takeaway?: string; width?: number; height?: number }
export declare function ChevronProcess(props: ChevronProcessProps): React.ReactElement;

export interface TimelineProps { milestones: { date: string; label: string }[]; highlight?: number; width?: number; height?: number }
export declare function Timeline(props: TimelineProps): React.ReactElement;

export interface IssueTreeProps { root: string; branches: { label: string; children?: string[]; comment?: string }[]; highlight?: number; width?: number; height?: number }
export declare function IssueTree(props: IssueTreeProps): React.ReactElement;

export interface PyramidProps { levels: { label: string; text?: string }[]; highlight?: number; width?: number; height?: number }
export declare function Pyramid(props: PyramidProps): React.ReactElement;

export interface CycleProps { items: { label: string; text?: string }[]; highlight?: number; centre?: string; width?: number; height?: number }
export declare function Cycle(props: CycleProps): React.ReactElement;

export interface HubSpokeProps { centre: string; items: { label: string; text?: string }[]; highlight?: number; width?: number; height?: number }
export declare function HubSpoke(props: HubSpokeProps): React.ReactElement;

export interface TextColumnsProps { items: { label: string; text: string }[]; highlight?: number; takeaway?: string; width?: number; height?: number }
export declare function TextColumns(props: TextColumnsProps): React.ReactElement;

export interface TakeawayBoxProps { text: string; bottom?: boolean; width?: number }
export declare function TakeawayBox(props: TakeawayBoxProps): React.ReactElement;

export interface TrackerProps { n: number; current: number }
export declare function Tracker(props: TrackerProps): React.ReactElement;

export interface ChinaMapProps { data: Record<string, number>; highlight?: string[]; labels?: string[]; unit?: string; legend?: string; points?: string[]; heading?: string; width?: number; height?: number }
export declare function ChinaMap(props: ChinaMapProps): React.ReactElement;

export interface GanttProps { periods: string[]; rows: { label: string; start?: number; end?: number; milestone?: number; group?: boolean }[]; highlight?: number; width?: number; height?: number }
export declare function Gantt(props: GanttProps): React.ReactElement;

export interface FunnelProps { stages: { label: string; value: number | string; text?: string }[]; highlight?: number; width?: number; height?: number }
export declare function Funnel(props: FunnelProps): React.ReactElement;

export interface VennProps { sets: { label: string }[]; intersection?: { label: string; text: string }; width?: number; height?: number }
export declare function Venn(props: VennProps): React.ReactElement;

export interface OrgChartProps { root: { label: string; sub?: string }; children: { label: string; sub?: string; children?: string[] }[]; highlight?: number; width?: number; height?: number }
export declare function OrgChart(props: OrgChartProps): React.ReactElement;

export interface TempleProps { roof: string; pillars: { label: string; text: string }[]; foundation: string; highlight?: number; width?: number; height?: number }
export declare function Temple(props: TempleProps): React.ReactElement;

export interface DonutKPIProps { items: { value: number; label: string; note?: string }[]; highlight?: number; width?: number; height?: number }
export declare function DonutKPI(props: DonutKPIProps): React.ReactElement;

export interface PieProps { slices: { label: string; value: number }[]; highlight?: number; comment?: string; width?: number; height?: number }
export declare function Pie(props: PieProps): React.ReactElement;

export interface MarimekkoProps { segments: { label: string; size: number; shares: number[] }[]; players: string[]; highlight?: number; unit?: string; width?: number; height?: number }
export declare function Marimekko(props: MarimekkoProps): React.ReactElement;

export interface HeatmapProps { rows: string[]; cols: string[]; values: number[][]; highlight?: [number, number][]; suffix?: string; width?: number; height?: number }
export declare function Heatmap(props: HeatmapProps): React.ReactElement;
