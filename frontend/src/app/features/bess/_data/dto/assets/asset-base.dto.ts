export enum BESSAssetType {
  BESSItself = 'BESSItself', // The BESS itself is also an asset
  TransformerStation = 'BESSTransformerStation',
  Inverter = 'BESSInverter',
  BatteryContainer = 'BESSBatteryContainer', // Physical container for batteries
  BatteryRack = 'BESSBatteryRack', // Usually 6 racks per container
  BatteryPack = 'BESSBatteryPack', // Usually 8 packs per rack
  BatteryCell = 'BESSBatteryCell', // Up to 120 cells per pack
}

export interface BESSAssetBaseDTO {
  id: string;
  type: BESSAssetType;
  name: string;

  /**
   * Index of the asset in its parent group,
   * usually starting from 1.
   *
   * E.g:
   * - Transformer Station 05 has display index 5.
   * - Battery Container with name "04_02" has display index 2.
   * - Inverter with name "05.02_07" has display index 7.
   *
   * The display index should be provided only where applicable.
   * It is used in the UI to display the asset name in a more readable or compact format.
   *
   * E.g:
   * If asset name is "05.02_07",
   * in some cases it can be displayed in the UI as "INV 07" or "Inverter 7".
   */
  displayIndex?: number;

  /**
   * Optional vendor profile ID.
   * Links this asset to a specific vendor profile for parameter binding resolution.
   * If omitted, only asset-type-level parameter bindings apply.
   */
  vendorProfileId?: string | null;
}
