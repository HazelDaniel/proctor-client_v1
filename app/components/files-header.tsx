import { Logo } from "./logo";

export const FilesHeader: React.FC = () => {
  return (
    <header className="files-header flex items-center content-start w-full h-32 md:h-20 px-4 bg-gradient-to-b from-bg from-80% backdrop-blur-sm fixed z-10">
      <div className="relative flex-row justify-start pr-4 md:w-1/4 h-3/4">
        <div className="flex items-center justify-start h-[95%] p-3 rounded-2xl drop-shadow-sm bg-canvas w-max min-w-20">
          <img
            src="/images/emoji_student_1.png"
            alt="the profile picture of the current user on the files page"
            className="w-10 h-10 drop-shadow-md"
          />
          <p className="flex-grow m-4">James B.</p>
          <div className="flex flex-col items-center justify-center w-10 h-full">
            <span className="absolute">
              <span></span>
            </span>

            <span className="w-[80%] h-8 flex justify-center items-center cursor-pointer hover:rotate-[-15deg] duration-150 ease-linear my-auto">
              <svg className="w-8 h-8">
                <use xlinkHref="#bell"></use>
              </svg>
            </span>
          </div>
        </div>
        <span className="h-[60%] md:h-[80%] w-[3px] bg-outline1 y-centered-absolute right-0 rounded"></span>
      </div>
      <div className="flex items-center justify-between flex-1 h-full pl-4">
        <h2>All Projects</h2>
        <Logo />
      </div>
    </header>
  );
};
