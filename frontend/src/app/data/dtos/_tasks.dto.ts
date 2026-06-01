//------------------------------------------------------------------------------------
// Tasks & Tickets
//

export interface TaskNodeDefinitionDTO {
  id: string;
  name: string;
  description: string;
  isLeaf: boolean;
  childrenIds: string[];

  forceOrder: boolean; // Applicable for groups only
}
