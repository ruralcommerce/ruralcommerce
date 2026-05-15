import type { BlockData } from '@/lib/editor-types';
import { SiteStreamBlocks } from '@/components/SiteStreamBlocks';

/** @deprecated Use `SiteStreamBlocks` — kept for imports existentes. */
export function LayoutBlocksRenderer(props: { blocks: BlockData[]; locale: string }) {
  return <SiteStreamBlocks {...props} />;
}
