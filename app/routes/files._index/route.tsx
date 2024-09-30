import { ClientLoaderFunctionArgs, json } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";
import { FilesHeader } from "~/components/files-header";

export const meta: MetaFunction = () => {
  return [
    { title: "files | proctor" },
    { name: "description", content: "proctor files page" },
  ];
};

export const clientLoader = async (args: ClientLoaderFunctionArgs) => {
  return json({});
}

export const FilesPage: React.FC = () => {
  return <>
   <FilesHeader/>
  </>
}

export default FilesPage;