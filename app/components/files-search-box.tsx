export const FilesSearchBox: React.FC = () => {
  return (
    <div className="search-box w-full flex justify-start h-[3rem] min-h-[40px] overflow-visible items-center pl-0.5 bg-transparent relative">
      <input
        type="search"
        name=""
        id=""
        className="w-[70%] p-2 px-8 ring-1 ring-offset-2 ring-offset-outline1 ring-outline1 outline-none rounded-sm bg-transparent h-[90%]"
      />
      <svg className="y-centered-absolute left-1 w-[20px] h-[20px] scale-75">
        <use xlinkHref="#search"></use>
      </svg>
    </div>
  );
};
