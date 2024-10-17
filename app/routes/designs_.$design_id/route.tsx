import { ClientLoaderFunctionArgs, Form, Link, json } from "@remix-run/react";
import { useDispatch, useSelector } from "react-redux";
import type { MetaFunction } from "@remix-run/node";
import useEventListener from "~/hooks/useevent";
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { WorkspaceHeader } from "~/components/workspace-header";
import { WorkspaceSidetab } from "~/components/workspace-sidetab";
import {
  DrawerTrigger,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from "~/components/ui/drawer";
import {
  commentsPaneSelector,
  commentsSelector,
  settingsSelector,
} from "~/store";
import {
  XOpenComments,
  closeCommentsPane,
  openCommentsPane,
} from "~/reducers/workspace.reducer";
import "@xyflow/react/dist/style.css";
import { DesignCanvas } from "~/components/design-canvas";
import { ChatBubbleViewCtx } from "~/context-components/chat-bubble-view.context";
import { handleResize } from "~/event-handlers/workspace.handlers";
import { ReactFlowInstance } from "@xyflow/react";
import { StatefulNodeType } from "~/types";
import {
  ChatBubbleContextValueType,
  chatBubbleContext,
} from "~/contexts/chat-bubble.context";
import { selectChatBubbles } from "~/reducers/chat-bubble.reducer";

export const meta: MetaFunction = () => {
  return [
    { title: "design | proctor" },
    { name: "description", content: "proctor design file" },
    {
      name: "viewport",
      content:
        "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0",
    },
  ];
};

export const clientLoader = async (args: ClientLoaderFunctionArgs) => {
  return json({});
};

const CommentBoxDrawer: React.FC<{
  commentsOpened: boolean;
  openComments: React.Dispatch<React.SetStateAction<boolean>>;
  activeCommentBoard: string | null;
}> = React.memo(function CommentBoxDrawerInner({
  activeCommentBoard,
  commentsOpened,
  openComments,
}) {
  return (
    <Drawer
      open={commentsOpened}
      onOpenChange={(open) => {
        openComments(!!open);
      }}
    >
      <DrawerContent className="h-[45rem] md:h-[30rem] bg-bg pt-8 border-t-accent border-t-4">
        <DrawerHeader className="flex items-center justify-center">
          <DrawerTitle>chat #{activeCommentBoard}</DrawerTitle>
        </DrawerHeader>

        <DrawerFooter className="flex flex-col justify-between flex-1 gap-8 md:flex-row">
          <ul className="flex flex-1 w-full gap-4 overflow-x-auto md:h-full md:max-h-[60%] md:overflow-y-auto md:flex-col snap-x md:snap-y pt-2 chat-box">
            <li className="flex h-full px-2 w-full min-w-[100%] md:px-4 md:h-max snap-center">
              <div className="flex flex-col items-center w-6 mx-4">
                <span className="w-4 h-4 origin-bottom rounded-full ring-accent bg-outline1/55 ring-1 z-[5]"></span>
                <span className="flex-1 w-1 bg-outline1 z-2"></span>
              </div>

              <div className="flex flex-col gap-4">
                <p className="text-lg text-primary">John smith</p>
                <p className="p-2 bg-outline1/55 text-secondaryText">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit.
                  Doloribus maiores qui officia iusto asperiores praesentium
                  temporibus odit, odio cumque error ab culpa! Rerum nisi, saepe
                  voluptas atque labore iure aliquid!
                </p>

                <h3 className="self-end text-sm text-secondaryText">
                  Thursday 01, July 15:00
                </h3>
              </div>
            </li>

            <li className="flex h-full px-2 w-full min-w-[100%] md:px-4 md:h-max snap-center">
              <div className="flex flex-col items-center w-6 mx-4">
                <span className="w-4 h-4 origin-bottom rounded-full ring-accent bg-outline1/55 ring-1 z-[5]"></span>
                <span className="flex-1 w-1 bg-outline1 z-2"></span>
              </div>

              <div className="flex flex-col gap-4">
                <p className="text-lg text-primary">John smith</p>
                <p className="p-2 bg-outline1/55 text-secondaryText">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit.
                  Doloribus maiores qui officia iusto asperiores praesentium
                  temporibus odit, odio cumque error ab culpa! Rerum nisi, saepe
                  voluptas atque labore iure aliquid!
                </p>

                <h3 className="self-end text-sm text-secondaryText">
                  Thursday 01, July 15:00
                </h3>
              </div>
            </li>

            <li className="flex h-full px-2 w-full min-w-[100%] md:px-4 md:h-max snap-center">
              <div className="flex flex-col items-center w-6 mx-4">
                <span className="w-4 h-4 origin-bottom rounded-full ring-accent bg-outline1/55 ring-1 z-[5]"></span>
                <span className="flex-1 w-1 bg-outline1 z-2"></span>
              </div>

              <div className="flex flex-col gap-4">
                <p className="text-lg text-primary">John smith</p>
                <p className="p-2 bg-outline1/55 text-secondaryText">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit.
                  Doloribus maiores qui officia iusto asperiores praesentium
                  temporibus odit, odio cumque error ab culpa! Rerum nisi, saepe
                  voluptas atque labore iure aliquid!
                </p>

                <h3 className="self-end text-sm text-secondaryText">
                  Thursday 01, July 15:00
                </h3>
              </div>
            </li>
          </ul>
          <Form className="flex flex-col gap-8 h-max md:w-[30%] w-full">
            <textarea
              name=""
              id=""
              cols={30}
              rows={10}
              maxLength={250}
              className="h-[8rem] max-h-[8rem] min-h-[8rem] md:h-[5rem] md:max-h-[5rem] md:min-h-[5rem] p-4 focus:border-2 focus:outline-none rounded focus:border-outline1 border-dashed"
            ></textarea>

            <div className="flex justify-end gap-4">
              <DrawerClose className="w-max">
                <button className="px-8 py-4 rounded-md ring-1 ring-outline1">
                  Cancel
                </button>
              </DrawerClose>
              <button
                className="px-8 py-4 rounded-md ring-1 ring-outline1 bg-fg text-bg"
                type="submit"
              >
                Submit
              </button>
            </div>
          </Form>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
});

const CommentBoard: React.FC<{
  instance:
    | ReactFlowInstance<StatefulNodeType & { id: string }, never>
    | undefined;
}> = ({ instance: ReactflowInstance }) => {
  const activeCommentBoard = useSelector(commentsSelector);
  const settings = useSelector(settingsSelector);
  const boardVisible = useSelector(commentsPaneSelector);
  const dispatch = useDispatch();

  const { chatBubbleState } = useContext(
    chatBubbleContext
  ) as ChatBubbleContextValueType;
  const getBubbles = useCallback(
    (state: typeof chatBubbleState) => selectChatBubbles(state),
    []
  );

  const [commentsOpened, openComments] = useState<boolean>(false);

  const [boardInteract, setboardInteract] = useState<boolean>(false);
  const boardOpened = !boardInteract ? settings.commentsPane : boardVisible;

  const toggleBoard = useCallback(() => {
    if (boardOpened) {
      dispatch(closeCommentsPane());
      setboardInteract(true);
      return;
    }
    dispatch(openCommentsPane());
    setboardInteract(true);
  }, [boardOpened]);

  useEffect(() => {
    if (ReactflowInstance && activeCommentBoard) {
      const equivBubble = chatBubbleState.bubbles[activeCommentBoard];
      if (!equivBubble) return;
      const { position, visible } = equivBubble;
      ReactflowInstance.setCenter(position.x, position.y, {
        duration: 300,
        zoom: 1,
      });
    }
  }, [activeCommentBoard]);

  return (
    <div
      className={
        "fixed top-[10rem] md:top-20 right-0 w-[25rem] h-[20rem] flex shadow-lg shadow-outline1/25 z-10 rounded-md bg-outline1/5 bg-blend-darken" +
        `${!boardOpened ? " shadow-none w-[2rem]" : ""}`
      }
    >
      <CommentBoxDrawer
        activeCommentBoard={activeCommentBoard}
        commentsOpened={commentsOpened}
        openComments={openComments}
      />

      <ul
        className={
          "h-full flex-1 flex-col overflow-auto no-scrollbar" +
          `${!boardOpened ? " scale-0 origin-right" : ""}`
        }
      >
        {getBubbles(chatBubbleState).length ? (
          getBubbles(chatBubbleState).map((bubble) => {
            return (
              <li
                className="flex w-full h-[5rem] bg-canvas/55 backdrop-blur-md ring-transparent ring-2 flex-col items-start p-2"
                key={bubble.id}
              >
                <div className="relative flex justify-end w-full h-1/2">
                  <Link
                    to={""}
                    className="absolute top-0 left-0 w-full h-full font-semibold text-accent/75"
                    onClick={(e) => {
                      e.preventDefault();
                      dispatch(XOpenComments(bubble.id) as any);
                      openComments(true);
                    }}
                  >
                    chat #{bubble.id}
                  </Link>
                  <span className="w-4 h-4">
                    <svg className="w-full h-full">
                      <use xlinkHref="#external-link"></use>
                    </svg>
                  </span>
                </div>
                <div className="flex flex-1 w-full gap-1">
                  <img
                    src="/images/emoji_student_1.png"
                    alt=""
                    className="w-8 h-8 rounded-full"
                  />
                  <img
                    src="/images/emoji_student_2.png"
                    alt=""
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="flex items-center justify-center h-full ml-auto text-sm justify-self-end text-outline1">
                    Thur, 11:02 am
                  </span>
                </div>
              </li>
            );
          })
        ) : (
          <p className="my-auto w-full h-full top-1/2 self-center justify-self-center flex items-center justify-center italic text-outline1">
            comments for this session will show here.
          </p>
        )}
      </ul>
      <div className="flex flex-col items-center justify-center w-8 h-full bg-canvas">
        <button
          className={
            "w-8 h-8 flex items-center justify-center scale-x-[-1]" +
            `${boardOpened ? " scale-x-[unset]" : ""}`
          }
          onClick={() => toggleBoard()}
        >
          <svg className="w-[80%] h-full scale-y-125">
            <use xlinkHref="#caret"></use>
          </svg>
        </button>
      </div>
    </div>
  );
};

export const DesignsPage: React.FC = React.memo(() => {
  const [_, setWindowSize] = useState<number>(window.innerWidth);
  const [instance, setInstance] =
    useState<ReactFlowInstance<StatefulNodeType & { id: string }, never>>();

  useEventListener(
    "resize",
    handleResize(null, (_, width) => setWindowSize(width)),
    window as HTMLElement | any
  );

  return (
    <>
      <WorkspaceHeader />
      <section className="designs-section flex-1 w-full basis-auto h-max md:mt-20 mt-32 overflow-hidden">
        <ChatBubbleViewCtx>
          <CommentBoard instance={instance} />

          <div
            className="w-[100vw] max-w-[100vw] h-[82vh] md:h-[87vh] relative bottom-0 overflow-hidden my-auto"
            id="design-canvas-wrapper"
          >
            <DesignCanvas instance={instance} setInstance={setInstance} />
          </div>

          <WorkspaceSidetab />
        </ChatBubbleViewCtx>
      </section>
    </>
  );
});

export default DesignsPage;
