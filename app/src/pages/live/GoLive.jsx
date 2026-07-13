/**
 * Go Live — single file rendered at both `/live/go-live` (form) and
 * `/live/go-live/:streamId` (camera + live), mode driven by the route param.
 * See "Pre-broadcast / during-broadcast screen — a single file" in
 * LIVE_STREAM_MOBILE_BROADCAST.md.
 */

import { useParams } from 'react-router-dom';

import DuringBroadcast from './DuringBroadcast';
import PreBroadcast from './PreBroadcast';

export default function GoLive() {
  const { streamId } = useParams();
  return streamId ? <DuringBroadcast streamId={streamId} /> : <PreBroadcast />;
}
