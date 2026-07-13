import { Provider } from 'react-redux';

import { graphicsBootstrapStore } from './bootstrapStore';

export function GraphicsStoreProvider({ children }) {
  return <Provider store={graphicsBootstrapStore}>{children}</Provider>;
}
