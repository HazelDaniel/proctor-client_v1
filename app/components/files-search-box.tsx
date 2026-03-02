import React, { useState, useRef, useCallback, useEffect } from "react";
import { useLoaderData, Link, useFetcher } from "@remix-run/react";
import { Loader2 } from "lucide-react";
import { useFilesSearch } from "~/contexts/files-search.context";
import { gqlRequest } from "~/utils/api";
import type { loader } from "~/routes/files._index/route";
import { ToolInstanceType } from "~/types";

export const FilesSearchBox: React.FC = () => {
  const { toolInstances } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const { searchQuery, searchResults, isSearchingOnServer, setSearchQuery, setSearchResults, setIsSearchingOnServer } = useFilesSearch();
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout>();
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults(null);
      setIsSearchingOnServer(false);
      return;
    }

    try {
      // 1. Search client side first
      const resolvedTools: any = await toolInstances;
      const items: ToolInstanceType[] = resolvedTools?.items || [];
      const clientHits = items.filter((t: ToolInstanceType) => 
        t.name.toLowerCase().includes(query.toLowerCase())
      );

      if (clientHits.length > 0) {
        setSearchResults(clientHits);
        setIsSearchingOnServer(false);
      } else {
        // 2. No client hits, search server side
        setSearchResults([]);
        setIsSearchingOnServer(true);
        
        const serverResult = await gqlRequest(`
          query SearchToolInstances($query: String!) {
            searchToolInstances(query: $query) {
              id
              toolType
              createdAt
              ownerId
              name
              lastAccessedAt
              accessCount
            }
          }
        `, { query });

        if (serverResult?.searchToolInstances) {
           const mapped = serverResult.searchToolInstances.map((t: any) => ({
             ...t,
             createdAt: t.createdAt ? new Date(isNaN(+t.createdAt) ? t.createdAt : +t.createdAt) : new Date(),
             lastAccessedAt: t.lastAccessedAt ? new Date(isNaN(+t.lastAccessedAt) ? t.lastAccessedAt : +t.lastAccessedAt) : undefined,
           }));
           setSearchResults(mapped);
        } else {
           setSearchResults([]);
        }
      }
    } catch (e) {
      console.error("Search failed:", e);
      setSearchResults([]);
    } finally {
      setIsSearchingOnServer(false);
    }
  }, [toolInstances, setSearchResults, setIsSearchingOnServer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    setSearchQuery(val);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (!val.trim()) {
      setSearchResults(null);
      setIsSearchingOnServer(false);
      return;
    }

    debounceTimer.current = setTimeout(() => {
      performSearch(val.trim());
    }, 400); 
  };


  return (
    <div ref={searchContainerRef} className="search-box w-full flex justify-start h-[3rem] min-h-[40px] overflow-visible items-center pl-0.5 bg-transparent relative mb-10 z-50">
      <input
        type="search"
        name="filesSearch"
        id="filesSearch"
        value={inputValue}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        className="w-[95%] p-2 pr-8 pl-12 md:pl-10 shadow-input rounded-lg bg-transparent hover:bg-black/5 dark:hover:bg-white/5 transition-all outline-none border border-outline1/50 focus:border-accent h-[90%] caret-accent placeholder:text-outline1 placeholder:italic"
        placeholder="search for files..."
      />
      <span className="y-centered-absolute left-5 w-[20px] h-[20px] scale-75 flex justify-center items-center pointer-events-none">
        <svg className="w-full h-full">
          <use xlinkHref="#search"></use>
        </svg>
      </span>

      <span className="y-centered-absolute right-[10%] w-[20px] h-[20px] scale-90 flex justify-center items-center text-outline1d text-lg pointer-events-none">
        <svg className="mr-2 w-[18px] h-[18px] block scale-125">
          <use xlinkHref="#command"></use>
        </svg>
        <p className="w-2 absolute right-[-3px] text-2xl md:text-xl">/</p>
      </span>

      {/* Search Results Dropdown Board */}
      {isFocused && inputValue.length > 0 && (
        <div className="absolute top-[calc(100%+0.5rem)] left-0 w-[95%] max-h-[25rem] overflow-y-auto bg-canvas ring-1 ring-outline1 rounded-lg shadow-xl flex flex-col items-start justify-start p-2">
          {searchResults === null ? (
            <p className="text-sm text-outline1 italic p-4 text-center w-full">typing...</p>
          ) : searchResults.length === 0 && !isSearchingOnServer ? (
            <p className="text-sm text-outline1 p-4 text-center w-full">No results found.</p>
          ) : (
            <ul className="w-full flex flex-col gap-1">
              {searchResults.map((t) => {
                const createdAt = t.createdAt instanceof Date ? t.createdAt : new Date(t.createdAt);
                const lastAccessedAt = t.lastAccessedAt ? (t.lastAccessedAt instanceof Date ? t.lastAccessedAt : new Date(t.lastAccessedAt)) : undefined;
                
                return (
                  <li key={t.id} className="w-full">
                    <Link 
                      to={`/files/${t.id}`}
                      onClick={() => {
                        setIsFocused(false);
                        fetcher.submit(
                          { intent: "RECORD_TOOL_ACCESS", instanceId: t.id },
                          { method: "post", action: "/files?index" }
                        );
                      }}
                      className="flex justify-start items-center w-full p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-colors"
                    >
                      <span className="flex items-center justify-center w-8 h-8 shrink-0 mr-3">
                        <svg className="w-full h-full scale-75">
                          <use xlinkHref="#folder"></use>
                        </svg>
                      </span>
                      <div className="flex flex-col flex-1 truncate">
                        <p className="font-medium text-[15px] truncate">{t.name}</p>
                        <span className="text-xs text-outline1d truncate flex gap-2">
                          <span>{t.toolType}</span>
                          <span>•</span>
                          <span>
                            {lastAccessedAt && !isNaN(lastAccessedAt.getTime())
                              ? `accessed ${lastAccessedAt.toLocaleDateString()}` 
                              : (!isNaN(createdAt.getTime()) ? `created ${createdAt.toLocaleDateString()}` : '')}
                          </span>
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          {isSearchingOnServer && (
            <div className="w-full flex justify-center items-center p-4">
              <Loader2 className="w-5 h-5 animate-spin text-accent" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

