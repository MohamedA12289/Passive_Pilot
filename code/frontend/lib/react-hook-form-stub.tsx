/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import * as React from "react";

export type FieldValues = Record<string, any>;
export type FieldPath<TFieldValues extends FieldValues = FieldValues> = string;
export type ControllerProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  name: TName;
  render?: any;
  [key: string]: any;
};

export function Controller(_props: ControllerProps) {
  return null;
}

export const FormProvider: React.FC<any> = ({ children, ...props }) => (
  <form {...props}>{children}</form>
);

export function useFormContext() {
  return {
    getFieldState: (_name: string, _formState?: any) => ({
      error: { message: undefined as string | undefined },
    }),
    formState: {},
  };
}
