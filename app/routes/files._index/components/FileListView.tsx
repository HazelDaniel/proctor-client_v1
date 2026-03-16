import React, { Suspense } from "react";
import { Await, useLoaderData, useSearchParams } from "@remix-run/react";
import { Skeleton } from "~/components/ui/skeleton";
import { ToolInstanceType } from "~/types";
import { ToolInstanceFile } from "./ToolInstanceFile";
import { Pagination } from "./Pagination";

export const FileListView: React.FC = () => {
  const { toolInstances } = useLoaderData();
  const [searchParams] = useSearchParams();
  const currentSort = searchParams.get("sortBy") || "recent";

  return (
    <>
      <ul className="flex md:grid flex-col md:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(25rem,1fr))] justify-start md:justify-normal items-center w-[95%] md:w-[98%] mx-auto mt-20  min-w-[80vw] md:min-w-[70vw] mb-20">
        <Suspense
          fallback={
            <>
              <Skeleton className="h-48 md:h-[20rem] w-full md:w-[22rem] xl:w-[25rem] rounded-md m-2" />
              <Skeleton className="h-48 md:h-[20rem] w-full md:w-[22rem] xl:w-[25rem] rounded-md m-2 hidden md:block" />
              <Skeleton className="h-48 md:h-[20rem] w-full md:w-[22rem] xl:w-[25rem] rounded-md m-2 hidden lg:block" />
            </>
          }
        >
          <Await resolve={toolInstances} errorElement={<p className="text-red-500 px-8">Error loading projects. Check console for details.</p>}>
            {(resolvedTools: { items: ToolInstanceType[]; totalCount: number; totalPages: number; currentPage: number }) => (
              <>
                {resolvedTools.items.map((tool) => (
                  <ToolInstanceFile key={tool.id} {...tool} />
                ))}
              </>
            )}
          </Await>
        </Suspense>
      </ul>
      <Suspense fallback={null}>
        <Await resolve={toolInstances}>
          {(resolvedTools: { items: ToolInstanceType[]; totalCount: number; totalPages: number; currentPage: number }) =>
            resolvedTools.totalPages > 1 ? (
              <Pagination currentPage={resolvedTools.currentPage} totalPages={resolvedTools.totalPages} sortBy={currentSort} />
            ) : null
          }
        </Await>
      </Suspense>
    </>
  );
};
