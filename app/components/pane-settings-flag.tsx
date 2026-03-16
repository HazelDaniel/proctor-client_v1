import { UnknownAction } from "@reduxjs/toolkit";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { settingsSelector } from "~/store";

type PaneSettingsFlagProps = {
  command: string;
  text: string;
  checkAction: UnknownAction;
  uncheckAction: UnknownAction;
  matchingActionText: string;
};

export const PaneSettingsFlag: React.FC<PaneSettingsFlagProps> = ({
  checkAction,
  command,
  text,
  uncheckAction,
  matchingActionText,
}) => {
  const dispatch = useDispatch();
  const [isChecked, setChecked] = useState<boolean>(false);
  const settings = useSelector(settingsSelector);
  const id = text.replaceAll(" ", "-");

  return (
    <li className="w-full flex justify-between items-center h-8 overflow-hidden capitalize my-2">
      <input
        type="checkbox"
        name=""
        id={id}
        className="inline accent-accent mr-4"
        checked={
          isChecked ||
          settings[matchingActionText as unknown as keyof typeof settings]
        }
        onChange={(e) => {
          const target = e.target as HTMLInputElement;
          if (target.checked) {
            setChecked(true);
            dispatch(checkAction);
          } else {
            setChecked(false);
            dispatch(uncheckAction);
          }
        }}
      />
      <label htmlFor={id} className="mr-auto">
        {text}
      </label>
      <span className="w-8 h-8 mr-2 flex items-center">
        <svg className="w-4 h-4 mr-1">
          <use xlinkHref="#command"></use>
        </svg>

        <span className="text-lg text-outline1d text-opacity-50 opacity-60">
          {command}
        </span>
      </span>
    </li>
  );
};
