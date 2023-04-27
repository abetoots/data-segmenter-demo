import classNames from "classnames";
import * as Switch from "@radix-ui/react-switch";

type ToggleProps = {
  id: string;
  leftText?: string;
  rightText?: string;
  className?: string;
  checked?: boolean;
  onCheckedChange?: Switch.SwitchProps["onCheckedChange"];
};

const Toggle = ({
  id,
  leftText,
  rightText,
  className,
  checked,
  onCheckedChange,
}: ToggleProps) => {
  return (
    <div
      className={classNames("flex items-center", className)}
      style={{ display: "flex", alignItems: "center" }}
    >
      <label
        className="pr-[15px] text-[15px] leading-none text-white"
        htmlFor={id}
      >
        {leftText}
      </label>
      <Switch.Root
        className="bg-blackA9 shadow-blackA7 relative h-[25px] w-[42px] cursor-default rounded-full shadow-[0_2px_10px] outline-none focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-black"
        id={id}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        style={{ "-webkit-tap-highlight-color": "rgba(0, 0, 0, 0)" }}
        checked={checked}
        onCheckedChange={onCheckedChange}
      >
        <Switch.Thumb className="shadow-blackA7 block h-[21px] w-[21px] translate-x-0.5 rounded-full bg-white shadow-[0_2px_2px] transition-transform duration-100 will-change-transform data-[state=checked]:translate-x-[19px]" />
      </Switch.Root>
      {rightText ? (
        <label
          className="pr-[15px] text-[15px] leading-none text-white"
          htmlFor={id}
        >
          {rightText}
        </label>
      ) : null}
    </div>
  );
};

export default Toggle;

// export default function Toggle({
//   rightText = '',
//   leftText = '',
//   rootClassName = '',
//   description = '',
//   cornerHintText = '',
//   heading,
//   className = '',
//   required,
//   value,
//   stateHandler,
// }: ToggleProps) {
//   const id = heading.toLowerCase().replace(/\s/g, '-');

//   return (
//     <div className={rootClassName}>
//       <InputLabel
//         label={heading}
//         htmlFor={id}
//         required={required}
//         cornerHintText={cornerHintText}
//       />
//       <Switch.Group as="div" className="flex items-center">
//         {leftText ? (
//           <Switch.Label as="span" className="mr-3">
//             <span className="text-sm font-medium text-gray-900">{leftText} </span>
//             <span className="text-sm text-gray-500">{description}</span>
//           </Switch.Label>
//         ) : null}

//         <Switch
//           onChange={stateHandler}
//           checked={value}
//           className={classNames(
//             value ? 'bg-indigo-600' : 'bg-gray-200',
//             'relative mt-1 inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
//             className,
//           )}
//         >
//           <span
//             aria-hidden="true"
//             className={classNames(
//               value ? 'translate-x-5' : 'translate-x-0',
//               'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200',
//             )}
//           />
//         </Switch>
//         <Switch.Label as="span" className="ml-3">
//           <span className="text-sm font-medium text-gray-900">{rightText} </span>
//           <span className="text-sm text-gray-500">{description}</span>
//         </Switch.Label>
//       </Switch.Group>
//     </div>
//   );
// }
