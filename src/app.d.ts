declare global {
  namespace App {
    interface PageState {
      focus?: string;

      editFile?: {
        id: number | string;
        searchPath?: string;
      };
    }
  }
}
export {};
