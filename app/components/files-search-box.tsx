export const FilesSearchBox: React.FC = () => {
  return (
    <div className="search-box w-full flex justify-start h-[3rem] min-h-[40px] overflow-visible items-center pl-0.5 bg-transparent relative mb-10">
      <input
        type="search"
        name=""
        id=""
        className="w-[95%] p-2 pr-8 pl-12 md:pl-10 shadow-input rounded-lg bg-transparent h-[90%] caret-accent placeholder:text-outline1 placeholder:italic"
        placeholder="search for files..."
      />
      <span className="y-centered-absolute left-5 w-[20px] h-[20px] scale-75 flex justify-center items-center">
        <svg className="w-full h-full">
          <use xlinkHref="#search"></use>
        </svg>
      </span>

      <span className="y-centered-absolute right-[10%] w-[20px] h-[20px] scale-90 flex justify-center items-center text-outline1d text-lg">
        <svg className="mr-2 w-[18px] h-[18px] block scale-125">
          <use xlinkHref="#command"></use>
        </svg>
        <p className="w-2 absolute right-[-3px] text-2xl md:text-xl">/</p>
      </span>
    </div>
  );
};
