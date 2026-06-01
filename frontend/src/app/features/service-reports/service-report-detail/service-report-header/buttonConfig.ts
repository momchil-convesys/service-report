export interface ButtonConfig {
  /** Button identifier used for button element in the HTML */
  buttonId?: string;
  /** Button label */
  label?: string;
  /** Button context to use predefined button styles */
  context?: ButtonContext;
  /** Button class */
  class?: string;
  /** Funtion for button visibility */
  isVisible: () => boolean;
  /** Function to be executed when the button is clicked */
  onClick: () => void;
  /** Function to determine if the button is disabled */
  isDisabled: () => boolean;
  customEnable?: () => boolean;
  order?: number;
}
// export interface ButtonsState {
//   activeSaveButton?: boolean;
//   showSaveButton?: boolean;
//   showUpdateButton: boolean;
//   showCancelButton: boolean;
//   showBackButton: boolean;
//   showCreateLikeButton?: boolean;
//   activeCreateLikeButton?: boolean;
//   showDownloadReport?: boolean;
//   // showSaveDraftButton: boolean;
//   // activeSaveDraftButton: boolean;
// }
export enum ButtonContext {
  SUCCESS = 'success',
  PRIMARY = 'primary',
  DANGER = 'danger',
}
