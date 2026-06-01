import { BESSAssetDTO } from './assets/asset.dto';
import { BESSParameterBindingDTO, BESSParameterDefinitionDTO } from './parameters.dto';
import { BESSVendorProfileDTO } from './vendor-profile.dto';

/**
 * Container for all static metadata of a BESS.
 */
export interface BESSMetadataDTO {
  /**
   * The ID of the BESS.
   */
  id: string;

  /**
   * The ID of the plant that this BESS is installed in.
   */
  plantId: string;

  /**
   * All assets that belong to the BESS as a flat list, including the BESS itself,
   * as it takes part in the topology (as a parent of the transformer stations),
   * and has its own parameters.
   */
  assets: BESSAssetDTO[];

  /**
   * All connections between assets in the BESS as a flat list.
   * Logical and/or electrical connections between assets.
   */
  topology: BESSConnectionDTO[];

  /**
   * All parameter definitions that exist in the BESS scope.
   */
  parameterDefinitions: BESSParameterDefinitionDTO[];

  /**
   * All parameter bindings that define which parameters apply to which asset types
   * and optionally vendor profiles.
   */
  parameterBindings: BESSParameterBindingDTO[];

  /**
   * All vendor profiles that identify specific vendor model combinations.
   */
  vendorProfiles: BESSVendorProfileDTO[];
}

//------------------------------------------------------------------------------
// BESS connection

export interface BESSConnectionDTO {
  id: string;

  fromAssetId: string;
  toAssetId: string;
}
