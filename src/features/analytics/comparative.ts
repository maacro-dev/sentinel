import { YieldByLocationView } from '@/features/analytics/views/YieldByLocationView';
import { YieldByMethodView } from '@/features/analytics/views/YieldByMethodView';
import { YieldByVarietyView } from '@/features/analytics/views/YieldByVarietyView';
import { DamageByCauseView } from '@/features/analytics/views/DamageByCauseView';
import { ComparativeView, ComparativeViewComponent } from '@/features/analytics/types';
import { DamageByLocationView } from './views/DamageByLocationView';

export type MoreFilters = { variety: string[], method: string[] }

export const comparativeViewMap: Record<ComparativeView, ComparativeViewComponent> = {
  'yield-location': YieldByLocationView,
  'yield-method': YieldByMethodView,
  'yield-variety': YieldByVarietyView,
  'damage-location': DamageByLocationView,
  'damage-cause': DamageByCauseView,
} as const;

