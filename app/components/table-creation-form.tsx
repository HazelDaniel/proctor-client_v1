import { Form } from "@remix-run/react";
import React, {
  useCallback,
  useEffect,
  useMemo,
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
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { MessageSquareWarningIcon } from "lucide-react";
import { TableFormColumnSelectType } from "~/types";
import { tableColumnFields } from "~/data/table-form";
import { useDebounce } from "~/hooks/usedebounce";
import { isEqual } from "~/utils/comparison";

const columns = [
  {
    invoice: "INV001",
    paymentStatus: "Paid",
    totalAmount: "$250.00",
    paymentMethod: "Credit Card",
    name: "ID",
    id: "ID",
  },
  {
    invoice: "INV002",
    paymentStatus: "Pending",
    totalAmount: "$150.00",
    paymentMethod: "PayPal",
    name: "date_created",
    id: "date_created",
  },
  {
    invoice: "INV003",
    paymentStatus: "Unpaid",
    totalAmount: "$350.00",
    paymentMethod: "Bank Transfer",
    name: "date_updated",
    id: "date_updated",
  },
  {
    invoice: "INV004",
    paymentStatus: "Paid",
    totalAmount: "$450.00",
    paymentMethod: "Credit Card",
    name: "price",
    id: "price",
  },
  {
    invoice: "INV005",
    paymentStatus: "Paid",
    totalAmount: "$550.00",
    paymentMethod: "PayPal",
    name: "discount",
    id: "discount",
  },
  {
    invoice: "INV006",
    paymentStatus: "Pending",
    totalAmount: "$200.00",
    paymentMethod: "Bank Transfer",
    name: "user_id",
    id: "user_id",
  },
  {
    invoice: "INV007",
    paymentStatus: "Unpaid",
    totalAmount: "$300.00",
    paymentMethod: "Credit Card",
    name: "customer_name",
    id: "customer_name",
  },
];

export const TableCheckbox: React.FC<{ id: string; columnID: string }> = ({
  id,
  columnID,
}) => {
  return (
    <div className="flex items-center space-x-2 justify-center">
      <Checkbox id={id} />
    </div>
  );
};

export const TableCompositeListCheckbox: React.ForwardRefExoticComponent<
  Omit<CheckboxProps & React.RefAttributes<HTMLButtonElement>, "ref"> &
    React.RefAttributes<HTMLButtonElement> & {
      addPlaceholder: (item: string) => void;
      removePlaceholder: (item: string) => void;
      optText: string;
      selectedItemList: string[];
    }
> = React.forwardRef((prop, ref) => {
  if (!prop) return null;
  const { id, addPlaceholder, removePlaceholder, optText, selectedItemList } =
    prop;
  const [isChecked, setChecked] = useState<boolean>(false);

  useEffect(() => {
    setChecked(selectedItemList.includes(optText));
  }, [selectedItemList]);

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
          ).parentElement?.querySelector("p")!;
          if (isChecked) {
            removePlaceholder(siblingPElement.textContent || "");
            return;
          }
          addPlaceholder(siblingPElement.textContent || "");
        }}
        ref={ref}
        checked={isChecked}
      />
    </div>
  );
});

export const FormCompositeSelectList: React.FC<{
  rowID: string;
  columnID: string;
}> = ({ rowID, columnID }) => {
  const itemList = ["NONE", "customer_id", "ordered_at"];
  const checkboxRef = useRef<
    Omit<CheckboxProps & React.RefAttributes<HTMLButtonElement>, "ref"> &
      React.RefAttributes<HTMLButtonElement>
  >(null);

  const [selectedItemList, setSelectedItemList] = useState(["NONE"]);

  const handleAddPlaceholder = useCallback(
    () => (item: string) => {
      if (selectedItemList.includes(item)) return;
      if (item === "NONE") {
        setSelectedItemList(["NONE"]);
        return;
      }
      setSelectedItemList((prev) => [
        ...prev.filter((e) => e !== "NONE"),
        item,
      ]);
    },
    [selectedItemList]
  );

  const handleRemovePlaceholder = useCallback(
    () => (item: string) => {
      if (!selectedItemList.includes(item)) return;
      if (selectedItemList.length === 1 && item === "NONE") {
        return;
      }
      setSelectedItemList((prev) => {
        const res = prev.filter((e) => e !== item);
        if (res.length === 0) return ["NONE"];
        return res;
      });
    },
    [selectedItemList]
  );

  return (
    <Select>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder={selectedItemList.join(", ")} />
      </SelectTrigger>
      <SelectContent>
        <div className="w-full h-max min-h-[4rem]">
          {itemList.map((el) => (
            <div
              className="w-full h-[4rem] flex gap-2 items-center justify-between px-2"
              key={`${rowID}-${el}`}
            >
              <TableCompositeListCheckbox
                id={`${rowID}-${el}`}
                ref={checkboxRef as any}
                addPlaceholder={handleAddPlaceholder()}
                removePlaceholder={handleRemovePlaceholder()}
                selectedItemList={selectedItemList}
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
}> = ({ select, columnID }) => {
  return (
    <Select
      onValueChange={(e) => {
        console.log(`selected ${e}`);
      }}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue
          placeholder={select.defaultible ? select.default : select.placeholder}
        />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {select.entries.map((el) => {
            return (
              <SelectItem
                value={el}
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

const EnumCreationForm: React.FC = React.memo(
  () => {
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
              defaultValue={"RANDOM_ENUM"}
              id="enum-name-column"
              className="h-[2.5rem] rounded-sm p-1 ring-outline1 ring-1"
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
              defaultValue={"'cup', 'tea', 'coffee'"}
              id="enum-entries-column"
              className="h-[2.5rem] rounded-sm p-1 ring-outline1 ring-1"
            />
          </div>

          <div className="h-full w-max flex items-center justify-center">
            <button className="h-8 w-8 flex items-center justify-center">
              <svg className="w-full h-full">
                <use xlinkHref="#trash"></use>
              </svg>
            </button>
          </div>
        </div>

        <input
          type="submit"
          value="create"
          className="capitalize w-max px-8 h-[3rem] rounded-md bg-fg/90 text-bg cursor-pointer ring-outline1 ring-offset-1 ring-1 mb-2 md:mb-0"
        />
      </Form>
    );
  },
  (prev, next) => isEqual(prev, next)
);

export const TableNameColumn: React.FC<{ name: string; columnID: string }> = ({
  name,
}) => {
  const [colunmName, setColumnName] = useState(name);
  const debouncedName = useDebounce(colunmName, 3000);

  useEffect(() => {
    // TODO: run the reducer dispatcher here
  }, [debouncedName]);

  return (
    <>
      <TableCell className="font-medium w-32">
        <input
          type="text"
          name=""
          id=""
          value={colunmName}
          onChange={(e) => {
            setColumnName(e.target.value);
          }}
          className="w-full p-2 shadow-input shadow-none rounded-md h-8 caret-outline1d placeholder:text-outline1 placeholder:italic bg-canvas"
        />
      </TableCell>
    </>
  );
};

export const TableFormCTAArea: React.FC = React.memo(
  () => {
    return (
      <>
        <div className="w-max flex mx-auto h-max gap-8">
          <button className="capitalize h-[35px] w-max px-4  flex items-center justify-center gap-2 rounded-lg ring-1 ring-outline1 mx-auto my-4">
            Add Column
            <span className="inline-flex w-4 h-4 items-center justify-center">
              <svg>
                <use xlinkHref="#plus"></use>
              </svg>
            </span>
          </button>

          <button className="capitalize h-[35px] w-max px-4  flex items-center justify-center gap-2 rounded-lg ring-1 ring-outline1 mx-auto my-4">
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

export const TableCreationForm: React.FC = () => {
  const [displayErrorText, setDisplayErrorText] = useState<string | null>(null);

  return (
    <div className="w-full h-full overflow-hidden">
      <Form className="w-full h-[6rem] bg-slate-900/5 flex flex-row items-center justify-between pl-[4rem] rounded-md">
        <input
          type="text"
          name=""
          id=""
          placeholder="input table name"
          className="w-[20rem] p-2 shadow-input shadow-none rounded-md h-8 caret-outline1d placeholder:text-outline1 placeholder:italic bg-canvas"
        />

        <div
          className={
            "w-[60%] flex items-baseline justify-end h-full bg-[#ff1d1d23] px-4" +
            `${!displayErrorText ? " invisible" : ""}`
          }
        >
          <span className="w-8 h-8">
            <MessageSquareWarningIcon color="#ff2424d2" />
          </span>
          <p className="flex-1 text-danger h-full flex items-center pl-8">
            {displayErrorText}
          </p>
        </div>
      </Form>

      <div className="w-full h-max flex flex-col overflow-auto flex-1 table-form-wrapper min-h-[43rem] md:min-h-[25rem]">
        <Table className="min-w-[60rem] relative min-h-[45rem]">
          <TableHeader>
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
          <TableBody className="">
            {columns.map((column) => (
              <TableRow key={column.name}>
                <TableNameColumn name={column.name} columnID={column.id} />

                <TableCell>
                  <FormColumnSelectList
                    select={tableColumnFields.type}
                    columnID={column.id}
                  />
                </TableCell>

                <TableCell>
                  <FormColumnSelectList
                    select={tableColumnFields.index}
                    columnID={column.id}
                  />
                </TableCell>

                <TableCell className="text-right">
                  <TableCheckbox
                    id={`${column.name}-nullible`}
                    columnID={column.id}
                  />
                </TableCell>

                <TableCell className="text-right">
                  <TableCheckbox
                    id={`${column.name}-unique`}
                    columnID={column.id}
                  />
                </TableCell>

                <TableCell className="w-[8rem]">
                  <FormColumnSelectList
                    select={tableColumnFields.default}
                    columnID={column.id}
                  />
                </TableCell>

                <TableCell className="w-[8rem]">
                  <FormCompositeSelectList
                    rowID={column.name}
                    columnID={column.id}
                  />
                </TableCell>

                <TableCell className="w-[8rem] h-[8rem]">
                  <div className="w-6 h-6 flex items-center justify-end cursor-pointer ml-auto">
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

        <TableFormCTAArea />

        <EnumCreationForm />
      </div>
    </div>
  );
};
