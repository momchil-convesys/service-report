export interface TaskNodeDefinition {
  id: string;
  name: string;
  description: string;
  isLeaf: boolean;
  childrenIds: string[];
  children?: TaskNodeDefinition[];
  parentNodeId?: string; // TODO: make not optional

  forceOrder: boolean; // Applicable for groups only
}
