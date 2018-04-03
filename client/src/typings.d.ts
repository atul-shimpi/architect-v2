/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
  id: string;
}

declare module 'sortablejs' {
    let exportAs: any;
    export = exportAs;
}
