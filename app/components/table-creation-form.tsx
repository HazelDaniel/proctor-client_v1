/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { v7 as UUIDv7 } from "uuid";
import { Form } from "@remix-run/react";
import React, {
  ChangeEvent,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { CheckboxProps } from "@radix-ui/react-checkbox";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

import { Checkbox } from "~/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { MessageSquareWarningIcon } from "lucide-react";
import {
  TableFormColumnSelectType,
  GlobalColumnIndexType,
  GlobalColumnTypeType,
  NodeCompositeID,
} from "~/types";
import { tableColumnFields } from "~/data/table-form";
import { useDebounce } from "~/hooks/usedebounce";
import { isEqual } from "~/utils/comparison";
import {
  initialTableCreationFormState,
  tableCreationFormReducer,
} from "~/reducers/table-creation-form.reducer";
import {
  __addColumn,
  __addToComposite,
  __clearError,
  __dropColumn,
  __removeFromComposite,
  __setDefault,
  __setError,
  __setIndex,
  __setName,
  __setTableName,
  __setType,
  __toggleNullibility,
  __toggleUniqueness,
  __validate,
  selectColumnIDFromName,
  selectCompositeColumns,
  selectDefault,
  selectIndex,
  selectNullibility,
  selectType,
  selectUniqueness,
} from "~/reducers/utils/shared-functions";
import {
  TableCreationContextValueType,
  TableCreationProvider,
  tableCreationContext,
} from "~/contexts/table-creation-form.context";
import { useContextSelector } from "~/hooks/usecontextselector";
import { useDispatch, useSelector } from "react-redux";
import {
  compositionSelector,
  typeDefaultSelector,
  typeErrorStateSelector,
  typeMappingSelector,
} from "~/store";
import { addType, clearError } from "~/reducers/global-types.reducer";
import { DialogFooter } from "./ui/dialog";
import { DialogClose } from "@radix-ui/react-dialog";
import { setCurrentGroupID, upload } from "~/reducers/table-to-node.reducer";
import { getNodePropsFromIDS } from "~/utils/node.utils";
import {
  addComposition,
  addCompositions,
  getCompositeRep,
  removeComposition,
  removeCompositionParent,
} from "~/reducers/composition.reducer";

export const TableCheckbox: React.FC<{
  id: string;
  columnID: string;
  intent: "nullibility" | "uniqueness";
}> = ({ id, columnID, intent }) => {
  const { tableCreationDispatch } = useContext(
    tableCreationContext
  ) as TableCreationContextValueType;
  const [isChecked, setChecked] = useState<boolean>(false);

  const columnNullibility = useContextSelector<
    TableCreationContextValueType,
    boolean
  >(tableCreationContext as any, selectNullibility, [columnID]);

  const columnUniqueness = useContextSelector<
    TableCreationContextValueType,
    boolean
  >(tableCreationContext as any, selectUniqueness, [columnID]);

  useEffect(() => {
    if (intent === "nullibility")
      tableCreationDispatch(__toggleNullibility(columnID));
    else tableCreationDispatch(__toggleUniqueness(columnID));
  }, [intent, isChecked]);

  return (
    <div className="flex items-center space-x-2 justify-center">
      <Checkbox
        id={id}
        onClick={(_) => {
          setChecked((prev) => !prev);
        }}
        checked={
          intent === "nullibility" ? columnNullibility : columnUniqueness
        }
      />
    </div>
  );
};

export const TableCompositeListCheckbox: React.ForwardRefExoticComponent<
  Omit<CheckboxProps & React.RefAttributes<HTMLButtonElement>, "ref"> &
    React.RefAttributes<HTMLButtonElement> & {
      addPlaceholder: (item: string) => void;
      removePlaceholder: (item: string) => void;
      optText: string;
      itemList: string[];
    }
> = React.forwardRef(function TableCompositeListCheckboxInner(prop, ref) {
  const { id, addPlaceholder, removePlaceholder, optText, itemList } = prop;
  const [isChecked, setChecked] = useState<boolean>(false);

  useEffect(() => {
    setChecked(itemList.includes(optText));
  }, [itemList]);

  if (!prop) return null;

  return (
    <div className="flex items-center space-x-2 justify-between w-full">
      <p className="inline w-max">{optText}</p>
      <Checkbox
        id={id}
        onClick={(e) => {
          setChecked((prev) => !prev);
          const { target } = e;
          const siblingPElement = (
            target as HTMLInputElement
          ).parentElement?.querySelector("p");
          if (isChecked) {
            removePlaceholder(siblingPElement?.textContent || "");
            return;
          }
          addPlaceholder(siblingPElement?.textContent || "");
        }}
        ref={ref}
        checked={isChecked}
      />
    </div>
  );
});

export const FormCompositeSelectList: React.FC<{
  columnID: string;
}> = ({ columnID }) => {
  const checkboxRef = useRef<
    Omit<CheckboxProps & React.RefAttributes<HTMLButtonElement>, "ref"> &
      React.RefAttributes<HTMLButtonElement>
  >(null);
  const dispatch = useDispatch();

  const { tableCreationState, tableCreationDispatch } = useContext(
    tableCreationContext
  ) as TableCreationContextValueType;

  const itemList = useContextSelector<TableCreationContextValueType, string[]>(
    tableCreationContext as any,
    selectCompositeColumns,
    [columnID]
  );

  useEffect(() => {
    const prevItems =
      getNodePropsFromIDS(
        tableCreationState.columns[columnID].compositeOn as unknown as []
      ) || [];
    const resItems = prevItems.map(
      (el) => selectColumnIDFromName(tableCreationState, el) || ""
    );
    if (!resItems.length) return;
    dispatch(
      addCompositions([columnID as unknown as NodeCompositeID, resItems])
    );
  }, [tableCreationState, columnID]);

  const itemListSelection = useMemo(() => itemList, [itemList]);

  const handleAddPlaceholder = useCallback(
    () => (item: string) => {
      tableCreationDispatch(__addToComposite(columnID, item));
      const resItemID = selectColumnIDFromName(tableCreationState, item);
      dispatch(
        addComposition([columnID as NodeCompositeID, resItemID as string])
      );
    },
    [itemList]
  );

  const handleRemovePlaceholder = useCallback(
    () => (item: string) => {
      tableCreationDispatch(__removeFromComposite(columnID, item));
      const resItemID = selectColumnIDFromName(tableCreationState, item);
      dispatch(
        removeComposition([
          columnID as NodeCompositeID,
          resItemID as string as NodeCompositeID,
        ])
      );
    },
    [itemList]
  );

  return (
    <Select>
      <SelectTrigger className="w-[180px]">
        <SelectValue
          placeholder={(
            getNodePropsFromIDS(
              tableCreationState.columns[columnID].compositeOn as unknown as []
            ) || ["NONE"]
          ).join(", ")}
        />
      </SelectTrigger>
      <SelectContent>
        <div className="w-full h-max min-h-[4rem]">
          {itemListSelection.map((el) => (
            <div
              className="w-full h-[4rem] flex gap-2 items-center justify-between px-2"
              key={`${columnID}-${el}`}
            >
              <TableCompositeListCheckbox
                id={`${columnID}-${el}`}
                ref={checkboxRef as any}
                addPlaceholder={handleAddPlaceholder()}
                removePlaceholder={handleRemovePlaceholder()}
                itemList={
                  getNodePropsFromIDS(
                    tableCreationState.columns[columnID]
                      .compositeOn as unknown as []
                  ) || ["NONE"]
                }
                optText={el}
              />
            </div>
          ))}
        </div>
      </SelectContent>
    </Select>
  );
};

export const FormColumnSelectList: React.FC<{
  select: TableFormColumnSelectType;
  columnID: string;
  intent: "default" | "index" | "type";
}> = ({ select, columnID, intent }) => {
  const { tableCreationDispatch } = useContext(
    tableCreationContext
  ) as TableCreationContextValueType;
  const dispatch = useDispatch();
  const globalTypeMappings = useSelector(typeMappingSelector, isEqual);

  const columnIndex = useContextSelector<
    TableCreationContextValueType,
    GlobalColumnIndexType
  >(tableCreationContext as any, selectIndex, [columnID]);

  const columnDefault = useContextSelector<
    TableCreationContextValueType,
    string
  >(tableCreationContext as any, selectDefault, [columnID]);

  const columnType = useContextSelector<
    TableCreationContextValueType,
    GlobalColumnTypeType
  >(tableCreationContext as any, selectType, [columnID]);

  return (
    <Select
      onValueChange={(e: GlobalColumnTypeType) => {
        switch (intent) {
          case "default":
            tableCreationDispatch(__setDefault(columnID, e));
            break;
          case "index":
            if (
              (e as unknown as GlobalColumnIndexType) !== "COMPOSITE_FOREIGN" &&
              (e as unknown as GlobalColumnIndexType) !== "COMPOSITE_PRIMARY"
            )
              dispatch(
                removeCompositionParent(columnID as unknown as NodeCompositeID)
              );
            tableCreationDispatch(
              __setIndex(columnID, e as unknown as GlobalColumnIndexType)
            );
            break;
          case "type":
            tableCreationDispatch(__setType(columnID, e, "", {}, globalTypeMappings));
            break;
          default:
            throw new Error("selection intent not implemented yet");
            break;
        }
      }}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue
          placeholder={
            intent === "index"
              ? columnIndex
              : intent === "type"
              ? columnType
              : columnDefault
          }
        />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {intent === "index"
            ? select.entries
                .filter((el) => el !== "COMPOSITE_FOREIGN")
                .map((el) => {
                  return (
                    <SelectItem
                      value={`${el}`}
                      className="hover:bg-outline1 hover:text-canvas"
                      key={el}
                    >
                      {el}
                    </SelectItem>
                  );
                })
            : select.entries.map((el) => {
                return (
                  <SelectItem
                    value={`${el}`}
                    className="hover:bg-outline1 hover:text-canvas"
                    key={el}
                  >
                    {el}
                  </SelectItem>
                );
              })}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

const EnumCreationForm: React.ForwardRefExoticComponent<
  React.RefAttributes<HTMLInputElement>
> = React.forwardRef(function InnerCreationForm(_, ref) {
  const [enumFormState, enumFormDispatch] = useState<{
    typeName: string;
    typeEntries: string;
  }>({ typeName: "", typeEntries: "" });
  const dispatch = useDispatch();
  const { tableCreationDispatch } = useContext(
    tableCreationContext
  ) as TableCreationContextValueType;

  const { errorMessage, errorState } = useSelector(
    typeErrorStateSelector,
    isEqual
  );

  useEffect(() => {
    if (errorState && errorMessage)
      tableCreationDispatch(__setError(errorMessage));
  }, [errorMessage]);

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

export const TableColumnNameForm: React.FC<{
  name: string;
  columnID: string;
}> = ({ name, columnID }) => {
  const [colunmName, setColumnName] = useState(name);
  const debouncedName = useDebounce(colunmName, 1500);

  const columnNameInputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState<boolean>(false);

  const { tableCreationDispatch } = useContext(
    tableCreationContext
  ) as TableCreationContextValueType;

  useEffect(() => {
    // TODO: run the reducer dispatcher here
    tableCreationDispatch(__setName(columnID, debouncedName));
  }, [debouncedName]);

  useEffect(() => {
    if (focused) return;

    if (columnNameInputRef.current) {
      columnNameInputRef.current.focus();
      setFocused(true);
    }
  }, [columnNameInputRef, focused]);

  return (
    <>
      <TableCell className="font-medium form-table-cell">
        <input
          type="text"
          name=""
          id=""
          value={colunmName}
          ref={columnNameInputRef}
          onChange={(e) => {
            setColumnName(e.target.value);
          }}
          className="w-full p-2 shadow-input shadow-none rounded-md h-8 caret-outline1d placeholder:text-outline1 placeholder:italic bg-canvas"
        />
      </TableCell>
    </>
  );
};

export const TableNameForm: React.FC = () => {
  const [tableName, setTableName] = useState("");
  const debouncedName = useDebounce(tableName, 1000);

  const { tableCreationDispatch } = useContext(
    tableCreationContext
  ) as TableCreationContextValueType;

  useEffect(() => {
    tableCreationDispatch(__setTableName(debouncedName));
  }, [debouncedName]);

  return (
    <input
      type="text"
      name=""
      value={tableName}
      id=""
      placeholder="input table name"
      className="w-[20rem] p-2 shadow-input shadow-none rounded-md h-8 caret-outline1d placeholder:text-outline1 placeholder:italic bg-canvas order-1 md:order-0"
      onChange={(e) => {
        setTableName(e.target.value);
      }}
    />
  );
};

export const TableFormCTAArea: React.FC<{
  setClickAction: React.Dispatch<React.SetStateAction<number>>;
}> = React.memo(
  function InnerTableFormCTA({ setClickAction }) {
    const { tableCreationDispatch } = useContext(
      tableCreationContext
    ) as TableCreationContextValueType;

    return (
      <>
        <div className="w-max flex mx-auto h-max gap-8">
          <button
            className="capitalize h-[35px] w-max px-4  flex items-center justify-center gap-2 rounded-lg ring-1 ring-outline1 mx-auto my-4"
            onClick={() => tableCreationDispatch(__addColumn())}
          >
            Add Column
            <span className="inline-flex w-4 h-4 items-center justify-center">
              <svg>
                <use xlinkHref="#plus"></use>
              </svg>
            </span>
          </button>

          <button
            className="capitalize h-[35px] w-max px-4  flex items-center justify-center gap-2 rounded-lg ring-1 ring-outline1 mx-auto my-4"
            onClick={() => {
              setClickAction((prev) => prev + 1);
            }}
          >
            Create Enum
            <span className="inline-flex w-4 h-4 items-center justify-center">
              <svg>
                <use xlinkHref="#plus"></use>
              </svg>
            </span>
          </button>
        </div>
      </>
    );
  },
  (prev, next) => isEqual(prev, next)
);

export const TableCreationForm: React.FC = React.memo(
  function InnerTableCreationForm() {
    const globalDefaultsList = useSelector(typeDefaultSelector, isEqual);
    const globalTypeMappings = useSelector(typeMappingSelector, isEqual);
    const dispatch = useDispatch();

    const composition = useSelector(compositionSelector, isEqual);

    const [creationFormState, creationFormDispatch] = useReducer(
      tableCreationFormReducer,
      initialTableCreationFormState,
      (state) => {
        return {
          ...state,
          tableID: UUIDv7(),
          typeMappings: globalTypeMappings,
        };
      }
    );

    const [enumLabelClicks, setEnumLabelClicks] = useState<number>(0);
    const [tableActionButtonClicks, setTableActionButtonClicks] =
      useState<number>(0);

    const formCloseButtonRef = useRef<HTMLButtonElement>(null);
    const creationFormValue: TableCreationContextValueType = useMemo(
      () => ({
        tableCreationState: creationFormState,
        tableCreationDispatch: creationFormDispatch,
        state: creationFormState,
      }),
      [creationFormState, creationFormDispatch]
    );

    const columns = useMemo(() => {
      return Object.entries(creationFormState.columns).map(([k, v]) => {
        return { id: k, ...v };
      });
    }, [creationFormState.columns]);

    const appendedTypes = useMemo(() => {
      return Object.keys(globalTypeMappings);
    }, [globalTypeMappings]);

    const enumCreationLabelRef = useRef<HTMLInputElement>(null);

    // 'FLASHING' THE ERROR STATE
    useEffect(() => {
      if (!creationFormState.errorState) return;
      let timeoutFn = setTimeout(
        () => creationFormDispatch(__clearError()),
        5000
      );
      return () => {
        clearTimeout(timeoutFn);
      };
    }, [creationFormState.errorState]);

    // WHEN YOU CLICK ON THE 'CREATE ENUM' BUTTON
    useEffect(() => {
      if (enumCreationLabelRef.current && enumLabelClicks) {
        enumCreationLabelRef.current.focus();
      }
    }, [enumCreationLabelRef, enumLabelClicks]);

    // AFTER FORM HAS BEEN SUCCESSFULLY VALIDATED FOR SUBMISSION
    useEffect(() => {
      if (creationFormState.errorState || !creationFormState.tableID) return;
      if (formCloseButtonRef.current && tableActionButtonClicks) {
        dispatch(setCurrentGroupID(creationFormState.tableID as string));
        dispatch(upload(creationFormState));
        formCloseButtonRef.current.click();
      }
    }, [tableActionButtonClicks]);

    return (
      <>
        <TableCreationProvider value={creationFormValue}>
          <div className="w-full h-full overflow-hidden">
            <Form className="w-full h-[6rem] bg-slate-900/5 flex flex-col md:flex-row items-center justify-between md:pl-[4rem] rounded-md">
              <TableNameForm />

              <div
                className={
                  "md:w-[60%] w-full flex items-center justify-end h-[40%] md:h-full bg-[#ff1d1d23] px-4 order-0 md:order-1" +
                  `${!creationFormState.errorState ? " invisible" : ""}`
                }
              >
                <span className="w-8 h-8">
                  <MessageSquareWarningIcon color="#ff2424d2" />
                </span>
                <p className="flex-1 text-danger h-full flex items-center pl-8">
                  {creationFormState.errorMessage || ""}
                </p>
              </div>
            </Form>

            <div className="w-full h-max flex flex-col overflow-auto flex-1 table-form-wrapper min-h-[43rem] md:min-h-[25rem]">
              <Table className="min-w-[60rem] relative min-h-[45rem]">
                <TableHeader className="">
                  <TableRow>
                    <TableHead className="w-[100px]">Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Index</TableHead>
                    <TableHead className="text-center">Nullible?</TableHead>
                    <TableHead className="text-center">Unique?</TableHead>
                    <TableHead className="text-center">DEFAULT</TableHead>
                    <TableHead className="text-center">Composite On</TableHead>
                    <TableHead className="text-right w-8"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {columns.map((column) => (
                    <TableRow key={column.id}>
                      <TableColumnNameForm
                        name={column.name || ""}
                        columnID={column.id || ""}
                      />

                      <TableCell className=" form-table-cell">
                        <FormColumnSelectList
                          select={{
                            ...tableColumnFields.type,
                            entries: [
                              ...tableColumnFields.type.entries,
                              ...appendedTypes,
                            ],
                          }}
                          columnID={column.id}
                          intent="type"
                        />
                      </TableCell>

                      <TableCell className="max-h-[5rem] form-table-cell">
                        <FormColumnSelectList
                          select={tableColumnFields.index}
                          columnID={column.id}
                          intent="index"
                        />
                      </TableCell>

                      <TableCell className="text-right h-max form-table-cell">
                        <TableCheckbox
                          id={`${column.name}-nullible`}
                          columnID={column.id}
                          intent="nullibility"
                        />
                      </TableCell>

                      <TableCell className="text-right h-max form-table-cell">
                        <TableCheckbox
                          id={`${column.name}-unique`}
                          columnID={column.id}
                          intent="uniqueness"
                        />
                      </TableCell>

                      <TableCell className="w-[8rem] h-max form-table-cell">
                        <FormColumnSelectList
                          select={globalDefaultsList}
                          columnID={column.id}
                          intent="default"
                        />
                      </TableCell>

                      <TableCell className="w-[8rem] h-max form-table-cell">
                        <FormCompositeSelectList columnID={column.id} />
                      </TableCell>

                      <TableCell className="w-[8rem] h-[8rem] form-table-cell">
                        <div
                          className="w-6 h-6 flex items-center justify-end cursor-pointer ml-auto"
                          onClick={() => {
                            const compositeRep = getCompositeRep(
                              composition,
                              creationFormState.tableID as string,
                              column.id
                            );
                            creationFormDispatch(
                              __dropColumn(
                                column.id,
                                creationFormState.tableID,
                                {
                                  isCompositeMember: !!compositeRep,
                                }
                              )
                            );

                            if (!compositeRep) {
                              dispatch(
                                removeCompositionParent(
                                  column.id as unknown as NodeCompositeID
                                )
                              );
                            }
                          }}
                        >
                          <svg className="w-full h-full">
                            <use xlinkHref="#trash"></use>
                          </svg>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="w-[15rem] h-2 bg-outline1 mx-auto rounded-full"></div>

              <TableFormCTAArea setClickAction={setEnumLabelClicks} />

              <EnumCreationForm ref={enumCreationLabelRef} />
            </div>
          </div>
        </TableCreationProvider>

        <DialogFooter className="sm:justify-start w-full">
          <div className="w-full flex justify-end">
            <button
              className="w-[8rem] h-[3.2rem] bg-canvas text-fg mr-8 outline-double rounded-md"
              onClick={() => {
                if (!formCloseButtonRef.current) return;
                formCloseButtonRef.current.click();
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="w-[8rem] h-[3.2rem] bg-fg text-bg rounded-md hover:ring-fg ring-offset-2 active:border-2"
              onClick={() => {
                if (creationFormState.errorState) return;
                if (formCloseButtonRef.current) {
                  creationFormDispatch(__validate());
                  setTableActionButtonClicks((prev) => prev + 1);
                }
              }}
            >
              Continue
            </button>

            <DialogClose asChild className="w-[8rem] h-[3.2rem] hidden">
              <button ref={formCloseButtonRef}></button>
            </DialogClose>
          </div>
        </DialogFooter>
      </>
    );
  },
  (prev, next) => isEqual(prev, next)
);
