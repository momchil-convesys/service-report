import { BESSAssetType } from './assets/asset-base.dto';

/**
 * Definition of a parameter.
 * Represents the meaning of the parameter globally.
 * One parameter can be used for different asset types.
 * E.g., "activePower" can be used for inverters, transformer stations, battery containers, etc.
 */
export interface BESSParameterDefinitionDTO {
  /**
   * Numeric string identifier, e.g. "1", "2", "3".
   * Primary key in the parameter definition table.
   */
  id: string;

  /**
   * Developer friendly key.
   * Maybe used to semantically chose parameters for certain assets.
   * E.g., "activePower", "batteryVoltage", "batteryTemperature", etc.
   */
  key: string;

  /**
   * Display name.
   * E.g., "Active Power", "Battery Voltage", "Battery Temperature", etc.
   */
  name: string;

  /**
   * Default display unit.
   * E.g., "kW", "%", "V", "A", "°C".
   */
  unit?: string | null; // null if not applicable

  /**
   * Default formatting precision (number of decimal places).
   * E.g., 2 for 0.00, 1 for 0.0, 0 for 0.
   */
  precision?: number | null; // null if not applicable

  /**
   * The kind of value this parameter represents.
   * E.g: activePower is instantaneous, energyCounter is cumulative, deviceState is enum.
   */
  valueKind?: 'instantaneous' | 'cumulative' | 'enum';
}

/**
 * Parameter Binding
 * Defines applicability of a parameter to an assetType and optionally a vendor.
 *
 * A parameter only applies to an asset if a binding exists
 * for (assetType) or (assetType + vendorProfile).
 *
 * If a parameter is bound to an assetType,
 * it applies to all assets of that type.
 *
 * If a parameter is bound to a vendorProfile,
 * it applies to all assets of that type that have that vendorProfile.
 */
export interface BESSParameterBindingDTO {
  /**
   * ID of the parameter being bound ("1", "2", ...)
   */
  parameterId: string;

  /**
   * Which assetType this applies to (BatteryContainer, Inverter, ...)
   */
  assetType: BESSAssetType;

  /**
   * OPTIONAL — only applies to assets of this vendor model.
   * If omitted → binding applies to the entire assetType.
   */
  vendorProfileId?: string | null;

  /**
   * Optional overrides of formatting.
   * If provided, these override the default unit/precision from parameter definition.
   */
  unit?: string | null;
  precision?: number | null;

  /**
   * Optional override of display name
   * E.g: logical "soc" parameter with default name "State of Charge" can be overridden
   * to "Container SoC" or "Rack SoC" for specific assets.
   */
  displayName?: string | null;
}
