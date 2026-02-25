/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { CSSProperties, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  AppDispatch,
  graphSelector,
  nodesStateSelector,
  referenceNodesSelector,
  typeMappingSelector,
  workspaceSelectors,
} from "~/store";

import { isEqual } from "~/utils/comparison.js";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { XOpenOutputPane } from "~/reducers/workspace.reducer";
import { Copy } from "lucide-react";
import { ResetIcon } from "@radix-ui/react-icons";
import { NodeSQLGeneratorDao } from "~/dao/node-sql-generator.dao";

import { PrismAsync as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import plsql from "react-syntax-highlighter/dist/cjs/languages/prism/plsql";

// SyntaxHighlighter.registerLanguage("sql", plsql);

export const SQLOutputPane: React.FC = () => {
  //prettier-ignore
  const { outputPane: outputPaneVisible, settings, } = useSelector(workspaceSelectors, isEqual);
  const [outputPaneInteract, setOutputPaneInteract] = useState<boolean>(false);

  const [outputSQL, setOutputSQL] = useState<string>("");

  //prettier-ignore
  const outputPaneOpened = !outputPaneInteract ? settings.outputPane : outputPaneVisible;

  const dispatch = useDispatch<AppDispatch>();

  const graphs = useSelector(graphSelector, isEqual);
  const refLists = useSelector(referenceNodesSelector, isEqual);
  const nodes = useSelector(nodesStateSelector, isEqual);
  const globalTypeMappings = useSelector(typeMappingSelector, isEqual);

  const generator = useMemo(
    () => new NodeSQLGeneratorDao(nodes, graphs, refLists, globalTypeMappings),
    [nodes, graphs, refLists, globalTypeMappings]
  );

  const [chunkedOutput, setChunkedOutput] = useState<string>("");

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const timeoutFns: any[] = [];

    setChunkedOutput("");

    for (const output of outputSQL) {
      timeoutFns.push(
        setTimeout(() => setChunkedOutput((prev) => prev + output), 5)
      );
    }

    return () => {
      for (const fn of timeoutFns) {
        clearTimeout(fn);
      }
    };
  }, [outputSQL]);

  return (
    <>
      <Sheet
        open={outputPaneOpened}
        onOpenChange={() => setOutputPaneInteract(true)}
      >
        <SheetTrigger asChild>
          <button
            className="w-16 h-[80%] md:h-full self-start hover:bg-accent/25 flex items-center justify-center ml-2 transition-colors duration-300"
            onClick={() => {
              dispatch(XOpenOutputPane());
            }}
          >
            <svg className="w-[80%] md:w-8 h-full scale-90">
              <use xlinkHref="#code"></use>
            </svg>
          </button>
        </SheetTrigger>
        <SheetTitle className="sr-only">
          output pane of the db design
        </SheetTitle>
        <SheetContent className="bg-primary w-[80%] pt-16 flex flex-col md:min-w-[40rem] border-none mt-8">
          <SheetHeader>
            <div className="flex justify-between h-max">
              <p className="h-4 w-max text-muted-foreground">Output SQL</p>
              <div className="h-full w-max flex">
                <span className="cursor-pointer mx-2 p-2 border-canvas/5 border-2 rounded-sm">
                  <Copy className="stroke-muted-foreground h-[15px] w-[15px]" />
                </span>
                <span
                  className="cursor-pointer mx-2 p-2 border-canvas/5 border-2 rounded-sm"
                  onClick={() => {
                    try {
                      generator.run();
                      setOutputSQL(generator.code);
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                >
                  <ResetIcon className="stroke-muted-foreground h-[15px] w-[15px]" />
                </span>
              </div>
            </div>
          </SheetHeader>

          <div className="flex-1 w-full relative">
            <pre className="text-output-panel text-accent overflow-scroll no-scrollbar h-full bg-outline1/5 p-2 ring-1 ring-outline1/20 rounded-sm  max-h-[80vh]">
              <SyntaxHighlighter
                language="sql"
                style={oneDark}
                customStyle={{
                  backgroundColor: "unset",
                  height: "100%",
                  minHeight: "inherit",
                  maxHeight: "80vh",
                }}
              >
                {chunkedOutput}
              </SyntaxHighlighter>
            </pre>
          </div>

          <SheetDescription className="justify-self-end mt-auto text-center">
            Always double check generated SQL codes for errors.
          </SheetDescription>
        </SheetContent>
      </Sheet>
    </>
  );
};
