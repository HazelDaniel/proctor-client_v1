import React from "react";
import { Form, useNavigation } from "@remix-run/react";
import { Loader2 } from "lucide-react";

export const DBSchemaDesignButton: React.FC = () => {
  const navigation = useNavigation();
  const isCreating = navigation.formData?.get("intent") === "CREATE_SCHEMA_DESIGN";

  return (
    <li className="group/opt-area-1 flex justify-start items-center even:justify-end h-[8rem] md:h-1/2 overflow-hidden max-w-[25rem] md:max-w-[22rem] md:mx-0 mx-auto mb-16 md:mb-0 rounded-lg ring-1 ring-outline1 bg-[#f8f8f8]/90 hover:bg-[#D70DB6] transition-all duration-200">
      <Form method="post" className="w-full h-full">
        <input type="hidden" name="intent" value="CREATE_SCHEMA_DESIGN" />
        <button
          type="submit"
          disabled={isCreating}
          className="flex items-center justify-start w-full h-full p-4 px-8 focus:outline-none disabled:opacity-70"
        >
          <div className="h-14 w-14 min-h-14 min-w-14 bg-[#D70DB6] rounded-[50%] mr-4 group-hover/opt-area-1:bg-canvas flex items-center justify-center">
            {isCreating ? (
              <Loader2 className="w-1/2 h-1/2 stroke-canvas animate-spin group-hover/opt-area-1:stroke-[#D70DB6]" />
            ) : (
              <svg className="w-1/2 stroke-canvas h-1/2 group-hover/opt-area-1:stroke-[#D70DB6]">
                <use xlinkHref="#design"></use>
              </svg>
            )}
          </div>
          <div className="select-none text-left">
            <h2 className="text-lg font-medium group-hover/opt-area-1:text-canvas">
              DB Schema Design
            </h2>
            <p className="text-sm group-hover/opt-area-1:text-canvas opacity-80">
              {isCreating ? "creating..." : "forward engineer a new db schema"}
            </p>
          </div>
        </button>
      </Form>
    </li>
  );
};
