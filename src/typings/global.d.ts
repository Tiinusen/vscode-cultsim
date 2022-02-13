export { };

declare global {
  type AcquireVsCodeApi = () => any

  namespace NodeJS {
    interface Global {
      window: any
      document: any
      vscode: any
      acquireVsCodeApi: AcquireVsCodeApi
    }
  }

  // const window: any;
  // const document: any;
  const vscode: any;
  const acquireVsCodeApi: AcquireVsCodeApi;
}
