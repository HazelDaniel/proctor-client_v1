/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { ChangeEvent, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Form } from "react-router-dom";
import { addType, clearError } from "~/reducers/global-types.reducer";
import { TableFormUpdateActionType } from "~/reducers/table-creation-form.reducer";
import { __setError } from "~/reducers/utils/shared-functions";
import { typeErrorStateSelector } from "~/store";
import { isEqual } from "~/utils/comparison";

export const EnumCreationForm: React.ForwardRefExoticComponent<
  React.RefAttributes<HTMLInputElement> & {props: {formDispatch: React.Dispatch<TableFormUpdateActionType | any>, tableID?: string}}
> = React.forwardRef(function InnerEnumCreationForm({props}, ref) {
  const {formDispatch, tableID} = props;

  const [enumFormState, enumFormDispatch] = useState<{
    typeName: string;
    typeEntries: string;
  }>({ typeName: "", typeEntries: "" });
  const dispatch = useDispatch();

  const { errorMessage, errorState } = useSelector(
    typeErrorStateSelector,
    isEqual
  );

  useEffect(() => {
    if (errorState && errorMessage)
      formDispatch(__setError(errorMessage, tableID));
  }, [errorMessage, tableID]);

  useEffect(() => {
    if (!errorState) return;
    const timeoutFn = setTimeout(() => dispatch(clearError()), 100);
    return () => {
      clearTimeout(timeoutFn);
    };
  }, [errorState]);

  return (
    <Form className="overflow-hidden flex flex-col md:flex-row items-center gap-8 h-[32rem] md:h-[20rem] w-full md:justify-start">
      <div className="w-full md:w-max h-[20rem] md:h-max flex items-center justify-start flex-col md:flex-row md:p-4 md:gap-[10%] md:mr-[20%]">
        <div className="h-full w-full md:w-max flex md:flex-col items-center md:items-start gap-2 justify-start">
          <label
            htmlFor="enum-name-column"
            className=" mr-4 truncate text-muted-foreground max-w-[10rem]"
          >
            Name
          </label>
          <input
            type="text"
            id="enum-name-column"
            className="h-[2.5rem] rounded-sm p-1 ring-outline1 ring-1"
            value={enumFormState.typeName}
            ref={ref}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              enumFormDispatch((prev) =>
                e.target.value === prev.typeName
                  ? prev
                  : { ...prev, typeName: e.target.value }
              );
            }}
          />
        </div>

        <div className="h-full w-full md:w-max flex md:flex-col items-center md:items-start gap-2 justify-start">
          <label
            htmlFor="enum-entries-column"
            className=" mr-4 truncate text-muted-foreground max-w-[10rem]"
          >
            Entries (Comma, separated)
          </label>
          <input
            type="text"
            id="enum-entries-column"
            className="h-[2.5rem] rounded-sm p-1 ring-outline1 ring-1"
            value={enumFormState.typeEntries}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              enumFormDispatch((prev) =>
                e.target.value === prev.typeEntries
                  ? prev
                  : { ...prev, typeEntries: e.target.value }
              );
            }}
          />
        </div>

        <div className="h-full w-max flex items-center justify-center">
          <button
            className="h-8 w-8 flex items-center justify-center"
            onClick={() => {
              enumFormDispatch({ typeEntries: "", typeName: "" });
            }}
          >
            <svg className="w-full h-full">
              <use xlinkHref="#trash"></use>
            </svg>
          </button>
        </div>
      </div>

      <input
        onClick={(e) => {
          e.preventDefault();
          dispatch(addType(enumFormState));
          enumFormDispatch({ typeEntries: "", typeName: "" });
        }}
        type="submit"
        value="create"
        className="capitalize w-max px-8 h-[3rem] rounded-md bg-fg/90 text-bg cursor-pointer ring-outline1 ring-offset-1 ring-1 mb-2 md:mb-0"
      />
    </Form>
  );
});
