import React, { createContext, useContext, useState, ReactNode } from "react";
import { ToolInstanceType } from "~/types";

interface FilesSearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: ToolInstanceType[] | null;
  setSearchResults: (results: ToolInstanceType[] | null) => void;
  isSearchingOnServer: boolean;
  setIsSearchingOnServer: (isSearching: boolean) => void;
}

const FilesSearchContext = createContext<FilesSearchContextType | undefined>(undefined);

export const FilesSearchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ToolInstanceType[] | null>(null);
  const [isSearchingOnServer, setIsSearchingOnServer] = useState(false);

  return (
    <FilesSearchContext.Provider
      value={{
        searchQuery,
        setSearchQuery,
        searchResults,
        setSearchResults,
        isSearchingOnServer,
        setIsSearchingOnServer,
      }}
    >
      {children}
    </FilesSearchContext.Provider>
  );
};

export const useFilesSearch = () => {
  const context = useContext(FilesSearchContext);
  if (context === undefined) {
    throw new Error("useFilesSearch must be used within a FilesSearchProvider");
  }
  return context;
};
