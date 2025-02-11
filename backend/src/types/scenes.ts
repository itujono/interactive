export type SceneKey = 'space' | 'flow-field' | 'garden';
export type SceneLabel = 'Space' | 'Flow Field' | 'Garden';
export type SceneMap = {
  [key in SceneKey]: SceneLabel;
};

export interface ScenePayload {
  displays?: number;
  controls?: number;
  // Add other specific payload types as needed
  [key: string]: unknown;
}

export interface SceneMessage {
  type: 'SCENE_CHANGE' | 'SCENE_STATUS' | 'CONTROL_INPUT';
  scene?: SceneKey;
  status?: 'loading' | 'ready' | 'error';
  payload?: ScenePayload;
  clientType?: 'control' | 'display';
}
