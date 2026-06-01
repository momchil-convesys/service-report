/**
 * Vendor Profile
 * Identifies a specific vendor model combination.
 */
export interface BESSVendorProfileDTO {
  /**
   * ID, e.g. "VendorA-BB1", "VendorB-BB3"
   */
  id: string;

  /**
   * Human-readable name
   */
  name: string;

  /**
   * Manufacturer name
   */
  vendor: string;

  /**
   * Optional model identifier
   */
  model?: string | null;

  /**
   * Optional description
   */
  description?: string | null;
}
