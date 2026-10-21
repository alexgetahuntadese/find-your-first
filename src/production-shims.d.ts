declare module "react-hook-form" {
  export type FieldValues = Record<string, unknown>;
  export type FieldPath<TFieldValues extends FieldValues = FieldValues> = string & keyof TFieldValues;
  export type ControllerProps<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>> = { name: TName; [key: string]: unknown };
  export const Controller: any;
  export const FormProvider: any;
  export const useFormContext: any;
}

declare module "@tanstack/react-start/server-entry" {
  const serverEntry: any;
  export default serverEntry;
}

declare module "@tanstack/react-start" {
  type MiddlewareContext = { next: () => Promise<Response> | Response; handlerType: string };
  export function createMiddleware(): { server: (handler: (context: MiddlewareContext) => unknown) => unknown };
  export function createCsrfMiddleware(options: { filter: (context: MiddlewareContext) => boolean }): unknown;
  export function createStart(factory: () => unknown): any;
}
