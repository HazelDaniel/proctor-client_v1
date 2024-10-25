import { Form } from "@remix-run/react";
import React from "react";
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

const columns = [
  {
    invoice: "INV001",
    paymentStatus: "Paid",
    totalAmount: "$250.00",
    paymentMethod: "Credit Card",
    name: "ID",
  },
  {
    invoice: "INV002",
    paymentStatus: "Pending",
    totalAmount: "$150.00",
    paymentMethod: "PayPal",
    name: "date_created",
  },
  {
    invoice: "INV003",
    paymentStatus: "Unpaid",
    totalAmount: "$350.00",
    paymentMethod: "Bank Transfer",
    name: "date_updated",
  },
  {
    invoice: "INV004",
    paymentStatus: "Paid",
    totalAmount: "$450.00",
    paymentMethod: "Credit Card",
    name: "price",
  },
  {
    invoice: "INV005",
    paymentStatus: "Paid",
    totalAmount: "$550.00",
    paymentMethod: "PayPal",
    name: "discount",
  },
  {
    invoice: "INV006",
    paymentStatus: "Pending",
    totalAmount: "$200.00",
    paymentMethod: "Bank Transfer",
    name: "user_id",
  },
  {
    invoice: "INV007",
    paymentStatus: "Unpaid",
    totalAmount: "$300.00",
    paymentMethod: "Credit Card",
    name: "customer_name",
  },
];

export const TableCheckbox: React.FC<{ id: string }> = ({ id }) => {
  return (
    <div className="flex items-center space-x-2 justify-center">
      <Checkbox id={id} />
    </div>
  );
};

export function FormColumnSelectList() {
  return (
    <Select>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Fruits</SelectLabel>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="blueberry">Blueberry</SelectItem>
          <SelectItem value="grapes">Grapes</SelectItem>
          <SelectItem value="pineapple">Pineapple</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

const EnumCreationForm: React.FC = () => {
  return (
    <Form className="overflow-hidden flex flex-col md:flex-row items-center gap-8 h-[32rem] md:h-[20rem]  w-full">
      <div className="w-full md:w-max h-[20rem] md:h-max flex items-center justify-start flex-col md:flex-row md:p-4 md:gap-[10%]">
        <div className="h-full w-full md:w-max flex md:flex-col items-center md:items-start gap-2 justify-between">
          <label
            htmlFor="enum-name-column"
            className=" mr-4 truncate text-muted-foreground"
          >
            Name
          </label>
          <input
            type="text"
            value={"RANDOM_ENUM"}
            id="enum-name-column"
            className="h-[2.5rem] rounded-sm p-1 ring-outline1 ring-1"
          />
        </div>

        <div className="h-full w-full md:w-max flex md:flex-col items-center md:items-start gap-2 justify-between">
          <label
            htmlFor="enum-entries-column"
            className=" mr-4 truncate text-muted-foreground"
          >
            Entries (Comma, separated)
          </label>
          <input
            type="text"
            value={"'cup', 'tea', 'coffee'"}
            id="enum-entries-column"
            className="h-[2.5rem] rounded-sm p-1 ring-outline1 ring-1"
          />
        </div>

        <div className="h-full w-max flex items-center justify-center">
          <button className="h-8 w-[15rem] px-4 flex items-center justify-center">
            <svg className="h-4 w-4">
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
};

export const TableCreationForm: React.FC = () => {
  return (
    <div className="w-full h-full  overflow-hidden">
      <Form className="w-full h-[6rem] bg-slate-900/5 flex flex-col items-start justify-center pl-[4rem] rounded-md">
        <input
          type="text"
          name=""
          id=""
          placeholder="input table name"
          className="w-[20rem] p-2 shadow-input rounded-md h-8 caret-outline1d placeholder:text-outline1 placeholder:italic bg-canvas"
        />
      </Form>
      <div className="w-full h-max flex flex-col overflow-auto flex-1 table-form-wrapper min-h-[43rem] md:min-h-[25rem]">
        <Table className="min-w-[60rem] relative min-h-[45rem]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Index</TableHead>
              <TableHead className="text-right">Nullible?</TableHead>
              <TableHead className="text-right">Unique?</TableHead>
              <TableHead className="text-center">DEFAULT</TableHead>
              <TableHead className="text-center">Composite On</TableHead>
              <TableHead className="text-right w-8"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="">
            {columns.map((column) => (
              <TableRow key={column.name}>
                <TableCell className="font-medium ">{column.name}</TableCell>
                <TableCell>
                  <FormColumnSelectList />
                </TableCell>

                <TableCell>
                  <FormColumnSelectList />
                </TableCell>

                <TableCell className="text-right">
                  <TableCheckbox id={`${column.name}-nullible`} />
                </TableCell>

                <TableCell className="text-right">
                  <TableCheckbox id={`${column.name}-unique`} />
                </TableCell>

                <TableCell className="w-[8rem]">
                  <FormColumnSelectList />
                </TableCell>

                <TableCell className="w-[8rem]">
                  <FormColumnSelectList />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="w-[15rem] h-2 bg-outline1 mx-auto rounded-full"></div>
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

        <EnumCreationForm />
      </div>
    </div>
  );
};
