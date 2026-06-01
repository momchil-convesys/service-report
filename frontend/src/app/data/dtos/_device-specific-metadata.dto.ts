export interface DeviceSpecificMetadata {
  /**
   * Indicates weather the devices have temperature sensors installed.
   */
  hasTemperatureSensors?: boolean;

  /**
   * Indicates max power for the device in kW. E.g: 550 kW
   */
  deviceMaxPower?: number | null;

  /**
   * Indicates if "Inverters" tab should be shown
   * (applicable for transformer stations).
   */
  hasInverters?: boolean;

  /**
   * For battery devices (hybrid inverters).
   */
  hasPV?: boolean;
}
