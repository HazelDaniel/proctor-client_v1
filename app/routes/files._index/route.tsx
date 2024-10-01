import { ClientLoaderFunctionArgs, json } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";
import { FilesHeader } from "~/components/files-header";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/components/ui/resizable";
import { FilesSearchBox } from "~/components/files-search-box";

export const meta: MetaFunction = () => {
  return [
    { title: "files | proctor" },
    { name: "description", content: "proctor files page" },
  ];
};

export const clientLoader = async (args: ClientLoaderFunctionArgs) => {
  return json({});
};

export const FilesPage: React.FC = () => {
  return (
    <>
      <FilesHeader />
      <section className="files-section flex-1 w-full basis-auto min-h-[100vh] h-[max-content]">
        <ResizablePanelGroup
          direction="horizontal"
          className="min-h-[100vh] rounded-lg w-full"
        >
          <ResizablePanel defaultSize={25} maxSize={40}>
            <div className="flex h-full flex-col justify-start p-4 md:max-w-[30rem] sm:max-w-[100vw] min-w-[30rem] items-start">
              <FilesSearchBox />
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={75}>
            <div className="flex items-center justify-center h-full p-6">
              <span className="font-semibold">Content</span>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </section>
    </>
  );
};

export default FilesPage;
