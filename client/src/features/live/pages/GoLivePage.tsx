import { ScreenBar } from '@/shared/layout';

import { GoLiveFormBody } from '../ui/GoLiveFormBody';
import { useGoLiveForm } from '../ui/useGoLiveForm';

/** Go-live setup — terms, metadata, thumbnail, then create stream → on-air. */
export default function GoLivePage() {
  const flow = useGoLiveForm();

  return (
    <GoLiveFormBody
      flow={flow}
      header={
        <ScreenBar title="Go Live" subtitle="Title and details — camera opens after Go Live" onBack={flow.goList} />
      }
    />
  );
}
