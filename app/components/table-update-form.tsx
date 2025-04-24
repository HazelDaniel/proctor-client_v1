/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import {
  compositionSelector,
  graphSelector,
  savedTableSelector,
  tableUpdateModalSelector,
  typeDefaultSelector,
  typeMappingSelector,
} from "~/store";
import { isEqual } from "~/utils/comparison";
import { useSelector, useDispatch } from "react-redux";

import { v7 as UUIDv7 } from "uuid";
import { Form } from "@remix-run/react";
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
import { Check, MessageSquareWarningIcon, X } from "lucide-react";
import {
  TableFormColumnSelectType,
  GlobalColumnIndexType,
  GlobalColumnTypeType,
  NodeCompositeID,
  TableCRUDFormStateType,
  TableCRUDColumnType,
} from "~/types";
import { tableColumnFields } from "~/data/table-form";
import { useDebounce } from "~/hooks/usedebounce";
import {
  initialTableUpdateFormState,
  tableUpdateFormReducer,
} from "~/reducers/table-update-form.reducer";
import {
  __addColumn,
  __addToComposite,
  __clearError,
  __dropColumn,
  __removeFromComposite,
  __replaceTable,
  __setDefault,
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
  tableUpdateContext,
  TableUpdateContextValueType,
  TableUpdateProvider,
} from "~/contexts/table-update-form.context";
import { useContextSelector } from "~/hooks/usecontextselector";

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
import { setActiveNode, updateNodeGroup } from "~/reducers/nodes.reducer";
import { closeUpdateFormModal } from "~/reducers/update-form-modal.reducer";
import { hasInboundEdges, hasOutboundEdges } from "~/reducers/graph.reducer";

export const TableUpdateForm: React.FC<{ id: string }> = React.memo(
  function InnerTableUpdateForm({ id }: { id: string }) {
    const globalDefaultsList = useSelector(typeDefaultSelector, isEqual);
    const globalTypeMappings = useSelector(typeMappingSelector, isEqual);
    const dispatch = useDispatch();

    const tableUpdateModal = useSelector(tableUpdateModalSelector);

    const {
      tableUpdateState: updateFormState,
      tableUpdateDispatch: updateFormDispatch,
    } = useContext(tableUpdateContext) as TableUpdateContextValueType;

    const [tableName, setTableName] = useState<string>(updateFormState[id]?.tableName || "");
    const debouncedName = useDebounce(tableName, 1000);

    const [tableActionButtonClicks, setTableActionButtonClicks] =
      useState<number>(0);

    const formCloseButtonRef = useRef<HTMLButtonElement>(null);

    const columns: (TableCRUDColumnType & { id: string })[] = useMemo(() => {
      if (!updateFormState[id] || !tableUpdateModal.open) {
        return [];
      }
      return Object.entries(updateFormState[id]?.columns)?.map(([k, v]) => {
        const key: NodeCompositeID = k as NodeCompositeID;
        return { id: key, ...v };
      });
    }, [id, updateFormState, tableUpdateModal]);

    const appendedTypes = useMemo(() => {
      return Object.keys(globalTypeMappings);
    }, [globalTypeMappings]);

    const composition = useSelector(compositionSelector, isEqual);
    const graph = useSelector(graphSelector, isEqual);

    useEffect(() => {
      updateFormDispatch(__setTableName(debouncedName, id));
    }, [debouncedName]);

    // 'FLASHING' THE ERROR STATE
    useEffect(() => {
      if (!updateFormState[id]?.errorState) return;
      const timeoutFn = setTimeout(
        () => updateFormDispatch(__clearError(id)),
        5000
      );
      return () => {
        clearTimeout(timeoutFn);
      };
    }, [updateFormState[id].errorState, updateFormState, id]);

    // AFTER FORM HAS BEEN SUCCESSFULLY VALIDATED FOR SUBMISSION
    useEffect(() => {
      if (updateFormState[id]?.errorState || !id) return;
      if (
        formCloseButtonRef.current &&
        tableActionButtonClicks &&
        updateFormState[id]
      ) {
        dispatch(setCurrentGroupID(id));
        dispatch(upload(updateFormState[id]));
        dispatch(updateNodeGroup({ group: updateFormState[id] }));
        formCloseButtonRef.current.click();
      }
    }, [tableActionButtonClicks, id]);

    console.log("current table state is ", updateFormState[id]);

    return (
      <>
        <div className="w-full h-full overflow-hidden">
          <Form className="w-full h-[6rem] bg-slate-900/5 flex flex-col md:flex-row items-center justify-between md:pl-[4rem] rounded-md">
            {/* <p className="w-[20rem] p-2 shadow-none rounded-md h-8 caret-outline1d bg-canvas order-1 md:order-0"> */}
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
            {/* </p> */}

            <div
              className={
                "md:w-[60%] w-full flex items-center justify-end h-[40%] md:h-full bg-[#ff1d1d23] px-4 order-0 md:order-1" +
                `${!updateFormState[id]?.errorState ? " invisible" : ""}`
              }
            >
              <span className="w-8 h-8">
                <MessageSquareWarningIcon color="#ff2424d2" />
              </span>
              <p className="flex-1 text-danger h-full flex items-center pl-8">
                {updateFormState[id]?.errorMessage || ""}
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
                {columns?.map((column) =>
                  column.isSurrogate ? (
                    // <TableRow>
                    // </TableRow>
                    <>
                      <TableRow
                        key={column.id}
                        className="h-8 bg-secondary/80 opacity-55"
                      >
                        <TableCell className=" form-table-cell">
                          <div className="w-full bg-outline1 border-dashed border-primary flex items-center justify-center h-8 my-auto rounded-sm">
                            <p className="text-red w-full flex items-center justify-center">
                              {column.name || ""}
                            </p>
                          </div>
                        </TableCell>

                        <TableCell className=" form-table-cell">
                          <div className="w-full bg-outline1 border-dashed border-primary flex items-center justify-center h-8 rounded-sm">
                            <p className="text-red w-full flex items-center justify-center">
                              {column.type || ""}
                            </p>
                          </div>
                        </TableCell>

                        <TableCell className="max-h-[5rem] form-table-cell">
                          <div className="w-full bg-outline1 border-dashed border-primary flex items-center justify-center h-8 rounded-sm">
                            <p className="text-red w-full flex items-center justify-center">
                              {column.index || ""}
                            </p>
                          </div>
                        </TableCell>

                        <TableCell className="text-right h-max form-table-cell">
                          <div className="w-full bg-outline1 border-dashed border-primary flex items-center justify-center h-8 rounded-sm">
                            {column.nullable ? <Check /> : <X />}
                          </div>
                        </TableCell>

                        <TableCell className="text-right h-max form-table-cell">
                          <div className="w-full bg-outline1 border-dashed border-primary flex items-center justify-center h-8 rounded-sm">
                            {column.unique ? <Check /> : <X />}
                          </div>
                        </TableCell>

                        <TableCell className="w-[8rem] h-max form-table-cell">
                          <div className="w-full bg-outline1 border-dashed border-primary flex items-center justify-center h-8 rounded-sm">
                            <p className="text-red w-full flex items-center justify-center">
                              {column.default || ""}
                            </p>
                          </div>
                        </TableCell>

                        <TableCell className="w-[8rem] h-max form-table-cell">
                          <div className="w-full bg-outline1 border-dashed border-primary flex items-center justify-center h-8 rounded-sm">
                            <p className="text-red w-full flex items-center justify-center">
                              {"NONE"}
                            </p>
                          </div>
                        </TableCell>

                        <TableCell className="w-[8rem] h-[8rem] form-table-cell"></TableCell>
                      </TableRow>
                    </>
                  ) : (
                    <TableRow key={column.id}>
                      <TableColumnNameForm
                        name={column.name || ""}
                        columnID={column.id || ""}
                        tableID={id}
                        columnIndex={column.index || "NONE" as GlobalColumnIndexType}
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
                          tableID={id}
                        />
                      </TableCell>

                      <TableCell className="max-h-[5rem] form-table-cell">
                        <FormColumnSelectList
                          select={tableColumnFields.index}
                          columnID={column.id}
                          intent="index"
                          tableID={id}
                        />
                      </TableCell>

                      <TableCell className="text-right h-max form-table-cell">
                        <TableCheckbox
                          id={`${column.name}-nullible`}
                          columnID={column.id}
                          intent="nullibility"
                          tableID={id}
                        />
                      </TableCell>

                      <TableCell className="text-right h-max form-table-cell">
                        <TableCheckbox
                          id={`${column.name}-unique`}
                          columnID={column.id}
                          intent="uniqueness"
                          tableID={id}
                        />
                      </TableCell>

                      <TableCell className="w-[8rem] h-max form-table-cell">
                        <FormColumnSelectList
                          select={globalDefaultsList}
                          columnID={column.id}
                          intent="default"
                          tableID={id}
                        />
                      </TableCell>

                      <TableCell className="w-[8rem] h-max form-table-cell">
                        <FormCompositeSelectList
                          columnID={column.id}
                          tableID={id}
                        />
                      </TableCell>

                      <TableCell className="w-[8rem] h-[8rem] form-table-cell">
                        <div
                          className="w-6 h-6 flex items-center justify-end cursor-pointer ml-auto"
                          onClick={() => {
                            let compositeRep: string | null = null;
                            const isReferencing = hasOutboundEdges(
                              graph,
                              column.id,
                              "node"
                            );

                            const isReferenced = hasInboundEdges(
                              graph,
                              column.id,
                              "node"
                            );

                            if (
                              column.index !== "COMPOSITE_FOREIGN" &&
                              column.index !== "COMPOSITE_PRIMARY"
                            ) {
                              compositeRep = getCompositeRep(
                                composition,
                                id,
                                column.id
                              );
                            }

                            updateFormDispatch(
                              __dropColumn(column.id, id, {
                                isCompositeMember: !!compositeRep,
                                isReferencing,
                                isReferenced,
                              })
                            );

                            if (
                              !compositeRep &&
                              !isReferencing &&
                              !isReferenced
                            ) {
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
                  )
                )}
              </TableBody>
            </Table>

            <div className="w-[15rem] h-2 bg-outline1 mx-auto rounded-full"></div>

            <TableFormCTAArea setClickAction={() => void 0} tableID={id} />
          </div>
        </div>

        <DialogFooter className="sm:justify-start w-full">
          <div className="w-full flex justify-end">
            <button
              className="w-[8rem] h-[3.2rem] bg-canvas text-fg mr-8 outline-double rounded-md"
              onClick={() => {
                if (!formCloseButtonRef.current) return;
                formCloseButtonRef.current.click();

                dispatch(setActiveNode({ activeNodeID: null }));
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="w-[8rem] h-[3.2rem] bg-fg text-bg rounded-md hover:ring-fg ring-offset-2 active:border-2"
              onClick={() => {
                if (updateFormState[id]?.errorState) return;
                if (formCloseButtonRef.current) {
                  updateFormDispatch(__validate());
                  setTableActionButtonClicks((prev) => prev + 1);

                  dispatch(setActiveNode({ activeNodeID: null }));
                }
              }}
            >
              Continue
            </button>

            <DialogClose asChild className="w-[8rem] h-[3.2rem] hidden">
              <button
                ref={formCloseButtonRef}
                onClick={() => {
                  dispatch(setActiveNode({ activeNodeID: null }));
                }}
              ></button>
            </DialogClose>
          </div>
        </DialogFooter>
      </>
    );
  },
  (prev, next) => isEqual(prev, next)
);

export const TableColumnNameForm: React.FC<{
  name: string;
  columnID: string;
  tableID: string;
  columnIndex: GlobalColumnIndexType
}> = ({ name, columnID, tableID, columnIndex }) => {
  const [colunmName, setColumnName] = useState(name);
  const debouncedName = useDebounce(colunmName, 1500);
  const composition = useSelector(compositionSelector, isEqual);

  const columnNameInputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState<boolean>(false);

  const { tableUpdateDispatch } = useContext(
    tableUpdateContext
  ) as TableUpdateContextValueType;

  useEffect(() => {
    // TODO: run the reducer dispatcher here

    let compositeRep: string | null = null;
    if (
      columnIndex !== "COMPOSITE_FOREIGN" &&
      columnIndex !== "COMPOSITE_PRIMARY"
    ) {
      compositeRep = getCompositeRep(
        composition,
        tableID,
        columnID
      );
    }

    tableUpdateDispatch(__setName(columnID, debouncedName, tableID, {isCompositeMember: !!compositeRep}));
  }, [debouncedName, tableID]);

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

export const TableFormCTAArea: React.FC<{
  setClickAction: React.Dispatch<React.SetStateAction<number>>;
  tableID: string;
}> = React.memo(
  function InnerTableFormCTA({
    setClickAction,
    tableID,
  }: {
    setClickAction: React.Dispatch<React.SetStateAction<number>>;
    tableID: string;
  }) {
    const { tableUpdateDispatch } = useContext(
      tableUpdateContext
    ) as TableUpdateContextValueType;

    return (
      <>
        <div className="w-max flex mx-auto h-max gap-8">
          <button
            className="capitalize h-[35px] w-max px-4  flex items-center justify-center gap-2 rounded-lg ring-1 ring-outline1 mx-auto my-4"
            onClick={() => tableUpdateDispatch(__addColumn(tableID))}
          >
            Add Column
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

export const FormColumnSelectList: React.FC<{
  select: TableFormColumnSelectType;
  columnID: string;
  intent: "default" | "index" | "type";
  tableID: string;
}> = ({ select, columnID, intent, tableID }) => {
  const { tableUpdateDispatch } = useContext(
    tableUpdateContext
  ) as TableUpdateContextValueType;
  const dispatch = useDispatch();

  const graph = useSelector(graphSelector, isEqual);
  const composition = useSelector(compositionSelector, isEqual);

  const columnIndex = useContextSelector<
    TableUpdateContextValueType,
    GlobalColumnIndexType
  >(tableUpdateContext as any, selectIndex, [columnID, tableID]);

  const columnDefault = useContextSelector<TableUpdateContextValueType, string>(
    tableUpdateContext as any,
    selectDefault,
    [columnID, tableID]
  );

  const columnType = useContextSelector<
    TableUpdateContextValueType,
    GlobalColumnTypeType
  >(tableUpdateContext as any, selectType, [columnID, tableID]);

  return (
    <Select
      onValueChange={(e: GlobalColumnTypeType) => {
        switch (intent) {
          case "default":
            tableUpdateDispatch(__setDefault(columnID, e));
            break;
          case "index": {
            const compositeRep = getCompositeRep(
              composition,
              tableID,
              columnID
            );

            let isCompositeRepReferenced: boolean = false;
            if (compositeRep) {
              isCompositeRepReferenced = hasInboundEdges(
                graph,
                compositeRep,
                "node"
              );
            }
            const invariantConfig = {
              isReferenced: hasInboundEdges(graph, columnID, "node"),
              isReferencing: hasOutboundEdges(graph, columnID, "node"),
              isCompositeRepReferenced,
            };

            tableUpdateDispatch(
              __setIndex(
                columnID,
                e as unknown as GlobalColumnIndexType,
                tableID,
                invariantConfig
              )
            );

            if (!compositeRep) {
              dispatch(
                removeCompositionParent(columnID as unknown as NodeCompositeID)
              );
            }
            break;
          }
          case "type":
            {
              const repNode = getCompositeRep(composition, tableID, columnID);
              let isCompositeRepReferenced: boolean = false;
              if (repNode) {
                isCompositeRepReferenced = hasInboundEdges(
                  graph,
                  repNode,
                  "node"
                );
              }
              const invariantConfig = {
                isReferenced: hasInboundEdges(graph, columnID, "node"),
                isReferencing: hasOutboundEdges(graph, columnID, "node"),
                isCompositeRepReferenced,
              };

              tableUpdateDispatch(
                __setType(columnID, e, tableID, invariantConfig)
              );
            }
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

export const TableCheckbox: React.FC<{
  id: string;
  columnID: string;
  intent: "nullibility" | "uniqueness";
  tableID: string;
}> = ({ id, columnID, intent, tableID }) => {
  const { tableUpdateDispatch } = useContext(
    tableUpdateContext
  ) as TableUpdateContextValueType;
  const [isChecked, setChecked] = useState<boolean>(false);

  const columnNullibility = useContextSelector<
    TableUpdateContextValueType,
    boolean
  >(tableUpdateContext as any, selectNullibility, [columnID, tableID]);

  const columnUniqueness = useContextSelector<
    TableUpdateContextValueType,
    boolean
  >(tableUpdateContext as any, selectUniqueness, [columnID, tableID]);

  useEffect(() => {
    if (intent === "nullibility")
      tableUpdateDispatch(__toggleNullibility(columnID, tableID));
    else tableUpdateDispatch(__toggleUniqueness(columnID, tableID));
  }, [intent, isChecked, tableID]);

  return (
    <div className="flex items-center space-x-2 justify-center">
      <Checkbox
        id={id}
        onClick={() => {
          setChecked((prev) => !prev);
        }}
        checked={
          intent === "nullibility" ? columnNullibility : columnUniqueness
        }
      />
    </div>
  );
};

export const FormCompositeSelectList: React.FC<{
  columnID: string;
  tableID: string;
}> = ({ columnID, tableID }) => {
  const checkboxRef = useRef<
    Omit<CheckboxProps & React.RefAttributes<HTMLButtonElement>, "ref"> &
      React.RefAttributes<HTMLButtonElement>
  >(null);
  const dispatch = useDispatch();

  const { tableUpdateState, tableUpdateDispatch } = useContext(
    tableUpdateContext
  ) as TableUpdateContextValueType;

  const itemList = useContextSelector<TableUpdateContextValueType, string[]>(
    tableUpdateContext as any,
    selectCompositeColumns,
    [columnID, tableID]
  );

  const composition = useSelector(compositionSelector, isEqual);

  const graph = useSelector(graphSelector, isEqual);

  useEffect(() => {
    const prevItems =
      getNodePropsFromIDS(
        tableUpdateState[tableID]?.columns[columnID]
          .compositeOn as unknown as []
      ) || [];
    const resItems = prevItems.map(
      (el) => selectColumnIDFromName(tableUpdateState, el, tableID) || ""
    );
    if (!resItems.length) return;
    dispatch(
      addCompositions([columnID as unknown as NodeCompositeID, resItems])
    );
  }, [tableUpdateState, columnID, tableID]);

  const itemListSelection = useMemo(() => itemList, [itemList]);

  const handleAddPlaceholder = useCallback(
    () => (item: string) => {
      const invariantConfig = {
        isReferenced: hasInboundEdges(graph, columnID, "node"),
      };

      tableUpdateDispatch(
        __addToComposite(columnID, item, tableID, invariantConfig)
      );
      const resItemID = selectColumnIDFromName(tableUpdateState, item);
      dispatch(
        addComposition([columnID as NodeCompositeID, resItemID as string])
      );
    },
    [itemList, tableID, columnID, composition, graph]
  );

  const handleRemovePlaceholder = useCallback(
    () => (item: string) => {
      tableUpdateDispatch(__removeFromComposite(columnID, item, tableID));
      const resItemID = selectColumnIDFromName(tableUpdateState, item);
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
              tableUpdateState[tableID]?.columns[columnID]
                ?.compositeOn as unknown as []
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
                    tableUpdateState[tableID]?.columns[columnID]
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
