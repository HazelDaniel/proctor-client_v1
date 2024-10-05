import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";

export const WorkspaceHeader: React.FC = () => {
  return (
    <header className="files-header flex items-center justify-start w-full h-32 md:h-20 px-4 pr-0 bg-gradient-to-b from-bg from-80% backdrop-blur-sm fixed z-10">
      <div className="relative flex-row justify-start pr-4 md:w-1/4 h-3/4 flex w-max justify-self-start">
        <div className="h-full w-full flex items-center mr-auto">
          <span className="w-8 h-8 mr-0 md:mr-auto">
            <svg className="w-full h-full">
              <use xlinkHref="#open-side-tab"></use>
            </svg>
          </span>

          <div className="md:flex w-max justify-between hidden">
            <button className="w-8 h-8 mr-8">
              <svg className="h-full w-full scale-x-[-0.8] scale-y-[0.8]">
                <use xlinkHref="#undo"></use>
              </svg>
            </button>

            <button className="w-8 h-8">
              <svg className="h-full w-full scale-[0.8]">
                <use xlinkHref="#undo"></use>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="w-0 md:block mx-0 md:mx-auto">
        <input
          type="text"
          name=""
          id=""
          className="bg-transparent outline-none fixed md:static top-32 md:top-0  x-centered-absolute text-center font-semibold focus:ring-1 focus:ring-outline1 rounded-md"
          defaultValue={"untitled_project"}
        />
      </div>

      {/* star and other header components */}
      <div className="w-[15rem] flex justify-between items-center mx-auto md:mx-0">
        <span className="w-8 h-8 flex items-center justify-center">
          <svg className="w-full h-full">
            <use xlinkHref="#star"></use>
          </svg>
        </span>

        <ul className="w-max flex h-8">
          <li className="w-8 h-8 rounded-full drop-shadow-md rotate-[-3deg] mx-[-0.3rem]">
            <img src="/images/emoji_student_2.png" alt="" />
          </li>
          <li className="w-8 h-8 rounded-full drop-shadow-md rotate-[-3deg] mx-[-0.3rem]">
            <img src="/images/emoji_student_1.png" alt="" />
          </li>
          <li className="w-8 h-8 rounded-full drop-shadow-md bg-canvas mx-[-0.3rem]">
            <span className="w-full h-full flex items-center justify-center">
              +2
            </span>
          </li>
        </ul>

        <span className="w-8 h-8 flex items-center justify-center">
          <svg className="w-full h-full">
            <use xlinkHref="#export"></use>
          </svg>
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger className="ring-none border-none *:outline-none *:focus:outline-none">
            <button className="w-8 h-8 flex items-center justify-center">
              <svg className="w-full h-full">
                <use xlinkHref="#kebab"></use>
              </svg>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[15rem] mr-8 rounded-md p-2 bg-canvas *:outline-none *:focus:outline-none drop-shadow-md mt-4">
            <DropdownMenuItem className="rounded-sm p-4 cursor-pointer">
              invite collaborator
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-outline1 w-full h-[1px]" />
            <DropdownMenuItem className="rounded-sm p-4 cursor-pointer">
              record session
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-outline1 w-full h-[1px]" />
            <DropdownMenuItem className="rounded-sm p-4 cursor-pointer text-red-400">
              leave session
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <button className="w-16 h-full hover:bg-accent/25 flex items-center justify-center ml-2 transition-colors duration-300">
        <svg className="w-10 h-10">
          <use xlinkHref="#plus"></use>
        </svg>
      </button>
    </header>
  );
};
